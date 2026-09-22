import React from 'react';
import { ShieldAlert, ArrowLeft, ShieldCheck, ShoppingCart } from 'lucide-react';
import { UserRole } from '../types/database';

interface RouteGuardBannerProps {
  requiredRole: UserRole;
  currentRole: UserRole;
  onSwitchToAdmin: () => void;
  onBackToPos: () => void;
}

export const RouteGuardBanner: React.FC<RouteGuardBannerProps> = ({
  requiredRole,
  currentRole,
  onSwitchToAdmin,
  onBackToPos,
}) => {
  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-500/30">
            RBAC Route Guard Aktif
          </span>
          <h3 className="text-xl font-black text-white tracking-tight">
            Akses Dibatasi (Hanya Role Admin)
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sesuai spesifikasi PRD Toko Bangunan, akun dengan peran <strong className="text-sky-300 capitalize font-bold">&apos;{currentRole}&apos;</strong> hanya memiliki izin akses ke modul <strong className="text-amber-400 font-bold">Transaksi Kasir (POS)</strong> dan <strong className="text-amber-400 font-bold">Cek Stok Produk</strong>.
          </p>
        </div>

        <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-[11px] text-slate-300 text-left space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Halaman ini butuh role:</span>
            <span className="font-bold text-amber-400 uppercase">{requiredRole}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Role Anda saat ini:</span>
            <span className="font-bold text-sky-400 uppercase">{currentRole}</span>
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            onClick={onSwitchToAdmin}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Beralih ke Akun Admin (Uji Akses Penuh)</span>
          </button>

          <button
            onClick={onBackToPos}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Kembali ke Kasir / POS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
