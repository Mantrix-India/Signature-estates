import { api } from '../axios';
import { AiSearchResponse, AiSummaryResponse } from '@/types/ai';

export async function aiSearchRequest(query: string): Promise<AiSearchResponse> {
  const { data } = await api.post('/ai/search', { query });
  return data.data;
}

export async function aiSummaryRequest(propertyId: string): Promise<AiSummaryResponse> {
  const { data } = await api.post(`/ai/summary/${propertyId}`);
  return data.data;
}