export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'user' | 'responsable' | 'admin';
  department: string;
  phone: string;
  avatar: string | null;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface Comment {
  id: number;
  ticket: number;
  author: User;
  content: string;
  is_internal: boolean;
  is_solution_step: boolean;
  step_number: number | null;
  created_at: string;
  updated_at: string;
}

export interface TicketHistory {
  id: number;
  field_changed: string;
  old_value: string;
  new_value: string;
  changed_by: User;
  created_at: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'ouvert' | 'en_cours' | 'resolu' | 'ferme' | 'rejete';
  priority: 'faible' | 'normale' | 'haute' | 'urgente';
  category: Category | null;
  author: User;
  assigned_to: User | null;
  attachment: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  comments: Comment[];
  history: TicketHistory[];
  comments_count?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}

export interface TicketStats {
  total: number;
  ouvert: number;
  en_cours: number;
  resolu: number;
  ferme: number;
  rejete: number;
  urgente: number;
  haute: number;
}

export interface CreateTicketData {
  title: string;
  description: string;
  priority: string;
  category_id?: number;
  assigned_to_id?: number;
  attachment?: File;
}
