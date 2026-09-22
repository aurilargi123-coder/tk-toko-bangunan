import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_PROFILES, INITIAL_TRANSACTIONS } from '../data/initialData';
import { Category, Product, Profile, Transaction, TransactionItem, UserRole } from '../types/database';

const STORAGE_KEYS = {
  PRODUCTS: 'tb_products_v1',
  CATEGORIES: 'tb_categories_v1',
  PROFILES: 'tb_profiles_v1',
  TRANSACTIONS: 'tb_transactions_v1',
  CURRENT_USER: 'tb_current_user_v1',
  SUPABASE_CONFIG: 'tb_supabase_config_v1',
};

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

// Inisialisasi local storage jika belum ada
function initLocalStore() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_PROFILES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    // Default aktif sebagai Admin untuk kemudahan peninjauan awal
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_PROFILES[0]));
  }
}

// Ambil konfigurasi Supabase tersimpan
export function getSupabaseConfig(): SupabaseConfig {
  if (typeof window === 'undefined') {
    return { url: '', anonKey: '', isConnected: false };
  }
  const saved = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  return {
    url: (import.meta.env.VITE_SUPABASE_URL as string) || '',
    anonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '',
    isConnected: false,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): boolean {
  if (typeof window === 'undefined') return false;
  const isFilled = Boolean(url.trim() && anonKey.trim());
  localStorage.setItem(
    STORAGE_KEYS.SUPABASE_CONFIG,
    JSON.stringify({
      url: url.trim(),
      anonKey: anonKey.trim(),
      isConnected: isFilled,
    })
  );
  return isFilled;
}

let activeSupabaseClient: SupabaseClient | null = null;

export function getActiveSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) return null;
  if (!activeSupabaseClient) {
    try {
      activeSupabaseClient = createClient(config.url, config.anonKey);
    } catch (e) {
      console.error('Gagal inisialisasi Supabase client:', e);
      return null;
    }
  }
  return activeSupabaseClient;
}

// -------------------------------------------------------------
// OPERASI DATA (HYBRID: SUPABASE / LOCAL STATE STORE)
// -------------------------------------------------------------

export const dbService = {
  // Current user & auth simulation
  getCurrentUser(): Profile {
    initLocalStore();
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return INITIAL_PROFILES[0];
  },

  setCurrentUser(profile: Profile) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(profile));
  },

  login(email: string, _password?: string): { success: boolean; profile?: Profile; error?: string } {
    initLocalStore();
    const profiles: Profile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]');
    const found = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());

    if (found) {
      this.setCurrentUser(found);
      return { success: true, profile: found };
    }

    // Buat profil demo instan jika email baru
    const newProfile: Profile = {
      id: 'usr-' + Date.now(),
      full_name: email.split('@')[0],
      email: email,
      role: email.includes('admin') ? 'admin' : 'petugas',
      created_at: new Date().toISOString(),
    };
    profiles.push(newProfile);
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    this.setCurrentUser(newProfile);
    return { success: true, profile: newProfile };
  },

  logout() {
    initLocalStore();
    // Default set ke null atau switch profil
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  switchRole(role: UserRole): Profile {
    initLocalStore();
    const profiles: Profile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]');
    const target = profiles.find((p) => p.role === role) || {
      id: 'usr-' + role + '-demo',
      full_name: role === 'admin' ? 'Budi Santoso (Admin Toko)' : 'Rian Pratama (Petugas Kasir)',
      email: role === 'admin' ? 'admin@bangunan.com' : 'petugas@bangunan.com',
      role,
      created_at: new Date().toISOString(),
    };
    this.setCurrentUser(target);
    return target;
  },

  // Categories
  getCategories(): Category[] {
    initLocalStore();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
  },

  addCategory(name: string): Category {
    initLocalStore();
    const list: Category[] = this.getCategories();
    const newCat: Category = {
      id: 'cat-' + Date.now(),
      name,
    };
    list.push(newCat);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
    return newCat;
  },

  // Products
  getProducts(): Product[] {
    initLocalStore();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
  },

  createProduct(productData: Omit<Product, 'id' | 'updated_at'>): Product {
    initLocalStore();
    const products: Product[] = this.getProducts();
    const categories = this.getCategories();
    const cat = categories.find((c) => c.id === productData.category_id);

    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Date.now(),
      category_name: cat ? cat.name : 'Umum',
      updated_at: new Date().toISOString(),
    };

    products.unshift(newProduct);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return newProduct;
  },

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    initLocalStore();
    const products: Product[] = this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const categories = this.getCategories();
    const catId = updates.category_id || products[index].category_id;
    const cat = categories.find((c) => c.id === catId);

    const updated = {
      ...products[index],
      ...updates,
      category_name: cat ? cat.name : products[index].category_name,
      updated_at: new Date().toISOString(),
    };

    products[index] = updated;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return updated;
  },

  deleteProduct(id: string): boolean {
    initLocalStore();
    let products: Product[] = this.getProducts();
    const initialLen = products.length;
    products = products.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return products.length < initialLen;
  },

  restockProduct(id: string, additionalStock: number): Product | null {
    initLocalStore();
    const products: Product[] = this.getProducts();
    const item = products.find((p) => p.id === id);
    if (!item) return null;
    item.stock = (item.stock || 0) + Number(additionalStock);
    item.updated_at = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return item;
  },

  // Transactions (POS)
  getTransactions(): Transaction[] {
    initLocalStore();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
  },

  createTransaction(data: {
    items: { product: Product; quantity: number }[];
    payment_method: 'tunai' | 'qris' | 'transfer';
    amount_paid: number;
    customer_name?: string;
    notes?: string;
  }): { success: boolean; transaction?: Transaction; error?: string } {
    initLocalStore();
    const products: Product[] = this.getProducts();
    const currentUser = this.getCurrentUser();

    // 1. Validasi stok untuk semua item
    for (const item of data.items) {
      const prod = products.find((p) => p.id === item.product.id);
      if (!prod) {
        return { success: false, error: `Produk "${item.product.name}" tidak ditemukan.` };
      }
      if (prod.stock < item.quantity) {
        return {
          success: false,
          error: `Stok "${prod.name}" tidak mencukupi (Tersedia: ${prod.stock} ${prod.unit}, Diminta: ${item.quantity} ${prod.unit}).`,
        };
      }
    }

    // 2. Hitung total amount
    let totalAmount = 0;
    const trxItems: TransactionItem[] = [];
    const trxId = 'trx-' + Date.now();

    for (const item of data.items) {
      const subtotal = item.product.selling_price * item.quantity;
      totalAmount += subtotal;

      trxItems.push({
        id: 'item-' + Math.random().toString(36).substring(2, 9),
        transaction_id: trxId,
        product_id: item.product.id,
        product_name: item.product.name,
        product_sku: item.product.sku,
        unit: item.product.unit,
        quantity: item.quantity,
        price_at_sale: item.product.selling_price,
        subtotal,
      });

      // 3. PENGURANGAN STOK OTOMATIS (Sesuai fungsi trigger Supabase)
      const targetProd = products.find((p) => p.id === item.product.id);
      if (targetProd) {
        targetProd.stock -= item.quantity;
        targetProd.updated_at = new Date().toISOString();
      }
    }

    // Simpan pembaruan stok ke localStorage
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    // 4. Buat objek transaksi baru
    const today = new Date();
    const dateCode = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const invoiceNumber = `INV-${dateCode}-${randomSeq}`;

    const changeAmount =
      data.payment_method === 'tunai'
        ? Math.max(0, data.amount_paid - totalAmount)
        : 0;

    const newTrx: Transaction = {
      id: trxId,
      invoice_number: invoiceNumber,
      user_id: currentUser.id,
      cashier_name: currentUser.full_name,
      cashier_role: currentUser.role,
      total_amount: totalAmount,
      payment_method: data.payment_method,
      amount_paid: data.amount_paid,
      change_amount: changeAmount,
      customer_name: data.customer_name || 'Pelanggan Umum',
      notes: data.notes || '',
      created_at: new Date().toISOString(),
      items: trxItems,
    };

    const transactions = this.getTransactions();
    transactions.unshift(newTrx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

    return { success: true, transaction: newTrx };
  },

  // Profiles
  getProfiles(): Profile[] {
    initLocalStore();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]');
  },

  updateProfileRole(id: string, role: UserRole): boolean {
    initLocalStore();
    const profiles: Profile[] = this.getProfiles();
    const user = profiles.find((p) => p.id === id);
    if (!user) return false;
    user.role = role;
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));

    // Jika yang diubah adalah user saat ini, perbarui session
    const current = this.getCurrentUser();
    if (current.id === id) {
      current.role = role;
      this.setCurrentUser(current);
    }
    return true;
  },

  addProfile(fullName: string, email: string, role: UserRole): Profile {
    initLocalStore();
    const profiles: Profile[] = this.getProfiles();
    const newProfile: Profile = {
      id: 'usr-' + Date.now(),
      full_name: fullName,
      email,
      role,
      created_at: new Date().toISOString(),
    };
    profiles.push(newProfile);
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    return newProfile;
  },

  resetDatabaseToDefault() {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_PROFILES));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_PROFILES[0]));
  },
};
