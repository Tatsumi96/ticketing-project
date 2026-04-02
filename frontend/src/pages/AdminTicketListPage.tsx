import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ticketsApi } from '../lib/api';
import { Ticket } from '../types';
import { STATUS_CONFIG, PRIORITY_CONFIG, timeAgo } from '../lib/utils';
import { Search } from 'lucide-react';

export default function AdminTicketListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const statusFilter = searchParams.get('status') || '';

  const setStatusFilter = (val: string) => {
    if (val) searchParams.set('status', val);
    else searchParams.delete('status');
    setSearchParams(searchParams);
  };

  useEffect(() => {
    setLoading(true);
    ticketsApi.list({ search: search || undefined, status: statusFilter || undefined })
      .then(r => setTickets(r.data.results || r.data))
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="animate-fadeup">
        <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Administration</p>
        <h1 className="text-3xl font-bold text-ink tracking-tight">Tous les tickets</h1>
      </div>

      <div className="flex gap-3 animate-fadeup delay-1">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pl-9" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-44" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="card-white overflow-hidden animate-fadeup delay-2">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="w-6 h-6 border-2 border-ink/20 border-t-ink rounded-full animate-spin" /></div>
        ) : (
          <>
            <div className="grid grid-cols-12 px-5 py-3 border-b border-border text-[10px] font-bold uppercase tracking-widest text-muted">
              <div className="col-span-1">#</div>
              <div className="col-span-4">Titre</div>
              <div className="col-span-2">Auteur</div>
              <div className="col-span-2">Assigné à</div>
              <div className="col-span-2">Statut</div>
              <div className="col-span-1">Priorité</div>
            </div>
            {tickets.length === 0 ? (
              <p className="text-center text-muted text-sm py-16">Aucun ticket</p>
            ) : tickets.map(t => (
              <Link key={t.id} to={`/admin/tickets/${t.id}`}
                className="grid grid-cols-12 px-5 py-4 border-b border-border last:border-0 hover:bg-cream transition-colors items-center group">
                <div className="col-span-1 font-mono text-xs text-muted">{t.id}</div>
                <div className="col-span-4">
                  <p className="text-sm font-medium text-ink truncate group-hover:underline">{t.title}</p>
                  <p className="text-xs text-muted">{timeAgo(t.created_at)}</p>
                </div>
                <div className="col-span-2 text-xs text-ink font-medium truncate">{t.author.full_name}</div>
                <div className="col-span-2 text-xs text-muted truncate">{t.assigned_to?.full_name || <span className="italic">Non assigné</span>}</div>
                <div className="col-span-2"><span className={`badge-status ${STATUS_CONFIG[t.status].color}`}>{STATUS_CONFIG[t.status].label}</span></div>
                <div className="col-span-1"><span className={`badge-status ${PRIORITY_CONFIG[t.priority].color}`}>{PRIORITY_CONFIG[t.priority].label}</span></div>
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
