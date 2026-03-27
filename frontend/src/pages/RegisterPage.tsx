import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../lib/api';
import { Ticket, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', username: '',
    department: '', phone: '', password: '', password2: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password2) { setError('Les mots de passe ne correspondent pas.'); return; }
    setLoading(true); setError('');
    try {
      await authApi.register(form);
      navigate('/login');
    } catch (err: any) {
      const msg = err.response?.data;
      setError(typeof msg === 'object' ? Object.values(msg).flat().join(' ') : 'Erreur lors de l\'inscription.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(79,142,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(79,142,247,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 mb-4">
            <Ticket className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-white">Créer un compte</h1>
        </div>

        <div className="card p-6">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Prénom</label>
                <input className="input" value={form.first_name} onChange={set('first_name')} required />
              </div>
              <div>
                <label className="label">Nom</label>
                <input className="input" value={form.last_name} onChange={set('last_name')} required />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email} onChange={set('email')} required />
            </div>

            <div>
              <label className="label">Nom d'utilisateur</label>
              <input className="input" value={form.username} onChange={set('username')} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Département</label>
                <input className="input" value={form.department} onChange={set('department')} />
              </div>
              <div>
                <label className="label">Téléphone</label>
                <input className="input" value={form.phone} onChange={set('phone')} />
              </div>
            </div>

            <div>
              <label className="label">Mot de passe</label>
              <input type="password" className="input" value={form.password} onChange={set('password')} required minLength={6} />
            </div>
            <div>
              <label className="label">Confirmer le mot de passe</label>
              <input type="password" className="input" value={form.password2} onChange={set('password2')} required />
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
              {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Création...</span> : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-4">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-accent hover:text-accent-hover">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
