import { api } from '../axios';
import { PropertyDocument, DocumentType } from '@/types/document';

export async function listDocumentsRequest(propertyId: string): Promise<PropertyDocument[]> {
  const { data } = await api.get(`/documents/property/${propertyId}`);
  return data.data;
}

export async function uploadDocumentRequest(
  propertyId: string,
  file: File,
  docType: DocumentType,
  title: string
): Promise<PropertyDocument> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('propertyId', propertyId);
  formData.append('docType', docType);
  formData.append('title', title);

  const { data } = await api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function deleteDocumentRequest(id: string): Promise<void> {
  await api.delete(`/documents/${id}`);
}