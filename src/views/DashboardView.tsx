import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle, 
  Boxes, 
  ArrowUpRight, 
  Clock, 
  ArrowRight,
  Receipt,
  Plus
} from 'lucide-react';
import { Product, Transaction } from '../types/database';
import { formatRupiah, formatDate } from '../lib/formatters';

interface DashboardViewProps {
  products: Product[];
  transactions: Transaction[];
  onNavigateTab: (tab: any) => void;
  onSelectTransaction: (trx: Transaction) => void;
  onOpenRestock: (product: Product) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  transactions,
  onNavigateTab,
  onSelectTransaction,
  onOpenRestock,
}) => {
  // Hitung metrik hari ini
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTransactions = transactions.filter((t) =>
    t.created_at.startsWith(todayStr)
  );

  const todayRevenue = todayTransactions.reduce((acc, t) => acc + t.total_amount, 0);
  const totalRevenueAll = transactions.reduce((acc, t) => acc + t.total_amount, 0);
  const lowStockProducts = products.filter((p) => p.stock <= p.min_stock);

  // Hitung total unit terjual hari ini
  const todayUnitsSold = todayTransactions.reduce(
    (acc, t) => acc + t.items.reduce((sum, it) => sum + it.quantity, 0),
    0
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Dashboard Manajemen Toko
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ringkasan performa penjualan harian kasir & pemantauan inventaris material bangunan.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigateTab('pos')}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs shadow-md shadow-amber-500/10 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Buka Kasir POS</span>
          </button>
          <button
            onClick={() => onNavigateTab('products')}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold text-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Penjualan Hari Ini */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Penjualan Hari Ini</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400 tracking-tight">
              {formatRupiah(todayRevenue)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Dari {todayTransactions.length} transaksi kasir hari ini
            </p>
          </div>
        </div>

        {/* Metric 2: Total Transaksi */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Unit Barang Terjual</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-400 tracking-tight">
              {todayUnitsSold} <span className="text-sm font-semibold text-slate-400">item</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Total omset kumulatif: {formatRupiah(totalRevenueAll)}
            </p>
          </div>
        </div>

        {/* Metric 3: Total Produk Katalog */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Katalog Material</span>
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-sky-400 tracking-tight">
              {products.length} <span className="text-sm font-semibold text-slate-400">SKU</span>
            </div>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-[11px] text-sky-400 hover:underline mt-1 flex items-center space-x-1"
            >
              <span>Kelola daftar barang</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 4: Peringatan Stok Menipis */}
        <div className={`border rounded-2xl p-4 relative overflow-hidden ${
          lowStockProducts.length > 0
            ? 'bg-rose-950/20 border-rose-500/40'
            : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Peringatan Stok</span>
            <div className={`p-2 rounded-xl border ${
              lowStockProducts.length > 0
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-black tracking-tight ${
              lowStockProducts.length > 0 ? 'text-rose-400' : 'text-slate-200'
            }`}>
              {lowStockProducts.length} <span className="text-sm font-semibold text-slate-400">SKU</span>
            </div>
            <button
              onClick={() => onNavigateTab('stock')}
              className="text-[11px] text-rose-400 hover:underline mt-1 flex items-center space-x-1"
            >
              <span>Lihat stok &lt; batas minimum</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Low Stock Warning & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Transactions */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Transaksi Penjualan Terbaru</h3>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs text-amber-400 hover:underline flex items-center space-x-1"
            >
              <span>Lihat Semua Laporan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">No. Nota</th>
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Kasir</th>
                  <th className="py-2.5 px-3">Metode</th>
                  <th className="py-2.5 px-3 text-right">Total Tagihan</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {transactions.slice(0, 5).map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-amber-400">
                      {trx.invoice_number}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {formatDate(trx.created_at)}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {trx.cashier_name}
                    </td>
                    <td className="py-3 px-3">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                        {trx.payment_method}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-slate-100">
                      {formatRupiah(trx.total_amount)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onSelectTransaction(trx)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg border border-slate-700 transition-colors"
                        title="Lihat Struk Nota"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Low Stock Action Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3 className="font-bold text-sm text-white">Perlu Restock Segera</h3>
              </div>
              <span className="text-xs bg-rose-950/60 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                {lowStockProducts.length} Item
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  Semua stok material di atas ambang batas minimum.
                </div>
              ) : (
                lowStockProducts.slice(0, 4).map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <span className="font-mono text-[10px] text-amber-400">
                        {prod.sku}
                      </span>
                      <h5 className="font-bold text-xs text-slate-200 line-clamp-1">
                        {prod.name}
                      </h5>
                      <p className="text-[11px] text-rose-400 font-semibold">
                        Sisa: {prod.stock} {prod.unit} (Min: {prod.min_stock})
                      </p>
                    </div>

                    <button
                      onClick={() => onOpenRestock(prod)}
                      className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                      Restock
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('stock-in')}
            className="w-full mt-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <span>Buka Halaman Stok Masuk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
