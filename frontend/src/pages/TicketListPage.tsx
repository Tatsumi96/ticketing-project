import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketsApi } from '../lib/api';
import { Ticket } from '../types';
import { STATUS_CONFIG, PRIORITY_CONFIG, timeAgo } from '../lib/utils';
import { Search, Plus } from 'lucide-react';

export default function TicketListPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    ticketsApi.list({ search: search || undefined, status: statusFilter || undefined })
      .then(r => setTickets(r.data.results || r.data))
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-end justify-between animate-fadeup">
        <div>
          <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Support</p>
          <h1 className="text-3xl font-bold text-ink tracking-tight">Mes demandes</h1>
        </div>
        <Link to="/tickets/new" className="btn-black"><Plus className="w-4 h-4" /> Nouveau</Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 animate-fadeup delay-1">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pl-9" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card-white overflow-hidden animate-fadeup delay-2">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-ink font-semibold mb-1">Aucun ticket trouvé</p>
            <p className="text-muted text-sm mb-4">Commencez par créer une demande</p>
            <Link to="/tickets/new" className="btn-black inline-flex"><Plus className="w-4 h-4" /> Nouveau ticket</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 px-5 py-3 border-b border-border text-[10px] font-bold uppercase tracking-widest text-muted">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Titre</div>
              <div className="col-span-3">Statut</div>
              <div className="col-span-3">Priorité</div>
            </div>
            {tickets.map(ticket => (
              <Link key={ticket.id} to={`/tickets/${ticket.id}`}
                className="grid grid-cols-12 px-5 py-4 border-b border-border last:border-0 hover:bg-cream transition-colors items-center group">
                <div className="col-span-1 font-mono text-xs text-muted">{ticket.id}</div>
                <div className="col-span-5">
                  <p className="text-sm font-medium text-ink group-hover:underline truncate">{ticket.title}</p>
                  <p className="text-xs text-muted">{timeAgo(ticket.created_at)}</p>
                </div>
                <div className="col-span-3">
                  <span className={`badge-status ${STATUS_CONFIG[ticket.status].color}`}>{STATUS_CONFIG[ticket.status].label}</span>
                </div>
                <div className="col-span-3">
                  <span className={`badge-status ${PRIORITY_CONFIG[ticket.priority].color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${PRIORITY_CONFIG[ticket.priority].dot}`} />
                    {PRIORITY_CONFIG[ticket.priority].label}
                  </span>
                </div>
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
