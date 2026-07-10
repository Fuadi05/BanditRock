// ============================================
// middleware/rateLimiter.js
// Pembatas request untuk mencegah spam
// ============================================
// Diterapkan pada endpoint sensitif:
// - POST /api/order      (checkout)
// - POST /api/pembayaran (upload bukti transfer)
//
// Batas: 5 request per 15 menit per alamat IP.

const rateLimit = require('express-rate-limit')

// Limiter untuk endpoint checkout (membuat pesanan baru)
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // Jendela waktu: 15 menit
  max: 5,                       // Maksimal 5 request per jendela
  standardHeaders: true,        // Kirim info rate limit di header `RateLimit-*`
  legacyHeaders: false,         // Nonaktifkan header `X-RateLimit-*` yang lama
  message: {
    success: false,
    message: '⚠️ Terlalu banyak permintaan checkout dari IP ini. Coba lagi dalam 15 menit.'
  }
})

// Limiter untuk endpoint upload bukti pembayaran
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: '⚠️ Terlalu banyak upload bukti bayar dari IP ini. Coba lagi dalam 15 menit.'
  }
})

module.exports = { checkoutLimiter, paymentLimiter }
