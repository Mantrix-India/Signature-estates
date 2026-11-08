import { api } from '../axios';
import { Collection, CreateCollectionValues } from '@/types/collection';

export async function listCollectionsRequest(
  clientId: string,
  includeArchived = false
): Promise<Collection[]> {
  const { data } = await api.get('/collections', { params: { clientId, includeArchived } });
  return data.data;
}

export async function getCollectionRequest(id: string): Promise<Collection> {
  const { data } = await api.get(`/collections/${id}`);
  return data.data;
}

export async function createCollectionRequest(
  payload: CreateCollectionValues
): Promise<Collection> {
  const { data } = await api.post('/collections', payload);
  return data.data;
}

export async function updateCollectionRequest(
  id: string,
  payload: { name?: string; description?: string | null; expiresAt?: string | null; isArchived?: boolean }
): Promise<Collection> {
  const { data } = await api.patch(`/collections/${id}`, payload);
  return data.data;
}

export async function addCollectionPropertyRequest(
  id: string,
  propertyId: string
): Promise<Collection> {
  const { data } = await api.post(`/collections/${id}/properties`, { propertyId });
  return data.data;
}

export async function removeCollectionPropertyRequest(
  id: string,
  propertyId: string
): Promise<Collection> {
  const { data } = await api.delete(`/collections/${id}/properties/${propertyId}`);
  return data.data;
}

export async function revokeCollectionRequest(id: string): Promise<Collection> {
  const { data } = await api.post(`/collections/${id}/revoke`);
  return data.data;
}

export async function regenerateCollectionRequest(
  id: string,
  expiresAt?: string | null
): Promise<Collection> {
  const { data } = await api.post(`/collections/${id}/regenerate`, { expiresAt });
  return data.data;
}