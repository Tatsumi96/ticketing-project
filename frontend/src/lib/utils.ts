import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function timeAgo(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
}

export function formatDate(date: string) {
  return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: fr });
}

export const STATUS_CONFIG = {
  ouvert:   { label: 'Ouvert',   color: 'bg-blue-50 text-blue-700' },
  en_cours: { label: 'En cours', color: 'bg-amber-50 text-amber-700' },
  resolu:   { label: 'Résolu',   color: 'bg-emerald-50 text-emerald-700' },
  ferme:    { label: 'Fermé',    color: 'bg-gray-100 text-gray-500' },
  rejete:   { label: 'Rejeté',   color: 'bg-red-50 text-red-600' },
} as const;

export const PRIORITY_CONFIG = {
  faible:  { label: 'Faible',  color: 'bg-gray-100 text-gray-500',       dot: 'bg-gray-400' },
  normale: { label: 'Normale', color: 'bg-sky-50 text-sky-700',          dot: 'bg-sky-400' },
  haute:   { label: 'Haute',   color: 'bg-orange-50 text-orange-700',    dot: 'bg-orange-400' },
  urgente: { label: 'Urgente', color: 'bg-red-50 text-red-700',          dot: 'bg-red-500' },
} as const;
