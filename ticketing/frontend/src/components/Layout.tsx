import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Ticket, LayoutDashboard, Plus, List, LogOut,
  ChevronRight, User, Menu, X, Settings
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/tickets', icon: List, label: 'Mes tickets' },
  { to: '/tickets/new', icon: Plus, label: 'Nouveau ticket' },
];

const adminNavItems = [
  { to: '/admin/tickets', icon: List, label: 'Tous les tickets' },
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Vue admin' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isResponsable } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const NavItems = () => (
    <nav className="flex-1 py-4 space-y-0.5">
      <p className="px-4 text-[10px] uppercase tracking-widest text-slate-600 font-medium mb-2">Utilisateur</p>
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} end={to === '/dashboard'}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg mx-2 transition-all duration-150 ${
              isActive
                ? 'bg-accent/10 text-accent font-medium border border-accent/15'
                : 'text-slate-400 hover:text-slate-100 hover:bg-dark-700'
            }`
          }>
          <Icon className="w-4 h-4 shrink-0" />
          {label}
        </NavLink>
      ))}

      {isResponsable && (
        <>
          <p className="px-4 text-[10px] uppercase tracking-widest text-slate-600 font-medium mb-2 mt-4">Administration</p>
          {adminNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg mx-2 transition-all duration-150 ${
                  isActive
                    ? 'bg-accent/10 text-accent font-medium border border-accent/15'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-dark-700'
                }`
              }>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </>
      )}
    </nav>
  );

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-dark-900 border-r border-surface-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-surface-border">
        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
          <Ticket className="w-4 h-4 text-accent" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">HelpDesk</p>
          <p className="text-[10px] text-slate-500">Ticketing System</p>
        </div>
      </div>

      <NavItems />

      {/* User footer */}
      <div className="border-t border-surface-border p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-dark-700 transition-colors">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">{user?.full_name}</p>
            <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors" title="Déconnexion">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-60 shrink-0 flex-col">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-60">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-surface-border bg-dark-900">
          <button onClick={() => setMobileOpen(true)} className="text-slate-400">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-white">HelpDesk</span>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
