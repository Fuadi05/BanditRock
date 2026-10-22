-- ============================================================
-- SKEMA DATABASE PRODUKSI: Sistem Informasi Penjualan Batu Alam Merapi
-- ============================================================
-- Sinkron 100% dengan skema PostgreSQL 17 di Supabase (banditrockProject)
-- ============================================================

-- ==================
-- 1. TABEL PRODUCTS
-- ==================
CREATE TABLE IF NOT EXISTS public.products (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama              VARCHAR(255) NOT NULL,
  kategori          VARCHAR(100) NOT NULL,          -- 'Alat Dapur', 'Eksterior', 'Interior', 'Ornamen Dinding'
  harga_min         BIGINT NOT NULL DEFAULT 0,      -- Harga jual katalog (Rupiah)
  harga_max         BIGINT NOT NULL DEFAULT 0,      -- Harga modal / HPP internal admin (tidak diekspos ke publik)
  tipe_harga        VARCHAR(20) NOT NULL DEFAULT 'fixed'
                    CHECK (tipe_harga IN ('fixed', 'range', 'preorder')),
  deskripsi         TEXT,
  deskripsi_singkat TEXT,
  ukuran            TEXT DEFAULT '',
  image_url         VARCHAR(500),
  image_url_2       TEXT,
  image_url_3       TEXT,
  image_url_4       TEXT,
  status_stok       VARCHAR(20) NOT NULL DEFAULT 'ready'
                    CHECK (status_stok IN ('ready', 'preorder', 'custom')),
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ==================
-- 2. TABEL ORDERS
-- ==================
CREATE TABLE IF NOT EXISTS public.orders (
  id              VARCHAR(30) PRIMARY KEY,      -- Format: BMA-YYYYMMDD-XXXX
  nama_pembeli    VARCHAR(255) NOT NULL,
  telepon         VARCHAR(20) NOT NULL,
  provinsi        VARCHAR(100),
  kabupaten       VARCHAR(100),
  kecamatan       VARCHAR(100),
  desa            VARCHAR(100),
  alamat_lengkap  TEXT,
  total_tagihan   BIGINT NOT NULL DEFAULT 0,
  status          VARCHAR(30) NOT NULL DEFAULT 'pending_payment'
                  CHECK (status IN ('pending_payment', 'waiting_verification', 'paid', 'processing', 'shipped', 'completed', 'cancelled')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_telepon ON public.orders (telepon);

-- ==================
-- 3. TABEL ORDER_ITEMS
-- ==================
CREATE TABLE IF NOT EXISTS public.order_items (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id         VARCHAR(30) NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id       UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  qty              INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0),
  ukuran           VARCHAR(100) DEFAULT '',
  harga_disepakati BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items (product_id);

-- ==================
-- 4. TABEL PAYMENTS
-- ==================
-- Catatan: order_id dapat merujuk ke orders (BMA-...) maupun custom_orders (BMA-K-...)
CREATE TABLE IF NOT EXISTS public.payments (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id          VARCHAR(30) NOT NULL,
  nama_pengirim     VARCHAR(150),
  bank_pengirim     VARCHAR(100) NOT NULL,
  no_rekening       VARCHAR(100),
  tanggal_transfer  DATE,
  nominal           BIGINT NOT NULL DEFAULT 0,
  catatan           TEXT,
  bukti_url         VARCHAR(500),
  status_verifikasi BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_unverified ON public.payments (status_verifikasi) WHERE status_verifikasi = FALSE;
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments (order_id);

-- ==================
-- 5. TABEL ADMINS
-- ==================
CREATE TABLE IF NOT EXISTS public.admins (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  whatsapp      VARCHAR(30) DEFAULT '6287846725184',
  avatar_url    TEXT
);

-- ==================
-- 6. TABEL CUSTOM_ORDERS
-- ==================
CREATE TABLE IF NOT EXISTS public.custom_orders (
  id              VARCHAR(30) PRIMARY KEY,      -- Format: BMA-K-YYYYMMDD-XXXX
  nama_pembeli    VARCHAR(255) NOT NULL,
  telepon         VARCHAR(20) NOT NULL,
  nama_produk     VARCHAR(255) NOT NULL,
  deskripsi       TEXT,
  provinsi        VARCHAR(100),
  kabupaten       VARCHAR(100),
  kecamatan       VARCHAR(100),
  desa            VARCHAR(100),
  alamat_lengkap  TEXT,
  lat             DECIMAL(10, 8),
  lng             DECIMAL(11, 8),
  total_tagihan   BIGINT NOT NULL DEFAULT 0,
  status          VARCHAR(30) NOT NULL DEFAULT 'pending_payment'
                  CHECK (status IN ('pending', 'pending_payment', 'waiting_verification', 'paid', 'processing', 'shipped', 'completed', 'cancelled')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_orders_telepon ON public.custom_orders (telepon);

-- ==================
-- 7. ROW LEVEL SECURITY (RLS)
-- ==================
-- Seluruh akses data dilakukan melalui Backend Express menggunakan service_role key.
-- Mengaktifkan RLS pada semua tabel menutup akses langsung dari luar menggunakan anon key.
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_products" ON public.products FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_orders" ON public.orders FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_order_items" ON public.order_items FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_payments" ON public.payments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_admins" ON public.admins FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_custom_orders" ON public.custom_orders FOR ALL TO service_role USING (true) WITH CHECK (true);
