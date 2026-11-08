import { api } from '../axios';

export async function bulkClientsRequest(payload: {
  ids: string[];
  action: 'status' | 'delete';
  status?: string;
}): Promise<{ updated?: number; deleted?: number }> {
  const { data } = await api.post('/bulk/clients', payload);
  return data.data;
}

export async function bulkLeadsRequest(payload: {
  ids: string[];
  action: 'stage' | 'assignee' | 'delete';
  stage?: string;
  assignedToId?: string;
}): Promise<{ updated?: number; deleted?: number }> {
  const { data } = await api.post('/bulk/leads', payload);
  return data.data;
}