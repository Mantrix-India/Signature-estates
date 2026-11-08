import { api } from '../axios';
import { Invoice, InvoiceFormValues } from '@/types/invoice';

export async function listInvoicesRequest(): Promise<Invoice[]> {
  const { data } = await api.get('/invoices');
  return data.data;
}

export async function createInvoiceRequest(payload: InvoiceFormValues): Promise<Invoice> {
  const { data } = await api.post('/invoices', payload);
  return data.data;
}

export async function updateInvoiceStatusRequest(id: string, status: string): Promise<Invoice> {
  const { data } = await api.patch(`/invoices/${id}`, { status });
  return data.data;
}

export async function deleteInvoiceRequest(id: string): Promise<void> {
  await api.delete(`/invoices/${id}`);
}