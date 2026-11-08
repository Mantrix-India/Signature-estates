import { Phone, MessageCircle } from 'lucide-react';

function digitsOnly(phone: string) {
  return phone.replace(/[^\d]/g, '');
}

export function PortalAgentBar({
  agentName,
  agentPhone,
  onCall,
  onWhatsApp,
}: {
  agentName: string;
  agentPhone?: string | null;
  onCall: () => void;
  onWhatsApp: () => void;
}) {
  if (!agentPhone) return null;
  const wa = digitsOnly(agentPhone);

  return (
    <div className="sticky bottom-0 z-10 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-neutral-500">Your agent</p>
          <p className="truncate text-sm font-semibold text-neutral-900">{agentName}</p>
        </div>
        
         <a href={`tel:${agentPhone}`}
          onClick={onCall}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          <Phone size={15} /> Call
        </a>
        
         <a href={`https://wa.me/${wa}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onWhatsApp}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <MessageCircle size={15} /> WhatsApp
        </a>
      </div>
    </div>
  );
}