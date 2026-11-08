import { api } from '../axios';
import { InventoryStatusLog, ProjectInventory, BulkUpdateItem, BulkUpdateResult, InventorySource } from '@/types/inventory';

export async function updatePropertyStatusRequest(
  propertyId: string,
  status: string,
  source: InventorySource,
  note?: string
) {
  const { data } = await api.patch(`/properties/${propertyId}/status`, { status, source, note });
  return data.data;
}

export async function getStatusHistoryRequest(propertyId: string): Promise<InventoryStatusLog[]> {
  const { data } = await api.get(`/properties/${propertyId}/status-history`);
  return data.data;
}

export async function getProjectInventoryRequest(projectId: string): Promise<ProjectInventory> {
  const { data } = await api.get(`/inventory/projects/${projectId}`);
  return data.data;
}

export async function bulkUpdateStatusRequest(
  updates: BulkUpdateItem[],
  source: InventorySource,
  note?: string
): Promise<BulkUpdateResult[]> {
  const { data } = await api.post('/inventory/bulk-update', { updates, source, note });
  return data.data;
}