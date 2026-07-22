// ============================================
// index.js — Server Utama Express.js
// Sistem Informasi Penjualan Batu Alam Merapi
// ============================================
// Menggabungkan seluruh routes, middleware, dan konfigurasi.
// Jalankan: npm run dev (development) atau npm start (production)

require('dotenv').config()

const express = require('express')
const cors = require('cors')

// Import routes
const userRoutes = require('./routes/user-routes')
const adminRoutes = require('./routes/admin-routes')

// Import rate limiters
const { checkoutLimiter, paymentLimiter } = require('./middleware/rateLimiter')

// Inisialisasi Express
const app = express()
const PORT = process.env.PORT || 3000

// Trust reverse proxy (cPanel / Nginx / Apache) for rate limiter IP detection
app.set('trust proxy', true)


// ═══════════════════════════════════════
// MIDDLEWARE GLOBAL
// ═══════════════════════════════════════

// Aktifkan CORS agar frontend bisa mengakses API dari domain berbeda
app.use(cors())

// Parse body request format JSON
app.use(express.json())

// Parse body request format URL-encoded (untuk form biasa)
app.use(express.urlencoded({ extended: true }))


// ═══════════════════════════════════════
// RATE LIMITER (diterapkan per-route sensitif)
// ═══════════════════════════════════════

// Batasi khusus PEMBUATAN pesanan baru (POST): maks 5 request per 15 menit per IP
app.post('/api/order', checkoutLimiter)

// Batasi endpoint upload bukti bayar: maks 5 request per 15 menit per IP
app.post('/api/pembayaran', paymentLimiter)


// ═══════════════════════════════════════
// MOUNT ROUTES
// ═══════════════════════════════════════

// Routes publik (customer / pembeli)
app.use('/api', userRoutes)

// Routes admin (dilindungi JWT di dalam file route-nya)
app.use('/api/admin', adminRoutes)


// ═══════════════════════════════════════
// ROUTE INFO / HEALTH CHECK
// ═══════════════════════════════════════

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🪨 Batu Merapi API — Server berjalan!',
    version: '1.0.0',
    endpoints: {
      produk: 'GET /api/produk',
      detail_produk: 'GET /api/produk/:id',
      buat_order: 'POST /api/order',
      cari_order: 'GET /api/order/search?telepon=08xxx',
      konfirmasi_bayar: 'POST /api/pembayaran',
      admin_login: 'POST /api/admin/login',
      admin_order_manual: 'POST /api/admin/order',
      admin_verifikasi: 'GET /api/admin/verifikasi',
      admin_checklist: 'PUT /api/admin/verifikasi/:id',
      admin_laporan: 'GET /api/admin/laporan'
    }
  })
})


// ═══════════════════════════════════════
// GLOBAL ERROR HANDLER
// ═══════════════════════════════════════
// Menangkap error yang tidak di-handle oleh routes
// (termasuk error dari multer seperti file terlalu besar)

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('❌ Unhandled Error:', err.message)

  // Error dari multer (ukuran file melebihi batas)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: '📁 Ukuran file terlalu besar. Maksimal 5 MB.'
    })
  }

  // Error umum dari multer (format file tidak didukung, dll)
  if (err.message && err.message.includes('Format file')) {
    return res.status(400).json({
      success: false,
      message: err.message
    })
  }

  // Error tidak terduga lainnya
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal pada server.',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  })
})


// ═══════════════════════════════════════
// JALANKAN SERVER
// ═══════════════════════════════════════

app.listen(PORT, () => {
  console.log('')
  console.log('🪨 ════════════════════════════════════════')
  console.log('   BATU MERAPI API SERVER')
  console.log(`   🟢 Berjalan di: http://localhost:${PORT}`)
  console.log(`   📋 Daftar endpoint: http://localhost:${PORT}/`)
  console.log('🪨 ════════════════════════════════════════')
  console.log('')
})
