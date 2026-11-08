export type DocumentType = 'BROCHURE' | 'PAYMENT_PLAN' | 'RERA' | 'REGISTRY' | 'INVOICE' | 'OTHER';

export interface PropertyDocument {
  id: string;
  title: string;
  docType: DocumentType;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  uploadedBy: { id: string; fullName: string };
}