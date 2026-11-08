import { useState } from 'react';
import { Heart, MapPin, Bed, Bath, Ruler, CalendarPlus, MessageSquarePlus } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { FeedbackSentiment } from '@/types/portal';

const SENTIMENTS: { key: FeedbackSentiment; label: string; active: string }[] = [
  { key: 'INTERESTED', label: 'Interested', active: 'border-emerald-300 bg-emerald-50 text-emerald-700' },
  { key: 'MAYBE', label: 'Maybe', active: 'border-amber-300 bg-amber-50 text-amber-700' },
  { key: 'NOT_INTERESTED', label: 'Not for me', active: 'border-rose-300 bg-rose-50 text-rose-700' },
];

export function PortalPropertyCard({
  title,
  price,
  address,
  city,
  bedrooms,
  bathrooms,
  areaSqft,
  isFavorited,
  onToggleFavorite,
  feedback,
  onFeedback,
  onRequestVisit,
  onComment,
}: {
  title: string;
  price: number;
  address: string;
  city: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  areaSqft?: number | null;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  feedback?: FeedbackSentiment | null;
  onFeedback?: (sentiment: FeedbackSentiment) => void;
  onRequestVisit?: () => void;
  onComment?: (body: string) => void;
}) {
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');

  function submitComment() {
    const trimmed = comment.trim();
    if (!trimmed || !onComment) return;
    onComment(trimmed);
    setComment('');
    setShowComment(false);
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
        <button
          onClick={onToggleFavorite}
          className="rounded-lg p-1.5 hover:bg-neutral-100"
          aria-label="Toggle favorite"
        >
          <Heart size={18} className={isFavorited ? 'fill-red-500 text-red-500' : 'text-neutral-300'} />
        </button>
      </div>

      <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500">
        <MapPin size={13} /> {address}, {city}
      </p>
      <p className="mt-3 text-lg font-semibold text-neutral-900">{formatPrice(price)}</p>

      {(bedrooms != null || bathrooms != null || areaSqft != null) && (
        <div className="mt-3 flex items-center gap-4 border-t border-neutral-100 pt-3 text-sm text-neutral-600">
          {bedrooms != null && <span className="flex items-center gap-1"><Bed size={14} /> {bedrooms}</span>}
          {bathrooms != null && <span className="flex items-center gap-1"><Bath size={14} /> {bathrooms}</span>}
          {areaSqft != null && <span className="flex items-center gap-1"><Ruler size={14} /> {areaSqft} sqft</span>}
        </div>
      )}

      {onFeedback && (
        <div className="mt-4 flex flex-wrap gap-2">
          {SENTIMENTS.map((s) => (
            <button
              key={s.key}
              onClick={() => onFeedback(s.key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                feedback === s.key
                  ? s.active
                  : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {(onRequestVisit || onComment) && (
        <div className="mt-3 flex flex-wrap gap-3 border-t border-neutral-100 pt-3">
          {onRequestVisit && (
            <button
              onClick={onRequestVisit}
              className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900"
            >
              <CalendarPlus size={15} /> Request site visit
            </button>
          )}
          {onComment && (
            <button
              onClick={() => setShowComment((v) => !v)}
              className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900"
            >
              <MessageSquarePlus size={15} /> Comment
            </button>
          )}
        </div>
      )}

      {showComment && onComment && (
        <div className="mt-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            maxLength={2000}
            placeholder="Ask a question or leave a note for your agent..."
            className="w-full rounded-lg border border-neutral-200 p-2 text-sm text-neutral-800 outline-none focus:border-neutral-400"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => { setShowComment(false); setComment(''); }}
              className="rounded-lg px-3 py-1.5 text-sm text-neutral-500 hover:bg-neutral-100"
            >
              Cancel
            </button>
            <button
              onClick={submitComment}
              disabled={!comment.trim()}
              className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}