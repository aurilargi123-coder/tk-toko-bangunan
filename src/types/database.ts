export type UserRole = 'admin' | 'petugas';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category_id: string;
  category_name?: string;
  unit: string; // Sak, Batang, Kaleng, Lembar, Dus, Pcs, Meter, Kg
  purchase_price: number;
  selling_price: number;
  stock: number;
  min_stock: number;
  image_url?: string;
  updated_at?: string;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  unit: string;
  quantity: number;
  price_at_sale: number;
  subtotal: number;
}

export type PaymentMethod = 'tunai' | 'qris' | 'transfer';

export interface Transaction {
  id: string;
  invoice_number: string;
  user_id: string;
  cashier_name: string;
  cashier_role: UserRole;
  total_amount: number;
  payment_method: PaymentMethod;
  amount_paid?: number;
  change_amount?: number;
  created_at: string;
  items: TransactionItem[];
  customer_name?: string;
  notes?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
