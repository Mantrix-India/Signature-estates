import type { UserRole } from '@/types/auth';

/** Roles allowed to publish to the public website. Mirrors PUBLISH_ROLES in the backend. */
export const PUBLISH_ROLES: UserRole[] = ['ADMIN', 'MANAGER'];

export function canPublishRole(role?: UserRole | null) {
  return !!role && PUBLISH_ROLES.includes(role);
}

/** Public page for a property, if NEXT_PUBLIC_WEBSITE_URL is set (e.g. http://localhost:3001). */
export function websitePropertyUrl(slug?: string | null) {
  const base = process.env.NEXT_PUBLIC_WEBSITE_URL?.replace(/\/+$/, '');
  return base && slug ? `${base}/properties/${slug}` : undefined;
}
