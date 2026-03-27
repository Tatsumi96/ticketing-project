import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketsApi } from '../lib/api';
import { Ticket } from '../types';
import { STATUS_CONFIG, PRIORITY_CONFIG, timeAgo } from '../lib/utils';
import { Search, Filter, TicketIcon, User } from 'lucide-react';

export default function AdminTicketListPage() {
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
      <div>
        <h1 className="text-xl font-bold text-white">Gestion des tickets</h1>
        <p className="text-slate-500 text-sm mt-0.5">Tous les tickets du système</p>
      </div>

      {/* Filters */}
      <div className="card p-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input className="input pl-9" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-full sm:w-36" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Tous statuts</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className="input w-full sm:w-36" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="">Toutes priorités</option>
          {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <TicketIcon className="w-10 h-10 mx-auto mb-3 text-slate-700" />
            <p className="text-slate-400">Aucun ticket trouvé</p>
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2.5 border-b border-surface-border text-xs uppercase tracking-wider text-slate-600 font-medium">
              <div className="col-span-1">#</div>
              <div className="col-span-4">Titre</div>
              <div className="col-span-2">Auteur</div>
              <div className="col-span-2">Assigné à</div>
              <div className="col-span-1">Statut</div>
              <div className="col-span-1">Priorité</div>
              <div className="col-span-1">Date</div>
            </div>

            <div className="divide-y divide-surface-border">
              {tickets.map(ticket => (
                <Link
                  key={ticket.id}
                  to={`/admin/tickets/${ticket.id}`}
                  className="grid md:grid-cols-12 gap-2 md:gap-4 px-4 py-3 hover:bg-dark-800/60 transition-colors group items-center"
                >
                  <div className="hidden md:block col-span-1 font-mono text-xs text-slate-600">{ticket.id}</div>
                  <div className="col-span-12 md:col-span-4">
                    <p className="text-sm text-slate-200 group-hover:text-white font-medium truncate">{ticket.title}</p>
                    {ticket.category && <p className="text-xs text-slate-600">{ticket.category.name}</p>}
                  </div>
                  <div className="hidden md:flex col-span-2 items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                      {ticket.author.full_name.charAt(0)}
                    </div>
                    <span className="text-xs text-slate-400 truncate">{ticket.author.full_name}</span>
                  </div>
                  <div className="hidden md:flex col-span-2 items-center gap-1.5">
                    {ticket.assigned_to ? (
                      <>
                        <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-xs text-accent">
                          {ticket.assigned_to.full_name.charAt(0)}
                        </div>
                        <span className="text-xs text-slate-400 truncate">{ticket.assigned_to.full_name}</span>
                      </>
                    ) : (
                      <span className="text-xs text-slate-700 italic">Non assigné</span>
                    )}
                  </div>
                  <div className="col-span-6 md:col-span-1">
                    <span className={`badge text-xs ${STATUS_CONFIG[ticket.status].color}`}>
                      {STATUS_CONFIG[ticket.status].label}
                    </span>
                  </div>
                  <div className="col-span-6 md:col-span-1">
                    <span className={`badge text-xs ${PRIORITY_CONFIG[ticket.priority].color}`}>
                      {PRIORITY_CONFIG[ticket.priority].label}
                    </span>
                  </div>
                  <div className="hidden md:block col-span-1 text-xs text-slate-600">{timeAgo(ticket.created_at)}</div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
