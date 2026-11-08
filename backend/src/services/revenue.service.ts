// src/services/revenue.service.ts
import { prisma } from '../config/prisma';
import { RevenueQuery } from '../validators/revenue.validator';

function dealDateRange(q: RevenueQuery) {
  const range: { gte?: Date; lte?: Date } = {};
  if (q.from) range.gte = new Date(q.from);
  if (q.to) range.lte = new Date(q.to);
  return Object.keys(range).length ? range : undefined;
}

/**
 * Company-wide revenue snapshot (deterministic). Deal value is grouped by stage;
 * completed value, commission totals, and pending-payment totals are summed.
 */
export async function getRevenueSummary(q: RevenueQuery) {
  const created = dealDateRange(q);
  const dealWhere = created ? { createdAt: created } : {};

  const [byStage, completedAgg, commissionAgg, paymentAgg, pendingAgg] = await Promise.all([
    prisma.deal.groupBy({
      by: ['stage'],
      where: dealWhere,
      _count: { _all: true },
      _sum: { dealValue: true },
    }),
    prisma.deal.aggregate({
      where: { ...dealWhere, stage: 'COMPLETED' },
      _sum: { dealValue: true },
      _count: { _all: true },
    }),
    // Commission and payments follow the same date window as deals, and money on
    // CANCELLED deals no longer inflates the commission / pending figures.
    prisma.commission.aggregate({
      where: { status: { not: 'CANCELLED' }, deal: { ...dealWhere, stage: { not: 'CANCELLED' } } },
      _sum: { grossAmount: true, agentAmount: true, companyAmount: true },
    }),
    prisma.payment.groupBy({
      by: ['status'],
      where: { deal: dealWhere },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: { in: ['PENDING', 'OVERDUE'] },
        deal: { ...dealWhere, stage: { not: 'CANCELLED' } },
      },
      _sum: { amount: true },
    }),
  ]);

  const paymentsByStatus: Record<string, { count: number; amount: number }> = {};
  for (const p of paymentAgg) {
    paymentsByStatus[p.status] = { count: p._count._all, amount: p._sum.amount || 0 };
  }
  const pendingTotal = pendingAgg._sum.amount || 0;

  return {
    dealsByStage: byStage.map((s: (typeof byStage)[number]) => ({
      stage: s.stage,
      count: s._count._all,
      value: s._sum.dealValue || 0,
    })),
    completed: {
      count: completedAgg._count._all,
      value: completedAgg._sum.dealValue || 0,
    },
    commission: {
      gross: commissionAgg._sum.grossAmount || 0,
      agent: commissionAgg._sum.agentAmount || 0,
      company: commissionAgg._sum.companyAmount || 0,
    },
    payments: {
      byStatus: paymentsByStatus,
      pendingTotal,
    },
  };
}

/** Earned commission grouped per agent and status. */
export async function getCommissionBreakdown() {
  const rows = await prisma.commission.groupBy({
    by: ['agentId', 'status'],
    _sum: { grossAmount: true, agentAmount: true, companyAmount: true },
    _count: { _all: true },
  });

  const agentIds = Array.from(new Set(rows.map((r: (typeof rows)[number]) => r.agentId))) as string[];
  const agents = await prisma.user.findMany({
    where: { id: { in: agentIds } },
    select: { id: true, fullName: true },
  });
  const nameById = new Map(agents.map((a) => [a.id, a.fullName]));

  return rows.map((r: (typeof rows)[number]) => ({
    agentId: r.agentId,
    agentName: nameById.get(r.agentId) || null,
    status: r.status,
    count: r._count._all,
    gross: r._sum.grossAmount || 0,
    agent: r._sum.agentAmount || 0,
    company: r._sum.companyAmount || 0,
  }));
}

/** Outstanding payments (PENDING/OVERDUE), split into overdue vs upcoming. */
export async function getPendingPayments() {
  const now = new Date();
  const payments = await prisma.payment.findMany({
    where: { status: { in: ['PENDING', 'OVERDUE'] }, deal: { stage: { not: 'CANCELLED' } } },
    orderBy: [{ dueDate: 'asc' }],
    include: {
      deal: {
        select: {
          id: true,
          dealValue: true,
          client: { select: { id: true, fullName: true } },
        },
      },
    },
  });

  let overdueTotal = 0;
  let upcomingTotal = 0;
  const items = payments.map((p: (typeof payments)[number]) => {
    const isOverdue =
      p.status === 'OVERDUE' ||
      (!!p.dueDate && p.dueDate < now && p.status !== 'PAID' && p.status !== 'CANCELLED');
    if (isOverdue) overdueTotal += p.amount;
    else upcomingTotal += p.amount;
    return { ...p, isOverdue };
  });

  return { items, overdueTotal, upcomingTotal, total: overdueTotal + upcomingTotal };
}