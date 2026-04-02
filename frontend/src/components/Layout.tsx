import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Ticket, Plus, List, LogOut,
  User, Menu, X, ShieldCheck, Clock
} from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isResponsable } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const userNav = [
    { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tickets',     icon: List,             label: 'Mes tickets' },
    { to: '/tickets/new', icon: Plus,             label: 'Nouveau ticket' },
  ];

  const adminNav = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Vue admin' },
    { to: '/admin/tickets?status=ouvert', icon: Clock, label: 'Demandes à valider' },
    { to: '/admin/tickets',   icon: List,             label: 'Tous les tickets' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-border">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-ink rounded-lg flex items-center justify-center">
            <Ticket className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-ink text-base tracking-tight">HelpDesk</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {userNav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/dashboard'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}

        {isResponsable && (
          <>
            <div className="pt-4 pb-1 px-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Administration</p>
            </div>
            {adminNav.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-cream transition-colors">
          <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">
              {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-ink truncate">{user?.full_name}</p>
            <p className="text-[10px] text-muted capitalize">{user?.role} {user?.department && `· ${user.department}`}</p>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Déconnexion">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-56 shrink-0 flex-col">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-56">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-ink rounded-lg flex items-center justify-center">
              <Ticket className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-ink text-sm">HelpDesk</span>
          </div>
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5 text-ink" />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
