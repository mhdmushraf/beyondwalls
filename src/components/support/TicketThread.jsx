import { useState } from 'react';
import { Send } from 'lucide-react';
import { timeAgo } from '@/lib/portalData';

/** Shared ticket conversation (venue + admin). */
export default function TicketThread({ ticket, onReply, fromTeam }) {
  const [text, setText] = useState('');
  const send = async () => {
    const body = text.trim();
    if (!body) return;
    await onReply(body);
    setText('');
  };
  return (
    <div className="flex flex-col">
      <div className="space-y-3 max-h-[420px] overflow-y-auto pe-1">
        {(ticket.messages || []).map((m, i) => (
          <div key={i} className={`flex ${m.from_team === fromTeam ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${m.from_team ? 'bw-grad text-white' : 'bg-bw-cream text-bw-navy'}`}>
              <p className={`text-[11px] font-bold ${m.from_team ? 'text-white/80' : 'text-bw-muted'}`}>{m.from_team ? `${m.by || 'Beyond Walls'} · support` : m.by}</p>
              <p className="text-[14px] whitespace-pre-wrap">{m.text}</p>
              <p className={`text-[10px] mt-1 ${m.from_team ? 'text-white/70' : 'text-bw-muted'}`}>{timeAgo(m.at)}</p>
            </div>
          </div>
        ))}
      </div>
      {ticket.status !== 'resolved' && (
        <div className="mt-3 flex gap-2">
          <textarea rows={2} className="bw-input flex-1" placeholder="Write a reply…" value={text} onChange={(e) => setText(e.target.value)} />
          <button type="button" className="bw-btn bw-btn-primary self-end" onClick={send}><Send className="h-4 w-4" />Send</button>
        </div>
      )}
    </div>
  );
}
