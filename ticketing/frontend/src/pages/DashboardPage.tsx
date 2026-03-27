import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketsApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Ticket, TicketStats } from '../types';
import { STATUS_CONFIG, PRIORITY_CONFIG, timeAgo } from '../lib/utils';
import {
  TicketIcon, Clock, CheckCircle, AlertTriangle,
  XCircle, TrendingUp, Plus, ArrowRight
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isResponsable } = useAuth();
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [recent, setRecent] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      isResponsable ? ticketsApi.stats() : Promise.resolve(null),
      ticketsApi.list({ page_size: 5 }),
    ]).then(([statsRes, ticketsRes]) => {
      if (statsRes) setStats(statsRes.data);
      setRecent(ticketsRes.data.results || ticketsRes.data);
    }).finally(() => setLoading(false));
  }, [isResponsable]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">
            Bonjour, {user?.first_name} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link to="/tickets/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          Nouveau ticket
        </Link>
      </div>

      {/* Stats (admin/responsable only) */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, icon: TicketIcon, color: 'text-slate-400', bg: 'bg-slate-500/10' },
            { label: 'Ouverts', value: stats.ouvert, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'En cours', value: stats.en_cours, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Résolus', value: stats.resolu, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Urgents', value: stats.urgente, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
            { label: 'Rejetés', value: stats.rejete, icon: XCircle, color: 'text-slate-500', bg: 'bg-slate-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent tickets */}
      <div className="card">
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
          <h2 className="text-sm font-semibold text-white">Tickets récents</h2>
          <Link to="/tickets" className="text-xs text-accent hover:text-accent-hover flex items-center gap-1">
            Voir tout <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            <TicketIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
            Aucun ticket pour le moment
          </div>
        ) : (
          <div className="divide-y divide-surface-border">
            {recent.map(ticket => (
              <Link key={ticket.id}
                to={isResponsable ? `/admin/tickets/${ticket.id}` : `/tickets/${ticket.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-dark-800/50 transition-colors group"
              >
                <div className="text-xs font-mono text-slate-600 w-10 shrink-0">#{ticket.id}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate group-hover:text-white transition-colors">
                    {ticket.title}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">{timeAgo(ticket.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`badge ${PRIORITY_CONFIG[ticket.priority].color} hidden sm:inline-flex`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${PRIORITY_CONFIG[ticket.priority].dot}`} />
                    {PRIORITY_CONFIG[ticket.priority].label}
                  </span>
                  <span className={`badge ${STATUS_CONFIG[ticket.status].color}`}>
                    {STATUS_CONFIG[ticket.status].label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
