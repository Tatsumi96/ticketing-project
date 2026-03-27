import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketsApi } from '../lib/api';
import { Ticket } from '../types';
import { STATUS_CONFIG, PRIORITY_CONFIG, timeAgo } from '../lib/utils';
import { Search, Filter, Plus, TicketIcon, ChevronDown } from 'lucide-react';

export default function TicketListPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    ticketsApi.list({
      search: search || undefined,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
    }).then(res => {
      setTickets(res.data.results || res.data);
    }).finally(() => setLoading(false));
  }, [search, statusFilter, priorityFilter]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Mes tickets</h1>
          <p className="text-slate-500 text-sm mt-0.5">Historique de vos demandes</p>
        </div>
        <Link to="/tickets/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          Nouveau
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            className="input pl-9"
            placeholder="Rechercher un ticket..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-full sm:w-40"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">Tous statuts</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select
          className="input w-full sm:w-40"
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
        >
          <option value="">Toutes priorités</option>
          {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <TicketIcon className="w-10 h-10 mx-auto mb-3 text-slate-700" />
            <p className="text-slate-400 font-medium">Aucun ticket trouvé</p>
            <p className="text-slate-600 text-sm mt-1">Créez votre première demande</p>
            <Link to="/tickets/new" className="btn-primary mt-4 inline-flex">
              <Plus className="w-4 h-4" /> Nouveau ticket
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2.5 border-b border-surface-border text-xs uppercase tracking-wider text-slate-600 font-medium">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Titre</div>
              <div className="col-span-2">Statut</div>
              <div className="col-span-2">Priorité</div>
              <div className="col-span-2">Date</div>
            </div>

            <div className="divide-y divide-surface-border">
              {tickets.map(ticket => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="grid md:grid-cols-12 gap-2 md:gap-4 px-4 py-3.5 hover:bg-dark-800/60 transition-colors group items-center"
                >
                  <div className="hidden md:block col-span-1 font-mono text-xs text-slate-600">
                    {ticket.id}
                  </div>
                  <div className="col-span-12 md:col-span-5">
                    <p className="text-sm text-slate-200 group-hover:text-white font-medium transition-colors truncate">
                      {ticket.title}
                    </p>
                    {ticket.category && (
                      <p className="text-xs text-slate-600 mt-0.5">{ticket.category.name}</p>
                    )}
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <span className={`badge ${STATUS_CONFIG[ticket.status].color}`}>
                      {STATUS_CONFIG[ticket.status].label}
                    </span>
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <span className={`badge ${PRIORITY_CONFIG[ticket.priority].color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${PRIORITY_CONFIG[ticket.priority].dot}`} />
                      {PRIORITY_CONFIG[ticket.priority].label}
                    </span>
                  </div>
                  <div className="hidden md:block col-span-2 text-xs text-slate-600">
                    {timeAgo(ticket.created_at)}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
