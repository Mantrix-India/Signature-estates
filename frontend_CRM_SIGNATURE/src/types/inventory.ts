export type InventorySource = 'AGENT' | 'BUILDER';

export interface InventoryStatusLog {
  id: string;
  previousStatus: string;
  newStatus: string;
  source: InventorySource;
  note?: string | null;
  createdAt: string;
  changedBy: { id: string; fullName: string };
}

export interface ProjectInventory {
  projectId: string;
  projectName: string;
  total: number;
  summary: {
    AVAILABLE: number;
    RESERVED: number;
    BOOKED: number;
    SOLD: number;
  };
  properties: {
    id: string;
    title: string;
    status: string;
    price: number;
  }[];
}

export interface BulkUpdateItem {
  propertyId: string;
  status: string;
}

export interface BulkUpdateResult {
  propertyId: string;
  success: boolean;
  property?: any;
  error?: string;
}