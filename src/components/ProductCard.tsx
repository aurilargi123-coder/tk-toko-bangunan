import React from 'react';
import { Plus, Check, AlertTriangle, PackageX, Sparkles } from 'lucide-react';
import { Product } from '../types/database';
import { formatRupiah } from '../lib/formatters';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  cartQuantity: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  cartQuantity,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= product.min_stock;
  const availableStock = product.stock - cartQuantity;

  return (
    <div
      className={`group relative bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:border-slate-700 ${
        isOutOfStock
          ? 'border-slate-800 opacity-60'
          : isLowStock
          ? 'border-amber-500/40 hover:border-amber-500'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div>
        {/* Product Image and Badges */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-800 mb-3.5">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&auto=format&fit=crop&q=80'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
            loading="lazy"
          />

          {/* SKU Pill */}
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-700/60 font-mono text-[10px] font-bold text-amber-300">
            {product.sku}
          </div>

          {/* Stock Badges */}
          {isOutOfStock ? (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-rose-950/90 border border-rose-500/50 text-[10px] font-bold text-rose-300 flex items-center space-x-1">
              <PackageX className="w-3 h-3" />
              <span>Habis</span>
            </div>
          ) : isLowStock ? (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-950/90 border border-amber-500/50 text-[10px] font-bold text-amber-300 flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Stok Menipis: {product.stock}</span>
            </div>
          ) : (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md border border-slate-700/50 text-[10px] font-semibold text-slate-300">
              Stok: {product.stock} {product.unit}
            </div>
          )}

          {/* Cart Quantity Indicator badge */}
          {cartQuantity > 0 && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-bold text-xs shadow-md">
              {cartQuantity} di keranjang
            </div>
          )}
        </div>

        {/* Category & Title */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
            {product.category_name || 'Material Bangunan'}
          </span>
          <h4 className="font-bold text-sm text-slate-100 line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
            {product.name}
          </h4>
        </div>
      </div>

      {/* Pricing & Add to Cart button */}
      <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 block">Harga Jual / {product.unit}:</span>
          <span className="text-base font-black text-amber-400">
            {formatRupiah(product.selling_price)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAddToCart(product)}
          disabled={availableStock <= 0}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            availableStock <= 0
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-amber-500 hover:bg-amber-600 text-slate-950 hover:shadow-amber-500/20 active:scale-95'
          }`}
          title={availableStock <= 0 ? 'Stok habis atau batas stok keranjang tercapai' : 'Tambah ke Keranjang'}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah</span>
        </button>
      </div>
    </div>
  );
};
