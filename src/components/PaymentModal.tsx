import React, { useState, useId } from 'react';
import { 
  CreditCard, 
  Banknote, 
  QrCode, 
  Building, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Copy, 
  Receipt,
  User
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PaymentMethod, CartItem, Transaction } from '../types/database';
import { formatRupiah } from '../lib/formatters';
import { dbService } from '../lib/supabaseClient';

interface PaymentModalProps {
  items: CartItem[];
  totalAmount: number;
  onClose: () => void;
  onSuccess: (transaction: Transaction) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  items,
  totalAmount,
  onClose,
  onSuccess,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('tunai');
  const [amountPaid, setAmountPaid] = useState<number>(totalAmount);
  const [customInput, setCustomInput] = useState<string>(totalAmount.toString());
  const [customerName, setCustomerName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  const customerNameInputId = useId();
  const cashAmountInputId = useId();
  const notesInputId = useId();

  // Kembalian calculation
  const changeAmount = method === 'tunai' ? Math.max(0, amountPaid - totalAmount) : 0;
  const isInsufficient = method === 'tunai' && amountPaid < totalAmount;

  // Preset quick cash buttons
  const quickCashPresets = [
    { label: 'Uang Pas', value: totalAmount },
    { label: 'Rp 50.000', value: 50000 },
    { label: 'Rp 100.000', value: 100000 },
    { label: 'Rp 200.000', value: 200000 },
    { label: 'Rp 500.000', value: 500000 },
    { label: 'Rp 1.000.000', value: 1000000 },
  ];

  const handlePresetClick = (value: number) => {
    setAmountPaid(value);
    setCustomInput(value.toString());
    setErrorMessage(null);
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const num = Number(raw);
    setAmountPaid(num);
    setCustomInput(raw);
    setErrorMessage(null);
  };

  const handleCopyAccount = (accNo: string, bank: string) => {
    navigator.clipboard.writeText(accNo);
    setCopiedBank(bank);
    setTimeout(() => setCopiedBank(null), 1500);
  };

  const handleProcessPayment = () => {
    if (items.length === 0) {
      setErrorMessage('Keranjang belanja kosong.');
      return;
    }

    if (method === 'tunai' && amountPaid < totalAmount) {
      setErrorMessage(`Uang tunai kurang sebesar ${formatRupiah(totalAmount - amountPaid)}.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const finalAmountPaid = method === 'tunai' ? amountPaid : totalAmount;
      const res = dbService.createTransaction({
        items,
        payment_method: method,
        amount_paid: finalAmountPaid,
        customer_name: customerName.trim() || 'Pelanggan Toko',
        notes: notes.trim(),
      });

      if (!res.success || !res.transaction) {
        setErrorMessage(res.error || 'Gagal memproses transaksi.');
        setIsSubmitting(false);
        return;
      }

      // Celebrate transaction success!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore if not supported
      }

      onSuccess(res.transaction);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Pembayaran Kasir (Checkout)</h3>
              <p className="text-xs text-slate-400">Pilih metode bayar & simpan transaksi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Total Tag */}
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-xl p-4 text-center">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-1">
              Total Tagihan Pembelian
            </span>
            <div className="text-3xl font-black text-amber-400 tracking-tight">
              {formatRupiah(totalAmount)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Jumlah Barang: {items.reduce((acc, it) => acc + it.quantity, 0)} item
            </span>
          </div>

          {/* Customer Name Input */}
          <div>
            <label htmlFor={customerNameInputId} className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Nama Pelanggan / Proyek (Opsional)</span>
            </label>
            <input
              id={customerNameInputId}
              type="text"
              placeholder="Contoh: Pak Mandor Budi / Renovasi Ruko"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Pilih Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setMethod('tunai');
                  setAmountPaid(totalAmount);
                  setCustomInput(totalAmount.toString());
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  method === 'tunai'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-sm'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Banknote className="w-5 h-5 mb-1" />
                <span className="text-xs">Uang Tunai</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('qris')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  method === 'qris'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-sm'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <QrCode className="w-5 h-5 mb-1" />
                <span className="text-xs">QRIS Instan</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('transfer')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  method === 'transfer'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-sm'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Building className="w-5 h-5 mb-1" />
                <span className="text-xs">Transfer Bank</span>
              </button>
            </div>
          </div>

          {/* METHOD: TUNAI / CASH */}
          {method === 'tunai' && (
            <div className="space-y-3 p-4 bg-slate-800/50 rounded-xl border border-slate-800">
              <label htmlFor={cashAmountInputId} className="block text-xs font-semibold text-slate-300">
                Nominal Uang yang Diterima (Rp)
              </label>

              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">
                  Rp
                </span>
                <input
                  id={cashAmountInputId}
                  type="text"
                  value={customInput}
                  onChange={handleCustomInputChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-base font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Quick Cash Presets */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {quickCashPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetClick(preset.value)}
                    className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300 rounded-lg border border-slate-700/60 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Kembalian Display */}
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Uang Kembalian:</span>
                <span className={`text-base font-black ${isInsufficient ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {formatRupiah(changeAmount)}
                </span>
              </div>
            </div>
          )}

          {/* METHOD: QRIS */}
          {method === 'qris' && (
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-800 text-center space-y-3">
              <div className="inline-block bg-white p-3 rounded-2xl shadow-md border border-slate-300">
                {/* Simulated QR Code */}
                <div className="w-36 h-36 bg-slate-100 flex flex-col items-center justify-center border-2 border-dashed border-slate-400 rounded-lg p-2">
                  <QrCode className="w-20 h-20 text-slate-900 mb-1" />
                  <span className="text-[10px] font-bold text-slate-800">QRIS TOKO BANGUNAN</span>
                  <span className="text-[8px] text-slate-500">NMID: ID10293847561</span>
                </div>
              </div>
              <p className="text-xs text-slate-300">
                Arahkan aplikasi BCA, Mandiri, GoPay, OVO, atau ShopeePay pelanggan ke QR Code di atas.
              </p>
              <div className="text-xs text-emerald-400 bg-emerald-950/40 py-1.5 px-3 rounded-lg border border-emerald-500/30 inline-block font-semibold">
                Nominal Pas: {formatRupiah(totalAmount)}
              </div>
            </div>
          )}

          {/* METHOD: TRANSFER BANK */}
          {method === 'transfer' && (
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-800 space-y-2.5">
              <p className="text-xs text-slate-300 font-medium mb-1">
                Rekening Toko Bahan Bangunan:
              </p>

              {[
                { bank: 'Bank BCA', no: '8820-1928-37', name: 'TB BANGUNAN JAYA' },
                { bank: 'Bank Mandiri', no: '137-00-9876543-2', name: 'TB BANGUNAN JAYA' },
                { bank: 'Bank BRI', no: '0123-01-002938-50-8', name: 'TB BANGUNAN JAYA' },
              ].map((acc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs"
                >
                  <div>
                    <span className="font-bold text-amber-400 block">{acc.bank}</span>
                    <span className="font-mono text-slate-200">{acc.no}</span>
                    <span className="text-[10px] text-slate-500 block">a.n {acc.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyAccount(acc.no, acc.bank)}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[11px]"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedBank === acc.bank ? 'Disalin!' : 'Salin'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Notes Input */}
          <div>
            <label htmlFor={notesInputId} className="block text-xs font-semibold text-slate-400 mb-1">
              Catatan Transaksi (Opsional)
            </label>
            <input
              id={notesInputId}
              type="text"
              placeholder="Contoh: Titip di proyek, dikirim besok pagi"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center space-x-2 text-xs text-rose-400 bg-rose-950/40 p-3 rounded-xl border border-rose-500/30">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleProcessPayment}
            disabled={isSubmitting || isInsufficient}
            className={`flex items-center space-x-2 px-6 py-2.5 text-xs font-bold rounded-xl shadow-lg transition-all ${
              isInsufficient || isSubmitting
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isSubmitting ? 'Memproses...' : 'Simpan & Cetak Struk'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
