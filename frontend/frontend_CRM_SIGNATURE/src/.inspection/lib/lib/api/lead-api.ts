import { api } from '../axios';
import { Lead, LeadBoard, LeadFormValues, LeadSource } from '@/types/lead';

export async function listLeadSourcesRequest(): Promise<LeadSource[]> {
  const { data } = await api.get('/leads/sources');
  return data.data;
}

export async function createLeadSourceRequest(name: string): Promise<LeadSource> {
  const { data } = await api.post('/leads/sources', { name });
  return data.data;
}

export async function getLeadBoardRequest(): Promise<LeadBoard> {
  const { data } = await api.get('/leads/board');
  return data.data;
}

export async function getLeadRequest(id: string): Promise<Lead> {
  const { data } = await api.get(`/leads/${id}`);
  return data.data;
}

export async function createLeadRequest(payload: LeadFormValues): Promise<Lead> {
  const { data } = await api.post('/leads', payload);
  return data.data;
}

export async function updateLeadStageRequest(id: string, stage: string): Promise<Lead> {
  const { data } = await api.patch(`/leads/${id}`, { stage });
  return data.data;
}

export async function addActivityRequest(leadId: string, payload: { activityType: string; description: string }) {
  const { data } = await api.post(`/leads/${leadId}/activities`, payload);
  return data.data;
}

export async function addTaskRequest(
  leadId: string,
  payload: { title: string; dueDate?: string; assignedToId: string }
) {
  const { data } = await api.post(`/leads/${leadId}/tasks`, payload);
  return data.data;
}

export async function toggleTaskRequest(leadId: string, taskId: string, isCompleted: boolean) {
  const { data } = await api.patch(`/leads/${leadId}/tasks/${taskId}`, { isCompleted });
  return data.data;
}