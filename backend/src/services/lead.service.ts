import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import {
  LEAD_STAGES,
  displayStage,
  resolveClientStatusFromStages,
  StoredLeadStage,
} from '../utils/pipeline';
import {
  CreateLeadSourceInput,
  CreateLeadInput,
  UpdateLeadInput,
  ListLeadsQuery,
  CreateActivityInput,
  CreateTaskInput,
  UpdateTaskInput,
} from '../validators/lead.validator';

const leadInclude = {
  client: { select: { id: true, fullName: true, phone: true } },
  property: { select: { id: true, title: true, price: true } },
  leadSource: true,
  assignedTo: { select: { id: true, fullName: true } },
};

export async function createLeadSource(input: CreateLeadSourceInput) {
  return prisma.leadSource.create({ data: input });
}

export async function listLeadSources() {
  return prisma.leadSource.findMany({ orderBy: { name: 'asc' } });
}

async function assertReferencesExist(input: {
  clientId?: string;
  propertyId?: string;
  leadSourceId?: string;
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
  if (input.leadSourceId) {
    const source = await prisma.leadSource.findUnique({ where: { id: input.leadSourceId } });
    if (!source) throw new AppError('Lead source not found', 404);
  }
  if (input.assignedToId) {
    const user = await prisma.user.findUnique({ where: { id: input.assignedToId } });
    if (!user) throw new AppError('Assigned user not found', 404);
  }
}

/**
 * Recompute a client's derived status from ALL of its leads and, if it changed,
 * persist it and log a STATUS_CHANGE timeline event. One-directional: Lead.stage ->
 * Client.status only. Safe to call after any create/update/delete of a lead.
 */
export async function syncClientStatusFromLeads(clientId: string, actorUserId: string) {
  const [client, leads] = await Promise.all([
    prisma.client.findUnique({ where: { id: clientId }, select: { id: true, status: true } }),
    prisma.lead.findMany({ where: { clientId }, select: { stage: true } }),
  ]);
  // Client may have been removed (e.g. cascade); nothing to sync.
  if (!client) return;

  const target = resolveClientStatusFromStages(
    leads.map((l) => l.stage as StoredLeadStage)
  );
  if (!target || target === client.status) return;

  await prisma.$transaction([
    prisma.client.update({ where: { id: clientId }, data: { status: target } }),
    prisma.clientTimeline.create({
      data: {
        clientId,
        eventType: 'STATUS_CHANGE',
        description: `Status updated to ${target} (derived from lead pipeline)`,
        createdById: actorUserId,
      },
    }),
  ]);
}

export async function createLead(input: CreateLeadInput, userId: string) {
  await assertReferencesExist(input);

  const lead = await prisma.lead.create({
    data: { ...input, createdById: userId },
    include: leadInclude,
  });

  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      activityType: 'OTHER',
      description: 'Lead created',
      createdById: userId,
    },
  });

  await syncClientStatusFromLeads(lead.clientId, userId);

  return lead;
}

export async function listLeads(query: ListLeadsQuery) {
  const { page, limit, stage, assignedToId, sort } = query;

  const where = {
    ...(stage && { stage }),
    ...(assignedToId && { assignedToId }),
  };

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: sort === 'created' ? { createdAt: 'desc' } : { updatedAt: 'desc' },
      include: leadInclude,
    }),
    prisma.lead.count({ where }),
  ]);

  return { leads, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getLeadBoard() {
  const leads = await prisma.lead.findMany({
    orderBy: { updatedAt: 'desc' },
    include: leadInclude,
  });

  // Always return every canonical stage bucket (even when empty) so the board has
  // no gaps. Residual dormant-WON rows are folded into CLOSED via displayStage.
  const board: Record<string, typeof leads> = {};
  for (const stage of LEAD_STAGES) board[stage] = [];
  for (const lead of leads) {
    const bucket = displayStage(lead.stage as StoredLeadStage);
    board[bucket].push(lead);
  }
  return board;
}

export async function getLeadById(id: string) {
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      ...leadInclude,
      activities: {
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { id: true, fullName: true } } },
      },
      tasks: {
        orderBy: { dueDate: 'asc' },
        include: { assignedTo: { select: { id: true, fullName: true } } },
      },
    },
  });
  if (!lead) throw new AppError('Lead not found', 404);
  return lead;
}

async function assertLeadExists(id: string) {
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) throw new AppError('Lead not found', 404);
  return lead;
}

export async function updateLead(id: string, input: UpdateLeadInput, userId: string) {
  const existing = await assertLeadExists(id);
  await assertReferencesExist(input);

  const stageChanged = !!input.stage && input.stage !== existing.stage;

  if (stageChanged) {
    await prisma.leadActivity.create({
      data: {
        leadId: id,
        activityType: 'OTHER',
        description: `Stage changed from ${existing.stage} to ${input.stage}`,
        createdById: userId,
      },
    });
  }

  const updated = await prisma.lead.update({
    where: { id },
    data: input,
    include: leadInclude,
  });

  if (stageChanged) {
    await syncClientStatusFromLeads(existing.clientId, userId);
  }

  return updated;
}

/**
 * V2.2 guard: a Deal links to its Lead with onDelete: Restrict. Deleting a lead
 * that has a deal would raise a raw FK error (surfacing as a 500), so we check
 * first and throw a clear 409 instead. Shared by single- and bulk-delete paths.
 */
export async function assertLeadsHaveNoDeals(leadIds: string[]) {
  const blocking = await prisma.deal.findMany({
    where: { leadId: { in: leadIds } },
    select: { leadId: true },
  });
  if (blocking.length > 0) {
    throw new AppError(
      blocking.length === 1
        ? 'This lead has a linked deal. Cancel or delete the deal before deleting the lead.'
        : `${blocking.length} of the selected leads have linked deals. Cancel or delete those deals first.`,
      409
    );
  }
}

export async function deleteLead(id: string, userId: string) {
  const existing = await assertLeadExists(id);
  // Block (409) when a deal is linked instead of letting the DB Restrict throw.
  await assertLeadsHaveNoDeals([id]);
  await prisma.lead.delete({ where: { id } });
  // Removing a lead can change the furthest-progress lead, so re-derive status.
  await syncClientStatusFromLeads(existing.clientId, userId);
}

export async function addActivity(leadId: string, input: CreateActivityInput, userId: string) {
  await assertLeadExists(leadId);
  return prisma.leadActivity.create({
    data: { ...input, leadId, createdById: userId },
    include: { createdBy: { select: { id: true, fullName: true } } },
  });
}

export async function addTask(leadId: string, input: CreateTaskInput, userId: string) {
  await assertLeadExists(leadId);
  const assignee = await prisma.user.findUnique({ where: { id: input.assignedToId } });
  if (!assignee) throw new AppError('Assigned user not found', 404);

  return prisma.task.create({
    data: {
      title: input.title,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      assignedToId: input.assignedToId,
      leadId,
      createdById: userId,
    },
    include: { assignedTo: { select: { id: true, fullName: true } } },
  });
}

export async function updateTask(id: string, input: UpdateTaskInput, leadId?: string) {
  const existing = await prisma.task.findUnique({ where: { id } });
  // Scope to the lead in the URL so /leads/A/tasks/<task of B> can't touch B's task.
  if (!existing || (leadId && existing.leadId !== leadId)) {
    throw new AppError('Task not found', 404);
  }

  return prisma.task.update({
    where: { id },
    data: {
      ...input,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    },
    include: { assignedTo: { select: { id: true, fullName: true } } },
  });
}

export async function deleteTask(id: string, leadId?: string) {
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing || (leadId && existing.leadId !== leadId)) {
    throw new AppError('Task not found', 404);
  }
  await prisma.task.delete({ where: { id } });
}