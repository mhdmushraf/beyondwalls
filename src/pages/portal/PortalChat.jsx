import { useEffect, useMemo, useRef, useState } from 'react';
import { Send, Check, X, Paperclip, Loader2, Hash, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { usePortal } from '@/lib/PortalContext';
import { useOrgEntity } from '@/lib/useOrgEntity';
import { uploadPublic, timeAgo } from '@/lib/portalData';
import { PageHeader } from '@/components/portal/ui';
import { useDraft, isOnline, notifyError, notifySuccess } from '@/lib/states';

const COLORS = ['#0EA5E9', '#EC4899', '#22C55E', '#F59E0B', '#6366F1', '#14B8A6'];
function colorFor(id = '') {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

export default function PortalChat() {
  const { user } = useAuth();
  const { venues } = usePortal();
  const { items, create, update } = useOrgEntity('TeamMessage', { sort: '-created_date', limit: 300, poll: 6000 });
  const [channel, setChannel] = useState('all');
  const [text, setText] = useState('');
  const { clear: clearDraft } = useDraft(`chat:${channel}`, text, setText, { saved: '' });
  const [approval, setApproval] = useState(false);
  const [attach, setAttach] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  const channels = [{ id: 'all', name: 'All team' }, ...venues.map((v) => ({ id: v.id, name: v.name }))];
  const messages = useMemo(() => items.filter((m) => (m.channel || 'all') === channel).slice().reverse(), [items, channel]);
  const pending = items.filter((m) => m.kind === 'approval' && m.approval_status === 'pending');
  const unread = (id) => items.filter((m) => (m.channel || 'all') === id && m.kind === 'approval' && m.approval_status === 'pending').length;

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [messages.length, channel]);

  const send = async () => {
    const body = text.trim();
    if (!body && !attach) return;
    setBusy(true);
    try {
      await create({
        channel, sender_id: user?.id, sender_name: user?.full_name || user?.email || 'Me', text: body,
        attachment_url: attach || '', kind: approval ? 'approval' : 'text',
        ...(approval ? { approval_title: body.slice(0, 80), approval_detail: channels.find((c) => c.id === channel)?.name || '', approval_status: 'pending' } : {}),
      });
      setText(''); setAttach(''); setApproval(false); clearDraft();
      if (!isOnline()) toast("You're offline — message saved", { description: 'It sends by itself when you reconnect.' });
    } catch (e) { notifyError(e, 'send the message', send); } finally { setBusy(false); }
  };

  const decide = async (m, status) => {
    try {
      await update(m.id, { approval_status: status, decided_by_name: user?.full_name || user?.email || '' });
      notifySuccess(status === 'approved' ? 'Approved' : 'Declined', `${m.sender_name || 'Your teammate'} can see your decision in the chat.`);
    } catch (e) { notifyError(e, status === 'approved' ? 'approve this' : 'decline this', () => decide(m, status)); }
  };

  const ApprovalCard = ({ m }) => (
    <div className="rounded-2xl border border-bw-violet bg-white p-3.5 flex flex-wrap items-center gap-3">
      <span className="h-10 w-10 rounded-xl bg-bw-lav flex items-center justify-center"><ClipboardCheck className="h-5 w-5 text-bw-coral" /></span>
      <div className="flex-1 min-w-[160px]">
        <p className="text-[14px] font-bold text-bw-navy">{m.approval_title || m.text}</p>
        <p className="text-[12px] text-bw-muted">{m.sender_name} · {m.approval_detail}</p>
      </div>
      {m.approval_status === 'pending' ? (
        <div className="flex gap-2">
          <button type="button" className="bw-btn bw-btn-ghost" onClick={() => decide(m, 'declined')}><X className="h-4 w-4" />Decline</button>
          <button type="button" className="bw-btn bw-btn-primary" onClick={() => decide(m, 'approved')}><Check className="h-4 w-4" />Approve</button>
        </div>
      ) : (
        <span className={`bw-chip ${m.approval_status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>
          {m.approval_status === 'approved' ? 'Approved' : 'Declined'}{m.decided_by_name ? ` · ${m.decided_by_name}` : ''}
        </span>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader title="Team chat" subtitle="Your staff, designers and managers — approvals happen right in the chat" />
      <div className="grid lg:grid-cols-[230px_1fr_290px] gap-4">
        <div className="bw-card p-2 h-fit">
          {channels.map((c) => (
            <button key={c.id} type="button" onClick={() => setChannel(c.id)}
              className={`!min-h-0 w-full !justify-start flex items-center gap-2 rounded-xl px-3 py-2.5 text-start ${channel === c.id ? 'bg-bw-lav' : 'hover:bg-bw-cream'}`}>
              <Hash className={`h-4 w-4 ${channel === c.id ? 'text-bw-coral' : 'text-bw-muted'}`} />
              <span className={`flex-1 text-[13px] font-semibold truncate ${channel === c.id ? 'text-bw-coral' : 'text-bw-navy'}`}>{c.name}</span>
              {unread(c.id) > 0 && <span className="bw-chip bw-grad text-white">{unread(c.id)}</span>}
            </button>
          ))}
        </div>

        <div className="bw-card flex flex-col h-[calc(100vh-220px)] min-h-[460px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && <p className="text-center text-[13px] text-bw-muted py-10">No messages yet — say hi to your team.</p>}
            {messages.map((m) => {
              const me = m.sender_id === user?.id;
              if (m.kind === 'approval') return <ApprovalCard key={m.id} m={m} />;
              return (
                <div key={m.id} className={`flex items-end gap-2 ${me ? 'justify-end' : 'justify-start'}`}>
                  {!me && <span className="h-8 w-8 shrink-0 rounded-full text-white text-[12px] font-bold flex items-center justify-center" style={{ background: colorFor(m.sender_id) }}>{(m.sender_name || '?').charAt(0).toUpperCase()}</span>}
                  <div className={`max-w-[70%] rounded-2xl px-3.5 py-2.5 ${me ? 'bw-grad text-white' : 'bg-bw-cream text-bw-navy'}`}>
                    {!me && <p className="text-[11px] font-bold" style={{ color: colorFor(m.sender_id) }}>{m.sender_name}</p>}
                    {m.text && <p className="text-[14px] whitespace-pre-wrap">{m.text}</p>}
                    {m.attachment_url && <img src={m.attachment_url} alt="" className="mt-2 rounded-xl max-h-52" />}
                    <p className={`mt-1 text-[10px] ${me ? 'text-white/70' : 'text-bw-muted'}`}>{timeAgo(m.created_date)}</p>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
          <div className="border-t border-bw-line p-3">
            {attach && <div className="mb-2 flex items-center gap-2"><img src={attach} alt="" className="h-12 rounded-lg" /><button type="button" className="!min-h-0 text-[12px] text-rose-600" onClick={() => setAttach('')}>Remove</button></div>}
            <div className="flex items-center gap-2">
              <label className="!min-h-0 h-9 w-9 shrink-0 rounded-xl bg-bw-lav text-bw-coral flex items-center justify-center cursor-pointer" title="Attach image">
                <Paperclip className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const f = e.target.files?.[0]; if (!f) return;
                  if (f.size > 25 * 1048576) { toast.error('File is too big', { description: 'Attach a file under 25 MB.' }); return; } try { setAttach(await uploadPublic(f)); } catch (err) { notifyError(err, `attach ${f.name}`); }
                }} />
              </label>
              <button type="button" onClick={() => setApproval((v) => !v)} title="Ask for approval"
                className={`!min-h-0 shrink-0 bw-chip !py-2 ${approval ? 'bw-grad text-white' : 'bg-bw-cream text-bw-muted'}`}><ClipboardCheck className="h-3.5 w-3.5" />Needs OK</button>
              <input className="bw-input flex-1" placeholder={`Message # ${channels.find((c) => c.id === channel)?.name}…`} value={text}
                onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
              <button type="button" className="bw-btn bw-btn-primary" onClick={send} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Send</button>
            </div>
          </div>
        </div>

        <div className="bw-card p-4 h-fit">
          <p className="text-[14px] font-bold text-bw-navy">Waiting for you · {pending.length}</p>
          <div className="mt-3 space-y-2">
            {pending.length === 0 && <p className="text-[12px] text-bw-muted">Nothing to approve.</p>}
            {pending.map((m) => (
              <div key={m.id} className="rounded-xl bg-bw-cream p-3">
                <p className="text-[13px] font-semibold text-bw-navy">{m.approval_title}</p>
                <p className="text-[11px] text-bw-muted">{m.sender_name} · {m.approval_detail}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button type="button" className="bw-btn bw-btn-ghost !py-1.5" onClick={() => decide(m, 'declined')}>Decline</button>
                  <button type="button" className="bw-btn bw-btn-primary !py-1.5" onClick={() => decide(m, 'approved')}>Approve</button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[14px] font-bold text-bw-navy">Tip</p>
          <p className="text-[12px] text-bw-muted">Tick “Needs OK” before sending to turn a message into an approval request.</p>
        </div>
      </div>
    </div>
  );
}
