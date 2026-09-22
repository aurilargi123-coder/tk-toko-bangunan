import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  UserCheck, 
  X, 
  AlertCircle,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { Profile, UserRole } from '../types/database';
import { formatDate } from '../lib/formatters';
import { dbService } from '../lib/supabaseClient';

interface UserManagementViewProps {
  profiles: Profile[];
  currentUserId: string;
  onRefreshData: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  profiles,
  currentUserId,
  onRefreshData,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('petugas');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setErrorMessage('Nama lengkap dan email wajib diisi.');
      return;
    }

    dbService.addProfile(fullName.trim(), email.trim(), role);
    setIsAddOpen(false);
    setFullName('');
    setEmail('');
    setRole('petugas');
    setSuccessMessage('Petugas baru berhasil ditambahkan ke database Supabase.');
    setTimeout(() => setSuccessMessage(null), 3500);
    onRefreshData();
  };

  const handleRoleToggle = (profile: Profile) => {
    const newRole: UserRole = profile.role === 'admin' ? 'petugas' : 'admin';
    if (
      window.confirm(
        `Ubah hak akses "${profile.full_name}" dari ${profile.role.toUpperCase()} menjadi ${newRole.toUpperCase()}?`
      )
    ) {
      dbService.updateProfileRole(profile.id, newRole);
      onRefreshData();
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Manajemen Petugas &amp; Hak Akses RBAC (Admin)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Kelola peran pengguna (Admin dan Petugas Kasir) yang tersinkronisasi dengan tabel profiles Supabase.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Petugas</span>
        </button>
      </div>

      {successMessage && (
        <div className="flex items-center space-x-2 text-xs text-emerald-300 bg-emerald-950/60 p-3.5 rounded-xl border border-emerald-500/30">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* RBAC Info Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Hak Akses Role: Admin</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Akses tak terbatas: Dashboard statistik, Manajemen Stok &amp; CRUD Produk, Stok Masuk dari distributor, Laporan Penjualan, Manajemen Petugas, dan Kasir POS.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-500/30 space-y-1.5">
          <div className="flex items-center space-x-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
            <UserCheck className="w-4 h-4" />
            <span>Hak Akses Role: Petugas</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Akses operasional kasir: Transaksi Kasir (POS) belanja pelanggan dan melihat stok fisik katalog material (tanpa hak mengubah harga atau laporan laba toko).
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Nama Petugas</th>
                <th className="py-3.5 px-4">Email Supabase Auth</th>
                <th className="py-3.5 px-4">Role RBAC</th>
                <th className="py-3.5 px-4">Terdaftar Sejak</th>
                <th className="py-3.5 px-4 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {profiles.map((p) => {
                const isCurrentUser = p.id === currentUserId;
                const isAdmin = p.role === 'admin';

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-100 text-sm flex items-center space-x-2">
                        <span>{p.full_name}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                            Akun Anda
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">ID: {p.id}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">
                      {p.email}
                    </td>
                    <td className="py-3.5 px-4">
                      {isAdmin ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Admin Toko</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-950/80 text-sky-300 border border-sky-500/40">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Petugas Kasir</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleRoleToggle(p)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
                        title="Ubah Role Pengguna"
                      >
                        Jadikan {isAdmin ? 'Petugas' : 'Admin'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Tambah Petugas Toko</h3>
                  <p className="text-xs text-slate-400">Daftarkan akun kasir atau staf gudang</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Lengkap Petugas *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian Anggara"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Login Supabase *
                </label>
                <input
                  type="email"
                  required
                  placeholder="rian@bangunan.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pilih Hak Akses (Role) *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="petugas">Petugas (Hanya Akses POS & Cek Stok)</option>
                  <option value="admin">Admin (Akses Penuh Seluruh Modul)</option>
                </select>
              </div>

              {errorMessage && (
                <div className="flex items-center space-x-2 text-xs text-rose-400 bg-rose-950/40 p-3 rounded-xl border border-rose-500/30">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow"
                >
                  Simpan Petugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
