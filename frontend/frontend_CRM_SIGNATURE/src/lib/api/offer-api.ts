import { api } from '../axios';
import { Offer, OfferFormValues } from '@/types/offer';

export async function listOffersRequest(params?: {
  leadId?: string;
  status?: string;
}): Promise<Offer[]> {
  const { data } = await api.get('/offers', { params });
  return data.data;
}

export async function getOfferRequest(id: string): Promise<Offer> {
  const { data } = await api.get(`/offers/${id}`);
  return data.data;
}

export async function createOfferRequest(payload: OfferFormValues): Promise<Offer> {
  const { data } = await api.post('/offers', payload);
  return data.data;
}

export async function updateOfferRequest(
  id: string,
  payload: Partial<{ amount: number; status: string; party: string; note: string; validUntil: string }>
): Promise<Offer> {
  const { data } = await api.patch(`/offers/${id}`, payload);
  return data.data;
}

export async function deleteOfferRequest(id: string): Promise<void> {
  await api.delete(`/offers/${id}`);
}