import { api } from '../axios';
import { Builder, BuilderListResponse, BuilderFilters, BuilderFormValues } from '@/types/builder';

export async function listBuildersRequest(filters: BuilderFilters): Promise<BuilderListResponse> {
  const { data } = await api.get('/builders', { params: filters });
  return data.data;
}

export async function getBuilderRequest(id: string): Promise<Builder> {
  const { data } = await api.get(`/builders/${id}`);
  return data.data;
}

export async function createBuilderRequest(payload: BuilderFormValues): Promise<Builder> {
  const { data } = await api.post('/builders', payload);
  return data.data;
}

export async function updateBuilderRequest(
  id: string,
  payload: Partial<BuilderFormValues>
): Promise<Builder> {
  const { data } = await api.patch(`/builders/${id}`, payload);
  return data.data;
}

export async function deleteBuilderRequest(id: string): Promise<void> {
  await api.delete(`/builders/${id}`);
}