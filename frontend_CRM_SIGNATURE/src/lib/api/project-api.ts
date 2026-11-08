import { api } from '../axios';
import { Project, ProjectFormValues } from '@/types/project';

export async function createProjectRequest(payload: ProjectFormValues): Promise<Project> {
  const { data } = await api.post('/projects', payload);
  return data.data;
}

export async function updateProjectRequest(
  id: string,
  payload: Partial<ProjectFormValues>
): Promise<Project> {
  const { data } = await api.patch(`/projects/${id}`, payload);
  return data.data;
}

export async function deleteProjectRequest(id: string): Promise<void> {
  await api.delete(`/projects/${id}`);
}