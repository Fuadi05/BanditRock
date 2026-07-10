// ============================================
// routes/user-routes.js
// Endpoint publik untuk pembeli / customer
// ============================================

const express = require('express')
const multer = require('multer')
const supabase = require('../config/supabase')

const router = express.Router()

// Konfigurasi multer: simpan file sementara di memori (buffer)
// sebelum di-upload ke Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Maks 5 MB
  fileFilter: (req, file, cb) => {
    // Hanya terima gambar (JPG, PNG) dan PDF
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Format file tidak didukung. Gunakan JPG, PNG, atau PDF.'))
    }
  }
})


// ─────────────────────────────────────────────
// GET /api/produk
// Menarik katalog produk (opsional: filter kategori)
// Query params: ?kategori=Eksterior
// ─────────────────────────────────────────────
router.get('/produk', async (req, res) => {
  try {
    const { kategori } = req.query

    // Bangun query ke Supabase
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    // Terapkan filter kategori jika diberikan
    if (kategori) {
      query = query.eq('kategori', kategori)
    }

    const { data, error } = await query

    if (error) throw error

    res.json({
      success: true,
      count: data.length,
      data
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data produk.',
      error: err.message
    })
  }
})


// ─────────────────────────────────────────────
// GET /api/produk/:id
// Menarik detail spesifik satu produk
// ─────────────────────────────────────────────
router.get('/produk/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan.'
      })
    }

    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail produk.',
      error: err.message
    })
  }
})


// ─────────────────────────────────────────────
// POST /api/order
// Membuat pesanan baru (Sesi 1 — Produk Pasti / Keranjang)
// ─────────────────────────────────────────────
// Body JSON yang diharapkan:
// {
//   "nama_pembeli": "Budi Santoso",
//   "telepon": "081234567890",
//   "items": [
//     { "product_id": "uuid-produk-1", "qty": 2 },
//     { "product_id": "uuid-produk-2", "qty": 1 }
//   ]
// }
router.post('/order', async (req, res) => {
  try {
    const { nama_pembeli, telepon, items } = req.body

    // --- Validasi input ---
    if (!nama_pembeli || !telepon || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap. Diperlukan: nama_pembeli, telepon, dan items (array).'
      })
    }

    // --- Generate Order ID unik: BMA-YYYYMMDD-XXX ---
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '') // "20250710"
    const randomDigits = String(Math.floor(100 + Math.random() * 900))  // "482"
    const orderId = `BMA-${dateStr}-${randomDigits}`

    // --- Ambil harga katalog untuk setiap item ---
    // Kumpulkan semua product_id yang dibutuhkan
    const productIds = items.map(item => item.product_id)

    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('id, harga_min, tipe_harga')
      .in('id', productIds)

    if (prodErr) throw prodErr

    // Buat map harga untuk lookup cepat
    const priceMap = {}
    products.forEach(p => { priceMap[p.id] = p.harga_min })

    // Hitung total tagihan dan siapkan data order_items
    let totalTagihan = 0
    const orderItemsData = items.map(item => {
      const hargaSatuan = priceMap[item.product_id]
      if (hargaSatuan === undefined) {
        throw new Error(`Produk dengan ID "${item.product_id}" tidak ditemukan di katalog.`)
      }
      const subtotal = hargaSatuan * item.qty
      totalTagihan += subtotal

      return {
        order_id: orderId,
        product_id: item.product_id,
        qty: item.qty,
        harga_disepakati: hargaSatuan // Sesi 1: harga diambil langsung dari katalog
      }
    })

    // --- Simpan order ke tabel orders ---
    const { error: orderErr } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        nama_pembeli,
        telepon,
        total_tagihan: totalTagihan,
        status: 'pending_payment'
      })

    if (orderErr) throw orderErr

    // --- Simpan detail item ke tabel order_items ---
    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert(orderItemsData)

    if (itemsErr) throw itemsErr

    // --- Response sukses ---
    res.status(201).json({
      success: true,
      message: `✅ Pesanan berhasil dibuat!`,
      data: {
        order_id: orderId,
        nama_pembeli,
        telepon,
        total_tagihan: totalTagihan,
        jumlah_item: items.length,
        status: 'pending_payment'
      }
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Gagal membuat pesanan.',
      error: err.message
    })
  }
})


// ─────────────────────────────────────────────
// GET /api/order/search
// Mencari pesanan berdasarkan nomor telepon
// (Fitur: "Lupa nomor order? Cari pakai nomor WA")
// Query params: ?telepon=081234567890
// ─────────────────────────────────────────────
router.get('/order/search', async (req, res) => {
  try {
    const { telepon } = req.query

    if (!telepon) {
      return res.status(400).json({
        success: false,
        message: 'Parameter "telepon" wajib diisi.'
      })
    }

    const { data, error } = await supabase
      .from('orders')
      .select('id, nama_pembeli, telepon, total_tagihan, status, created_at')
      .eq('telepon', telepon)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({
      success: true,
      count: data.length,
      data
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Gagal mencari pesanan.',
      error: err.message
    })
  }
})


// ─────────────────────────────────────────────
// POST /api/pembayaran
// Upload bukti transfer dan catat konfirmasi pembayaran
// ─────────────────────────────────────────────
// Form data (multipart):
//   - order_id      : "BMA-20250710-482"
//   - bank_pengirim : "BCA"
//   - nominal       : 999321
//   - bukti         : (file gambar)
router.post('/pembayaran', upload.single('bukti'), async (req, res) => {
  try {
    const { order_id, bank_pengirim, nominal } = req.body
    const file = req.file

    // --- Validasi input ---
    if (!order_id || !bank_pengirim || !nominal || !file) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap. Diperlukan: order_id, bank_pengirim, nominal, dan file bukti transfer.'
      })
    }

    // --- Cek apakah order tersebut ada ---
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', order_id)
      .single()

    if (orderErr || !order) {
      return res.status(404).json({
        success: false,
        message: `Order dengan ID "${order_id}" tidak ditemukan.`
      })
    }

    // --- Upload file bukti ke Supabase Storage bucket "bukti-transfer" ---
    // Buat nama file unik: orderId_timestamp.ext
    const ext = file.originalname.split('.').pop()
    const fileName = `${order_id}_${Date.now()}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('bukti-transfer')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      })

    if (uploadErr) throw uploadErr

    // Ambil URL publik dari file yang baru di-upload
    const { data: urlData } = supabase.storage
      .from('bukti-transfer')
      .getPublicUrl(fileName)

    const buktiUrl = urlData.publicUrl

    // --- Simpan data pembayaran ke tabel payments ---
    const { error: payErr } = await supabase
      .from('payments')
      .insert({
        order_id,
        bank_pengirim,
        nominal: parseInt(nominal, 10),
        bukti_url: buktiUrl,
        status_verifikasi: false
      })

    if (payErr) throw payErr

    // --- Ubah status order menjadi "waiting_verification" ---
    const { error: updateErr } = await supabase
      .from('orders')
      .update({ status: 'waiting_verification' })
      .eq('id', order_id)

    if (updateErr) throw updateErr

    // --- Response sukses ---
    res.status(201).json({
      success: true,
      message: '✅ Bukti pembayaran berhasil diupload! Silakan tunggu verifikasi admin (maks 1x24 jam).',
      data: {
        order_id,
        bank_pengirim,
        nominal: parseInt(nominal, 10),
        bukti_url: buktiUrl,
        status: 'waiting_verification'
      }
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengupload bukti pembayaran.',
      error: err.message
    })
  }
})


module.exports = router
