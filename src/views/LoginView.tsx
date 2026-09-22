import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  Mail, 
  ShieldCheck, 
  UserCheck, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { Profile } from '../types/database';
import { dbService } from '../lib/supabaseClient';

interface LoginViewProps {
  onLoginSuccess: (profile: Profile) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = dbService.login(email.trim(), password);
      if (res.success && res.profile) {
        onLoginSuccess(res.profile);
      } else {
        setError(res.error || 'Email atau password salah.');
      }
      setLoading(false);
    }, 400);
  };

  const handleQuickLogin = (type: 'admin' | 'petugas') => {
    setError(null);
    setLoading(true);
    const targetEmail = type === 'admin' ? 'admin@bangunan.com' : 'petugas@bangunan.com';
    setEmail(targetEmail);
    setPassword('demo12345');

    setTimeout(() => {
      const res = dbService.login(targetEmail, 'demo12345');
      if (res.success && res.profile) {
        onLoginSuccess(res.profile);
      }
      setLoading(false);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-500/20 text-slate-950 font-black mb-3">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            TB BANGUNAN JAYA
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sistem Manajemen Kasir (POS) &amp; Inventaris Toko Material
          </p>
        </div>

        {/* Login Box */}
        <div className="mt-8 bg-slate-900 border border-slate-800 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-3 text-center">
            <h2 className="text-base font-bold text-slate-100">
              Masuk ke Akun Anda
            </h2>
            <p className="text-[11px] text-slate-400">
              Autentikasi Supabase Auth dengan Role-Based Access Control (RBAC)
            </p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-xs text-rose-400 bg-rose-950/40 p-3 rounded-xl border border-rose-500/30 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Alamat Email</span>
              </label>
              <input
                type="email"
                required
                placeholder="nama@bangunan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Kata Sandi (Password)</span>
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 active:scale-98"
            >
              <span>{loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Presets */}
          <div className="pt-2 border-t border-slate-800 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block text-center">
              1-Klik Login Demo (Langsung Masuk):
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="flex items-center justify-center space-x-1.5 p-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl border border-slate-700 text-xs font-bold transition-all text-center"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin (Owner)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('petugas')}
                className="flex items-center justify-center space-x-1.5 p-2.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-xl border border-slate-700 text-xs font-bold transition-all text-center"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Petugas (Kasir)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
