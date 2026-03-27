import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketsApi, categoriesApi, authApi } from '../lib/api';
import { Category, User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Paperclip, Send, X } from 'lucide-react';

export default function NewTicketPage() {
  const navigate = useNavigate();
  const { isResponsable } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [responsables, setResponsables] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'normale',
    category_id: '',
    assigned_to_id: '',
  });

  useEffect(() => {
    categoriesApi.list().then(r => setCategories(r.data.results || r.data));
    authApi.responsables().then(r => setResponsables(r.data));
  }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('priority', form.priority);
      if (form.category_id) fd.append('category_id', form.category_id);
      if (form.assigned_to_id) fd.append('assigned_to_id', form.assigned_to_id);
      if (file) fd.append('attachment', file);

      const res = await ticketsApi.create(fd);
      navigate(`/tickets/${res.data.id}`);
    } catch (err: any) {
      const msg = err.response?.data;
      setError(typeof msg === 'object' ? Object.values(msg).flat().join(' ') : 'Erreur lors de la création.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Nouvelle demande</h1>
        <p className="text-slate-500 text-sm mt-1">Décrivez votre problème en détail pour une résolution rapide</p>
      </div>

      <div className="card p-6">
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-5 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="label">Titre du problème *</label>
            <input
              className="input"
              placeholder="Ex: Impossible d'accéder à ma messagerie..."
              value={form.title}
              onChange={set('title')}
              required
              maxLength={255}
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">Description détaillée *</label>
            <textarea
              className="input resize-none"
              placeholder="Décrivez votre problème : quand cela s'est produit, les messages d'erreur observés, les actions déjà tentées..."
              rows={6}
              value={form.description}
              onChange={set('description')}
              required
            />
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Priorité</label>
              <select className="input" value={form.priority} onChange={set('priority')}>
                <option value="faible">Faible</option>
                <option value="normale">Normale</option>
                <option value="haute">Haute</option>
                <option value="urgente">🔴 Urgente</option>
              </select>
            </div>
            <div>
              <label className="label">Catégorie</label>
              <select className="input" value={form.category_id} onChange={set('category_id')}>
                <option value="">Choisir...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assigned to */}
          <div>
            <label className="label">Envoyer à</label>
            <select className="input" value={form.assigned_to_id} onChange={set('assigned_to_id')}>
              <option value="">Responsable automatique</option>
              {responsables.map(r => (
                <option key={r.id} value={r.id}>
                  {r.full_name} {r.department ? `— ${r.department}` : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-600 mt-1">Choisissez le responsable auquel adresser votre demande</p>
          </div>

          {/* Attachment */}
          <div>
            <label className="label">Pièce jointe (optionnel)</label>
            <div className="relative">
              <input
                type="file"
                id="attachment"
                className="hidden"
                onChange={e => setFile(e.target.files?.[0] || null)}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <label
                htmlFor="attachment"
                className="flex items-center gap-3 px-4 py-3 border border-dashed border-surface-border rounded-lg cursor-pointer hover:border-accent/40 hover:bg-accent/5 transition-all"
              >
                <Paperclip className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-500">
                  {file ? file.name : 'Cliquer pour joindre un fichier'}
                </span>
              </label>
              {file && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center py-2.5" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Envoi en cours...
                </span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Envoyer la demande
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-ghost"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
