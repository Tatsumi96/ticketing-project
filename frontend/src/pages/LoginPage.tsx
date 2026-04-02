import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Ticket, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Email ou mot de passe incorrect.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left panel - black */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <Ticket className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-base tracking-tight">HelpDesk</span>
        </div>
        <div>
          <p className="text-white/30 text-xs uppercase tracking-widest font-semibold mb-6">Système de tickets</p>
          <h1 className="text-white text-5xl font-bold leading-tight mb-4">
            Gérez vos<br />demandes<br />simplement.
          </h1>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Soumettez vos problèmes, suivez leur avancement et communiquez avec votre équipe support en temps réel.
          </p>
        </div>
        <p className="text-white/20 text-xs">© 2024 HelpDesk · Tous droits réservés</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-fadeup">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-ink rounded-lg flex items-center justify-center">
              <Ticket className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-ink">HelpDesk</span>
          </div>

          <h2 className="text-2xl font-bold text-ink mb-1">Connexion</h2>
          <p className="text-muted text-sm mb-4">Accédez à votre espace de support</p>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-text">Adresse email</label>
              <input type="email" className="input-field" placeholder="vous@exemple.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label-text">Mot de passe</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} className="input-field pr-10"
                  placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-ink">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-black w-full justify-center py-3 mt-2" disabled={loading}>
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Se connecter'
              }
            </button>
          </form>

          <p className="text-center text-muted text-sm mt-5 mb-10">
            Pas de compte ?{' '}
            <Link to="/register" className="text-ink font-semibold hover:underline">S'inscrire</Link>
          </p>
          {/* Comptes de démonstration*/}
          <div className="bg-ink/5 border border-ink/10 rounded-2xl p-4 mb-6">
            <p className="text-[10px] font-bold text-ink/40 uppercase tracking-widest mb-3">Comptes de démonstration (cliquer pour remplir)</p>
            <div className="flex flex-col gap-2">
              <button 
                type="button"
                onClick={() => { setEmail('admin@gmail.com'); setPassword('admin123'); }}
                className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-white/80 border border-ink/5 transition-all text-left"
              >
                <span className="text-xs font-semibold text-ink">Administrateur</span>
                <span className="text-[10px] text-muted">admin@gmail.com</span>
              </button>
              <button 
                type="button"
                onClick={() => { setEmail('resp@gmail.com'); setPassword('resp123'); }}
                className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-white/80 border border-ink/5 transition-all text-left"
              >
                <span className="text-xs font-semibold text-ink">Responsable</span>
                <span className="text-[10px] text-muted">resp@gmail.com</span>
              </button>
              <button 
                type="button"
                onClick={() => { setEmail('user@ticketing.mg'); setPassword('12345678'); }}
                className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-white/80 border border-ink/5 transition-all text-left"
              >
                <span className="text-xs font-semibold text-ink">Utilisateur</span>
                <span className="text-[10px] text-muted">user@ticketing.mg</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
