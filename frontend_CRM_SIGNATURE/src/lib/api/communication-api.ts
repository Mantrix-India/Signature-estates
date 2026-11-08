import { api } from '../axios';
import {
  CommunicationLog,
  CommunicationListResponse,
  CommunicationFormValues,
} from '@/types/communication';

export async function listCommunicationsRequest(params: {
  clientId?: string;
  leadId?: string;
  type?: string;
  direction?: string;
  page?: number;
  limit?: number;
}): Promise<CommunicationListResponse> {
  const { data } = await api.get('/communications', { params });
  return data.data;
}

export async function createCommunicationRequest(
  payload: CommunicationFormValues
): Promise<CommunicationLog> {
  const { data } = await api.post('/communications', payload);
  return data.data;
}

export async function deleteCommunicationRequest(id: string): Promise<void> {
  await api.delete(`/communications/${id}`);
}