export interface FollowUp {
  id: string;
  title: string;
  dueDate?: string | null;
  isCompleted: boolean;
  createdAt: string;
  assignedTo: { id: string; fullName: string };
  lead?: {
    id: string;
    stage: string;
    client: { id: string; fullName: string; phone: string };
  } | null;
}

export interface FollowUpBuckets {
  counts: { overdue: number; today: number; upcoming: number; noDueDate: number };
  overdue: FollowUp[];
  today: FollowUp[];
  upcoming: FollowUp[];
  noDueDate?: FollowUp[];
}

export interface FollowUpFormValues {
  title: string;
  dueDate?: string;
  assignedToId?: string;
  leadId?: string;
}