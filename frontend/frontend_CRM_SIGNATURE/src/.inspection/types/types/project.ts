export type ProjectStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED';

export interface Project {
  id: string;
  builderId: string;
  name: string;
  description?: string | null;
  city: string;
  state: string;
  status: ProjectStatus;
  launchDate?: string | null;
  possessionDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFormValues {
  builderId: string;
  name: string;
  description?: string;
  city: string;
  state: string;
  status?: ProjectStatus;
}