// ============================================
// middleware/rateLimiter.js
// Pembatas request untuk mencegah spam
// ============================================

const rateLimit = require('express-rate-limit')

// Limiter untuk endpoint checkout
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: {
    success: false,
    message: '⚠️ Terlalu banyak permintaan checkout dari IP ini. Coba lagi dalam 15 menit.'
  }
})

// Limiter untuk endpoint upload bukti pembayaran
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: {
    success: false,
    message: '⚠️ Terlalu banyak upload bukti bayar dari IP ini. Coba lagi dalam 15 menit.'
  }
})

module.exports = { checkoutLimiter, paymentLimiter }
