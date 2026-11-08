import { api } from '../axios';
import { Commission, CommissionFormValues, CommissionUpdateValues } from '@/types/deal';

export async function listCommissionsRequest(): Promise<Commission[]> {
  const { data } = await api.get('/commissions');
  return data.data;
}

export async function getCommissionByDealRequest(dealId: string): Promise<Commission> {
  const { data } = await api.get(`/commissions/deal/${dealId}`);
  return data.data;
}

export async function upsertCommissionRequest(payload: CommissionFormValues): Promise<Commission> {
  const { data } = await api.post('/commissions', payload);
  return data.data;
}

export async function updateCommissionRequest(
  id: string,
  payload: CommissionUpdateValues
): Promise<Commission> {
  const { data } = await api.patch(`/commissions/${id}`, payload);
  return data.data;
}

export async function deleteCommissionRequest(id: string): Promise<void> {
  await api.delete(`/commissions/${id}`);
}