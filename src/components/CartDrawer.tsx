import React from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag,
  Receipt
} from 'lucide-react';
import { CartItem } from '../types/database';
import { formatRupiah } from '../lib/formatters';

interface CartDrawerProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}) => {
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.selling_price * item.quantity,
    0
  );

  return (
    <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between h-full shrink-0">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Keranjang Kasir</h3>
            <p className="text-xs text-slate-400">
              {totalItemsCount} item dipilih
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-xs text-rose-400 hover:text-rose-300 hover:underline flex items-center space-x-1"
            title="Kosongkan keranjang"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kosongkan</span>
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px] max-h-[calc(100vh-380px)] lg:max-h-none">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
            <ShoppingBag className="w-12 h-12 text-slate-700" />
            <p className="font-medium text-sm text-slate-400">Keranjang Masih Kosong</p>
            <p className="text-xs text-slate-500 max-w-[200px]">
              Klik tombol &quot;Tambah&quot; pada katalog barang di sebelah kiri untuk memulai pesanan.
            </p>
          </div>
        ) : (
          items.map(({ product, quantity }) => {
            const itemSubtotal = product.selling_price * quantity;
            const isMaxStock = quantity >= product.stock;

            return (
              <div
                key={product.id}
                className="bg-slate-800/60 border border-slate-800 hover:border-slate-700 rounded-xl p-3 space-y-2 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 flex-1">
                    <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      {product.sku}
                    </span>
                    <h5 className="font-bold text-xs text-slate-100 line-clamp-1">
                      {product.name}
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      {formatRupiah(product.selling_price)} / {product.unit}
                    </p>
                  </div>

                  <button
                    onClick={() => onRemoveItem(product.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                    title="Hapus item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
                  {/* Quantity controls */}
                  <div className="flex items-center space-x-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(product.id, -1)}
                      className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800"
                      title="Kurangi 1"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-xs text-amber-400 min-w-[24px] text-center font-mono">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(product.id, 1)}
                      disabled={isMaxStock}
                      className={`p-1 rounded ${
                        isMaxStock
                          ? 'text-slate-600 cursor-not-allowed'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                      title={isMaxStock ? 'Batas stok produk telah tercapai' : 'Tambah 1'}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <span className="font-bold text-xs text-slate-100">
                      {formatRupiah(itemSubtotal)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Summary & Checkout Bar */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/90 space-y-3">
        <div className="space-y-1.5 text-xs text-slate-400">
          <div className="flex justify-between">
            <span>Subtotal ({totalItemsCount} item):</span>
            <span className="font-semibold text-slate-200">{formatRupiah(subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-400 text-[11px]">
            <span>PPN (Sudah Termasuk):</span>
            <span>Rp 0</span>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-slate-100 font-bold">
            <span className="text-sm">Total Tagihan:</span>
            <span className="text-xl font-black text-amber-400">
              {formatRupiah(subtotal)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onCheckout}
          disabled={items.length === 0}
          className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg ${
            items.length === 0
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-amber-500/20 active:scale-[0.98]'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Proses Pembayaran (Kasir)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
