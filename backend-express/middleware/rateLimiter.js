// ============================================
// middleware/rateLimiter.js
// Pembatas request untuk mencegah spam & brute-force
// ============================================

const rateLimit = require('express-rate-limit')

// Limiter untuk endpoint checkout (pembuatan pesanan)
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: '⚠️ Terlalu banyak permintaan checkout dari IP ini. Coba lagi dalam 15 menit.'
  }
})

// Limiter untuk endpoint upload bukti pembayaran
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: '⚠️ Terlalu banyak upload bukti bayar dari IP ini. Coba lagi dalam 15 menit.'
  }
})

// Limiter ketat untuk login admin (mencegah brute-force password)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: '⛔ Terlalu banyak percobaan login gagal. Silakan tunggu 15 menit.'
  }
})

// Limiter untuk pelacakan & pencarian pesanan (mencegah enumerasi Order ID / nomor telepon)
const trackSearchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: '⚠️ Terlalu banyak permintaan pencarian pesanan. Silakan tunggu beberapa saat.'
  }
})

module.exports = {
  checkoutLimiter,
  paymentLimiter,
  loginLimiter,
  trackSearchLimiter
}
