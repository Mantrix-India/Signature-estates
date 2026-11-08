import { api } from '../axios';
import {
  Client,
  ClientListResponse,
  ClientFilters,
  ClientFormValues,
  RequirementFormValues,
} from '@/types/client';
import { ClientEngagement } from '@/types/engagement';
import { TimelineResponse } from '@/types/timeline';



export async function listClientsRequest(filters: ClientFilters): Promise<ClientListResponse> {
  const { data } = await api.get('/clients', { params: filters });
  return data.data;
}

export async function getClientRequest(id: string): Promise<Client> {
  const { data } = await api.get(`/clients/${id}`);
  return data.data;
}

export async function createClientRequest(payload: ClientFormValues): Promise<Client> {
  const { data } = await api.post('/clients', payload);
  return data.data;
}

export async function updateClientRequest(
  id: string,
  payload: Partial<ClientFormValues>
): Promise<Client> {
  const { data } = await api.patch(`/clients/${id}`, payload);
  return data.data;
}

export async function deleteClientRequest(id: string): Promise<void> {
  await api.delete(`/clients/${id}`);
}

export async function addRequirementRequest(clientId: string, payload: RequirementFormValues) {
  const { data } = await api.post(`/clients/${clientId}/requirements`, payload);
  return data.data;
}

export async function addNoteRequest(clientId: string, content: string) {
  const { data } = await api.post(`/clients/${clientId}/notes`, { content });
  return data.data;
}

export async function addTimelineEventRequest(
  clientId: string,
  payload: { eventType: string; description: string }
) {
  const { data } = await api.post(`/clients/${clientId}/timeline`, payload);
  return data.data;
}

export async function regeneratePortalTokenRequest(
  clientId: string,
  expiresAt?: string
): Promise<{ token: string }> {
  const { data } = await api.post(`/clients/${clientId}/portal-token/regenerate`, { expiresAt });
  return data.data;
}

export async function revokePortalTokenRequest(clientId: string): Promise<void> {
  await api.post(`/clients/${clientId}/portal-token/revoke`);
}

export async function getClientEngagementRequest(clientId: string): Promise<ClientEngagement> {
  const { data } = await api.get(`/clients/${clientId}/engagement`);
  return data.data;
}

export async function getClientTimelineRequest(
  clientId: string,
  params?: { page?: number; limit?: number; source?: string }
): Promise<TimelineResponse> {
  const { data } = await api.get(`/clients/${clientId}/timeline`, { params });
  return data.data;
}