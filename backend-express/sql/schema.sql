-- ============================================================
-- SKEMA DATABASE: Sistem Informasi Penjualan Batu Alam Merapi
-- ============================================================
-- Jalankan script ini di Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- Script ini akan membuat seluruh tabel yang dibutuhkan oleh backend.
--
-- URUTAN EKSEKUSI PENTING: Tabel induk dibuat terlebih dahulu
-- sebelum tabel anak yang memiliki Foreign Key.
-- ============================================================


-- ==================
-- 1. TABEL PRODUCTS
-- ==================
-- Menyimpan katalog produk batu alam.
-- Kolom tipe_harga menentukan sesi pemesanan:
--   'fixed'    → Sesi 1: Harga pasti, bisa langsung checkout via keranjang
--   'range'    → Sesi 2: Harga rentang, pemesanan via nego WhatsApp
--   'preorder' → Sesi 3: Produk custom/pre-order, harga disepakati via WA

CREATE TABLE IF NOT EXISTS products (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama        VARCHAR(255) NOT NULL,
  kategori    VARCHAR(100) NOT NULL,          -- 'Peralatan Dapur', 'Eksterior', 'Interior', 'Ornamen Dinding'
  harga_min   INTEGER NOT NULL DEFAULT 0,     -- Harga minimum (untuk tipe fixed, isi sama dengan harga_max)
  harga_max   INTEGER NOT NULL DEFAULT 0,     -- Harga maksimum
  tipe_harga  VARCHAR(20) NOT NULL DEFAULT 'fixed'
              CHECK (tipe_harga IN ('fixed', 'range', 'preorder')),
  deskripsi   TEXT,
  image_url   VARCHAR(500),                   -- URL gambar produk (bisa dari Supabase Storage atau path statis)
  status_stok VARCHAR(20) NOT NULL DEFAULT 'ready'
              CHECK (status_stok IN ('ready', 'preorder', 'custom')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ==================
-- 2. TABEL ORDERS
-- ==================
-- Menyimpan data pesanan pelanggan.
-- ID pesanan menggunakan format khusus: BMA-YYYYMMDD-XXX (3 digit acak)
-- yang di-generate oleh backend, bukan auto-increment database.

CREATE TABLE IF NOT EXISTS orders (
  id              VARCHAR(20) PRIMARY KEY,      -- Format: BMA-20250710-482
  nama_pembeli    VARCHAR(255) NOT NULL,
  telepon         VARCHAR(20) NOT NULL,          -- Nomor WhatsApp/Telepon pembeli
  total_tagihan   INTEGER NOT NULL DEFAULT 0,    -- Total harga + kode unik (dalam Rupiah)
  status          VARCHAR(30) NOT NULL DEFAULT 'pending_payment'
                  CHECK (status IN ('pending_payment', 'waiting_verification', 'paid', 'cancelled')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk pencarian pesanan berdasarkan nomor telepon (fitur "Lupa Nomor Order")
CREATE INDEX IF NOT EXISTS idx_orders_telepon ON orders (telepon);


-- ==================
-- 3. TABEL ORDER_ITEMS
-- ==================
-- Detail item per pesanan (relasi many-to-many antara orders dan products).
-- Kolom harga_disepakati menyimpan harga final per item:
--   - Untuk Sesi 1 (fixed): diisi otomatis dari harga katalog
--   - Untuk Sesi 2 & 3 (range/preorder): diisi oleh admin setelah nego WA

CREATE TABLE IF NOT EXISTS order_items (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id         VARCHAR(20) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id       UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  qty              INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0),
  harga_disepakati INTEGER NOT NULL DEFAULT 0   -- Harga satuan final (Rupiah)
);

-- Index untuk query item berdasarkan order
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);


-- ==================
-- 4. TABEL PAYMENTS
-- ==================
-- Menyimpan data konfirmasi pembayaran beserta bukti transfer.
-- bukti_url berisi link publik gambar dari Supabase Storage bucket "bukti-transfer".

CREATE TABLE IF NOT EXISTS payments (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id            VARCHAR(20) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  bank_pengirim       VARCHAR(100) NOT NULL,        -- Nama bank pengirim (BCA, BRI, Mandiri, dll)
  nominal             INTEGER NOT NULL DEFAULT 0,    -- Jumlah yang ditransfer (Rupiah)
  bukti_url           VARCHAR(500),                  -- URL gambar bukti transfer di Supabase Storage
  status_verifikasi   BOOLEAN NOT NULL DEFAULT FALSE,-- false = belum diverifikasi, true = sudah disetujui admin
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk antrean verifikasi admin (hanya ambil yang belum diverifikasi)
CREATE INDEX IF NOT EXISTS idx_payments_unverified ON payments (status_verifikasi) WHERE status_verifikasi = FALSE;


-- ==================
-- 5. TABEL ADMINS
-- ==================
-- Menyimpan kredensial administrator untuk login ke dashboard admin.
-- Password disimpan dalam bentuk hash bcrypt (JANGAN simpan plaintext).

CREATE TABLE IF NOT EXISTS admins (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL
);


-- ==================
-- 6. DATA AWAL ADMIN
-- ==================
-- Insert akun admin default untuk keperluan development.
-- Password: admin123 (bcrypt hash dengan salt rounds = 10)
--
-- ⚠️  PERINGATAN: GANTI PASSWORD INI DI PRODUCTION!
-- Untuk generate hash baru, jalankan di Node.js:
--   const bcrypt = require('bcryptjs')
--   bcrypt.hashSync('password_baru_anda', 10)

INSERT INTO admins (username, password_hash) VALUES
  ('admin', '$2a$10$rQqy6OE4F1gBiJqS4MzXxOxGz7xMhGqL1mB2FqV5Kx9yVQZ3xKyHW')
ON CONFLICT (username) DO NOTHING;


-- ============================================================
-- SELESAI! Pastikan juga membuat Storage Bucket di dashboard:
-- Dashboard Supabase > Storage > Create New Bucket
-- Nama bucket: bukti-transfer
-- Access: Public (agar URL bisa diakses langsung oleh frontend)
-- ============================================================
