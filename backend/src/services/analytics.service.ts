import { prisma } from '../config/prisma';
import { LEAD_STAGES, displayStage, StoredLeadStage } from '../utils/pipeline';
import { lastMonthKeys, monthKey, monthLabel } from '../utils/time';

/**
 * Analytics is the SINGLE source of truth for every headline number in the CRM.
 * The dashboard and the analytics page both read from here, so they can never
 * disagree. Rules:
 *
 * - Leads: terminal stages are CLOSED/LOST (dormant WON folded into CLOSED).
 * - Conversion = closed leads / all leads.
 * - Revenue collected = PAID invoices + PAID deal payments (V2.2), each reported
 *   separately as well so nothing is hidden. `totalRevenue` keeps its original
 *   invoice-only meaning for backwards compatibility.
 * - Deal money is AGENT-scoped (D7): agents see their own deals only;
 *   ADMIN/MANAGER see the whole company.
 */

export type AnalyticsActor = { userId: string; role: string };

// Terminal stages excluded from "active leads". WON is included defensively so the
// count is correct whether or not the WON->CLOSED backfill has been applied yet.
const TERMINAL_STAGES = ['CLOSED', 'WON', 'LOST'] as const;
// Win stages for conversion. Counts CLOSED and any residual WON (== CLOSED post-backfill).
const WIN_STAGES = ['CLOSED', 'WON'] as const;

const ACTIVE_DEAL_STAGES = ['BOOKING', 'AGREEMENT', 'LOAN', 'REGISTRATION'] as const;

function isPrivileged(role?: string) {
  return role === 'ADMIN' || role === 'MANAGER';
}

/** Deal filter for the actor: agents only see their own deals. */
function dealScope(actor?: AnalyticsActor) {
  if (!actor || isPrivileged(actor.role)) return {};
  return { agentId: actor.userId };
}

function round1(n: number) {
  return Number(n.toFixed(1));
}

async function conversionNumbers() {
  const [totalLeads, wonLeads, lostLeads] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { stage: { in: [...WIN_STAGES] } } }),
    prisma.lead.count({ where: { stage: 'LOST' } }),
  ]);
  return {
    totalLeads,
    wonLeads,
    lostLeads,
    conversionRate: totalLeads > 0 ? round1((wonLeads / totalLeads) * 100) : 0,
  };
}

export async function getOverview(actor?: AnalyticsActor) {
  const scope = dealScope(actor);

  const [
    totalProperties,
    totalClients,
    totalSiteVisits,
    activeLeads,
    conversion,
    invoiceAgg,
    paidPaymentAgg,
    pendingPaymentAgg,
    dealGroups,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.client.count(),
    prisma.siteVisit.count(),
    prisma.lead.count({ where: { stage: { notIn: [...TERMINAL_STAGES] } } }),
    conversionNumbers(),
    prisma.invoice.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
    prisma.payment.aggregate({
      where: { status: 'PAID', deal: scope },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: { in: ['PENDING', 'OVERDUE'] },
        deal: { ...scope, stage: { not: 'CANCELLED' } },
      },
      _sum: { amount: true },
    }),
    prisma.deal.groupBy({
      by: ['stage'],
      where: scope,
      _count: { _all: true },
      _sum: { dealValue: true },
    }),
  ]);

  const invoiceRevenue = invoiceAgg._sum.amount || 0;
  const dealRevenue = paidPaymentAgg._sum.amount || 0;

  const deals = { active: 0, completed: 0, cancelled: 0, activeValue: 0, completedValue: 0 };
  for (const g of dealGroups) {
    const count = g._count._all;
    const value = g._sum.dealValue || 0;
    if ((ACTIVE_DEAL_STAGES as readonly string[]).includes(g.stage)) {
      deals.active += count;
      deals.activeValue += value;
    } else if (g.stage === 'COMPLETED') {
      deals.completed += count;
      deals.completedValue += value;
    } else if (g.stage === 'CANCELLED') {
      deals.cancelled += count;
    }
  }

  return {
    totalProperties,
    totalClients,
    totalLeads: conversion.totalLeads,
    totalSiteVisits,
    activeLeads,
    wonLeads: conversion.wonLeads,
    lostLeads: conversion.lostLeads,
    conversionRate: conversion.conversionRate,
    /** Invoice-only revenue (original V2.0 meaning, kept for compatibility). */
    totalRevenue: invoiceRevenue,
    revenue: {
      invoices: invoiceRevenue,
      dealPayments: dealRevenue,
      total: invoiceRevenue + dealRevenue,
    },
    pendingPayments: pendingPaymentAgg._sum.amount || 0,
    deals,
    scope: actor && !isPrivileged(actor.role) ? 'me' : 'all',
    generatedAt: new Date().toISOString(),
  };
}

export async function getInventoryBreakdown() {
  const grouped = await prisma.property.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  // Always emit every status (in a stable order) so charts don't jump around.
  const order = ['AVAILABLE', 'RESERVED', 'BOOKED', 'SOLD'];
  const counts = new Map(grouped.map((g) => [g.status as string, g._count._all]));
  return order.map((status) => ({ status, count: counts.get(status) || 0 }));
}

export async function getLeadFunnel() {
  const grouped = await prisma.lead.groupBy({
    by: ['stage'],
    _count: { _all: true },
  });

  // Fold counts into canonical buckets (dormant WON -> CLOSED) so no leads are lost
  // from the chart before the backfill runs; emit all 10 stages so there are no gaps.
  const counts = new Map<string, number>();
  for (const g of grouped) {
    const bucket = displayStage(g.stage as StoredLeadStage);
    counts.set(bucket, (counts.get(bucket) || 0) + g._count._all);
  }

  return LEAD_STAGES.map((stage) => ({ stage, count: counts.get(stage) || 0 }));
}

/**
 * Collected revenue for the last 12 months (business timezone), oldest first,
 * zero-filled so the chart has no gaps and is always chronological.
 * Invoices use their last update as the paid date (no paidAt column on invoices);
 * deal payments use paidAt.
 */
export async function getRevenueByMonth(actor?: AnalyticsActor, months = 12) {
  const keys = lastMonthKeys(months);
  const [firstYear, firstMonth] = keys[0].split('-').map(Number);
  // A day of slack before the first month covers the timezone offset.
  const since = new Date(Date.UTC(firstYear, firstMonth - 1, 1) - 24 * 60 * 60 * 1000);

  const [invoices, payments] = await Promise.all([
    prisma.invoice.findMany({
      where: { status: 'PAID', updatedAt: { gte: since } },
      select: { amount: true, updatedAt: true },
    }),
    prisma.payment.findMany({
      where: {
        status: 'PAID',
        deal: dealScope(actor),
        OR: [{ paidAt: { gte: since } }, { paidAt: null, updatedAt: { gte: since } }],
      },
      select: { amount: true, paidAt: true, updatedAt: true },
    }),
  ]);

  const buckets = new Map(keys.map((k) => [k, { invoices: 0, deals: 0 }]));

  for (const inv of invoices) {
    const b = buckets.get(monthKey(inv.updatedAt));
    if (b) b.invoices += inv.amount;
  }
  for (const p of payments) {
    const b = buckets.get(monthKey(p.paidAt ?? p.updatedAt));
    if (b) b.deals += p.amount;
  }

  return keys.map((key) => {
    const b = buckets.get(key)!;
    return {
      key,
      month: monthLabel(key),
      invoices: b.invoices,
      deals: b.deals,
      total: b.invoices + b.deals,
    };
  });
}

export async function getBuilderPerformance() {
  const builders = await prisma.builder.findMany({
    orderBy: { name: 'asc' },
    include: {
      projects: {
        select: {
          id: true,
          properties: { select: { status: true } },
        },
      },
    },
  });

  // Properties link to builders through Project.projectId, so inventory per
  // builder is real data — not just a project count.
  return builders.map((b) => {
    let propertyCount = 0;
    let soldCount = 0;
    let availableCount = 0;
    for (const p of b.projects) {
      for (const prop of p.properties) {
        propertyCount += 1;
        if (prop.status === 'SOLD' || prop.status === 'BOOKED') soldCount += 1;
        if (prop.status === 'AVAILABLE') availableCount += 1;
      }
    }
    return {
      id: b.id,
      name: b.name,
      projectCount: b.projects.length,
      propertyCount,
      availableCount,
      soldCount,
      commissionPercent: b.commissionPercent,
    };
  });
}

export async function getConversionRate() {
  const { totalLeads, wonLeads, conversionRate } = await conversionNumbers();
  return { totalLeads, wonLeads, conversionRate };
}

/**
 * One snapshot for both the dashboard and the analytics page: same query, same
 * moment, so the two screens always show identical numbers.
 */
export async function getSnapshot(actor?: AnalyticsActor) {
  const [overview, funnel, inventory, revenueByMonth] = await Promise.all([
    getOverview(actor),
    getLeadFunnel(),
    getInventoryBreakdown(),
    getRevenueByMonth(actor),
  ]);
  return { overview, funnel, inventory, revenueByMonth };
}
