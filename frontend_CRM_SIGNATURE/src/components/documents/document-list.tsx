'use client';

import { FileText, Trash2, ExternalLink } from 'lucide-react';
import { PropertyDocument } from '@/types/document';

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentList({
  documents,
  onDelete,
}: {
  documents: PropertyDocument[];
  onDelete: (id: string) => void;
}) {
  if (documents.length === 0) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        No documents uploaded yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800"
        >
          <div className="flex items-center gap-3">
            <FileText size={16} className="text-neutral-400" />
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">{doc.title}</p>
              <p className="text-xs text-neutral-400">
                {doc.docType.replace('_', ' ')} · {formatFileSize(doc.fileSize)} ·{' '}
                {doc.uploadedBy.fullName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            
             <a href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              aria-label="Open document"
            >
              <ExternalLink size={14} />
            </a>
            <button
              onClick={() => onDelete(doc.id)}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-red-600 dark:hover:bg-neutral-800"
              aria-label="Delete document"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}