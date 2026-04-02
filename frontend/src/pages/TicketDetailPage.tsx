import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketsApi, commentsApi } from '../lib/api';
import { Ticket, Comment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { STATUS_CONFIG, PRIORITY_CONFIG, formatDate, timeAgo } from '../lib/utils';
import { ArrowLeft, Send, Paperclip, CheckCircle2 } from 'lucide-react';

function Bubble({ comment, isOwn }: { comment: Comment; isOwn: boolean }) {
  if (comment.is_solution_step) {
    return (
      <div className="flex gap-3 mb-4">
        <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        </div>
        <div className="flex-1">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl rounded-tl-sm p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1.5">Étape {comment.step_number}</p>
            <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{comment.content}</p>
          </div>
          <p className="text-[10px] text-muted mt-1 ml-1">{timeAgo(comment.created_at)}</p>
        </div>
      </div>
    );
  }
  return (
    <div className={`flex gap-2.5 mb-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${isOwn ? 'bg-ink text-white' : 'bg-gray-100 text-ink'}`}>
        {comment.author.full_name.charAt(0)}
      </div>
      <div className={`max-w-[72%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && <p className="text-[10px] text-muted mb-1 ml-1 font-semibold">{comment.author.full_name}{comment.author.role !== 'user' && <span className="text-ink ml-1">· {comment.author.role}</span>}</p>}
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isOwn ? 'bg-ink text-white rounded-tr-sm' : 'bg-white border border-border text-ink rounded-tl-sm'}`}>
          {comment.content}
        </div>
        <p className="text-[10px] text-muted mt-1 mx-1">{timeAgo(comment.created_at)}</p>
      </div>
    </div>
  );
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetch = () => ticketsApi.get(Number(id)).then(r => { setTicket(r.data); setLoading(false); });
  useEffect(() => { fetch(); }, [id]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [ticket?.comments]);

  const send = async () => {
    if (!msg.trim() || !ticket) return;
    setSending(true);
    try { await commentsApi.create(ticket.id, { content: msg }); setMsg(''); fetch(); }
    finally { setSending(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-ink/20 border-t-ink rounded-full animate-spin" /></div>;
  if (!ticket) return <p className="text-muted text-center py-20">Ticket introuvable</p>;

  const isClosed = ['ferme','rejete','resolu'].includes(ticket.status);
  const steps = ticket.comments.filter(c => c.is_solution_step);
  const msgs = ticket.comments.filter(c => !c.is_solution_step);

  return (
    <div className="max-w-3xl animate-fadeup">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted hover:text-ink font-medium mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      {/* Header card */}
      <div className="card-white p-5 mb-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="font-mono text-xs text-muted">#{ticket.id}</span>
          <span className={`badge-status ${STATUS_CONFIG[ticket.status].color}`}>{STATUS_CONFIG[ticket.status].label}</span>
          <span className={`badge-status ${PRIORITY_CONFIG[ticket.priority].color}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${PRIORITY_CONFIG[ticket.priority].dot}`} />
            {PRIORITY_CONFIG[ticket.priority].label}
          </span>
          {ticket.category && <span className="badge-status bg-gray-100 text-gray-600">{ticket.category.name}</span>}
        </div>
        <h1 className="text-xl font-bold text-ink mb-1">{ticket.title}</h1>
        <p className="text-xs text-muted">{ticket.author.full_name} · {formatDate(ticket.created_at)}{ticket.assigned_to && <> · Assigné à <span className="text-ink font-medium">{ticket.assigned_to.full_name}</span></>}</p>
        <div className="mt-4 p-4 bg-cream rounded-xl border border-border">
          <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
        </div>
        {ticket.attachment && <a href={ticket.attachment} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1.5 text-xs text-ink font-medium hover:underline"><Paperclip className="w-3.5 h-3.5" />Pièce jointe</a>}
      </div>

      {/* Steps */}
      {steps.length > 0 && (
        <div className="card-white p-5 mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-4">Guide de résolution · {steps.length} étape{steps.length > 1 ? 's' : ''}</p>
          {steps.map(s => <Bubble key={s.id} comment={s} isOwn={s.author.id === user?.id} />)}
        </div>
      )}

      {/* Chat */}
      <div className="card-white flex flex-col overflow-hidden" style={{ minHeight: '400px' }}>
        <div className="px-5 py-3.5 border-b border-border">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Discussion · {msgs.length} message{msgs.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-5 bg-cream" style={{ maxHeight: '360px' }}>
          {msgs.length === 0
            ? <p className="text-center text-muted text-sm py-10">Aucun message — démarrez la discussion</p>
            : msgs.map(c => <Bubble key={c.id} comment={c} isOwn={c.author.id === user?.id} />)
          }
          <div ref={bottomRef} />
        </div>
        {!isClosed ? (
          <div className="flex gap-2 p-3 border-t border-border bg-white">
            <textarea className="input-field flex-1 resize-none text-sm" placeholder="Votre message... (Entrée pour envoyer)" rows={2}
              value={msg} onChange={e => setMsg(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
            <button onClick={send} disabled={sending || !msg.trim()} className="btn-black self-end px-4">
              {sending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        ) : (
          <div className="p-3 text-center text-xs text-muted border-t border-border">
            Ticket {STATUS_CONFIG[ticket.status].label.toLowerCase()} · plus de réponse possible
          </div>
        )}
      </div>
    </div>
  );
}
