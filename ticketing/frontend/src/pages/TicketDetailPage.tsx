import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketsApi, commentsApi } from '../lib/api';
import { Ticket, Comment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { STATUS_CONFIG, PRIORITY_CONFIG, formatDate, timeAgo } from '../lib/utils';
import {
  ArrowLeft, Send, User, CheckCircle2, AlertCircle,
  Paperclip, Clock, Tag, ChevronRight, Footprints
} from 'lucide-react';

function CommentBubble({ comment, isOwn }: { comment: Comment; isOwn: boolean }) {
  const isStep = comment.is_solution_step;

  if (isStep) {
    return (
      <div className="flex gap-3 my-2">
        <div className="flex flex-col items-center">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="w-px flex-1 bg-emerald-500/15 mt-1" />
        </div>
        <div className="flex-1 pb-3">
          <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Étape {comment.step_number || ''}
              </span>
              <span className="text-xs text-slate-600">— {comment.author.full_name}</span>
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
      <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwn && (
          <p className="text-xs text-slate-600 mb-1 ml-1">
            {comment.author.full_name}
            {comment.author.role !== 'user' && (
              <span className="ml-1 text-accent">· {comment.author.role}</span>
            )}
          </p>
        )}
        <div className={`rounded-2xl px-4 py-2.5 ${
          isOwn
            ? 'bg-accent/15 border border-accent/20 text-slate-200 rounded-tr-sm'
            : 'bg-surface-raised border border-surface-border text-slate-200 rounded-tl-sm'
        }`}>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{comment.content}</p>
        </div>
        <p className="text-xs text-slate-700 mt-1 mx-1">{timeAgo(comment.created_at)}</p>
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
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchTicket = () => {
    ticketsApi.get(Number(id)).then(r => {
      setTicket(r.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchTicket(); }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.comments]);

  const sendComment = async () => {
    if (!newComment.trim() || !ticket) return;
    setSending(true);
    try {
      await commentsApi.create(ticket.id, { content: newComment });
      setNewComment('');
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

  const solutionSteps = ticket.comments.filter(c => c.is_solution_step);
  const regularComments = ticket.comments.filter(c => !c.is_solution_step);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4 -ml-1">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      {/* Header */}
      <div className="card p-5 mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs text-slate-600">#{ticket.id}</span>
              <span className={`badge ${STATUS_CONFIG[ticket.status].color}`}>
                {STATUS_CONFIG[ticket.status].label}
              </span>
              <span className={`badge ${PRIORITY_CONFIG[ticket.priority].color}`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${PRIORITY_CONFIG[ticket.priority].dot}`} />
                {PRIORITY_CONFIG[ticket.priority].label}
              </span>
            </div>
            <h1 className="text-lg font-bold text-white">{ticket.title}</h1>
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <User className="w-3.5 h-3.5" />
            <span className="text-slate-400">{ticket.author.full_name}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDate(ticket.created_at)}</span>
          </div>
          {ticket.category && (
            <div className="flex items-center gap-2 text-slate-500">
              <Tag className="w-3.5 h-3.5" />
              <span>{ticket.category.name}</span>
            </div>
          )}
          {ticket.assigned_to && (
            <div className="flex items-center gap-2 text-slate-500 col-span-2 md:col-span-1">
              <span className="text-slate-600">Assigné à</span>
              <span className="text-accent">{ticket.assigned_to.full_name}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mt-4 p-4 bg-dark-800 rounded-lg border border-surface-border">
          <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
        </div>

        {ticket.attachment && (
          <a href={ticket.attachment} target="_blank" rel="noreferrer"
            className="mt-3 flex items-center gap-2 text-xs text-accent hover:text-accent-hover transition-colors">
            <Paperclip className="w-3.5 h-3.5" />
            Voir la pièce jointe
          </a>
        )}
      </div>

      {/* Solution steps */}
      {solutionSteps.length > 0 && (
        <div className="card p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Footprints className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Étapes de résolution</h2>
          </div>
          <div>
            {solutionSteps.map(step => (
              <CommentBubble key={step.id} comment={step} isOwn={step.author.id === user?.id} />
            ))}
          </div>
        </div>
      )}

      {/* Chat */}
      <div className="card flex flex-col" style={{ minHeight: '420px' }}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-surface-border">
          <span className="text-sm font-semibold text-white">Discussion</span>
          <span className="text-xs text-slate-600 ml-1">({regularComments.length} message{regularComments.length !== 1 ? 's' : ''})</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1" style={{ maxHeight: '380px' }}>
          {regularComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-600 text-sm">
              <AlertCircle className="w-6 h-6 mb-2 opacity-30" />
              Aucun message pour l'instant
            </div>
          ) : (
            regularComments.map(comment => (
              <CommentBubble
                key={comment.id}
                comment={comment}
                isOwn={comment.author.id === user?.id}
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {ticket.status !== 'ferme' && ticket.status !== 'rejete' ? (
          <div className="border-t border-surface-border p-3 flex gap-2">
            <textarea
              className="input flex-1 resize-none"
              placeholder="Écrire un message... (Entrée pour envoyer)"
              rows={2}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={handleKey}
            />
            <button
              onClick={sendComment}
              disabled={sending || !newComment.trim()}
              className="btn-primary px-4 self-end"
            >
              {sending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        ) : (
          <div className="border-t border-surface-border p-3 text-center text-xs text-slate-600">
            Ce ticket est {STATUS_CONFIG[ticket.status].label.toLowerCase()} — plus de réponse possible
          </div>
        )}
      </div>
    </div>
  );
}
