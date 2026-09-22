import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Calendar, 
  Download, 
  Receipt, 
  TrendingUp, 
  DollarSign, 
  Filter,
  CreditCard,
  Banknote,
  QrCode,
  Building
} from 'lucide-react';
import { Transaction } from '../types/database';
import { formatRupiah, formatDate } from '../lib/formatters';

interface SalesReportViewProps {
  transactions: Transaction[];
  onSelectTransaction: (trx: Transaction) => void;
}

export const SalesReportView: React.FC<SalesReportViewProps> = ({
  transactions,
  onSelectTransaction,
}) => {
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  // Filter logic
  const filtered = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    return transactions.filter((t) => {
      const matchSearch =
        t.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
        t.cashier_name.toLowerCase().includes(search.toLowerCase()) ||
        (t.customer_name && t.customer_name.toLowerCase().includes(search.toLowerCase()));

      const matchMethod = methodFilter === 'all' || t.payment_method === methodFilter;

      let matchTime = true;
      if (timeFilter === 'today') {
        matchTime = t.created_at.startsWith(todayStr);
      } else if (timeFilter === 'week') {
        const diff = (now.getTime() - new Date(t.created_at).getTime()) / (1000 * 3600 * 24);
        matchTime = diff <= 7;
      } else if (timeFilter === 'month') {
        const diff = (now.getTime() - new Date(t.created_at).getTime()) / (1000 * 3600 * 24);
        matchTime = diff <= 30;
      }

      return matchSearch && matchMethod && matchTime;
    });
  }, [transactions, search, timeFilter, methodFilter]);

  // Aggregate stats
  const totalRevenue = filtered.reduce((acc, t) => acc + t.total_amount, 0);
  const totalItemsSold = filtered.reduce(
    (acc, t) => acc + t.items.reduce((s, it) => s + it.quantity, 0),
    0
  );
  const avgOrderValue = filtered.length > 0 ? totalRevenue / filtered.length : 0;

  const exportCSV = () => {
    const headers = ['No. Invoice', 'Tanggal', 'Kasir', 'Pelanggan', 'Metode Bayar', 'Total (Rp)'];
    const rows = filtered.map((t) => [
      t.invoice_number,
      t.created_at,
      t.cashier_name,
      t.customer_name || 'Pelanggan Umum',
      t.payment_method,
      t.total_amount,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan-penjualan-toko-bangunan-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Laporan Penjualan Kasir (Admin)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Rekapitulasi riwayat transaksi, metode pembayaran, dan rincian struk belanja material.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Export Laporan (.CSV)</span>
        </button>
      </div>

      {/* Aggregate metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 font-medium">Total Omset Penjualan</span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {formatRupiah(totalRevenue)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Dari {filtered.length} struk transaksi
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 font-medium">Total Volume Barang</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {totalItemsSold} <span className="text-sm font-semibold text-slate-400">item</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Material bangunan terkirim
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 font-medium">Rata-rata Nilai Belanja</span>
          <div className="text-2xl font-black text-sky-400 mt-1">
            {formatRupiah(avgOrderValue)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Average order value (AOV)
          </span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nomor nota, nama kasir, atau pelanggan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time range pills */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                timeFilter === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                timeFilter === 'today' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                timeFilter === 'week' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                timeFilter === 'month' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              30 Hari
            </button>
          </div>

          {/* Payment Method filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Semua Metode Bayar</option>
            <option value="tunai">Tunai</option>
            <option value="qris">QRIS</option>
            <option value="transfer">Transfer Bank</option>
          </select>
        </div>
      </div>

      {/* Transaction List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3.5 px-4">No. Faktur / Invoice</th>
                <th className="py-3.5 px-4">Tanggal &amp; Waktu</th>
                <th className="py-3.5 px-4">Kasir</th>
                <th className="py-3.5 px-4">Pelanggan</th>
                <th className="py-3.5 px-4">Metode Bayar</th>
                <th className="py-3.5 px-4 text-center">Jml Item</th>
                <th className="py-3.5 px-4 text-right">Total Tagihan</th>
                <th className="py-3.5 px-4 text-center">Struk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Tidak ada data transaksi yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {t.invoice_number}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {formatDate(t.created_at)}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-medium">
                      {t.cashier_name}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {t.customer_name || 'Pelanggan Umum'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                        {t.payment_method}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-200">
                      {t.items.reduce((s, it) => s + it.quantity, 0)} item
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-100 font-mono">
                      {formatRupiah(t.total_amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onSelectTransaction(t)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg border border-slate-700 transition-colors inline-flex items-center space-x-1"
                        title="Buka Struk / Nota"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-semibold hidden sm:inline">Nota</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
