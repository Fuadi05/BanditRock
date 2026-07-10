// ============================================
// middleware/auth.js
// Middleware autentikasi JWT untuk endpoint admin
// ============================================
// Cara kerja:
// 1. Cek header Authorization: "Bearer <token>"
// 2. Verifikasi token menggunakan JWT_SECRET
// 3. Jika valid → lanjutkan ke handler berikutnya
// 4. Jika tidak valid → tolak dengan status 401

const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
  // Ambil header Authorization
  const authHeader = req.headers['authorization']

  // Header harus ada dan berbentuk "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '⛔ Akses ditolak. Token tidak ditemukan di header Authorization.'
    })
  }

  // Ekstrak token (buang prefix "Bearer ")
  const token = authHeader.split(' ')[1]

  try {
    // Verifikasi dan decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Simpan data admin ke req.admin agar bisa diakses di handler berikutnya
    req.admin = decoded
    next()
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: '⛔ Token tidak valid atau sudah kedaluwarsa. Silakan login ulang.'
    })
  }
}

module.exports = verifyToken
