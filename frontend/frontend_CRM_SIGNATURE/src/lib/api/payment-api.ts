import { api } from '../axios';
import { Payment, PaymentFormValues, PaymentUpdateValues } from '@/types/deal';

export async function listPaymentsRequest(dealId: string): Promise<Payment[]> {
  const { data } = await api.get('/payments', { params: { dealId } });
  return data.data;
}

export async function createPaymentRequest(payload: PaymentFormValues): Promise<Payment> {
  const { data } = await api.post('/payments', payload);
  return data.data;
}

export async function updatePaymentRequest(
  id: string,
  payload: PaymentUpdateValues
): Promise<Payment> {
  const { data } = await api.patch(`/payments/${id}`, payload);
  return data.data;
}

export async function deletePaymentRequest(id: string): Promise<void> {
  await api.delete(`/payments/${id}`);
}