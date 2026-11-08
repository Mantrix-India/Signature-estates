import { Prisma } from '@prisma/client';
import { env, WebsiteLeadAssignment } from '../config/env';
import { AppError } from '../utils/AppError';

/**
 * Who gets a new website lead.
 *
 * To change strategy: set WEBSITE_LEAD_ASSIGNMENT in .env, or add a function to
 * STRATEGIES below (e.g. "least_open_leads", "by_city") and allow its name in
 * config/env.ts. Every strategy returns a user id or null; null falls through
 * to the safety chain in pickWebsiteLeadAssignee.
 */

type Tx = Prisma.TransactionClient;
type Strategy = (tx: Tx) => Promise<string | null>;

/** Namespace for pg advisory locks taken by the public website flow. */
export const PUBLIC_LOCK_NAMESPACE = 7311;

async function activeUserId(tx: Tx, id: string): Promise<string | null> {
  if (!id) return null;
  const user = await tx.user.findFirst({
    where: { id, isActive: true },
    select: { id: true },
  });
  return user?.id ?? null;
}

/**
 * Round-robin across active AGENT users, ordered by join date. Stateless: the
 * next agent is the one after whoever received the most recent website lead.
 * A transaction-scoped advisory lock serialises concurrent enquiries so two
 * leads arriving at once don't both go to the same agent.
 */
const roundRobin: Strategy = async (tx) => {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(${PUBLIC_LOCK_NAMESPACE}::int, hashtext('website-round-robin'))`;

  const agents = await tx.user.findMany({
    where: { role: 'AGENT', isActive: true },
    select: { id: true },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });
  if (agents.length === 0) return null;
  const ids = agents.map((a) => a.id);

  const last = await tx.lead.findFirst({
    where: {
      leadSource: { name: { equals: 'Website', mode: 'insensitive' } },
      assignedToId: { in: ids },
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: { assignedToId: true },
  });

  const lastIndex = last ? ids.indexOf(last.assignedToId) : -1;
  return ids[(lastIndex + 1) % ids.length];
};

const defaultAgent: Strategy = (tx) => activeUserId(tx, env.publicSite.defaultAgentId);

const STRATEGIES: Record<WebsiteLeadAssignment, Strategy> = {
  round_robin: roundRobin,
  default_agent: defaultAgent,
};

/**
 * Configured strategy -> default agent -> round robin -> oldest active
 * ADMIN/MANAGER. A website lead is never dropped just because nobody matched.
 */
export async function pickWebsiteLeadAssignee(tx: Tx): Promise<string> {
  const chosen =
    (await STRATEGIES[env.publicSite.leadAssignment](tx)) ??
    (await defaultAgent(tx)) ??
    (env.publicSite.leadAssignment !== 'round_robin' ? await roundRobin(tx) : null);
  if (chosen) return chosen;

  const fallback = await tx.user.findFirst({
    where: { isActive: true, role: { in: ['ADMIN', 'MANAGER'] } },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    select: { id: true },
  });
  if (fallback) return fallback.id;

  console.error('[public-enquiry] No active user available to assign a website lead to.');
  throw new AppError('We could not submit your enquiry right now. Please call us instead.', 503);
}
