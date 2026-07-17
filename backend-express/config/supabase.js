// ============================================
// config/supabase.js
// Koneksi ke Supabase menggunakan SDK resmi
// ============================================
// File ini menginisialisasi satu instance client Supabase
// yang digunakan oleh seluruh routes dan middleware.

const { createClient } = require('@supabase/supabase-js')
const WebSocket = require('ws')
require('dotenv').config()

// Ambil kredensial dari variabel lingkungan (.env)
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

// Validasi: pastikan variabel lingkungan sudah diisi
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ FATAL: SUPABASE_URL dan SUPABASE_ANON_KEY harus diisi di file .env')
  process.exit(1)
}

// Buat instance client Supabase (singleton)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    transport: WebSocket
  }
})

module.exports = supabase
