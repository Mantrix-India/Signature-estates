import { api } from '../axios';
import {
  Deal,
  DealFormValues,
  DealListResponse,
  DealTransitionValues,
} from '@/types/deal';

export async function listDealsRequest(params?: {
  page?: number;
  limit?: number;
  scope?: 'me' | 'all';
  stage?: string;
  agentId?: string;
}): Promise<DealListResponse> {
  const { data } = await api.get('/deals', { params });
  return data.data;
}

export async function getDealRequest(id: string): Promise<Deal> {
  const { data } = await api.get(`/deals/${id}`);
  return data.data;
}

export async function createDealRequest(payload: DealFormValues): Promise<Deal> {
  const { data } = await api.post('/deals', payload);
  return data.data;
}

export async function updateDealRequest(
  id: string,
  payload: Partial<{ ownerId: string | null; agentId: string; dealValue: number; notes: string }>
): Promise<Deal> {
  const { data } = await api.patch(`/deals/${id}`, payload);
  return data.data;
}

export async function transitionDealRequest(
  id: string,
  payload: DealTransitionValues
): Promise<Deal> {
  const { data } = await api.patch(`/deals/${id}/stage`, payload);
  return data.data;
}

export async function deleteDealRequest(id: string): Promise<void> {
  await api.delete(`/deals/${id}`);
}