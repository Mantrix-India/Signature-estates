import { api } from '../axios';
import {
  Client,
  ClientListResponse,
  ClientFilters,
  ClientFormValues,
  RequirementFormValues,
} from '@/types/client';

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