'use client';

import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { FileText, Trash2, Upload } from 'lucide-react';
import { Deal } from '@/types/deal';
import { DocumentType } from '@/types/document';
import {
  uploadDealDocumentRequest,
  deleteDealDocumentRequest,
} from '@/lib/api/dealDocument-api';

const DOC_TYPES: DocumentType[] = ['BROCHURE', 'PAYMENT_PLAN', 'RERA', 'REGISTRY', 'INVOICE', 'OTHER'];

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white';

export function DocumentsPanel({ deal, onRefresh }: { deal: Deal; onRefresh: () => void }) {
  const documents = deal.documents ?? [];
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState<DocumentType>('OTHER');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload() {
    if (!file) {
      toast.error('Choose a file');
      return;
    }
    if (!title.trim()) {
      toast.error('Enter a title');
      return;
    }
    setBusy(true);
    try {
      await uploadDealDocumentRequest(deal.id, file, docType, title.trim());
      toast.success('Document uploaded');
      setTitle('');
      setDocType('OTHER');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to upload document');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    try {
      await deleteDealDocumentRequest(id);
      toast.success('Document removed');
      onRefresh();
    } catch {
      toast.error('Failed to remove document');
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Documents</h3>

      <div className="mt-4 space-y-2">
        {documents.length === 0 && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">No documents attached yet.</p>
        )}
        {documents.map((d) => (
          <div
            key={d.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-neutral-100 px-3 py-2 dark:border-neutral-800"
          >
            
             <a href={d.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-0 items-center gap-2 text-sm text-neutral-900 hover:underline dark:text-white"
            >
              <FileText size={15} className="shrink-0 text-neutral-400" />
              <span className="truncate">{d.title}</span>
              <span className="shrink-0 text-[11px] text-neutral-400">· {d.docType}</span>
            </a>
            <button
              onClick={() => remove(d.id)}
              aria-label="Delete document"
              className="shrink-0 text-neutral-400 transition-colors hover:text-red-500"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Document title" className={inputClass} />
        <div className="grid grid-cols-2 gap-2">
          <select value={docType} onChange={(e) => setDocType(e.target.value as DocumentType)} className={inputClass}>
            {DOC_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input
            ref={fileRef}
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-xs text-neutral-600 file:mr-2 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-xs file:font-medium dark:text-neutral-400 dark:file:bg-neutral-800 dark:file:text-neutral-200"
          />
        </div>
        <button
          onClick={upload}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          <Upload size={15} />
          {busy ? 'Uploading...' : 'Upload document'}
        </button>
      </div>
    </div>
  );
}