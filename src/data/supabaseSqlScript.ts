export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- STRUKTUR DATABASE SUPABASE (POSTGRESQL) - SISTEM MANAJEMEN TOKO BANGUNAN
-- Fitur: RBAC (admin & petugas), Produk, Kategori, Transaksi Kasir (POS),
--        Trigger Pengurangan Stok Otomatis, dan Row Level Security (RLS)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL PROFILES (Ekstensi data auth.users Supabase dengan Role RBAC)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'petugas')) DEFAULT 'petugas',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Komentar tabel
COMMENT ON TABLE public.profiles IS 'Data profil pengguna dan hak akses RBAC (admin / petugas)';

-- 3. TABEL CATEGORIES (Kategori Material Bahan Bangunan)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABEL PRODUCTS (Katalog Barang / Material Bangunan)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sku VARCHAR(50) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  unit VARCHAR(20) NOT NULL, -- Contoh: 'Sak', 'Batang', 'Pail', 'Kaleng', 'Lembar', 'Dus', 'Kg', 'Pcs'
  purchase_price NUMERIC(15, 2) NOT NULL DEFAULT 0, -- Harga Beli / Modal
  selling_price NUMERIC(15, 2) NOT NULL DEFAULT 0,  -- Harga Jual Kasir
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  min_stock INTEGER NOT NULL DEFAULT 5, -- Ambang batas peringatan stok menipis
  image_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);

-- 5. TABEL TRANSACTIONS (Header Transaksi Penjualan Kasir)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_number VARCHAR(60) UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('tunai', 'qris', 'transfer')),
  customer_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_invoice ON public.transactions(invoice_number);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- 6. TABEL TRANSACTION_ITEMS (Rincian Barang yang Dibeli)
CREATE TABLE IF NOT EXISTS public.transaction_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_sale NUMERIC(15, 2) NOT NULL,
  subtotal NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_trx_items_trx_id ON public.transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_trx_items_prod_id ON public.transaction_items(product_id);

-- ==============================================================================
-- 7. POSTGRES FUNCTION & TRIGGER: PENGURANGAN STOK OTOMATIS
-- ==============================================================================
-- Fungsi ini akan dijalankan setiap kali baris baru dimasukkan ke 'transaction_items'
-- dan langsung mengurangi 'stock' di tabel 'products'.

CREATE OR REPLACE FUNCTION public.reduce_product_stock()
RETURNS TRIGGER AS $$
DECLARE
  current_stock_val INTEGER;
BEGIN
  -- Cek ketersediaan stok
  SELECT stock INTO current_stock_val
  FROM public.products
  WHERE id = NEW.product_id;

  IF current_stock_val < NEW.quantity THEN
    RAISE EXCEPTION 'Stok produk tidak mencukupi untuk item ID: % (Sisa stok: %, Diminta: %)',
      NEW.product_id, current_stock_val, NEW.quantity;
  END IF;

  -- Kurangi stok produk
  UPDATE public.products
  SET 
    stock = stock - NEW.quantity,
    updated_at = timezone('utc'::text, now())
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pasang trigger pada tabel transaction_items
DROP TRIGGER IF EXISTS trigger_reduce_stock ON public.transaction_items;
CREATE TRIGGER trigger_reduce_stock
AFTER INSERT ON public.transaction_items
FOR EACH ROW
EXECUTE FUNCTION public.reduce_product_stock();

-- ==============================================================================
-- 8. TRIGGER OTOMATIS: BUAT PROFIL KETIKA USER BARU DAFTAR DI SUPABASE AUTH
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'petugas')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Aktifkan RLS di seluruh tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

-- Helper Function: Cek apakah user saat ini adalah Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---- POLICIES: PROFILES ----
-- Semua user yang login dapat membaca profilnya sendiri dan profil admin/petugas lain
CREATE POLICY "Profiles can be read by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Hanya Admin yang dapat mengupdate role user
CREATE POLICY "Only admin can update profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- ---- POLICIES: CATEGORIES ----
-- Petugas & Admin dapat melihat kategori
CREATE POLICY "Categories readable by all authenticated users"
  ON public.categories FOR SELECT
  TO authenticated
  USING (true);

-- Hanya Admin yang dapat menambah/mengubah/menghapus kategori
CREATE POLICY "Categories manageable by admin only"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---- POLICIES: PRODUCTS ----
-- Petugas & Admin dapat melihat katalog produk & stok
CREATE POLICY "Products readable by all authenticated users"
  ON public.products FOR SELECT
  TO authenticated
  USING (true);

-- Hanya Admin yang memiliki akses modifikasi penuh (Tambah/Edit/Hapus/Update Harga)
CREATE POLICY "Products manageable by admin only"
  ON public.products FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---- POLICIES: TRANSACTIONS ----
-- Admin dapat melihat seluruh riwayat transaksi penjualan
CREATE POLICY "Admin can read all transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Petugas dapat membaca transaksi yang dibuat oleh dirinya sendiri
CREATE POLICY "Petugas can read own transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Baik Admin maupun Petugas dapat membuat transaksi baru (Kasir POS)
CREATE POLICY "Authenticated users can insert transactions"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ---- POLICIES: TRANSACTION_ITEMS ----
-- Admin dapat melihat semua item transaksi
CREATE POLICY "Admin can view all transaction items"
  ON public.transaction_items FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Petugas dapat melihat item transaksi miliknya
CREATE POLICY "Petugas can view own transaction items"
  ON public.transaction_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = transaction_items.transaction_id AND t.user_id = auth.uid()
    )
  );

-- Kasir dapat memasukkan item transaksi baru saat checkout
CREATE POLICY "Authenticated users can insert transaction items"
  ON public.transaction_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = transaction_items.transaction_id AND t.user_id = auth.uid()
    )
  );

-- ==============================================================================
-- 10. SEED DATA AWAL (KATEGORI & PRODUK MATERIAL BANGUNAN)
-- ==============================================================================
INSERT INTO public.categories (id, name) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Semen & Mortar'),
  ('c2222222-2222-2222-2222-222222222222', 'Besi & Baja Ringan'),
  ('c3333333-3333-3333-3333-333333333333', 'Cat & Pelapis'),
  ('c4444444-4444-4444-4444-444444444444', 'Pipa & Fitting PVC'),
  ('c5555555-5555-5555-5555-555555555555', 'Kayu & Triplek'),
  ('c6666666-6666-6666-6666-666666666666', 'Alat Tukang & Paku')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.products (sku, name, category_id, unit, purchase_price, selling_price, stock, min_stock) VALUES
  ('SMN-001', 'Semen Tiga Roda Portland 50kg', 'c1111111-1111-1111-1111-111111111111', 'Sak', 68000, 75000, 120, 20),
  ('SMN-002', 'Semen Gresik PPC 40kg', 'c1111111-1111-1111-1111-111111111111', 'Sak', 54000, 60000, 15, 20),
  ('BSI-010', 'Besi Beton Ulir 10mm SNI (12M)', 'c2222222-2222-2222-2222-222222222222', 'Batang', 78000, 88000, 85, 25),
  ('BJA-075', 'Baja Ringan Canal C75 0.75mm (6M)', 'c2222222-2222-2222-2222-222222222222', 'Batang', 85000, 98000, 60, 20),
  ('CAT-001', 'Cat Tembok Dulux Putih 5 Kg', 'c3333333-3333-3333-3333-333333333333', 'Pail', 135000, 155000, 22, 10),
  ('PIP-001', 'Pipa PVC Rucika D 3 Inch (4M)', 'c4444444-4444-4444-4444-444444444444', 'Batang', 92000, 108000, 40, 15),
  ('PKU-005', 'Paku Kayu Campur 5cm (1 Kg)', 'c6666666-6666-6666-6666-666666666666', 'Kg', 16000, 22000, 95, 20)
ON CONFLICT (sku) DO NOTHING;
`;

export const NEXTJS_SUPABASE_CLIENT_CODE = `// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Peringatan: Variabel NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY belum dikonfigurasi pada file .env.local.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
`;

export const NEXTJS_MIDDLEWARE_CODE = `// middleware.ts (Next.js App Router RBAC Route Guard)
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 1. Ambil session user saat ini
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Jika belum login dan bukan di halaman login
  if (!user && path !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Jika sudah login dan membuka halaman login, arahkan ke POS atau Dashboard
  if (user && path === '/login') {
    return NextResponse.redirect(new URL('/pos', request.url));
  }

  // 2. Cek Role pengguna dari tabel profiles
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role || 'petugas';

    // ATURAN AKSES ROLE (RBAC):
    // - Petugas: HANYA boleh akses /pos dan /stock
    // - Admin: Boleh akses semua halaman (/dashboard, /products, /reports, /users, /pos)
    const isAdminOnlyRoute = 
      path.startsWith('/dashboard') || 
      path.startsWith('/products') || 
      path.startsWith('/reports') || 
      path.startsWith('/users') ||
      path.startsWith('/stock-in');

    if (role === 'petugas' && isAdminOnlyRoute) {
      // Petugas dilarang masuk ke halaman admin, redirect ke kasir (/pos)
      const redirectUrl = new URL('/pos', request.url);
      redirectUrl.searchParams.set('unauthorized', '1');
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/pos/:path*',
    '/stock/:path*',
    '/dashboard/:path*',
    '/products/:path*',
    '/reports/:path*',
    '/users/:path*',
    '/login',
  ],
};
`;

export const NEXTJS_FOLDER_STRUCTURE = `my-toko-bangunan/
├── app/
│   ├── layout.tsx             # Root layout dengan Tailwind CSS & Auth Provider
│   ├── page.tsx               # Redirect otomatis ke /pos atau /login
│   ├── login/
│   │   └── page.tsx           # Halaman Login (Email & Password)
│   ├── pos/
│   │   └── page.tsx           # Halaman Kasir / POS (Katalog barang & Keranjang)
│   ├── stock/
│   │   └── page.tsx           # Halaman Cek Stok Barang (Read-only untuk Petugas)
│   └── dashboard/
│       ├── layout.tsx         # Sidebar Admin & Header Navigasi
│       ├── page.tsx           # Dashboard Admin (Ringkasan Penjualan & Alert Stok)
│       ├── products/
│       │   └── page.tsx       # Manajemen Produk & CRUD Harga
│       ├── stock-in/
│       │   └── page.tsx       # Form Restock Stok Masuk Barang
│       ├── reports/
│       │   └── page.tsx       # Laporan Penjualan & Filter Tanggal
│       └── users/
│           └── page.tsx       # Manajemen Akun & Hak Akses Petugas
├── components/
│   ├── pos/
│   │   ├── ProductGrid.tsx    # Grid kartu barang dengan pencarian cepat
│   │   ├── CartDrawer.tsx     # Keranjang belanja & perhitungan otomatis
│   │   ├── PaymentModal.tsx   # Modal pembayaran Tunai/QRIS/Transfer & Kembalian
│   │   └── ReceiptModal.tsx   # Cetak struk nota belanja thermal (80mm/58mm)
│   ├── admin/
│   │   ├── ProductFormModal.tsx # Tambah & Edit Produk
│   │   └── MetricCard.tsx     # Kartu statistik ringkasan
│   └── ui/                    # Tombol, Input, Modal, Badge
├── lib/
│   ├── supabaseClient.js      # Inisialisasi Supabase client
│   └── utils.ts               # Helper format mata uang Rupiah (IDR) & tanggal
├── middleware.ts              # Route Guard RBAC (Admin vs Petugas)
├── .env.local                 # Kredensial Supabase (URL & Anon Key)
└── package.json
`;
