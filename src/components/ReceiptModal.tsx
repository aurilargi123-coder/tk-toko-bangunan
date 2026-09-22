import React from 'react';
import { Printer, CheckCircle, Share2, X, FileText } from 'lucide-react';
import { Transaction } from '../types/database';
import { formatRupiah, formatDate } from '../lib/formatters';

interface ReceiptModalProps {
  transaction: Transaction;
  onClose: () => void;
  onNewTransaction: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  onClose,
  onNewTransaction,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Pembayaran Berhasil</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <div
            id="printable-receipt"
            className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm font-mono text-xs text-slate-800 space-y-4"
          >
            {/* Store Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300 space-y-1">
              <h2 className="text-base font-bold tracking-tight text-slate-950 font-sans">
                TB BANGUNAN JAYA
              </h2>
              <p className="text-[11px] text-slate-600">
                Pusat Semen, Besi, Cat, Pipa & Alat Konstruksi
              </p>
              <p className="text-[10px] text-slate-500">
                Jl. Raya Industri Bangunan No. 88 | Telp: 0812-3456-7890
              </p>
            </div>

            {/* Meta Info */}
            <div className="text-[11px] space-y-1 pb-3 border-b border-dashed border-slate-300 text-slate-700">
              <div className="flex justify-between">
                <span>No. Nota:</span>
                <span className="font-bold text-slate-950">{transaction.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span>{formatDate(transaction.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{transaction.cashier_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span>{transaction.customer_name || 'Pelanggan Umum'}</span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="space-y-2 pb-3 border-b border-dashed border-slate-300">
              <div className="text-[10px] font-bold text-slate-500 uppercase flex justify-between">
                <span>Item Barang</span>
                <span>Total</span>
              </div>
              {transaction.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-medium text-slate-900 leading-snug">
                    {item.product_name}
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-600 pl-2">
                    <span>
                      {item.quantity} {item.unit} x {formatRupiah(item.price_at_sale)}
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary / Total */}
            <div className="space-y-1.5 text-xs pb-3 border-b border-dashed border-slate-300">
              <div className="flex justify-between text-sm font-bold text-slate-950 pt-1">
                <span>TOTAL BELANJA:</span>
                <span className="text-amber-600 font-black">{formatRupiah(transaction.total_amount)}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span className="capitalize">Metode Bayar:</span>
                <span className="font-bold uppercase tracking-wider">{transaction.payment_method}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Bayar / Tunai:</span>
                <span>{formatRupiah(transaction.amount_paid || transaction.total_amount)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold text-[11px]">
                <span>Kembalian:</span>
                <span>{formatRupiah(transaction.change_amount || 0)}</span>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="text-center text-[10px] text-slate-500 pt-1 space-y-1">
              <p className="font-bold text-slate-700">TERIMA KASIH ATAS KUNJUNGAN ANDA</p>
              <p>Barang yang sudah dibeli dapat ditukar max 2 hari disertai nota ini dalam kondisi utuh.</p>
              <p className="text-[9px] text-slate-400">Dicetak otomatis dari Sistem POS TB Bangunan Jaya</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk (Print)</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onNewTransaction();
            }}
            className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs shadow-md transition-colors text-center"
          >
            Transaksi Baru
          </button>
        </div>
      </div>
    </div>
  );
};
