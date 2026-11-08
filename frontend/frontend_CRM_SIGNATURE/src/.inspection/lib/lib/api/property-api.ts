import { api } from '../axios';
import { Property, PropertyListResponse, PropertyFilters, PropertyFormValues } from '@/types/property';

export async function listPropertiesRequest(filters: PropertyFilters): Promise<PropertyListResponse> {
  const { data } = await api.get('/properties', { params: filters });
  return data.data;
}

export async function getPropertyRequest(id: string): Promise<Property> {
  const { data } = await api.get(`/properties/${id}`);
  return data.data;
}

export async function createPropertyRequest(payload: PropertyFormValues): Promise<Property> {
  const { data } = await api.post('/properties', payload);
  return data.data;
}

export async function updatePropertyRequest(
  id: string,
  payload: Partial<PropertyFormValues>
): Promise<Property> {
  const { data } = await api.patch(`/properties/${id}`, payload);
  return data.data;
}

export async function deletePropertyRequest(id: string): Promise<void> {
  await api.delete(`/properties/${id}`);
}

export async function comparePropertiesRequest(ids: string[]): Promise<Property[]> {
  const { data } = await api.get('/properties/compare', { params: { ids: ids.join(',') } });
  return data.data;
}