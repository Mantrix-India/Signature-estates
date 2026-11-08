// src/services/deal.service.ts
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { isValidDealTransition, STAGE_DATE_FIELD, DealStageValue } from '../utils/deal';
import { syncClientStatusFromLeads } from './lead.service';
import {
  CreateDealInput,
  UpdateDealInput,
  TransitionDealInput,
  ListDealsQuery,
} from '../validators/deal.validator';

/** The authenticated actor as attached by authMiddleware (req.user). */
export type Actor = { userId: string; role: string };

const dealInclude = {
  client: { select: { id: true, fullName: true, phone: true } },
  property: { select: { id: true, title: true, price: true, city: true } },
  owner: { select: { id: true, fullName: true, phone: true } },
  agent: { select: { id: true, fullName: true } },
  lead: { select: { id: true, stage: true } },
  commission: true,
  payments: { orderBy: { dueDate: 'asc' as const } },
  _count: { select: { documents: true, payments: true, offers: true } },
};

// Lead stages that come before a booking. Creating a deal moves such a lead to
// BOOKING; completing the deal moves it to CLOSED. This keeps the lead pipeline,
// the conversion rate and the deal pipeline telling the same story.
const PRE_BOOKING_STAGES = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPERTIES_SHARED',
  'INTERESTED',
  'SITE_VISIT',
  'NEGOTIATION',
] as const;

async function moveLeadStage(
  leadId: string,
  to: 'BOOKING' | 'CLOSED',
  onlyFrom: readonly string[] | null,
  actorUserId: string
) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { id: true, stage: true, clientId: true },
  });
  if (!lead || lead.stage === to || lead.stage === 'WON') return;
  if (onlyFrom && !onlyFrom.includes(lead.stage)) return;

  await prisma.$transaction([
    prisma.lead.update({ where: { id: leadId }, data: { stage: to } }),
    prisma.leadActivity.create({
      data: {
        leadId,
        activityType: 'OTHER',
        description: `Stage changed from ${lead.stage} to ${to} (synced from deal)`,
        createdById: actorUserId,
      },
    }),
  ]);
  await syncClientStatusFromLeads(lead.clientId, actorUserId);
}

export function isPrivileged(role: string) {
  return role === 'ADMIN' || role === 'MANAGER';
}

/** AGENTs may only touch deals they own; ADMIN/MANAGER may touch any. */
function assertDealAccess(deal: { agentId: string }, actor: Actor) {
  if (!isPrivileged(actor.role) && deal.agentId !== actor.userId) {
    throw new AppError('Forbidden: you can only access your own deals', 403);
  }
}

/**
 * Load a deal by id and assert the actor may access it. Shared by the payment
 * and deal-document services so their access rules stay identical to deals'.
 */
export async function assertDealAccessById(dealId: string, actor: Actor) {
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    select: { id: true, agentId: true },
  });
  if (!deal) throw new AppError('Deal not found', 404);
  assertDealAccess(deal, actor);
  return deal;
}

export async function createDeal(input: CreateDealInput, actor: Actor) {
  const lead = await prisma.lead.findUnique({
    where: { id: input.leadId },
    select: { id: true, clientId: true, propertyId: true, assignedToId: true },
  });
  if (!lead) throw new AppError('Lead not found', 404);

  const existing = await prisma.deal.findUnique({ where: { leadId: input.leadId } });
  if (existing) throw new AppError('This lead already has a deal', 409);

  const propertyId = input.propertyId ?? lead.propertyId ?? undefined;
  if (!propertyId) {
    throw new AppError('A propertyId is required (the lead has no linked property)', 400);
  }
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError('Property not found', 404);

  // Agent assignment: AGENT is forced to self; ADMIN/MANAGER may assign anyone,
  // defaulting to the lead's assignee.
  let agentId = actor.userId;
  if (input.agentId) {
    if (!isPrivileged(actor.role) && input.agentId !== actor.userId) {
      throw new AppError('Forbidden: agents cannot assign deals to other users', 403);
    }
    const agent = await prisma.user.findUnique({ where: { id: input.agentId } });
    if (!agent) throw new AppError('Assigned agent not found', 404);
    agentId = input.agentId;
  } else if (isPrivileged(actor.role) && lead.assignedToId) {
    agentId = lead.assignedToId;
  }

  if (input.ownerId) {
    const owner = await prisma.owner.findUnique({ where: { id: input.ownerId } });
    if (!owner) throw new AppError('Owner not found', 404);
  }

  // Resolve deal value: explicit wins, else derive from a linked accepted offer.
  let dealValue = input.dealValue;
  let offer: { id: string; leadId: string; amount: number } | null = null;
  if (input.offerId) {
    const found = await prisma.offer.findUnique({
      where: { id: input.offerId },
      select: { id: true, leadId: true, amount: true },
    });
    if (!found) throw new AppError('Offer not found', 404);
    if (found.leadId !== input.leadId) {
      throw new AppError('Offer does not belong to this lead', 400);
    }
    offer = found;
    if (dealValue === undefined) dealValue = found.amount;
  }
  if (dealValue === undefined) {
    throw new AppError('Provide dealValue, or an offerId to derive it from', 400);
  }

  // Deal + offer acceptance are one atomic write: no half-created deals.
  const deal = await prisma.$transaction(async (tx) => {
    const created = await tx.deal.create({
      data: {
        leadId: input.leadId,
        clientId: lead.clientId,
        propertyId,
        ownerId: input.ownerId,
        agentId,
        dealValue: dealValue!,
        bookingDate: input.bookingDate ? new Date(input.bookingDate) : undefined,
        notes: input.notes,
        createdById: actor.userId,
      },
    });

    // If created from an offer, mark it accepted and link it to the new deal.
    if (offer) {
      await tx.offer.update({
        where: { id: offer.id },
        data: { status: 'ACCEPTED', dealId: created.id },
      });
    }
    return created;
  });

  // A deal is a booking: advance an earlier-stage lead so the pipeline matches.
  await moveLeadStage(input.leadId, 'BOOKING', PRE_BOOKING_STAGES, actor.userId);

  return prisma.deal.findUniqueOrThrow({ where: { id: deal.id }, include: dealInclude });
}

export async function listDeals(query: ListDealsQuery, actor: Actor) {
  const { page, limit, scope, stage, agentId } = query;

  // Ownership scoping (D7): AGENTs are hard-scoped to their own deals regardless
  // of scope=all; ADMIN/MANAGER see all with scope=all, or own with scope=me.
  let agentFilter: string | undefined;
  if (!isPrivileged(actor.role)) agentFilter = actor.userId;
  else if (scope === 'me') agentFilter = actor.userId;
  if (agentId && isPrivileged(actor.role)) agentFilter = agentId;

  const where = {
    ...(agentFilter && { agentId: agentFilter }),
    ...(stage && { stage }),
  };

  const [deals, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: dealInclude,
    }),
    prisma.deal.count({ where }),
  ]);

  return { deals, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getDealById(id: string, actor: Actor) {
  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      ...dealInclude,
      offers: { orderBy: { createdAt: 'asc' } },
      documents: {
        orderBy: { createdAt: 'desc' },
        include: { uploadedBy: { select: { id: true, fullName: true } } },
      },
    },
  });
  if (!deal) throw new AppError('Deal not found', 404);
  assertDealAccess(deal, actor);
  return deal;
}

async function loadDealForWrite(id: string, actor: Actor) {
  const deal = await prisma.deal.findUnique({ where: { id } });
  if (!deal) throw new AppError('Deal not found', 404);
  assertDealAccess(deal, actor);
  return deal;
}

export async function updateDeal(id: string, input: UpdateDealInput, actor: Actor) {
  await loadDealForWrite(id, actor);

  if (input.agentId) {
    if (!isPrivileged(actor.role)) {
      throw new AppError('Forbidden: only ADMIN/MANAGER can reassign a deal', 403);
    }
    const agent = await prisma.user.findUnique({ where: { id: input.agentId } });
    if (!agent) throw new AppError('Assigned agent not found', 404);
  }
  if (input.ownerId) {
    const owner = await prisma.owner.findUnique({ where: { id: input.ownerId } });
    if (!owner) throw new AppError('Owner not found', 404);
  }

  return prisma.deal.update({
    where: { id },
    data: {
      ownerId: input.ownerId,
      agentId: input.agentId,
      dealValue: input.dealValue,
      notes: input.notes,
    },
    include: dealInclude,
  });
}

export async function transitionDeal(id: string, input: TransitionDealInput, actor: Actor) {
  const deal = await loadDealForWrite(id, actor);

  const from = deal.stage as DealStageValue;
  const to = input.stage as DealStageValue;

  if (from === to) throw new AppError(`Deal is already at stage ${to}`, 400);
  if (!isValidDealTransition(from, to)) {
    throw new AppError(`Invalid stage transition: ${from} -> ${to}`, 400);
  }
  if (to === 'CANCELLED' && !input.cancelReason) {
    throw new AppError('cancelReason is required to cancel a deal', 400);
  }

  const stamp = input.date ? new Date(input.date) : new Date();
  const dateField = STAGE_DATE_FIELD[to];

  // Dynamic date column keyed by target stage (resolved at runtime from STAGE_DATE_FIELD).
  const data: Record<string, unknown> = { stage: to };
  if (dateField) data[dateField] = stamp;
  if (to === 'CANCELLED') data.cancelReason = input.cancelReason;

  const updated = await prisma.deal.update({ where: { id }, data, include: dealInclude });

  // Completed deal == closed (won) lead, so conversion rate reflects real sales.
  if (to === 'COMPLETED') {
    await moveLeadStage(deal.leadId, 'CLOSED', null, actor.userId);
    return prisma.deal.findUniqueOrThrow({ where: { id }, include: dealInclude });
  }

  return updated;
}

export async function deleteDeal(id: string, actor: Actor) {
  await loadDealForWrite(id, actor);
  // Only privileged users may hard-delete; agents should CANCEL instead so the
  // financial trail (payments/commission) is never silently destroyed.
  if (!isPrivileged(actor.role)) {
    throw new AppError('Forbidden: cancel the deal instead, or ask an admin to delete it', 403);
  }
  await prisma.deal.delete({ where: { id } });
}