import { api } from '../axios';
import { SiteVisit, SiteVisitListResponse, SiteVisitFilters, SiteVisitFormValues } from '@/types/siteVisit';

export async function listSiteVisitsRequest(filters: SiteVisitFilters): Promise<SiteVisitListResponse> {
  const { data } = await api.get('/site-visits', { params: filters });
  return data.data;
}

export async function getSiteVisitRequest(id: string): Promise<SiteVisit> {
  const { data } = await api.get(`/site-visits/${id}`);
  return data.data;
}

export async function createSiteVisitRequest(payload: SiteVisitFormValues): Promise<SiteVisit> {
  const { data } = await api.post('/site-visits', payload);
  return data.data;
}

export async function updateSiteVisitStatusRequest(id: string, status: string): Promise<SiteVisit> {
  const { data } = await api.patch(`/site-visits/${id}`, { status });
  return data.data;
}

export async function confirmByClientRequest(id: string): Promise<SiteVisit> {
  const { data } = await api.post(`/site-visits/${id}/confirm-client`);
  return data.data;
}

export async function confirmByBuilderRequest(id: string): Promise<SiteVisit> {
  const { data } = await api.post(`/site-visits/${id}/confirm-builder`);
  return data.data;
}

export async function deleteSiteVisitRequest(id: string): Promise<void> {
  await api.delete(`/site-visits/${id}`);
}