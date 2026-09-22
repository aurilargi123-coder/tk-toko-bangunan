import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  LogOut, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Profile, UserRole } from '../types/database';
import { dbService, getSupabaseConfig, saveSupabaseConfig } from '../lib/supabaseClient';

interface HeaderProps {
  currentUser: Profile;
  onRoleSwitch: (newRole: UserRole) => void;
  onLogout: () => void;
  onRefreshData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onRoleSwitch,
  onLogout,
  onRefreshData,
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState(getSupabaseConfig().url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(getSupabaseConfig().anonKey);
  const [configSuccess, setConfigSuccess] = useState(false);

  const isConnected = Boolean(getSupabaseConfig().url && getSupabaseConfig().anonKey);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
    setConfigSuccess(true);
    setTimeout(() => {
      setConfigSuccess(false);
      setShowConfigModal(false);
      onRefreshData();
    }, 1200);
  };

  const handleResetData = () => {
    if (window.confirm('Reset semua data produk, transaksi, dan akun ke data awal bawaan?')) {
      dbService.resetDatabaseToDefault();
      onRefreshData();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">TB Bangunan Jaya</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  POS & Stock
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Sistem Manajemen Toko Bahan Bangunan (Next.js + Supabase)
              </p>
            </div>
          </div>

          {/* Controls: Role Switcher & User Profile */}
          <div className="flex items-center space-x-3">
            {/* Supabase Status Pill */}
            <button
              onClick={() => setShowConfigModal(true)}
              title="Konfigurasi Supabase Client"
              className={`hidden md:flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                isConnected
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isConnected ? 'Supabase: Terhubung' : 'Mode Demo (Lokal)'}</span>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </button>

            {/* Quick RBAC Switcher */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700">
              <span className="text-[11px] font-medium text-slate-400 px-2 hidden lg:inline">
                Uji Role:
              </span>
              <button
                onClick={() => onRoleSwitch('admin')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  currentUser.role === 'admin'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Beralih ke hak akses Admin (Akses Penuh)"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
              <button
                onClick={() => onRoleSwitch('petugas')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  currentUser.role === 'petugas'
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Beralih ke hak akses Petugas (Kasir POS & Stok)"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Petugas</span>
              </button>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-700 text-amber-400 flex items-center justify-center font-bold text-xs border border-slate-600">
                {currentUser.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-200 leading-tight">
                  {currentUser.full_name.split(' ')[0]}
                </p>
                <p className="text-[10px] text-slate-400 capitalize">
                  {currentUser.role}
                </p>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                title="Logout dari sistem"
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Supabase Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 text-slate-100 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Pengaturan Supabase</h3>
                  <p className="text-xs text-slate-400">Hubungkan database PostgreSQL Supabase</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Secara bawaan, aplikasi ini berjalan menggunakan <strong className="text-amber-400">penyimpanan lokal interaktif</strong> dengan data awal Toko Bangunan lengkap (semen, besi, cat, paku, pipa, dll). Anda dapat memasukkan URL & Anon Key Supabase asli di bawah jika ingin menyambungkannya langsung.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  NEXT_PUBLIC_SUPABASE_URL
                </label>
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              {configSuccess && (
                <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Pengaturan Supabase berhasil disimpan!</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetData}
                  className="flex items-center space-x-1.5 text-xs text-amber-400 hover:text-amber-300 hover:underline"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Data Demo</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg shadow"
                  >
                    Simpan Konfigurasi
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
