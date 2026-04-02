import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketsApi, commentsApi, authApi } from '../lib/api';
import { Ticket, User, Comment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { STATUS_CONFIG, PRIORITY_CONFIG, formatDate, timeAgo } from '../lib/utils';
import { ArrowLeft, Send, CheckCircle, XCircle, UserCheck, CheckCircle2, ListChecks, Paperclip } from 'lucide-react';

type Tab = 'discussion' | 'historique';

function Bubble({ comment, isOwn }: { comment: Comment; isOwn: boolean }) {
  if (comment.is_solution_step) {
    return (
      <div className="flex gap-3 mb-4">
        <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        </div>
        <div className="flex-1">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl rounded-tl-sm p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1.5">Étape {comment.step_number} · {comment.author.full_name}</p>
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

export default function AdminTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [responsables, setResponsables] = useState<User[]>([]);
  const [msg, setMsg] = useState('');
  const [isStep, setIsStep] = useState(false);
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [assignId, setAssignId] = useState('');
  const [tab, setTab] = useState<Tab>('discussion');
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetch = () => ticketsApi.get(Number(id)).then(r => { setTicket(r.data); setLoading(false); });
  useEffect(() => { fetch(); authApi.responsables().then(r => setResponsables(r.data.results || r.data)); }, [id]);
  useEffect(() => { if (tab === 'discussion') bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [ticket?.comments, tab]);

  const doAction = async (action: string) => {
    setActionLoading(action);
    try {
      if (action === 'assign') await ticketsApi.assign(Number(id), assignId ? Number(assignId) : undefined);
      else if (action === 'resolve') await ticketsApi.resolve(Number(id));
      else if (action === 'reject') await ticketsApi.reject(Number(id));
      fetch();
    } finally { setActionLoading(''); }
  };

  const sendMsg = async () => {
    if (!msg.trim() || !ticket) return;
    setSending(true);
    try {
      const stepCount = ticket.comments.filter(c => c.is_solution_step).length;
      await commentsApi.create(ticket.id, { content: msg, is_solution_step: isStep, step_number: isStep ? stepCount + 1 : null });
      setMsg(''); setIsStep(false); fetch();
    } finally { setSending(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-ink/20 border-t-ink rounded-full animate-spin" /></div>;
  if (!ticket) return <p className="text-muted text-center py-20">Ticket introuvable</p>;

  const isClosed = ['ferme','rejete','resolu'].includes(ticket.status);
  const msgs = ticket.comments.filter(c => !c.is_solution_step);
  const steps = ticket.comments.filter(c => c.is_solution_step);

  return (
    <div className="max-w-5xl animate-fadeup">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted hover:text-ink font-medium mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <div className="grid md:grid-cols-3 gap-4">
        {/* LEFT */}
        <div className="md:col-span-2 space-y-4">
          {/* Ticket info */}
          <div className="card-white p-5">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="font-mono text-xs text-muted">#{ticket.id}</span>
              <span className={`badge-status ${STATUS_CONFIG[ticket.status].color}`}>{STATUS_CONFIG[ticket.status].label}</span>
              <span className={`badge-status ${PRIORITY_CONFIG[ticket.priority].color}`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${PRIORITY_CONFIG[ticket.priority].dot}`} />
                {PRIORITY_CONFIG[ticket.priority].label}
              </span>
              {ticket.category && <span className="badge-status bg-gray-100 text-gray-600">{ticket.category.name}</span>}
            </div>
            <h1 className="text-xl font-bold text-ink mb-1">{ticket.title}</h1>
            <p className="text-xs text-muted mb-4">{ticket.author.full_name} · {formatDate(ticket.created_at)}</p>
            <div className="p-4 bg-cream rounded-xl border border-border">
              <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
            </div>
            {ticket.attachment && <a href={ticket.attachment} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1.5 text-xs text-ink font-medium hover:underline"><Paperclip className="w-3.5 h-3.5" />Pièce jointe</a>}
          </div>

          {/* Tabs */}
          <div className="card-white overflow-hidden" style={{ minHeight: '460px', display: 'flex', flexDirection: 'column' }}>
            <div className="flex border-b border-border">
              {(['discussion','historique'] as Tab[]).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-5 py-3.5 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${tab === t ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'}`}>
                  {t === 'discussion' ? `Discussion (${msgs.length + steps.length})` : `Historique (${ticket.history.length})`}
                </button>
              ))}
            </div>

            {tab === 'discussion' && (
              <>
                <div className="flex-1 overflow-y-auto p-5 bg-cream" style={{ maxHeight: '340px' }}>
                  {steps.length > 0 && (
                    <div className="mb-4 p-4 bg-white rounded-xl border border-border">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">Guide résolution</p>
                      {steps.map(s => <Bubble key={s.id} comment={s} isOwn={s.author.id === user?.id} />)}
                    </div>
                  )}
                  {msgs.length === 0
                    ? <p className="text-center text-muted text-sm py-8">Démarrez la discussion</p>
                    : msgs.map(c => <Bubble key={c.id} comment={c} isOwn={c.author.id === user?.id} />)
                  }
                  <div ref={bottomRef} />
                </div>
                {!isClosed && (
                  <div className="border-t border-border bg-white">
                    <div className="flex items-center gap-4 px-4 pt-3 pb-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${isStep ? 'bg-emerald-500 border-emerald-500' : 'border-border'}`}
                          onClick={() => setIsStep(!isStep)}>
                          {isStep && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className="text-xs font-semibold text-muted">Étape de solution</span>
                      </label>
                    </div>
                    <div className="flex gap-2 p-3 pt-1">
                      <textarea className={`input-field flex-1 resize-none text-sm ${isStep ? '!border-emerald-300 !bg-emerald-50/50' : ''}`}
                        placeholder={isStep ? 'Décrivez cette étape...' : 'Répondre au ticket...'}
                        rows={2} value={msg}
                        onChange={e => setMsg(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } }} />
                      <button onClick={sendMsg} disabled={sending || !msg.trim()}
                        className={`self-end px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all disabled:opacity-40 ${isStep ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-ink hover:bg-gray-800 text-white'}`}>
                        {sending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {tab === 'historique' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-2">
                {ticket.history.length === 0
                  ? <p className="text-center text-muted text-sm py-8">Aucun historique</p>
                  : ticket.history.map(h => (
                    <div key={h.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0 text-xs">
                      <span className="text-muted w-20 shrink-0">{timeAgo(h.created_at)}</span>
                      <span className="font-semibold text-ink">{h.changed_by?.full_name}</span>
                      <span className="text-muted">a changé</span>
                      <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-ink">{h.field_changed}</span>
                      <span className="text-red-500 line-through">{h.old_value || '—'}</span>
                      <span className="text-muted">→</span>
                      <span className="text-emerald-700 font-medium">{h.new_value || '—'}</span>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Actions */}
        <div className="space-y-3">
          {/* Quick Accept/Refuse for open tickets */}
          {ticket.status === 'ouvert' && (
            <div className="card-white p-5 border-amber-200 bg-amber-50/40">
              <p className="text-amber-800 text-[10px] font-bold uppercase tracking-widest mb-3">Nouveau ticket — Action requise</p>
              <div className="space-y-2">
                <button onClick={() => { setAssignId(user?.id.toString() || ''); doAction('assign'); }} disabled={!!actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-3 text-xs font-bold rounded-xl bg-ink text-white hover:bg-gray-800 transition-all shadow-sm">
                  {actionLoading === 'assign' ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Accepter le ticket
                </button>
                <button onClick={() => doAction('reject')} disabled={!!actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-all">
                  {actionLoading === 'reject' ? <span className="w-3.5 h-3.5 border-2 border-red-300/30 border-t-red-500 rounded-full animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  Refuser / Rejeter
                </button>
              </div>
            </div>
          )}

          {/* Actions card */}
          <div className="card-black p-5">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-4">Actions</p>

            <div className="space-y-3">
              <div>
                <label className="block text-white/50 text-[10px] font-bold uppercase tracking-wider mb-1.5">Assigner à</label>
                <select className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-white/30"
                  value={assignId} onChange={e => setAssignId(e.target.value)}>
                  <option value="" className="bg-ink">Choisir...</option>
                  {responsables.map(r => <option key={r.id} value={r.id} className="bg-ink">{r.full_name}</option>)}
                </select>
              </div>
              <button onClick={() => doAction('assign')} disabled={!!actionLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold rounded-xl bg-white text-ink hover:bg-gray-100 transition-all disabled:opacity-40">
                {actionLoading === 'assign' ? <span className="w-3.5 h-3.5 border-2 border-ink/20 border-t-ink rounded-full animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                Assigner / Accepter
              </button>

              {!isClosed && <>
                <button onClick={() => doAction('resolve')} disabled={!!actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold rounded-xl bg-emerald-400/20 text-emerald-300 hover:bg-emerald-400/30 transition-all disabled:opacity-40">
                  {actionLoading === 'resolve' ? <span className="w-3.5 h-3.5 border-2 border-emerald-300/30 border-t-emerald-300 rounded-full animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  Marquer résolu
                </button>
                <button onClick={() => doAction('reject')} disabled={!!actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold rounded-xl bg-red-400/20 text-red-300 hover:bg-red-400/30 transition-all disabled:opacity-40">
                  {actionLoading === 'reject' ? <span className="w-3.5 h-3.5 border-2 border-red-300/30 border-t-red-300 rounded-full animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  Rejeter
                </button>
              </>}
            </div>
          </div>

          {/* Info card */}
          <div className="card-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">Informations</p>
            <div className="space-y-2.5 text-xs">
              {[
                { l: 'Statut', v: <span className={`badge-status ${STATUS_CONFIG[ticket.status].color}`}>{STATUS_CONFIG[ticket.status].label}</span> },
                { l: 'Priorité', v: <span className={`badge-status ${PRIORITY_CONFIG[ticket.priority].color}`}>{PRIORITY_CONFIG[ticket.priority].label}</span> },
                { l: 'Catégorie', v: ticket.category?.name || '—' },
                { l: 'Auteur', v: ticket.author.full_name },
                { l: 'Assigné à', v: ticket.assigned_to?.full_name || <span className="text-muted italic">Non assigné</span> },
                { l: 'Créé', v: timeAgo(ticket.created_at) },
                { l: 'Messages', v: ticket.comments.length },
              ].map(({ l, v }) => (
                <div key={l} className="flex items-center justify-between gap-3">
                  <span className="text-muted">{l}</span>
                  <span className="text-ink font-medium text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
