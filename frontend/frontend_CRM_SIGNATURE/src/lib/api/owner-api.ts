import { api } from '../axios';
import { Owner, OwnerFormValues, OwnerListResponse } from '@/types/owner';

export async function listOwnersRequest(params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<OwnerListResponse> {
  const { data } = await api.get('/owners', { params });
  return data.data;
}

export async function getOwnerRequest(id: string): Promise<Owner> {
  const { data } = await api.get(`/owners/${id}`);
  return data.data;
}

export async function createOwnerRequest(payload: OwnerFormValues): Promise<Owner> {
  const { data } = await api.post('/owners', payload);
  return data.data;
}

export async function updateOwnerRequest(id: string, payload: OwnerFormValues): Promise<Owner> {
  const { data } = await api.patch(`/owners/${id}`, payload);
  return data.data;
}

export async function deleteOwnerRequest(id: string): Promise<void> {
  await api.delete(`/owners/${id}`);
}

export async function linkPropertyRequest(ownerId: string, propertyId: string): Promise<Owner> {
  const { data } = await api.post(`/owners/${ownerId}/properties`, { propertyId });
  return data.data;
}

export async function unlinkPropertyRequest(ownerId: string, propertyId: string): Promise<Owner> {
  const { data } = await api.delete(`/owners/${ownerId}/properties/${propertyId}`);
  return data.data;
}