import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketsApi } from '../lib/api';
import { TicketStats, Ticket } from '../types';
import { STATUS_CONFIG, PRIORITY_CONFIG, timeAgo } from '../lib/utils';
import { AlertTriangle, ArrowUpRight, CheckCircle, Clock, TrendingUp, Layers } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [urgent, setUrgent] = useState<Ticket[]>([]);
  const [pending, setPending] = useState<Ticket[]>([]);
  const [recent, setRecent] = useState<Ticket[]>([]);

  useEffect(() => {
    ticketsApi.stats().then(r => setStats(r.data));
    ticketsApi.list({ priority: 'urgente', status: 'ouvert', page_size: 5 }).then(r => setUrgent(r.data.results || r.data));
    ticketsApi.list({ status: 'ouvert', page_size: 5 }).then(r => setPending(r.data.results || r.data));
    ticketsApi.list({ page_size: 8 }).then(r => setRecent(r.data.results || r.data));
  }, []);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="animate-fadeup">
        <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Administration</p>
        <h1 className="text-3xl font-bold text-ink tracking-tight">Vue d'ensemble</h1>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fadeup delay-1">
          {/* Hero black card */}
          <div className="card-black p-6 col-span-2 row-span-1">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3">Total tickets</p>
            <p className="text-white text-5xl font-bold tracking-tight mb-1">{stats.total}</p>
            <div className="flex gap-3 mt-3 text-xs text-white/40">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />{stats.ouvert} ouverts</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />{stats.en_cours} en cours</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-400 rounded-full" />{stats.urgente} urgents</span>
            </div>
          </div>

          <div className="card-white p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted text-[10px] font-bold uppercase tracking-widest">Résolus</p>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-ink text-3xl font-bold">{stats.resolu}</p>
          </div>

          <div className="card-white p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted text-[10px] font-bold uppercase tracking-widest">En cours</p>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-ink text-3xl font-bold">{stats.en_cours}</p>
          </div>

          {[
            { label: 'Ouverts',   value: stats.ouvert,  icon: Clock,          iconColor: 'text-blue-500' },
            { label: 'Urgents',   value: stats.urgente, icon: AlertTriangle,  iconColor: 'text-red-500' },
            { label: 'Rejetés',   value: stats.rejete,  icon: Layers,         iconColor: 'text-gray-400' },
            { label: 'Fermés',    value: stats.ferme,   icon: Layers,         iconColor: 'text-gray-300' },
          ].map(({ label, value, icon: Icon, iconColor }) => (
            <div key={label} className="card-white p-4 flex items-center justify-between">
              <div>
                <p className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
                <p className="text-ink text-2xl font-bold">{value}</p>
              </div>
              <Icon className={`w-5 h-5 ${iconColor} opacity-60`} />
            </div>
          ))}
        </div>
      )}
<div className="grid md:grid-cols-3 gap-4 animate-fadeup delay-2">
  {/* Pending */}
  <div className="card-white overflow-hidden">
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-amber-50/50">
      <div className="flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        <p className="text-xs font-bold uppercase tracking-widest text-ink">En attente</p>
      </div>
      <Link to="/admin/tickets" className="text-xs text-muted font-semibold hover:text-ink flex items-center gap-1">
        Tout <ArrowUpRight className="w-3 h-3" />
      </Link>
    </div>
    {pending.length === 0 ? (
      <div className="py-10 text-center">
        <p className="text-muted text-xs italic">Aucun ticket en attente</p>
      </div>
    ) : pending.map(t => (
      <Link key={t.id} to={`/admin/tickets/${t.id}`}
        className="flex items-center gap-3 px-5 py-3.5 border-b border-border last:border-0 hover:bg-cream transition-colors group">
        <span className="font-mono text-xs text-muted w-8">#{t.id}</span>
        <span className="flex-1 text-sm font-medium text-ink truncate group-hover:underline">{t.title}</span>
        <span className="text-xs text-muted shrink-0">{timeAgo(t.created_at)}</span>
      </Link>
    ))}
  </div>

  {/* Urgents */}
  <div className="card-white overflow-hidden">
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
        <p className="text-xs font-bold uppercase tracking-widest text-ink">Urgents ouverts</p>
      </div>
...
            <Link to="/admin/tickets" className="text-xs text-muted font-semibold hover:text-ink flex items-center gap-1">
              Tout <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {urgent.length === 0 ? (
            <div className="py-10 text-center">
              <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
              <p className="text-muted text-xs">Aucun ticket urgent</p>
            </div>
          ) : urgent.map(t => (
            <Link key={t.id} to={`/admin/tickets/${t.id}`}
              className="flex items-center gap-3 px-5 py-3.5 border-b border-border last:border-0 hover:bg-cream transition-colors group">
              <span className="font-mono text-xs text-muted w-8">#{t.id}</span>
              <span className="flex-1 text-sm font-medium text-ink truncate group-hover:underline">{t.title}</span>
              <span className="text-xs text-muted shrink-0">{timeAgo(t.created_at)}</span>
            </Link>
          ))}
        </div>

        {/* Recent */}
        <div className="card-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <p className="text-xs font-bold uppercase tracking-widest text-ink">Activité récente</p>
            <Link to="/admin/tickets" className="text-xs text-muted font-semibold hover:text-ink flex items-center gap-1">
              Tout <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {recent.map(t => (
            <Link key={t.id} to={`/admin/tickets/${t.id}`}
              className="flex items-center gap-3 px-5 py-3.5 border-b border-border last:border-0 hover:bg-cream transition-colors group">
              <span className="font-mono text-xs text-muted w-8">#{t.id}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate group-hover:underline">{t.title}</p>
                <p className="text-xs text-muted">{t.author.full_name}</p>
              </div>
              <span className={`badge-status ${STATUS_CONFIG[t.status].color} shrink-0`}>{STATUS_CONFIG[t.status].label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
