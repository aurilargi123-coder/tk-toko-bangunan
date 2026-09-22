import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  PackageX, 
  ArrowUpDown, 
  Layers,
  Info
} from 'lucide-react';
import { Product, Category, UserRole } from '../types/database';
import { formatRupiah } from '../lib/formatters';

interface StockViewProps {
  products: Product[];
  categories: Category[];
  userRole: UserRole;
  onOpenRestock?: (product: Product) => void;
}

export const StockView: React.FC<StockViewProps> = ({
  products,
  categories,
  userRole,
  onOpenRestock,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'empty'>('all');

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || p.category_id === categoryFilter;
    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'low'
        ? p.stock > 0 && p.stock <= p.min_stock
        : p.stock <= 0;
    return matchSearch && matchCat && matchStatus;
  });

  const lowStockTotal = products.filter((p) => p.stock > 0 && p.stock <= p.min_stock).length;
  const emptyStockTotal = products.filter((p) => p.stock <= 0).length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Katalog Stok Material</h2>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
              {userRole === 'petugas' ? 'Mode Lihat (Petugas)' : 'Mode Admin'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Informasi ketersediaan stok fisik barang, batas minimum, dan satuan toko material bangunan.
          </p>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setStatusFilter(statusFilter === 'low' ? 'all' : 'low')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              statusFilter === 'low'
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                : 'bg-slate-900 border-amber-500/30 text-amber-400 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Stok Menipis ({lowStockTotal})</span>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 'empty' ? 'all' : 'empty')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              statusFilter === 'empty'
                ? 'bg-rose-500 text-white border-rose-500 font-bold'
                : 'bg-slate-900 border-rose-500/30 text-rose-400 hover:bg-slate-800'
            }`}
          >
            <PackageX className="w-3.5 h-3.5" />
            <span>Stok Habis ({emptyStockTotal})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari SKU atau nama produk material..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3.5 px-4">SKU / Kode</th>
                <th className="py-3.5 px-4">Nama Produk Material</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4 text-right">Harga Jual</th>
                <th className="py-3.5 px-4 text-center">Stok Fisik</th>
                <th className="py-3.5 px-4 text-center">Batas Min.</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                {userRole === 'admin' && <th className="py-3.5 px-4 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Tidak ada material yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isOutOfStock = item.stock <= 0;
                  const isLow = !isOutOfStock && item.stock <= item.min_stock;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        {item.sku}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-100 text-sm">{item.name}</div>
                        <div className="text-[11px] text-slate-500">Satuan: {item.unit}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-[11px]">
                          {item.category_name || 'Material'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-100">
                        {formatRupiah(item.selling_price)}
                      </td>
                      <td className="py-3 px-4 text-center font-black text-sm">
                        <span
                          className={
                            isOutOfStock
                              ? 'text-rose-400'
                              : isLow
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }
                        >
                          {item.stock}
                        </span>{' '}
                        <span className="text-[10px] text-slate-400 font-normal">
                          {item.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-400">
                        {item.min_stock} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/70 text-rose-300 border border-rose-500/40">
                            <PackageX className="w-3 h-3" />
                            <span>Habis</span>
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/70 text-amber-300 border border-amber-500/40">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Menipis</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Aman</span>
                          </span>
                        )}
                      </td>
                      {userRole === 'admin' && (
                        <td className="py-3 px-4 text-center">
                          {onOpenRestock && (
                            <button
                              onClick={() => onOpenRestock(item)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
                            >
                              Restock
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
