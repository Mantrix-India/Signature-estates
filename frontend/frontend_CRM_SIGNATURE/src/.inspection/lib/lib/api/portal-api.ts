import axios from 'axios';
import { PortalData } from '@/types/portal';

// Deliberately a separate, bare axios instance — the portal is unauthenticated,
// so it must NOT use the main `api` instance from lib/axios.ts, which attaches
// a Bearer token and 401-triggers a redirect to /login (which a client has no access to).
const PORTAL_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function getPortalDataRequest(token: string): Promise<PortalData> {
  const { data } = await axios.get(`${PORTAL_API_URL}/portal/${token}`);
  return data.data;
}

export async function addPortalFavoriteRequest(token: string, propertyId: string): Promise<void> {
  await axios.post(`${PORTAL_API_URL}/portal/${token}/favorites`, { propertyId });
}

export async function removePortalFavoriteRequest(token: string, propertyId: string): Promise<void> {
  await axios.delete(`${PORTAL_API_URL}/portal/${token}/favorites/${propertyId}`);
}

export async function confirmPortalVisitRequest(token: string, visitId: string): Promise<void> {
  await axios.post(`${PORTAL_API_URL}/portal/${token}/site-visits/${visitId}/confirm`);
}