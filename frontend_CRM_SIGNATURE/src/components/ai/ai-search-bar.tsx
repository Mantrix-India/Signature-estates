'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Search, Loader2, X, Bed, Bath, Ruler, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { aiSearchRequest } from '@/lib/api/ai-api';
import { AiSearchResultItem } from '@/types/ai';

function formatPrice(price: number) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export function AiSearchBar() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<AiSearchResultItem[] | null>(null);
  const [aiParsed, setAiParsed] = useState(true);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await aiSearchRequest(query);
      setResults(response.results);
      setAiParsed(response.ai_parsed);
      if (!response.ai_parsed) {
        toast.error('AI search is temporarily unavailable — showing all available listings instead');
      } else if (response.results.length === 0) {
        toast('No matching properties found', { icon: '🔍' });
      }
    } catch {
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }

  function handleClear() {
    setQuery('');
    setResults(null);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <Sparkles
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Try "3 BHK under 90 lakh in Kharar"'
          className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-10 pr-24 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {results && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {isSearching ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
            Search
          </button>
        </div>
      </form>

      {results && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <Sparkles size={12} />
            {aiParsed
              ? `AI found ${results.length} matching ${results.length === 1 ? 'property' : 'properties'}`
              : 'Showing all available listings (AI parsing unavailable)'}
          </div>

          {results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-300 py-10 text-center dark:border-neutral-700">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No properties matched. Try a broader search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/properties/${item.id}`}
                  className="block rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                >
                  <p className="font-medium text-neutral-900 dark:text-white">{item.title}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                    <MapPin size={12} /> {item.city}, {item.state}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-neutral-900 dark:text-white">
                    {formatPrice(item.price)}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                    {item.bedrooms != null && item.bedrooms > 0 && (
                      <span className="flex items-center gap-1"><Bed size={12} /> {item.bedrooms}</span>
                    )}
                    {item.bathrooms != null && item.bathrooms > 0 && (
                      <span className="flex items-center gap-1"><Bath size={12} /> {item.bathrooms}</span>
                    )}
                    {item.areaSqft != null && (
                      <span className="flex items-center gap-1"><Ruler size={12} /> {item.areaSqft} sqft</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}