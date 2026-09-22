import React from 'react';
import { 
  ShoppingCart, 
  Package, 
  LayoutDashboard, 
  Boxes, 
  FileText, 
  Users, 
  Code2, 
  ArrowDownToLine,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { UserRole } from '../types/database';

export type NavTab = 
  | 'pos' 
  | 'stock' 
  | 'dashboard' 
  | 'products' 
  | 'stock-in' 
  | 'reports' 
  | 'users' 
  | 'sql-guide';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  userRole: UserRole;
  lowStockCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  lowStockCount,
}) => {
  const isPetugas = userRole === 'petugas';

  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ElementType;
    adminOnly?: boolean;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    {
      id: 'pos',
      label: 'Kasir / POS',
      icon: ShoppingCart,
      badge: 'Utama',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'stock',
      label: 'Cek Stok Produk',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} Menipis` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    // Admin Only sections
    {
      id: 'dashboard',
      label: 'Dashboard Admin',
      icon: LayoutDashboard,
      adminOnly: true,
    },
    {
      id: 'products',
      label: 'Kelola Produk & Harga',
      icon: Boxes,
      adminOnly: true,
    },
    {
      id: 'stock-in',
      label: 'Stok Masuk (Restock)',
      icon: ArrowDownToLine,
      adminOnly: true,
    },
    {
      id: 'reports',
      label: 'Laporan Penjualan',
      icon: FileText,
      adminOnly: true,
    },
    {
      id: 'users',
      label: 'Manajemen Petugas',
      icon: Users,
      adminOnly: true,
    },
    // Developer / Documentation tab
    {
      id: 'sql-guide',
      label: 'Skrip SQL & Setup',
      icon: Code2,
      badge: 'Supabase',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 shrink-0 flex flex-col justify-between hidden md:flex">
      <div className="p-4 space-y-6">
        {/* Role Notice Card */}
        <div className={`p-3 rounded-xl border text-xs ${
          isPetugas 
            ? 'bg-sky-950/40 border-sky-800/60 text-sky-200' 
            : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
        }`}>
          <div className="flex items-center justify-between font-bold mb-1">
            <span className="uppercase tracking-wider">Akses Anda: {userRole}</span>
            <span className="w-2 h-2 rounded-full bg-current" />
          </div>
          <p className="text-[11px] opacity-80 leading-relaxed">
            {isPetugas 
              ? 'Terbatas pada Kasir (POS) dan melihat Stok Produk sesuai aturan RBAC.' 
              : 'Akses penuh ke seluruh modul kasir, CRUD barang, laporan & petugas.'}
          </p>
        </div>

        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Menu Operasional
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const isLocked = item.adminOnly && isPetugas;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left group ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : isLocked
                    ? 'text-slate-500 hover:text-slate-400 hover:bg-slate-800/40 cursor-pointer'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-slate-950' : isLocked ? 'text-slate-600' : 'text-slate-400 group-hover:text-amber-400'
                  }`} />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                  {isLocked && (
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded flex items-center space-x-1 border border-slate-700">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Admin</span>
                    </span>
                  )}
                  {item.badge && !isLocked && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      isActive ? 'bg-slate-900/40 text-slate-950' : item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
        <div className="flex items-center space-x-2 text-slate-400 font-medium mb-1">
          <Boxes className="w-3.5 h-3.5 text-amber-500" />
          <span>Toko Bahan Bangunan</span>
        </div>
        <p>Postgres Trigger Auto-Reduce Stock & RLS Active.</p>
      </div>
    </aside>
  );
};
