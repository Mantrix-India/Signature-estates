"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { globalSearchRequest } from '@/lib/api/search-api';
import type { SearchResults } from '@/types/search';
import { formatPrice } from '@/lib/format';

const EMPTY: SearchResults = { clients: [], leads: [], properties: [] };

export function GlobalSearch() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (term.length === 0) {
      setResults(EMPTY);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await globalSearchRequest(term);
        setResults(r);
      } catch {
        setResults(EMPTY);
      } finally {
        setIsLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQ('');
      router.push(href);
    },
    [router]
  );

  const total = results.clients.length + results.leads.length + results.properties.length;

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm dark:border-neutral-800 dark:bg-neutral-950/50">
        <Search size={15} className="text-neutral-400" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search everything…"
          className="w-56 bg-transparent text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-white"
        />
        {q ? (
          <button onClick={() => setQ('')} aria-label="Clear search" className="text-neutral-400 hover:text-neutral-600">
            <X size={14} />
          </button>
        ) : (
          <kbd className="rounded border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800">
            ⌘K
          </kbd>
        )}
      </div>

      {open && q.trim().length > 0 && (
        <div className="absolute left-0 top-11 z-30 max-h-96 w-96 overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          {isLoading ? (
            <p className="p-4 text-sm text-neutral-500 dark:text-neutral-400">Searching…</p>
          ) : total === 0 ? (
            <p className="p-4 text-sm text-neutral-500 dark:text-neutral-400">No results.</p>
          ) : (
            <div className="py-2">
              {results.clients.length > 0 && (
                <Section label="Clients">
                  {results.clients.map((c) => (
                    <Row key={c.id} onClick={() => go(c.link)} title={c.fullName} subtitle={`${c.phone} · ${c.status}`} />
                  ))}
                </Section>
              )}
              {results.leads.length > 0 && (
                <Section label="Leads">
                  {results.leads.map((l) => (
                    <Row key={l.id} onClick={() => go(l.link)} title={l.client.fullName} subtitle={l.stage} />
                  ))}
                </Section>
              )}
              {results.properties.length > 0 && (
                <Section label="Properties">
                  {results.properties.map((p) => (
                    <Row
                      key={p.id}
                      onClick={() => go(p.link)}
                      title={p.title}
                      subtitle={`${p.city} · ${formatPrice(p.price)} · ${p.status}`}
                    />
                  ))}
                </Section>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-1">
      <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
        {label}
      </p>
      {children}
    </div>
  );
}

function Row({ title, subtitle, onClick }: { title: string; subtitle?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="block w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      <p className="truncate text-sm text-neutral-900 dark:text-white">{title}</p>
      {subtitle && <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{subtitle}</p>}
    </button>
  );
}