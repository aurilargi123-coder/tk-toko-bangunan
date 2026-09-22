import React, { useState } from 'react';
import { 
  ArrowDownToLine, 
  CheckCircle, 
  Boxes, 
  Truck, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { Product } from '../types/database';
import { formatRupiah } from '../lib/formatters';
import { dbService } from '../lib/supabaseClient';

interface StockInViewProps {
  products: Product[];
  selectedProduct?: Product | null;
  onRefreshData: () => void;
}

export const StockInView: React.FC<StockInViewProps> = ({
  products,
  selectedProduct,
  onRefreshData,
}) => {
  const [targetProductId, setTargetProductId] = useState<string>(
    selectedProduct?.id || products[0]?.id || ''
  );
  const [additionalStock, setAdditionalStock] = useState<number>(50);
  const [supplierName, setSupplierName] = useState<string>('PT Semen Indonesia / Distributor Jaya');
  const [deliveryNote, setDeliveryNote] = useState<string>('Pengiriman armada truk pagi');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const currentProduct = products.find((p) => p.id === targetProductId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || additionalStock <= 0) return;

    dbService.restockProduct(currentProduct.id, additionalStock);
    onRefreshData();

    setSuccessMessage(
      `Berhasil menambahkan +${additionalStock} ${currentProduct.unit} ke stok "${currentProduct.name}". Stok sekarang: ${
        currentProduct.stock + additionalStock
      } ${currentProduct.unit}.`
    );

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Formulir Stok Masuk (Restock Material)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Catat penerimaan muatan barang dari distributor/pabrik semen, besi, atau supplier material bangunan.
        </p>
      </div>

      {successMessage && (
        <div className="flex items-center space-x-3 text-xs text-emerald-300 bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/30 shadow-lg animate-in fade-in">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Pilih Material Bangunan yang Diterima *
            </label>
            <select
              value={targetProductId}
              onChange={(e) => setTargetProductId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.sku}] {p.name} — Stok Saat Ini: {p.stock} {p.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Preview Card */}
          {currentProduct && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {currentProduct.sku}
                </span>
                <h4 className="font-bold text-sm text-slate-100">{currentProduct.name}</h4>
                <p className="text-xs text-slate-400">
                  Harga Beli: {formatRupiah(currentProduct.purchase_price)} | Satuan: {currentProduct.unit}
                </p>
              </div>

              <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4">
                <span className="text-[11px] text-slate-400 block">Stok Saat Ini:</span>
                <span className="text-2xl font-black text-amber-400">
                  {currentProduct.stock}{' '}
                  <span className="text-xs font-normal text-slate-400">{currentProduct.unit}</span>
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Jumlah Tambahan Stok Masuk *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  required
                  value={additionalStock}
                  onChange={(e) => setAdditionalStock(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-base font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-3.5 top-3 text-xs text-slate-400 font-semibold">
                  {currentProduct?.unit || 'Unit'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Nama Supplier / Distributor Pabrik</span>
              </label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Contoh: PT Holcim Indonesia / Agen Pipa Rucika"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nomor Surat Jalan / Catatan Pengiriman
            </label>
            <input
              type="text"
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              placeholder="Contoh: SJ-2026/09/22-004 (Armada Colt Diesel B 9123 ABC)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Simpan Penerimaan Stok</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
