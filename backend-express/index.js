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
const {
  checkoutLimiter,
  paymentLimiter,
  loginLimiter,
  trackSearchLimiter
} = require('./middleware/rateLimiter')

// Inisialisasi Express
const app = express()
const PORT = process.env.PORT || 3000

// Trust tepat 1 hop reverse proxy (cPanel Apache/LiteSpeed Passenger)
// agar deteksi IP pada express-rate-limit akurat dan tidak bisa di-spoof via X-Forwarded-For
app.set('trust proxy', 1)
app.disable('x-powered-by')

// ═══════════════════════════════════════
// MIDDLEWARE GLOBAL & SECURITY HEADERS
// ═══════════════════════════════════════

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  next()
})

// Konfigurasi CORS hanya untuk domain resmi Batu Merapi & localhost (development)
const allowedOrigins = [
  'https://batumerapi.biz.id',
  'https://www.batumerapi.biz.id',
  'https://admin.batumerapi.biz.id',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
]

app.use(cors({
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (misal same-origin, server-to-server, curl) atau origin yang terdaftar
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error('Origin tidak diizinkan oleh kebijakan CORS.'))
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Parse body request format JSON (batas ukuran payload 1 MB)
app.use(express.json({ limit: '1mb' }))

// Parse body request format URL-encoded (untuk form biasa)
app.use(express.urlencoded({ extended: true, limit: '1mb' }))


// ═══════════════════════════════════════
// RATE LIMITER (diterapkan per-route sensitif)
// ═══════════════════════════════════════

// Batasi khusus PEMBUATAN pesanan baru (POST)
app.post('/api/order', checkoutLimiter)

// Batasi endpoint upload bukti bayar
app.post('/api/pembayaran', paymentLimiter)

// Batasi percobaan login admin (anti brute-force)
app.post('/api/admin/login', loginLimiter)

// Batasi pencarian & pelacakan pesanan (anti enumerasi)
app.get('/api/order/search', trackSearchLimiter)
app.use('/api/order/track', trackSearchLimiter)


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
    version: '1.1.0'
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

  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: err.message
    })
  }

  // Error tidak terduga lainnya (jangan bocorkan detail internal di production)
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal pada server.'
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
  console.log('🪨 ════════════════════════════════════════')
  console.log('')
})
