'use client';

import { useState, useRef } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { DocumentType } from '@/types/document';
import { uploadDocumentRequest } from '@/lib/api/document-api';

const docTypes: DocumentType[] = ['BROCHURE', 'PAYMENT_PLAN', 'RERA', 'REGISTRY', 'INVOICE', 'OTHER'];

export function DocumentUpload({
  propertyId,
  onUploaded,
}: {
  propertyId: string;
  onUploaded: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState<DocumentType>('BROCHURE');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(file: File) {
    setPendingFile(file);
    setTitle(file.name.replace(/\.[^/.]+$/, ''));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  async function handleUpload() {
    if (!pendingFile || !title.trim()) return;
    setIsUploading(true);
    try {
      await uploadDocumentRequest(propertyId, pendingFile, docType, title);
      toast.success('Document uploaded');
      setPendingFile(null);
      setTitle('');
      onUploaded();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }

  if (pendingFile) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="mb-3 text-sm text-neutral-600 dark:text-neutral-300">
          Selected: <span className="font-medium">{pendingFile.name}</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document title"
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
          />
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocumentType)}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
          >
            {docTypes.map((t) => (
              <option key={t} value={t}>{t.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setPendingFile(null)}
            className="flex-1 rounded-lg border border-neutral-200 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading || !title.trim()}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-neutral-900 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {isUploading ? <Loader2 size={14} className="animate-spin" /> : null}
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 text-center transition-colors ${
        isDragging
          ? 'border-neutral-400 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800/50'
          : 'border-neutral-200 dark:border-neutral-800'
      }`}
    >
      <UploadCloud size={24} className="mb-2 text-neutral-400" />
      <p className="text-sm text-neutral-600 dark:text-neutral-300">
        Drag a file here, or click to browse
      </p>
      <p className="mt-1 text-xs text-neutral-400">PDF, JPG, PNG, WEBP, DOC — up to 10MB</p>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />
    </div>
  );
}