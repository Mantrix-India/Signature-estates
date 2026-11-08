import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { createNotification } from './notification.service';
import { formatDateTime } from '../utils/time';
import {
  CreateSiteVisitInput,
  UpdateSiteVisitInput,
  ListSiteVisitsQuery,
} from '../validators/siteVisit.validator';

const siteVisitInclude = {
  client: { select: { id: true, fullName: true, phone: true } },
  property: { select: { id: true, title: true, address: true, city: true } },
  assignedTo: { select: { id: true, fullName: true } },
  createdBy: { select: { id: true, fullName: true } },
};

async function assertReferencesExist(input: {
  clientId?: string;
  propertyId?: string;
  assignedToId?: string;
}) {
  if (input.clientId) {
    const client = await prisma.client.findUnique({ where: { id: input.clientId } });
    if (!client) throw new AppError('Client not found', 404);
  }
  if (input.propertyId) {
    const property = await prisma.property.findUnique({ where: { id: input.propertyId } });
    if (!property) throw new AppError('Property not found', 404);
  }
  if (input.assignedToId) {
    const user = await prisma.user.findUnique({ where: { id: input.assignedToId } });
    if (!user) throw new AppError('Assigned user not found', 404);
  }
}

export async function createSiteVisit(input: CreateSiteVisitInput, userId: string) {
  await assertReferencesExist(input);

  const property = await prisma.property.findUnique({ where: { id: input.propertyId } });

  const siteVisit = await prisma.siteVisit.create({
    data: {
      ...input,
      scheduledAt: new Date(input.scheduledAt),
      createdById: userId,
    },
    include: siteVisitInclude,
  });

  if (siteVisit.assignedToId !== userId) {
    await createNotification(
      siteVisit.assignedToId,
      'New site visit assigned',
      `You have a site visit for "${property?.title}" scheduled on ${formatDateTime(
        new Date(siteVisit.scheduledAt)
      )}.`,
      { link: `/dashboard/site-visits/${siteVisit.id}`, type: 'SITE_VISIT' }
    );
  }

  return siteVisit;
}

export async function listSiteVisits(query: ListSiteVisitsQuery) {
  const { page, limit, status, assignedToId, from, to } = query;

  const where = {
    ...(status && { status }),
    ...(assignedToId && { assignedToId }),
    ...((from || to) && {
      scheduledAt: {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
      },
    }),
  };

  const [siteVisits, total] = await Promise.all([
    prisma.siteVisit.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { scheduledAt: 'asc' },
      include: siteVisitInclude,
    }),
    prisma.siteVisit.count({ where }),
  ]);

  return { siteVisits, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getSiteVisitById(id: string) {
  const siteVisit = await prisma.siteVisit.findUnique({
    where: { id },
    include: siteVisitInclude,
  });
  if (!siteVisit) throw new AppError('Site visit not found', 404);
  return siteVisit;
}

async function assertSiteVisitExists(id: string) {
  const siteVisit = await prisma.siteVisit.findUnique({ where: { id } });
  if (!siteVisit) throw new AppError('Site visit not found', 404);
  return siteVisit;
}

export async function updateSiteVisit(id: string, input: UpdateSiteVisitInput, userId: string) {
  const existing = await assertSiteVisitExists(id);
  await assertReferencesExist(input);

  const updated = await prisma.siteVisit.update({
    where: { id },
    data: {
      ...input,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
    },
    include: siteVisitInclude,
  });

  if (input.status && input.status !== existing.status) {
    const notifyUserId = existing.assignedToId !== userId ? existing.assignedToId : existing.createdById;
    if (notifyUserId !== userId) {
      await createNotification(
        notifyUserId,
        'Site visit status updated',
        `Status changed from ${existing.status} to ${input.status} for "${updated.property.title}".`,
        { link: `/dashboard/site-visits/${updated.id}`, type: 'SITE_VISIT' }
      );
    }
  }

  return updated;
}

export async function confirmByClient(id: string) {
  await assertSiteVisitExists(id);
  return prisma.siteVisit.update({
    where: { id },
    data: { clientConfirmed: true },
    include: siteVisitInclude,
  });
}

export async function confirmByBuilder(id: string) {
  await assertSiteVisitExists(id);
  return prisma.siteVisit.update({
    where: { id },
    data: { builderConfirmed: true },
    include: siteVisitInclude,
  });
}

export async function deleteSiteVisit(id: string) {
  await assertSiteVisitExists(id);
  await prisma.siteVisit.delete({ where: { id } });
}