export type LeadStage = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'NEGOTIATION' | 'WON' | 'LOST';
export type ActivityType = 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'OTHER';

export interface LeadSource {
  id: string;
  name: string;
}

export interface LeadActivity {
  id: string;
  activityType: ActivityType;
  description: string;
  createdAt: string;
  createdBy: { id: string; fullName: string };
}

export interface LeadTask {
  id: string;
  title: string;
  dueDate?: string | null;
  isCompleted: boolean;
  assignedTo: { id: string; fullName: string };
}

export interface Lead {
  id: string;
  clientId: string;
  client: { id: string; fullName: string; phone: string };
  propertyId?: string | null;
  property?: { id: string; title: string; price: number } | null;
  leadSourceId?: string | null;
  leadSource?: LeadSource | null;
  assignedToId: string;
  assignedTo: { id: string; fullName: string };
  stage: LeadStage;
  createdAt: string;
  updatedAt: string;
  activities?: LeadActivity[];
  tasks?: LeadTask[];
}

export type LeadBoard = Record<LeadStage, Lead[]>;

export interface LeadFormValues {
  clientId: string;
  propertyId?: string;
  leadSourceId?: string;
  assignedToId: string;
}