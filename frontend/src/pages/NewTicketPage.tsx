import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketsApi, categoriesApi, authApi } from '../lib/api';
import { Category, User } from '../types';
import { Paperclip, X, Send } from 'lucide-react';

export default function NewTicketPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [responsables, setResponsables] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ title:'', description:'', priority:'normale', category_id:'', assigned_to_id:'' });
  const set = (k: string) => (e: React.ChangeEvent<any>) => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    categoriesApi.list().then(r => setCategories(r.data.results || r.data));
    authApi.responsables().then(r => setResponsables(r.data.results || r.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('title', form.title); fd.append('description', form.description); fd.append('priority', form.priority);
      if (form.category_id) fd.append('category_id', form.category_id);
      if (form.assigned_to_id) fd.append('assigned_to_id', form.assigned_to_id);
      if (file) fd.append('attachment', file);
      const res = await ticketsApi.create(fd);
      navigate(`/tickets/${res.data.id}`);
    } catch (err: any) {
      const msg = err.response?.data;
      setError(typeof msg === 'object' ? Object.values(msg).flat().join(' ') : 'Erreur lors de la création.');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl animate-fadeup">
      <div className="mb-6">
        <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Support</p>
        <h1 className="text-3xl font-bold text-ink tracking-tight">Nouvelle demande</h1>
        <p className="text-muted text-sm mt-1">Décrivez votre problème en détail</p>
      </div>

      <div className="card-white p-6">
        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-red-600 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-text">Titre du problème *</label>
            <input className="input-field" placeholder="Ex: Impossible d'accéder à ma messagerie..."
              value={form.title} onChange={set('title')} required maxLength={255} />
          </div>

          <div>
            <label className="label-text">Description détaillée *</label>
            <textarea className="input-field resize-none" rows={6}
              placeholder="Décrivez votre problème, les erreurs observées, les actions déjà tentées..."
              value={form.description} onChange={set('description')} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Priorité</label>
              <select className="input-field" value={form.priority} onChange={set('priority')}>
                <option value="faible">Faible</option>
                <option value="normale">Normale</option>
                <option value="haute">Haute</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div>
              <label className="label-text">Catégorie</label>
              <select className="input-field" value={form.category_id} onChange={set('category_id')}>
                <option value="">Choisir...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label-text">Envoyer à</label>
            <select className="input-field" value={form.assigned_to_id} onChange={set('assigned_to_id')}>
              <option value="">Responsable automatique</option>
              {responsables.map(r => <option key={r.id} value={r.id}>{r.full_name}{r.department ? ` — ${r.department}` : ''}</option>)}
            </select>
          </div>

          {/* Attachment */}
          <div>
            <label className="label-text">Pièce jointe (optionnel)</label>
            <div className="relative">
              <input type="file" id="att" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
              <label htmlFor="att" className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-ink hover:bg-cream transition-all">
                <Paperclip className="w-4 h-4 text-muted" />
                <span className="text-sm text-muted">{file ? file.name : 'Cliquer pour joindre un fichier'}</span>
              </label>
              {file && <button type="button" onClick={() => setFile(null)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-red-500"><X className="w-4 h-4" /></button>}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" className="btn-black flex-1 justify-center py-3" disabled={loading}>
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Send className="w-4 h-4" /> Envoyer la demande</>
              }
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-outline">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}
