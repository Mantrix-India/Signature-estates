import { api } from '../axios';
import { SavedView } from '@/types/savedview';

export async function listSavedViewsRequest(entity?: string): Promise<SavedView[]> {
  const { data } = await api.get('/saved-views', { params: entity ? { entity } : {} });
  return data.data;
}

export async function createSavedViewRequest(payload: {
  name: string;
  entity: string;
  config: Record<string, unknown>;
}): Promise<SavedView> {
  const { data } = await api.post('/saved-views', payload);
  return data.data;
}

export async function deleteSavedViewRequest(id: string): Promise<void> {
  await api.delete(`/saved-views/${id}`);
}