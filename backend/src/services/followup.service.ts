import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { dayBounds } from '../utils/time';
import {
  ListFollowUpsQuery,
  CreateFollowUpInput,
  UpdateFollowUpInput,
} from '../validators/followup.validator';

// Follow-ups ARE Tasks. This module gives the agent a cross-cutting to-do view
// (Overdue/Today/Upcoming) plus standalone CRUD, while lead-scoped task creation
// stays available via the existing /leads/:id/tasks endpoints.
const followUpInclude = {
  assignedTo: { select: { id: true, fullName: true } },
  lead: {
    select: {
      id: true,
      stage: true,
      client: { select: { id: true, fullName: true, phone: true } },
    },
  },
};

// Day boundaries use the BUSINESS timezone (APP_TIMEZONE, default Asia/Kolkata),
// not the server clock — the API runs on UTC hosts, which used to push IST
// morning follow-ups into "Overdue". Overdue = before today's local midnight.

export async function listFollowUps(query: ListFollowUpsQuery, currentUserId: string) {
  const { scope, assignedToId, includeNoDueDate } = query;

  const where = {
    isCompleted: false,
    ...(scope === 'me'
      ? { assignedToId: assignedToId ?? currentUserId }
      : assignedToId
        ? { assignedToId }
        : {}),
  };

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
    include: followUpInclude,
  });

  const { startToday, startTomorrow } = dayBounds();
  const overdue: typeof tasks = [];
  const today: typeof tasks = [];
  const upcoming: typeof tasks = [];
  const noDueDate: typeof tasks = [];

  for (const t of tasks) {
    if (!t.dueDate) {
      noDueDate.push(t);
      continue;
    }
    if (t.dueDate < startToday) overdue.push(t);
    else if (t.dueDate < startTomorrow) today.push(t);
    else upcoming.push(t);
  }

  return {
    counts: {
      overdue: overdue.length,
      today: today.length,
      upcoming: upcoming.length,
      noDueDate: includeNoDueDate ? noDueDate.length : 0,
    },
    overdue,
    today,
    upcoming,
    ...(includeNoDueDate ? { noDueDate } : {}),
  };
}

export async function createFollowUp(input: CreateFollowUpInput, currentUserId: string) {
  const assignedToId = input.assignedToId ?? currentUserId;

  const assignee = await prisma.user.findUnique({ where: { id: assignedToId } });
  if (!assignee) throw new AppError('Assigned user not found', 404);

  if (input.leadId) {
    const lead = await prisma.lead.findUnique({ where: { id: input.leadId } });
    if (!lead) throw new AppError('Lead not found', 404);
  }

  return prisma.task.create({
    data: {
      title: input.title,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      assignedToId,
      leadId: input.leadId,
      createdById: currentUserId,
    },
    include: followUpInclude,
  });
}

export async function updateFollowUp(id: string, input: UpdateFollowUpInput) {
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) throw new AppError('Follow-up not found', 404);

  if (input.assignedToId) {
    const assignee = await prisma.user.findUnique({ where: { id: input.assignedToId } });
    if (!assignee) throw new AppError('Assigned user not found', 404);
  }

  return prisma.task.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.isCompleted !== undefined && { isCompleted: input.isCompleted }),
      ...(input.assignedToId !== undefined && { assignedToId: input.assignedToId }),
      ...(input.dueDate !== undefined && {
        dueDate: input.dueDate === null ? null : new Date(input.dueDate),
      }),
    },
    include: followUpInclude,
  });
}

export async function deleteFollowUp(id: string) {
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) throw new AppError('Follow-up not found', 404);
  await prisma.task.delete({ where: { id } });
}