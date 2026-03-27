import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketsApi } from '../lib/api';
import { TicketStats, Ticket } from '../types';
import { STATUS_CONFIG, PRIORITY_CONFIG, timeAgo } from '../lib/utils';
import { TicketIcon, Clock, CheckCircle, AlertTriangle, XCircle, TrendingUp, ArrowRight } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [urgent, setUrgent] = useState<Ticket[]>([]);
  const [recent, setRecent] = useState<Ticket[]>([]);

  useEffect(() => {
    ticketsApi.stats().then(r => setStats(r.data));
    ticketsApi.list({ priority: 'urgente', status: 'ouvert', page_size: 5 }).then(r =>
      setUrgent(r.data.results || r.data)
    );
    ticketsApi.list({ page_size: 8 }).then(r =>
      setRecent(r.data.results || r.data)
    );
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">Vue d'ensemble</h1>
        <p className="text-slate-500 text-sm mt-0.5">Tableau de bord administrateur</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, icon: TicketIcon, color: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
            { label: 'Ouverts', value: stats.ouvert, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
            { label: 'En cours', value: stats.en_cours, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
            { label: 'Résolus', value: stats.resolu, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            { label: 'Urgents', value: stats.urgente, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
            { label: 'Priorité haute', value: stats.haute, icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
            { label: 'Rejetés', value: stats.rejete, icon: XCircle, color: 'text-slate-500', bg: 'bg-slate-700/30', border: 'border-slate-700' },
            { label: 'Fermés', value: stats.ferme, icon: XCircle, color: 'text-slate-600', bg: 'bg-slate-700/20', border: 'border-slate-700/50' },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <div key={label} className={`card p-4 flex items-center gap-3 border ${border}`}>
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-600">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Urgent tickets */}
        <div className="card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-semibold text-white">Tickets urgents ouverts</h2>
            </div>
            <Link to="/admin/tickets?priority=urgente" className="text-xs text-accent hover:text-accent-hover flex items-center gap-1">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {urgent.length === 0 ? (
            <div className="p-6 text-center text-slate-600 text-sm">
              <CheckCircle className="w-6 h-6 mx-auto mb-1 text-emerald-700" />
              Aucun ticket urgent
            </div>
          ) : (
            <div className="divide-y divide-surface-border">
              {urgent.map(t => (
                <Link key={t.id} to={`/admin/tickets/${t.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-dark-800/50 transition-colors group">
                  <span className="font-mono text-xs text-slate-600 w-8">#{t.id}</span>
                  <span className="flex-1 text-sm text-slate-300 truncate group-hover:text-white">{t.title}</span>
                  <span className="text-xs text-slate-600">{timeAgo(t.created_at)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent */}
        <div className="card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
            <h2 className="text-sm font-semibold text-white">Activité récente</h2>
            <Link to="/admin/tickets" className="text-xs text-accent hover:text-accent-hover flex items-center gap-1">
              Tous <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-surface-border">
            {recent.map(t => (
              <Link key={t.id} to={`/admin/tickets/${t.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-dark-800/50 transition-colors group">
                <span className="font-mono text-xs text-slate-600 w-8">#{t.id}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 truncate group-hover:text-white">{t.title}</p>
                  <p className="text-xs text-slate-600">{t.author.full_name}</p>
                </div>
                <span className={`badge text-xs ${STATUS_CONFIG[t.status].color}`}>
                  {STATUS_CONFIG[t.status].label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
