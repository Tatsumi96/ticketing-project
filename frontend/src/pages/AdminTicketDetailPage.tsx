import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketsApi, commentsApi, authApi } from '../lib/api';
import { Ticket, User, Comment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { STATUS_CONFIG, PRIORITY_CONFIG, formatDate, timeAgo } from '../lib/utils';
import {
  ArrowLeft, Send, CheckCircle, XCircle, UserCheck,
  Clock, Tag, Paperclip, ChevronDown, ListChecks,
  MessageSquare, History, AlertTriangle, Footprints
} from 'lucide-react';

type Tab = 'chat' | 'history';

function CommentBubble({ comment, isOwn }: { comment: Comment; isOwn: boolean }) {
  if (comment.is_solution_step) {
    return (
      <div className="flex gap-3 mb-3">
        <div className="flex flex-col items-center">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="w-px flex-1 bg-emerald-500/15 mt-1" />
        </div>
        <div className="flex-1 pb-2">
          <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Étape {comment.step_number}
              </span>
              <span className="text-xs text-slate-600">par {comment.author.full_name}</span>
            </div>
            <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
          </div>
          <p className="text-xs text-slate-700 mt-1 ml-1">{timeAgo(comment.created_at)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-2.5 ${isOwn ? 'flex-row-reverse' : ''} mb-3`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
        isOwn ? 'bg-accent/20 text-accent' : 'bg-slate-600/40 text-slate-300'
      }`}>
        {comment.author.full_name.charAt(0)}
      </div>
      <div className={`max-w-[75%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <p className="text-xs text-slate-600 mb-1 ml-1">
            {comment.author.full_name}
            {comment.author.role !== 'user' && <span className="ml-1 text-accent">· {comment.author.role}</span>}
          </p>
        )}
        <div className={`rounded-2xl px-4 py-2.5 ${
          isOwn
            ? 'bg-accent/15 border border-accent/20 rounded-tr-sm'
            : 'bg-surface-raised border border-surface-border rounded-tl-sm'
        }`}>
          <p className="text-sm whitespace-pre-wrap leading-relaxed text-slate-200">{comment.content}</p>
        </div>
        <p className="text-xs text-slate-700 mt-1 mx-1">{timeAgo(comment.created_at)}</p>
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
  const [newComment, setNewComment] = useState('');
  const [isStep, setIsStep] = useState(false);
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [assignId, setAssignId] = useState('');
  const [tab, setTab] = useState<Tab>('chat');
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchTicket = () => {
    ticketsApi.get(Number(id)).then(r => {
      setTicket(r.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchTicket();
    authApi.responsables().then(r => setResponsables(r.data));
  }, [id]);

  useEffect(() => {
    if (tab === 'chat') bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.comments, tab]);

  const doAction = async (action: string) => {
    setActionLoading(action);
    try {
      if (action === 'assign') await ticketsApi.assign(Number(id), assignId ? Number(assignId) : undefined);
      else if (action === 'resolve') await ticketsApi.resolve(Number(id));
      else if (action === 'reject') await ticketsApi.reject(Number(id));
      fetchTicket();
    } finally { setActionLoading(''); }
  };

  const sendComment = async () => {
    if (!newComment.trim() || !ticket) return;
    setSending(true);
    try {
      const solutionStepCount = ticket.comments.filter(c => c.is_solution_step).length;
      await commentsApi.create(ticket.id, {
        content: newComment,
        is_solution_step: isStep,
        is_internal: isInternal,
        step_number: isStep ? solutionStepCount + 1 : null,
      });
      setNewComment('');
      setIsStep(false);
      setIsInternal(false);
      fetchTicket();
    } finally { setSending(false); }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendComment(); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>
  );
  if (!ticket) return <div className="text-slate-500 text-center py-20">Ticket introuvable</div>;

  const isClosed = ticket.status === 'ferme' || ticket.status === 'rejete' || ticket.status === 'resolu';
  const regularComments = ticket.comments.filter(c => !c.is_solution_step);
  const solutionSteps = ticket.comments.filter(c => c.is_solution_step);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4 -ml-1">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <div className="grid md:grid-cols-3 gap-4">
        {/* LEFT — Chat */}
        <div className="md:col-span-2 space-y-4">
          {/* Ticket header */}
          <div className="card p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs text-slate-600">#{ticket.id}</span>
                  <span className={`badge ${STATUS_CONFIG[ticket.status].color}`}>{STATUS_CONFIG[ticket.status].label}</span>
                  <span className={`badge ${PRIORITY_CONFIG[ticket.priority].color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${PRIORITY_CONFIG[ticket.priority].dot}`} />
                    {PRIORITY_CONFIG[ticket.priority].label}
                  </span>
                </div>
                <h1 className="text-lg font-bold text-white">{ticket.title}</h1>
                <p className="text-xs text-slate-600 mt-1">
                  Par <span className="text-slate-400">{ticket.author.full_name}</span>
                  {ticket.author.department && <> · {ticket.author.department}</>}
                  <> · {formatDate(ticket.created_at)}</>
                </p>
              </div>
            </div>

            <div className="p-4 bg-dark-800 rounded-lg border border-surface-border">
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
            </div>
            {ticket.attachment && (
              <a href={ticket.attachment} target="_blank" rel="noreferrer"
                className="mt-2 flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover">
                <Paperclip className="w-3.5 h-3.5" />Pièce jointe
              </a>
            )}
          </div>

          {/* Chat / History tabs */}
          <div className="card flex flex-col" style={{ minHeight: '460px' }}>
            {/* Tabs */}
            <div className="flex border-b border-surface-border">
              {([
                { key: 'chat', label: 'Discussion', icon: MessageSquare, count: regularComments.length },
                { key: 'history', label: 'Historique', icon: History, count: ticket.history.length },
              ] as const).map(({ key, label, icon: Icon, count }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    tab === key
                      ? 'border-accent text-accent'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  <span className="text-xs bg-dark-700 px-1.5 py-0.5 rounded">{count}</span>
                </button>
              ))}
            </div>

            {/* Chat tab */}
            {tab === 'chat' && (
              <>
                <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: '340px' }}>
                  {/* Solution steps inline */}
                  {solutionSteps.length > 0 && (
                    <div className="mb-4 p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                          Guide de résolution ({solutionSteps.length} étape{solutionSteps.length > 1 ? 's' : ''})
                        </span>
                      </div>
                      {solutionSteps.map(s => (
                        <CommentBubble key={s.id} comment={s} isOwn={s.author.id === user?.id} />
                      ))}
                    </div>
                  )}

                  {regularComments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-24 text-slate-700 text-sm">
                      <MessageSquare className="w-6 h-6 mb-1 opacity-30" />
                      Démarrez la discussion
                    </div>
                  ) : regularComments.map(c => (
                    <CommentBubble key={c.id} comment={c} isOwn={c.author.id === user?.id} />
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Options bar */}
                {!isClosed && (
                  <div className="border-t border-surface-border">
                    <div className="flex items-center gap-3 px-3 pt-2 pb-1">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isStep}
                          onChange={e => setIsStep(e.target.checked)}
                          className="w-3.5 h-3.5 accent-emerald-500"
                        />
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <ListChecks className="w-3 h-3 text-emerald-400" />
                          Étape de solution
                        </span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isInternal}
                          onChange={e => setIsInternal(e.target.checked)}
                          className="w-3.5 h-3.5 accent-amber-500"
                        />
                        <span className="text-xs text-slate-500">Note interne</span>
                      </label>
                    </div>
                    <div className="flex gap-2 p-3 pt-1">
                      <textarea
                        className={`input flex-1 resize-none text-sm ${isStep ? 'border-emerald-500/30 focus:border-emerald-500/50' : ''}`}
                        placeholder={isStep ? 'Décrivez cette étape de résolution...' : 'Répondre au ticket...'}
                        rows={2}
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        onKeyDown={handleKey}
                      />
                      <button
                        onClick={sendComment}
                        disabled={sending || !newComment.trim()}
                        className={`px-4 self-end rounded-lg flex items-center gap-2 text-sm font-medium transition-all disabled:opacity-50 ${
                          isStep
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'btn-primary'
                        }`}
                      >
                        {sending
                          ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <Send className="w-4 h-4" />
                        }
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* History tab */}
            {tab === 'history' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {ticket.history.length === 0 ? (
                  <div className="text-center text-slate-700 text-sm py-8">Aucun historique</div>
                ) : ticket.history.map(h => (
                  <div key={h.id} className="flex items-center gap-3 text-xs text-slate-500 py-2 border-b border-surface-border/50">
                    <span className="text-slate-700">{timeAgo(h.created_at)}</span>
                    <span className="text-slate-600">{h.changed_by?.full_name}</span>
                    <span>a modifié <span className="text-slate-400">{h.field_changed}</span></span>
                    <span className="text-red-400/70 line-through">{h.old_value || '—'}</span>
                    <span>→</span>
                    <span className="text-emerald-400/70">{h.new_value || '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Actions */}
        <div className="space-y-4">
          {/* Status actions */}
          <div className="card p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</h3>

            {/* Assign */}
            <div>
              <label className="label">Assigner à</label>
              <select className="input mb-2 text-xs" value={assignId} onChange={e => setAssignId(e.target.value)}>
                <option value="">Choisir un responsable...</option>
                {responsables.map(r => (
                  <option key={r.id} value={r.id}>{r.full_name}</option>
                ))}
              </select>
              <button
                onClick={() => doAction('assign')}
                disabled={!!actionLoading}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-lg bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 transition-all disabled:opacity-50"
              >
                {actionLoading === 'assign'
                  ? <span className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                  : <UserCheck className="w-4 h-4" />
                }
                Assigner / Accepter
              </button>
            </div>

            {!isClosed && (
              <>
                <button
                  onClick={() => doAction('resolve')}
                  disabled={!!actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {actionLoading === 'resolve'
                    ? <span className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                    : <CheckCircle className="w-4 h-4" />
                  }
                  Marquer résolu
                </button>

                <button
                  onClick={() => doAction('reject')}
                  disabled={!!actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all disabled:opacity-50"
                >
                  {actionLoading === 'reject'
                    ? <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                    : <XCircle className="w-4 h-4" />
                  }
                  Rejeter
                </button>
              </>
            )}
          </div>

          {/* Ticket info */}
          <div className="card p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Informations</h3>
            <div className="space-y-2.5 text-xs">
              {[
                { label: 'Statut', value: <span className={`badge ${STATUS_CONFIG[ticket.status].color}`}>{STATUS_CONFIG[ticket.status].label}</span> },
                { label: 'Priorité', value: <span className={`badge ${PRIORITY_CONFIG[ticket.priority].color}`}>{PRIORITY_CONFIG[ticket.priority].label}</span> },
                { label: 'Catégorie', value: ticket.category?.name || <span className="text-slate-700">—</span> },
                { label: 'Auteur', value: ticket.author.full_name },
                { label: 'Assigné à', value: ticket.assigned_to?.full_name || <span className="text-slate-700 italic">Non assigné</span> },
                { label: 'Créé', value: timeAgo(ticket.created_at) },
                { label: 'Messages', value: ticket.comments.length },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <span className="text-slate-600">{label}</span>
                  <span className="text-slate-300">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
