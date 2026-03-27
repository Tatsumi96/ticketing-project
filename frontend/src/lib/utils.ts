import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function timeAgo(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
}

export function formatDate(date: string) {
  return format(new Date(date), 'dd MMM yyyy à HH:mm', { locale: fr });
}

export const STATUS_CONFIG = {
  ouvert:   { label: 'Ouvert',    color: 'bg-blue-500/15 text-blue-400 border border-blue-500/20' },
  en_cours: { label: 'En cours',  color: 'bg-amber-500/15 text-amber-400 border border-amber-500/20' },
  resolu:   { label: 'Résolu',    color: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' },
  ferme:    { label: 'Fermé',     color: 'bg-slate-500/15 text-slate-400 border border-slate-500/20' },
  rejete:   { label: 'Rejeté',    color: 'bg-red-500/15 text-red-400 border border-red-500/20' },
} as const;

export const PRIORITY_CONFIG = {
  faible:   { label: 'Faible',   color: 'bg-slate-500/15 text-slate-400', dot: 'bg-slate-400' },
  normale:  { label: 'Normale',  color: 'bg-sky-500/15 text-sky-400', dot: 'bg-sky-400' },
  haute:    { label: 'Haute',    color: 'bg-orange-500/15 text-orange-400', dot: 'bg-orange-400' },
  urgente:  { label: 'Urgente',  color: 'bg-red-500/15 text-red-400', dot: 'bg-red-400' },
} as const;

export function clsx(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}
