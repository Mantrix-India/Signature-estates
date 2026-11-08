import { api } from '../axios';
import { FollowUp, FollowUpBuckets, FollowUpFormValues } from '@/types/followup';

export async function listFollowUpsRequest(params?: {
  scope?: 'me' | 'all';
  assignedToId?: string;
  includeNoDueDate?: boolean;
}): Promise<FollowUpBuckets> {
  const { data } = await api.get('/follow-ups', { params });
  return data.data;
}

export async function createFollowUpRequest(payload: FollowUpFormValues): Promise<FollowUp> {
  const { data } = await api.post('/follow-ups', payload);
  return data.data;
}

export async function updateFollowUpRequest(
  id: string,
  payload: { title?: string; dueDate?: string | null; isCompleted?: boolean; assignedToId?: string }
): Promise<FollowUp> {
  const { data } = await api.patch(`/follow-ups/${id}`, payload);
  return data.data;
}

export async function deleteFollowUpRequest(id: string): Promise<void> {
  await api.delete(`/follow-ups/${id}`);
}