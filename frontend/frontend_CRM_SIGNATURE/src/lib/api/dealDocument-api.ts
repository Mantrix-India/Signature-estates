import { api } from '../axios';
import { DealDocument } from '@/types/deal';
import { DocumentType } from '@/types/document';

export async function listDealDocumentsRequest(dealId: string): Promise<DealDocument[]> {
  const { data } = await api.get(`/deal-documents/deal/${dealId}`);
  return data.data;
}

export async function uploadDealDocumentRequest(
  dealId: string,
  file: File,
  docType: DocumentType,
  title: string
): Promise<DealDocument> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('dealId', dealId);
  formData.append('docType', docType);
  formData.append('title', title);

  const { data } = await api.post('/deal-documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function deleteDealDocumentRequest(id: string): Promise<void> {
  await api.delete(`/deal-documents/${id}`);
}