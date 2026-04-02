import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../lib/api';
import { Ticket } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    first_name:'', 
    last_name:'', 
    email:'', 
    username:'', 
    department:'', 
    phone:'', 
    role: 'user',
    password:'', 
    password2:'' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password2) { setError('Les mots de passe ne correspondent pas.'); return; }
    setLoading(true); setError('');
    try { await authApi.register(form); navigate('/login'); }
    catch (err: any) {
      const msg = err.response?.data;
      setError(typeof msg === 'object' ? Object.values(msg).flat().join(' ') : 'Erreur inscription.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fadeup">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-ink rounded-lg flex items-center justify-center">
            <Ticket className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-ink text-base">HelpDesk</span>
        </div>

        <h2 className="text-2xl font-bold text-ink mb-1">Créer un compte</h2>
        <p className="text-muted text-sm mb-8">Rejoignez votre espace de support</p>

        <div className="bg-white rounded-2xl border border-border p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-red-600 text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label-text">Prénom</label><input className="input-field" value={form.first_name} onChange={set('first_name')} required /></div>
              <div><label className="label-text">Nom</label><input className="input-field" value={form.last_name} onChange={set('last_name')} required /></div>
            </div>
            <div><label className="label-text">Email</label><input type="email" className="input-field" value={form.email} onChange={set('email')} required /></div>
            <div><label className="label-text">Nom d'utilisateur</label><input className="input-field" value={form.username} onChange={set('username')} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label-text">Département</label><input className="input-field" value={form.department} onChange={set('department')} /></div>
              <div><label className="label-text">Téléphone</label><input className="input-field" value={form.phone} onChange={set('phone')} /></div>
            </div>
            <div>
              <label className="label-text">Rôle</label>
              <select className="input-field" value={form.role} onChange={set('role')}>
                <option value="user">Utilisateur</option>
                <option value="responsable">Responsable</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
            <div><label className="label-text">Mot de passe</label><input type="password" className="input-field" value={form.password} onChange={set('password')} required minLength={6} /></div>
            <div><label className="label-text">Confirmer</label><input type="password" className="input-field" value={form.password2} onChange={set('password2')} required /></div>
            <button type="submit" className="btn-black w-full justify-center py-3 mt-1" disabled={loading}>
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Créer mon compte'}
            </button>
          </form>
          <p className="text-center text-muted text-sm mt-4">
            Déjà un compte ? <Link to="/login" className="text-ink font-semibold hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
