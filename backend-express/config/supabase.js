// ============================================
// config/supabase.js
// Koneksi ke Supabase menggunakan SDK resmi
// ============================================
// File ini menginisialisasi satu instance client Supabase
// yang digunakan oleh seluruh routes dan middleware.

const { createClient } = require('@supabase/supabase-js')
let WebSocketImpl = globalThis.WebSocket
try {
  WebSocketImpl = require('ws')
} catch (_) {
  if (!WebSocketImpl) {
    WebSocketImpl = class DummyWebSocket {}
  }
}
require('dotenv').config()

// Ambil kredensial dari variabel lingkungan (.env)
// Mendukung SUPABASE_SERVICE_ROLE_KEY (direkomendasikan) maupun SUPABASE_ANON_KEY (kompatibilitas mundur)
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

// Validasi: pastikan variabel lingkungan sudah diisi
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ FATAL: SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY (atau SUPABASE_ANON_KEY) harus diisi di file .env')
  process.exit(1)
}

// Buat instance client Supabase (singleton)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  realtime: {
    transport: WebSocketImpl
  }
})

module.exports = supabase
