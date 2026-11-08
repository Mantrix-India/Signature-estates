import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { resolveClientStatusFromStages, StoredLeadStage } from '../utils/pipeline';
import { PublicEnquiryInput } from '../validators/public.validator';
import { PUBLIC_VISIBILITY } from './public/propertyDto';
import { pickWebsiteLeadAssignee, PUBLIC_LOCK_NAMESPACE } from './leadAssignment.service';
import { createNotification } from './notification.service';

/**
 * Website enquiry -> CRM lead.
 *
 * Everything that must be consistent happens in ONE transaction:
 *   lock on phone -> match/create client -> match open lead or create NEW lead
 *   -> activity -> (site visit request) -> follow-up task -> client status sync.
 * The notification is sent after commit, so a notification failure can never
 * roll back (or duplicate) a lead.
 *
 * Writes go through the normal Lead/LeadActivity/Task tables, so the lead shows
 * up on /leads/board under NEW and in the funnel with no extra work.
 */

type Tx = Prisma.TransactionClient;

const CLOSED_STAGES = ['CLOSED', 'WON', 'LOST'] as const;
const TASK_TYPES = new Set<PublicEnquiryInput['enquiryType']>(['SITE_VISIT', 'CALLBACK']);
const WEBSITE_SOURCE_NAME = 'Website';

const TYPE_LABEL: Record<PublicEnquiryInput['enquiryType'], string> = {
  GENERAL: 'General enquiry',
  SITE_VISIT: 'Site visit request',
  CALLBACK: 'Callback request',
  BROCHURE: 'Brochure request',
  PRICE_REQUEST: 'Price request',
};

const SLOT_LABEL = { MORNING: 'Morning', AFTERNOON: 'Afternoon', EVENING: 'Evening' } as const;
/** IST start time used when a site visit is requested with a slot. */
const SLOT_START_IST = { MORNING: '10:00', AFTERNOON: '14:00', EVENING: '17:00' } as const;

const IST_OFFSET_MS = 330 * 60 * 1000;
const FOLLOW_UP_WITHIN_MS = 2 * 60 * 60 * 1000;

/** now + 2h, but never later than 23:59 IST today — "due the same day". */
function sameDayDue(now = new Date()): Date {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  const endOfTodayIst = new Date(
    Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate(), 23, 59, 0) - IST_OFFSET_MS
  );
  return new Date(Math.min(now.getTime() + FOLLOW_UP_WITHIN_MS, endOfTodayIst.getTime()));
}

function preferredDateTime(input: PublicEnquiryInput): Date | null {
  if (!input.preferredDate) return null;
  if (input.preferredDate.length === 10) {
    const time = input.preferredSlot ? SLOT_START_IST[input.preferredSlot] : '10:00';
    return new Date(`${input.preferredDate}T${time}:00+05:30`);
  }
  return new Date(input.preferredDate);
}

function formatIst(d: Date, withTime: boolean) {
  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime && { hour: 'numeric', minute: '2-digit' }),
  });
}

function describeEnquiry(
  input: PublicEnquiryInput,
  property: { title: string; slug: string } | null,
  propertyUnavailable: boolean
) {
  const lines = [`Website enquiry · ${TYPE_LABEL[input.enquiryType]}`];
  if (property) lines.push(`Property: ${property.title} (/properties/${property.slug})`);
  if (propertyUnavailable) lines.push('Property: the listing they enquired about is no longer public');

  const when = preferredDateTime(input);
  const pref = [
    when ? formatIst(when, input.preferredDate!.length !== 10) : null,
    input.preferredSlot ? SLOT_LABEL[input.preferredSlot] : null,
  ].filter(Boolean);
  if (pref.length) lines.push(`Preferred: ${pref.join(' · ')}`);

  lines.push(`Phone: ${input.phone}`);
  if (input.email) lines.push(`Email: ${input.email}`);
  if (input.message) lines.push('', 'Message:', input.message);
  return lines.join('\n');
}

async function websiteLeadSourceId(tx: Tx): Promise<string> {
  const existing = await tx.leadSource.findFirst({
    where: { name: { equals: WEBSITE_SOURCE_NAME, mode: 'insensitive' } },
    select: { id: true },
  });
  if (existing) return existing.id;
  // Seeded by the migration; this is only a safety net.
  const created = await tx.leadSource.create({ data: { name: WEBSITE_SOURCE_NAME }, select: { id: true } });
  return created.id;
}

/** Match on the last 10 digits, whatever format the CRM stored the phone in. */
async function findClientByPhone(tx: Tx, phone10: string) {
  const rows = await tx.$queryRaw<{ id: string }[]>`
    SELECT "id" FROM "clients"
    WHERE right(regexp_replace("phone", '[^0-9]', '', 'g'), 10) = ${phone10}
    ORDER BY "createdAt" ASC
    LIMIT 1`;
  if (rows.length === 0) return null;
  return tx.client.findUnique({
    where: { id: rows[0].id },
    select: { id: true, email: true, status: true },
  });
}

/** Same rule as lead.service syncClientStatusFromLeads, but inside this transaction. */
async function syncClientStatusTx(tx: Tx, clientId: string, actorId: string) {
  const [client, leads] = await Promise.all([
    tx.client.findUnique({ where: { id: clientId }, select: { status: true } }),
    tx.lead.findMany({ where: { clientId }, select: { stage: true } }),
  ]);
  if (!client) return;
  const target = resolveClientStatusFromStages(leads.map((l) => l.stage as StoredLeadStage));
  if (!target || target === client.status) return;
  await tx.client.update({ where: { id: clientId }, data: { status: target } });
  await tx.clientTimeline.create({
    data: {
      clientId,
      eventType: 'STATUS_CHANGE',
      description: `Status updated to ${target} (derived from lead pipeline)`,
      createdById: actorId,
    },
  });
}

type EnquiryOutcome = {
  leadId: string;
  assigneeId: string;
  isNewLead: boolean;
  propertyTitle: string | null;
};

export async function submitPublicEnquiry(input: PublicEnquiryInput): Promise<void> {
  const outcome = await prisma.$transaction(
    async (tx): Promise<EnquiryOutcome> => {
      // Serialise enquiries for the same phone so a double-click or two tabs
      // can never create two clients or two leads.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${PUBLIC_LOCK_NAMESPACE}::int, hashtext(${`phone:${input.phone}`}))`;

      // 0. Property — only if it is publicly visible. A stale/hidden id is not
      //    an error for the visitor; the enquiry becomes a general one.
      const property = input.propertyId
        ? await tx.property.findFirst({
            where: { AND: [PUBLIC_VISIBILITY, { id: input.propertyId }] },
            select: { id: true, title: true, slug: true },
          })
        : null;
      const propertyUnavailable = !!input.propertyId && !property;
      const leadSourceId = await websiteLeadSourceId(tx);

      // 1. Match or create the client.
      let client = await findClientByPhone(tx, input.phone);

      // 2. Existing open lead for this client + property?
      const openLead = client
        ? await tx.lead.findFirst({
            where: {
              clientId: client.id,
              propertyId: property?.id ?? null,
              stage: { notIn: [...CLOSED_STAGES] },
            },
            orderBy: { updatedAt: 'desc' },
            select: { id: true, assignedToId: true },
          })
        : null;

      // 4. Assignment — an existing lead keeps its agent.
      const assigneeId = openLead?.assignedToId ?? (await pickWebsiteLeadAssignee(tx));
      // No system user exists, so the assigned agent is recorded as creator.
      const actorId = assigneeId;

      if (!client) {
        client = await tx.client.create({
          data: {
            fullName: input.fullName,
            phone: input.phone,
            email: input.email,
            source: WEBSITE_SOURCE_NAME,
            createdById: actorId,
          },
          select: { id: true, email: true, status: true },
        });
        await tx.clientTimeline.create({
          data: {
            clientId: client.id,
            eventType: 'OTHER',
            description: 'Client added from a website enquiry',
            createdById: actorId,
          },
        });
      } else if (!client.email && input.email) {
        // Fill a missing email; never overwrite data the team already has.
        await tx.client.update({ where: { id: client.id }, data: { email: input.email } });
      }

      // 3. Create the lead at NEW, or reuse the open one.
      let leadId: string;
      if (openLead) {
        leadId = openLead.id;
        // Bump updatedAt so the lead rises to the top of its board column.
        await tx.lead.update({ where: { id: leadId }, data: { updatedAt: new Date() } });
      } else {
        const lead = await tx.lead.create({
          data: {
            clientId: client.id,
            propertyId: property?.id,
            leadSourceId,
            assignedToId: assigneeId,
            stage: 'NEW',
            createdById: actorId,
          },
          select: { id: true },
        });
        leadId = lead.id;
        await tx.leadActivity.create({
          data: {
            leadId,
            activityType: 'OTHER',
            description: 'Lead created from website enquiry',
            createdById: actorId,
          },
        });
      }

      // 5. Full context for the agent.
      await tx.leadActivity.create({
        data: {
          leadId,
          activityType: 'NOTE',
          description: describeEnquiry(input, property, propertyUnavailable),
          createdById: actorId,
        },
      });

      // Site visit requests on a listing also land in the Site Visits queue as
      // REQUESTED — same pattern as the client portal's requestSiteVisit.
      if (input.enquiryType === 'SITE_VISIT' && property) {
        await tx.siteVisit.create({
          data: {
            clientId: client.id,
            propertyId: property.id,
            assignedToId: assigneeId,
            createdById: actorId,
            scheduledAt: preferredDateTime(input) ?? new Date(),
            status: 'REQUESTED',
            notes: input.message ? `Website request: ${input.message.slice(0, 500)}` : 'Website request',
          },
        });
      }

      // 6. Same-day follow-up for site visits and callbacks — one open
      //    website follow-up per lead, so repeat submissions don't stack tasks.
      const openFollowUp = TASK_TYPES.has(input.enquiryType)
        ? await tx.task.findFirst({
            where: { leadId, isCompleted: false, title: { endsWith: '(website)' } },
            select: { id: true },
          })
        : null;
      if (TASK_TYPES.has(input.enquiryType) && !openFollowUp) {
        await tx.task.create({
          data: {
            leadId,
            title: `${input.enquiryType === 'SITE_VISIT' ? 'Arrange site visit' : 'Call back'}: ${input.fullName} (website)`,
            dueDate: sameDayDue(),
            assignedToId: assigneeId,
            createdById: actorId,
          },
        });
      }

      await syncClientStatusTx(tx, client.id, actorId);

      return { leadId, assigneeId, isNewLead: !openLead, propertyTitle: property?.title ?? null };
    },
    { timeout: 15_000, maxWait: 10_000 }
  );

  // 7. Notify (after commit, best-effort).
  try {
    const about = outcome.propertyTitle ? ` for "${outcome.propertyTitle}"` : '';
    await createNotification(
      outcome.assigneeId,
      outcome.isNewLead ? 'New website enquiry' : 'Repeat website enquiry',
      `${input.fullName} sent a ${TYPE_LABEL[input.enquiryType].toLowerCase()}${about}.`,
      { link: `/dashboard/leads/${outcome.leadId}`, type: 'WEBSITE_ENQUIRY' }
    );
  } catch (err) {
    console.error('[public-enquiry] Lead saved but notification failed:', err);
  }
}
