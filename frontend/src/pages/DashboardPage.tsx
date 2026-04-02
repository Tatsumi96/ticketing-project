import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketsApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Ticket, TicketStats } from '../types';
import { STATUS_CONFIG, PRIORITY_CONFIG, timeAgo } from '../lib/utils';
import { Plus, ArrowUpRight, Clock, CheckCircle, Layers, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const { user, isResponsable } = useAuth();
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [recent, setRecent] = useState<Ticket[]>([]);
  const [pending, setPending] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      isResponsable ? ticketsApi.stats() : Promise.resolve(null),
      ticketsApi.list({ page_size: 6 }),
      isResponsable ? ticketsApi.list({ status: 'ouvert', page_size: 5 }) : Promise.resolve(null),
    ]).then(([s, t, p]) => {
      if (s) setStats(s.data);
      setRecent(t.data.results || t.data);
      if (p) setPending(p.data.results || p.data);
    }).finally(() => setLoading(false));
  }, [isResponsable]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-end justify-between animate-fadeup">
        <div>
          <p className="text-muted text-sm mb-1">Bonjour,</p>
          <h1 className="text-3xl font-bold text-ink tracking-tight">{user?.first_name} {user?.last_name}</h1>
        </div>
        <div className="flex gap-3">
          {isResponsable && (
            <Link to="/admin/dashboard" className="btn-outline">
              <ShieldCheck className="w-4 h-4" /> Vue Admin
            </Link>
          )}
          <Link to="/tickets/new" className="btn-black">
            <Plus className="w-4 h-4" /> Nouveau ticket
          </Link>
        </div>
      </div>

      {/* Pending section for Responsables */}
      {isResponsable && (
        <div className="animate-fadeup delay-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-amber-600 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4" /> Demandes à valider ({pending.length})
            </h2>
            <Link to="/admin/tickets?status=ouvert" className="text-xs text-muted font-semibold hover:text-ink">
              Voir tout
            </Link>
          </div>
          {pending.length === 0 ? (
            <div className="card-white p-6 border-dashed border-2 border-amber-100 bg-amber-50/20 text-center">
              <p className="text-amber-800/60 text-sm italic font-medium">Aucune nouvelle demande en attente de validation</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pending.map(t => (
                <Link key={t.id} to={`/admin/tickets/${t.id}`} className="card-white p-4 border-amber-200 bg-amber-50/30 hover:bg-amber-50 transition-colors flex items-center justify-between group">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] text-muted">#{t.id}</span>
                      <span className={`badge-status ${PRIORITY_CONFIG[t.priority].color} scale-75 origin-left`}>{PRIORITY_CONFIG[t.priority].label}</span>
                    </div>
                    <p className="text-sm font-bold text-ink truncate group-hover:underline">{t.title}</p>
                    <p className="text-[10px] text-muted">{t.author.full_name} · {timeAgo(t.created_at)}</p>
                  </div>
                  <div className="shrink-0 ml-4 flex flex-col items-end gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-amber-200 text-amber-800">Nouveau</span>
                    <span className="text-[10px] text-ink font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Valider <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats cards (admin/resp) */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fadeup delay-1">
          {/* Big black card */}
          <div className="card-black p-5 col-span-2 flex flex-col justify-between min-h-[120px]">
            <div className="flex items-center justify-between">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Total tickets</p>
              <Layers className="w-4 h-4 text-white/30" />
            </div>
            <div>
              <p className="text-white text-4xl font-bold tracking-tight">{stats.total}</p>
              <p className="text-white/40 text-xs mt-1">{stats.urgente} urgents</p>
            </div>
          </div>

          <div className="card-white p-5 flex flex-col justify-between min-h-[120px]">
            <div className="flex items-center justify-between">
              <p className="text-muted text-xs font-semibold uppercase tracking-wider">Ouverts</p>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-ink text-3xl font-bold">{stats.ouvert}</p>
          </div>

          <div className="card-white p-5 flex flex-col justify-between min-h-[120px]">
            <div className="flex items-center justify-between">
              <p className="text-muted text-xs font-semibold uppercase tracking-wider">Résolus</p>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-ink text-3xl font-bold">{stats.resolu}</p>
          </div>

          <div className="card-white p-4">
            <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">En cours</p>
            <p className="text-ink text-2xl font-bold">{stats.en_cours}</p>
          </div>
          <div className="card-white p-4">
            <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">Rejetés</p>
            <p className="text-ink text-2xl font-bold">{stats.rejete}</p>
          </div>
          <div className="card-white p-4">
            <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">Priorité haute</p>
            <p className="text-ink text-2xl font-bold">{stats.haute}</p>
          </div>
          <div className="card-white p-4">
            <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">Fermés</p>
            <p className="text-ink text-2xl font-bold">{stats.ferme}</p>
          </div>
        </div>
      )}

      {/* Recent tickets */}
      <div className="animate-fadeup delay-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider">Tickets récents</h2>
          <Link to="/tickets" className="text-xs text-muted font-semibold hover:text-ink flex items-center gap-1 transition-colors">
            Voir tout <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="card-white overflow-hidden">
          {recent.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-muted text-sm">Aucun ticket pour le moment</p>
              <Link to="/tickets/new" className="btn-black mt-4 inline-flex">
                <Plus className="w-4 h-4" /> Créer une demande
              </Link>
            </div>
          ) : (
            <div>
              {/* Header row */}
              <div className="grid grid-cols-12 px-5 py-3 border-b border-border text-[10px] font-bold uppercase tracking-widest text-muted">
                <div className="col-span-1">#</div>
                <div className="col-span-5">Titre</div>
                <div className="col-span-3">Statut</div>
                <div className="col-span-3">Date</div>
              </div>
              {recent.map((ticket, i) => (
                <Link key={ticket.id}
                  to={isResponsable ? `/admin/tickets/${ticket.id}` : `/tickets/${ticket.id}`}
                  className="grid grid-cols-12 px-5 py-3.5 border-b border-border last:border-0 hover:bg-cream transition-colors items-center group"
                >
                  <div className="col-span-1 font-mono text-xs text-muted">{ticket.id}</div>
                  <div className="col-span-5">
                    <p className="text-sm font-medium text-ink truncate group-hover:underline">{ticket.title}</p>
                    {ticket.category && <p className="text-xs text-muted">{ticket.category.name}</p>}
                  </div>
                  <div className="col-span-3">
                    <span className={`badge-status ${STATUS_CONFIG[ticket.status].color}`}>
                      {STATUS_CONFIG[ticket.status].label}
                    </span>
                  </div>
                  <div className="col-span-3 text-xs text-muted">{timeAgo(ticket.created_at)}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
