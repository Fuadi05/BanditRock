// ============================================
// routes/admin-routes.js
// Endpoint khusus admin (dilindungi JWT)
// ============================================

const crypto = require('crypto')
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const supabase = require('../config/supabase')
const verifyToken = require('../middleware/auth')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Format file tidak didukung. Hanya JPG, PNG, dan WEBP yang diperbolehkan.'))
  }
})

const router = express.Router()

const ALLOWED_ORDER_STATUSES = [
  'pending',
  'pending_payment',
  'waiting_verification',
  'paid',
  'processing',
  'shipped',
  'completed',
  'cancelled'
]


// ─────────────────────────────────────────────
// POST /api/admin/login
// Verifikasi kredensial admin → return token JWT
// ⚠️  Endpoint ini dilindungi oleh loginLimiter di index.js
// ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password wajib diisi.'
      })
    }

    const cleanUsername = String(username).trim()
    if (cleanUsername.startsWith('admin_disabled_')) {
      return res.status(401).json({
        success: false,
        message: '⛔ Username atau password salah.'
      })
    }

    // Cari admin di database berdasarkan username
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', cleanUsername)
      .single()

    if (error || !admin) {
      return res.status(401).json({
        success: false,
        message: '⛔ Username atau password salah.'
      })
    }

    // Bandingkan password dengan hash di database
    const isMatch = await bcrypt.compare(String(password), admin.password_hash)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '⛔ Username atau password salah.'
      })
    }

    // Generate token JWT (berlaku 7 hari)
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      message: '✅ Login berhasil!',
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username
        }
      }
    })
  } catch (err) {
    console.error('Admin login error:', err.message)
    res.status(500).json({
      success: false,
      message: 'Gagal memproses login.'
    })
  }
})


// ═════════════════════════════════════════════
// Semua endpoint di bawah ini MEMERLUKAN TOKEN
// ═════════════════════════════════════════════
router.use(verifyToken)


// ─────────────────────────────────────────────
// POST /api/admin/upload
// Endpoint untuk mengunggah gambar produk / avatar
// ─────────────────────────────────────────────
router.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah.' })
  }

  try {
    const mimeToExt = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp'
    }
    const fileExt = mimeToExt[req.file.mimetype] || 'jpg'
    const fileName = `product_${Date.now()}_${crypto.randomInt(100, 999)}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase
      .storage
      .from('bukti-transfer')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      })

    if (uploadError) throw uploadError

    const { data: publicUrlData } = supabase
      .storage
      .from('bukti-transfer')
      .getPublicUrl(filePath)

    res.json({ success: true, url: publicUrlData.publicUrl })
  } catch (err) {
    console.error('Upload error:', err.message)
    res.status(500).json({ success: false, message: 'Gagal mengunggah gambar.' })
  }
})


// ─────────────────────────────────────────────
// GET /api/admin/produk
// Mengambil semua produk untuk admin (termasuk nonaktif & harga_max/HPP)
// ─────────────────────────────────────────────
router.get('/produk', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({
      success: true,
      data
    })
  } catch (err) {
    console.error('Error GET /api/admin/produk:', err.message)
    res.status(500).json({
      success: false,
      message: 'Gagal memuat produk.'
    })
  }
})


// ─────────────────────────────────────────────
// GET /api/admin/produk/:id
// Mengambil detail lengkap 1 produk untuk form edit admin (termasuk harga_max / HPP)
// ─────────────────────────────────────────────
router.get('/produk/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan.'
      })
    }

    res.json({
      success: true,
      data
    })
  } catch (err) {
    console.error('Error GET /api/admin/produk/:id:', err.message)
    res.status(500).json({
      success: false,
      message: 'Gagal memuat detail produk.'
    })
  }
})


// ─────────────────────────────────────────────
// POST /api/admin/produk
// Menambahkan produk baru ke katalog
// ─────────────────────────────────────────────
router.post('/produk', async (req, res) => {
  try {
    const {
      nama,
      kategori,
      harga_min,
      harga_max,
      tipe_harga,
      deskripsi,
      deskripsi_singkat,
      ukuran,
      image_url,
      image_url_2,
      image_url_3,
      image_url_4,
      status_stok
    } = req.body

    if (!nama || !kategori || harga_min === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap. Diperlukan: nama, kategori, harga_min.'
      })
    }

    const allowedStok = ['ready', 'preorder', 'custom']
    const cleanStok = allowedStok.includes(status_stok) ? status_stok : 'ready'

    const { data, error } = await supabase
      .from('products')
      .insert({
        nama: String(nama).trim(),
        kategori: String(kategori).trim(),
        harga_min: Number(harga_min) || 0,
        harga_max: Number(harga_max !== undefined ? harga_max : harga_min) || 0,
        tipe_harga: ['fixed', 'range', 'preorder'].includes(tipe_harga) ? tipe_harga : 'fixed',
        deskripsi: deskripsi || '',
        deskripsi_singkat: deskripsi_singkat || '',
        ukuran: ukuran || '',
        image_url: image_url || '',
        image_url_2: image_url_2 || '',
        image_url_3: image_url_3 || '',
        image_url_4: image_url_4 || '',
        status_stok: cleanStok,
        is_active: true
      })
      .select()

    if (error) throw error

    res.status(201).json({
      success: true,
      message: '✅ Produk berhasil ditambahkan!',
      data: data[0]
    })
  } catch (err) {
    console.error('Supabase Insert Product Error:', err.message)
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan produk.'
    })
  }
})


// ─────────────────────────────────────────────
// PUT /api/admin/produk/:id/status
// Toggle status is_active produk
// ─────────────────────────────────────────────
router.put('/produk/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const is_active = Boolean(req.body.is_active)

    const { data, error } = await supabase
      .from('products')
      .update({ is_active })
      .eq('id', id)
      .select()

    if (error) throw error

    res.json({
      success: true,
      message: `Status produk berhasil diubah menjadi ${is_active ? 'Aktif' : 'Tidak Aktif'}`,
      data: data[0]
    })
  } catch (err) {
    console.error('Error PUT /api/admin/produk/:id/status:', err.message)
    res.status(500).json({
      success: false,
      message: 'Gagal mengubah status produk.'
    })
  }
})


// ─────────────────────────────────────────────
// PUT /api/admin/produk/:id
// Update data produk (dengan whitelist kolom untuk mencegah Mass Assignment)
// ─────────────────────────────────────────────
router.put('/produk/:id', async (req, res) => {
  try {
    const { id } = req.params
    const body = req.body || {}

    const allowedFields = [
      'nama',
      'kategori',
      'harga_min',
      'harga_max',
      'tipe_harga',
      'deskripsi',
      'deskripsi_singkat',
      'ukuran',
      'image_url',
      'image_url_2',
      'image_url_3',
      'image_url_4',
      'status_stok',
      'is_active'
    ]

    const updates = {}
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updates[key] = body[key]
      }
    }

    if (updates.status_stok && !['ready', 'preorder', 'custom'].includes(updates.status_stok)) {
      updates.status_stok = 'ready'
    }

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw error

    res.json({
      success: true,
      message: '✅ Produk berhasil diperbarui!',
      data: data[0]
    })
  } catch (err) {
    console.error('Error PUT /api/admin/produk/:id:', err.message)
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui produk.'
    })
  }
})


// ─────────────────────────────────────────────
// DELETE /api/admin/produk/:id
// Hapus data produk
// ─────────────────────────────────────────────
router.delete('/produk/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({
      success: true,
      message: '🗑️ Produk berhasil dihapus!'
    })
  } catch (err) {
    const isFkError = err.code === '23503' || (err.message && err.message.includes('foreign key constraint'))
    res.status(isFkError ? 400 : 500).json({
      success: false,
      message: isFkError
        ? 'Produk ini sudah pernah dipesan pelanggan sehingga tidak bisa dihapus. Silakan nonaktifkan statusnya saja.'
        : 'Gagal menghapus produk.',
      error: isFkError ? 'foreign key constraint' : undefined
    })
  }
})


// ─────────────────────────────────────────────
// GET /api/admin/dashboard
// Mengambil rekapan semua pesanan (biasa & kustom) untuk dasbor & notifikasi
// ─────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const query1 = supabase
      .from('orders')
      .select('id, nama_pembeli, telepon, total_tagihan, status, created_at')
      .order('created_at', { ascending: false })

    const query2 = supabase
      .from('custom_orders')
      .select('id, nama_pembeli, telepon, total_tagihan, status, created_at')
      .order('created_at', { ascending: false })

    const [res1, res2] = await Promise.all([query1, query2])

    if (res1.error) throw res1.error
    if (res2.error) throw res2.error

    const normalizedCustom = (res2.data || []).map(o => ({
      ...o,
      status: o.status === 'pending' ? 'pending_payment' : o.status,
      is_custom: true
    }))

    const combinedData = [...(res1.data || []), ...normalizedCustom]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    res.json({
      success: true,
      count: combinedData.length,
      data: combinedData
    })
  } catch (err) {
    console.error('Error GET /api/admin/dashboard:', err.message)
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dashboard.'
    })
  }
})


// ─────────────────────────────────────────────
// GET /api/admin/orders
// Mengambil seluruh pesanan reguler beserta alamat, ukuran item, dan pembayaran
// ─────────────────────────────────────────────
router.get('/orders', async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        nama_pembeli,
        telepon,
        provinsi,
        kabupaten,
        kecamatan,
        desa,
        alamat_lengkap,
        total_tagihan,
        status,
        created_at,
        order_items (
          qty,
          ukuran,
          harga_disepakati,
          products ( nama )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Manual join untuk payments
    const orderIds = orders.map(o => o.id)
    const paymentsMap = {}
    if (orderIds.length > 0) {
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('id, order_id, nama_pengirim, bank_pengirim, no_rekening, tanggal_transfer, nominal, catatan, bukti_url, status_verifikasi, created_at')
        .in('order_id', orderIds)
        .order('created_at', { ascending: false })

      if (paymentsData) {
        paymentsData.forEach(p => {
          if (!paymentsMap[p.order_id]) paymentsMap[p.order_id] = []
          paymentsMap[p.order_id].push(p)
        })
      }
    }

    const data = orders.map(o => ({
      ...o,
      payments: paymentsMap[o.id] || []
    }))

    res.json({
      success: true,
      count: data.length,
      data
    })
  } catch (err) {
    console.error('Error GET /api/admin/orders:', err.message)
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data pesanan.'
    })
  }
})


// ─────────────────────────────────────────────
// PUT /api/admin/orders/:id/status
// Update status pesanan reguler
// ─────────────────────────────────────────────
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const allowedStatuses = ['pending_payment', 'waiting_verification', 'paid', 'processing', 'shipped', 'completed', 'cancelled']
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Gunakan salah satu dari: ${allowedStatuses.join(', ')}`
      })
    }

    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)

    if (error) throw error

    // Jika disetujui atau lanjut diproses/dikirim/selesai, tandai pembayaran terkait sebagai terverifikasi
    if (['paid', 'processing', 'shipped', 'completed'].includes(status)) {
      await supabase
        .from('payments')
        .update({ status_verifikasi: true })
        .eq('order_id', id)
    }

    res.json({
      success: true,
      message: `Status order "${id}" berhasil diubah menjadi "${status}".`
    })
  } catch (err) {
    console.error('Update order status error:', err.message)
    res.status(500).json({
      success: false,
      message: 'Gagal mengubah status pesanan.'
    })
  }
})


// ─────────────────────────────────────────────
// POST /api/admin/order
// Input pesanan manual dari admin (Sesi 2 & 3)
// ─────────────────────────────────────────────
router.post('/order', async (req, res) => {
  try {
    const { nama_pembeli, telepon, provinsi, kabupaten, kecamatan, desa, alamat_lengkap, items } = req.body

    if (!nama_pembeli || !telepon || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap. Diperlukan: nama_pembeli, telepon, dan items (array dengan harga_disepakati).'
      })
    }

    for (const item of items) {
      if (!item.product_id || !item.qty || !item.harga_disepakati) {
        return res.status(400).json({
          success: false,
          message: 'Setiap item harus memiliki: product_id, qty, dan harga_disepakati.'
        })
      }
    }

    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const randomDigits = String(crypto.randomInt(1000, 10000))
    const orderId = `BMA-${dateStr}-${randomDigits}`

    let totalTagihan = 0
    const orderItemsData = items.map(item => {
      const harga = Number(item.harga_disepakati) || 0
      const qty = Number(item.qty) || 1
      totalTagihan += harga * qty
      return {
        order_id: orderId,
        product_id: item.product_id,
        qty,
        ukuran: item.ukuran || item.size || '',
        harga_disepakati: harga
      }
    })

    const { error: orderErr } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        nama_pembeli: String(nama_pembeli).trim(),
        telepon: String(telepon).trim(),
        provinsi: provinsi || null,
        kabupaten: kabupaten || null,
        kecamatan: kecamatan || null,
        desa: desa || null,
        alamat_lengkap: alamat_lengkap || null,
        total_tagihan: totalTagihan,
        status: 'pending_payment'
      })

    if (orderErr) throw orderErr

    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert(orderItemsData)

    if (itemsErr) throw itemsErr

    res.status(201).json({
      success: true,
      message: '✅ Pesanan manual berhasil dicatat oleh admin!',
      data: {
        order_id: orderId,
        nama_pembeli,
        telepon,
        total_tagihan: totalTagihan,
        jumlah_item: items.length,
        status: 'pending_payment',
        dicatat_oleh: req.admin.username
      }
    })
  } catch (err) {
    console.error('Error POST /api/admin/order:', err.message)
    res.status(500).json({
      success: false,
      message: 'Gagal mencatat pesanan manual.'
    })
  }
})


// ─────────────────────────────────────────────
// GET /api/admin/verifikasi
// Menampilkan antrean bukti transfer yang belum diverifikasi
// ─────────────────────────────────────────────
router.get('/verifikasi', async (req, res) => {
  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('id, order_id, bank_pengirim, nominal, bukti_url, status_verifikasi, created_at')
      .eq('status_verifikasi', false)
      .order('created_at', { ascending: true })

    if (error) throw error

    const orderIds = (payments || []).map(p => p.order_id)
    const ordersMap = {}

    if (orderIds.length > 0) {
      const [normalRes, customRes] = await Promise.all([
        supabase.from('orders').select('id, nama_pembeli, telepon, total_tagihan, status').in('id', orderIds),
        supabase.from('custom_orders').select('id, nama_pembeli, telepon, total_tagihan, status').in('id', orderIds)
      ])
      ;(normalRes.data || []).forEach(o => { ordersMap[o.id] = o })
      ;(customRes.data || []).forEach(o => { ordersMap[o.id] = o })
    }

    const data = (payments || []).map(p => ({
      ...p,
      orders: ordersMap[p.order_id] || null
    }))

    res.json({
      success: true,
      count: data.length,
      message: data.length > 0
        ? `📋 Ada ${data.length} bukti transfer menunggu verifikasi.`
        : '✅ Tidak ada bukti transfer yang perlu diverifikasi.',
      data
    })
  } catch (err) {
    console.error('Error GET /api/admin/verifikasi:', err.message)
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil antrean verifikasi.'
    })
  }
})


// ─────────────────────────────────────────────
// PUT /api/admin/verifikasi/:id
// Checklist persetujuan/penolakan pembayaran
// ─────────────────────────────────────────────
router.put('/verifikasi/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { aksi } = req.body

    if (!aksi || !['approve', 'reject'].includes(aksi)) {
      return res.status(400).json({
        success: false,
        message: 'Aksi harus berisi "approve" atau "reject".'
      })
    }

    const { data: payment, error: payErr } = await supabase
      .from('payments')
      .select('id, order_id')
      .eq('id', id)
      .single()

    if (payErr || !payment) {
      return res.status(404).json({
        success: false,
        message: `Data pembayaran dengan ID "${id}" tidak ditemukan.`
      })
    }

    const targetTable = String(payment.order_id).startsWith('BMA-K-') ? 'custom_orders' : 'orders'

    if (aksi === 'approve') {
      const { error: updatePayErr } = await supabase
        .from('payments')
        .update({ status_verifikasi: true })
        .eq('id', id)

      if (updatePayErr) throw updatePayErr

      const { error: updateOrderErr } = await supabase
        .from(targetTable)
        .update({ status: 'paid' })
        .eq('id', payment.order_id)

      if (updateOrderErr) throw updateOrderErr

      res.json({
        success: true,
        message: `✅ Pembayaran untuk order "${payment.order_id}" telah DISETUJUI dan dicatat sebagai LUNAS.`,
        data: {
          payment_id: id,
          order_id: payment.order_id,
          status_verifikasi: true,
          status_order: 'paid'
        }
      })
    } else {
      const { error: updateOrderErr } = await supabase
        .from(targetTable)
        .update({ status: 'cancelled' })
        .eq('id', payment.order_id)

      if (updateOrderErr) throw updateOrderErr

      res.json({
        success: true,
        message: `❌ Pembayaran untuk order "${payment.order_id}" telah DITOLAK. Status order diubah ke CANCELLED.`,
        data: {
          payment_id: id,
          order_id: payment.order_id,
          status_verifikasi: false,
          status_order: 'cancelled'
        }
      })
    }
  } catch (err) {
    console.error('Error PUT /api/admin/verifikasi/:id:', err.message)
    res.status(500).json({
      success: false,
      message: 'Gagal memproses verifikasi.'
    })
  }
})


// ─────────────────────────────────────────────
// GET /api/admin/laporan
// Rekapan penjualan untuk grafik dashboard admin
// Opsional filter: ?bulan=2026-10 atau ?from=2026-10-01&to=2026-10-31
// ─────────────────────────────────────────────
router.get('/laporan', async (req, res) => {
  try {
    const { bulan, from, to } = req.query

    let query1 = supabase
      .from('orders')
      .select('id, nama_pembeli, telepon, total_tagihan, status, created_at, order_items (qty, ukuran, harga_disepakati, products (nama, kategori))')
      .in('status', ['paid', 'processing', 'shipped', 'completed'])

    let query2 = supabase
      .from('custom_orders')
      .select('id, nama_pembeli, telepon, total_tagihan, status, created_at, nama_produk, deskripsi')
      .in('status', ['paid', 'processing', 'shipped', 'completed'])

    let periodeLabel = 'Seluruh waktu'

    if (from || to) {
      if (from) {
        const fromIso = new Date(`${from}T00:00:00.000Z`).toISOString()
        query1 = query1.gte('created_at', fromIso)
        query2 = query2.gte('created_at', fromIso)
      }
      if (to) {
        const toIso = new Date(`${to}T23:59:59.999Z`).toISOString()
        query1 = query1.lte('created_at', toIso)
        query2 = query2.lte('created_at', toIso)
      }
      periodeLabel = `${from || 'Awal'} s/d ${to || 'Sekarang'}`
    } else if (bulan) {
      const [year, month] = String(bulan).split('-').map(Number)
      if (year && month) {
        const startDate = new Date(year, month - 1, 1).toISOString()
        const endDate = new Date(year, month, 1).toISOString()
        query1 = query1.gte('created_at', startDate).lt('created_at', endDate)
        query2 = query2.gte('created_at', startDate).lt('created_at', endDate)
        periodeLabel = bulan
      }
    }

    const [res1, res2] = await Promise.all([query1, query2])

    if (res1.error) throw res1.error
    if (res2.error) throw res2.error

    const combinedData = [...(res1.data || []), ...(res2.data || [])]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    const totalPendapatan = combinedData.reduce((sum, order) => sum + (Number(order.total_tagihan) || 0), 0)
    const totalTransaksi = combinedData.length

    res.json({
      success: true,
      message: `📊 Laporan penjualan (${periodeLabel}): ${totalTransaksi} transaksi lunas.`,
      ringkasan: {
        total_transaksi: totalTransaksi,
        total_pendapatan: totalPendapatan,
        periode: periodeLabel
      },
      data: combinedData
    })
  } catch (err) {
    console.error('Error GET /api/admin/laporan:', err.message)
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil laporan penjualan.'
    })
  }
})


// ─────────────────────────────────────────────
// GET /api/admin/profile
// Ambil profil admin yang sedang login
// ─────────────────────────────────────────────
router.get('/profile', async (req, res) => {
  try {
    const adminId = req.admin.id

    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, username, whatsapp, avatar_url')
      .eq('id', adminId)
      .single()

    if (error || !admin) {
      return res.status(404).json({ success: false, message: 'Admin tidak ditemukan.' })
    }

    res.json({
      success: true,
      data: {
        id: admin.id,
        username: admin.username,
        whatsapp: admin.whatsapp || '6287846725184',
        avatar_url: admin.avatar_url || null
      }
    })
  } catch (err) {
    console.error('Error GET /api/admin/profile:', err.message)
    res.status(500).json({ success: false, message: 'Gagal mengambil profil admin.' })
  }
})


// ─────────────────────────────────────────────
// PUT /api/admin/profile
// Update akun admin yang sedang login
// ─────────────────────────────────────────────
router.put('/profile', async (req, res) => {
  try {
    const adminId = req.admin.id
    const { username, whatsapp, password, avatar_url } = req.body

    const updates = {}
    if (username) updates.username = String(username).trim()
    if (password) {
      if (String(password).length < 6) {
        return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' })
      }
      updates.password_hash = await bcrypt.hash(String(password), 10)
    }
    if (whatsapp) {
      updates.whatsapp = String(whatsapp).trim()
    }
    if (avatar_url !== undefined) {
      updates.avatar_url = avatar_url
    }

    const { data: updatedAdmin, error } = await supabase
      .from('admins')
      .update(updates)
      .eq('id', adminId)
      .select('id, username, whatsapp, avatar_url')
      .single()

    if (error) throw error

    const newToken = jwt.sign(
      { id: updatedAdmin.id, username: updatedAdmin.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      message: '✅ Profil akun admin berhasil diperbarui!',
      data: {
        token: newToken,
        admin: {
          id: updatedAdmin.id,
          username: updatedAdmin.username,
          whatsapp: updatedAdmin.whatsapp || '6287846725184',
          avatar_url: updatedAdmin.avatar_url || null
        }
      }
    })
  } catch (err) {
    console.error('Error updating admin profile:', err.message)
    res.status(500).json({ success: false, message: 'Gagal mengupdate profil admin.' })
  }
})


// ─────────────────────────────────────────────
// GET /api/admin/custom-orders
// Mengambil daftar order kustom beserta bukti pembayarannya
// ─────────────────────────────────────────────
router.get('/custom-orders', async (req, res) => {
  try {
    const { data: customOrders, error } = await supabase
      .from('custom_orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    const orderIds = customOrders.map(o => o.id)
    const paymentsMap = {}
    if (orderIds.length > 0) {
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('id, order_id, nama_pengirim, bank_pengirim, no_rekening, tanggal_transfer, nominal, catatan, bukti_url, status_verifikasi, created_at')
        .in('order_id', orderIds)
        .order('created_at', { ascending: false })

      if (paymentsData) {
        paymentsData.forEach(p => {
          if (!paymentsMap[p.order_id]) paymentsMap[p.order_id] = []
          paymentsMap[p.order_id].push(p)
        })
      }
    }

    const data = customOrders.map(o => ({
      ...o,
      status: o.status === 'pending' ? 'pending_payment' : o.status,
      payments: paymentsMap[o.id] || []
    }))

    res.json({
      success: true,
      count: data.length,
      data
    })
  } catch (err) {
    console.error('Error GET /api/admin/custom-orders:', err.message)
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data order kustom.'
    })
  }
})


// ─────────────────────────────────────────────
// POST /api/admin/custom-order
// Menyimpan form tambah order kustom
// ─────────────────────────────────────────────
router.post('/custom-order', async (req, res) => {
  try {
    const {
      nama_pembeli, telepon, nama_produk, deskripsi,
      provinsi, kabupaten, kecamatan, desa,
      alamat_lengkap, lat, lng
    } = req.body

    if (!nama_pembeli || !telepon || !nama_produk || !provinsi || !kabupaten || !kecamatan || !desa || !alamat_lengkap || lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Mohon lengkapi semua field wajib.'
      })
    }

    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const randomDigits = String(crypto.randomInt(1000, 10000))
    const orderId = `BMA-K-${dateStr}-${randomDigits}`

    const { data, error } = await supabase
      .from('custom_orders')
      .insert({
        id: orderId,
        nama_pembeli: String(nama_pembeli).trim(),
        telepon: String(telepon).trim(),
        nama_produk: String(nama_produk).trim(),
        deskripsi: deskripsi ? String(deskripsi).trim() : '',
        provinsi: String(provinsi).trim(),
        kabupaten: String(kabupaten).trim(),
        kecamatan: String(kecamatan).trim(),
        desa: String(desa).trim(),
        alamat_lengkap: String(alamat_lengkap).trim(),
        lat: Number(lat),
        lng: Number(lng),
        total_tagihan: 0,
        status: 'pending_payment'
      })
      .select()

    if (error) throw error

    res.status(201).json({
      success: true,
      message: '✅ Order kustom berhasil disimpan!',
      data: data[0]
    })
  } catch (err) {
    console.error('Error POST /api/admin/custom-order:', err.message)
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan order kustom.'
    })
  }
})


// ─────────────────────────────────────────────
// PUT /api/admin/custom-orders/:id/status
// Update status order kustom
// ─────────────────────────────────────────────
router.put('/custom-orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status || !ALLOWED_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Gunakan salah satu dari: ${ALLOWED_ORDER_STATUSES.join(', ')}`
      })
    }

    const { error } = await supabase
      .from('custom_orders')
      .update({ status })
      .eq('id', id)

    if (error) throw error

    if (['paid', 'processing', 'shipped', 'completed'].includes(status)) {
      await supabase
        .from('payments')
        .update({ status_verifikasi: true })
        .eq('order_id', id)
    }

    res.json({
      success: true,
      message: `Status order kustom berhasil diubah menjadi "${status}".`
    })
  } catch (err) {
    console.error('Error PUT /api/admin/custom-orders/:id/status:', err.message)
    res.status(500).json({
      success: false,
      message: 'Gagal mengubah status.'
    })
  }
})


// ─────────────────────────────────────────────
// PUT /api/admin/custom-orders/:id/price
// Update harga/total tagihan order kustom
// ─────────────────────────────────────────────
router.put('/custom-orders/:id/price', async (req, res) => {
  try {
    const { id } = req.params
    const parsedPrice = Number(String(req.body.total_tagihan || '').replace(/[^0-9]/g, ''))

    if (!Number.isSafeInteger(parsedPrice) || parsedPrice < 0 || parsedPrice > 100000000000) {
      return res.status(400).json({
        success: false,
        message: 'Nominal harga tidak valid.'
      })
    }

    const { error } = await supabase
      .from('custom_orders')
      .update({ total_tagihan: parsedPrice })
      .eq('id', id)

    if (error) throw error

    res.json({
      success: true,
      message: 'Harga berhasil diperbarui.'
    })
  } catch (err) {
    console.error('Error PUT /api/admin/custom-orders/:id/price:', err.message)
    res.status(500).json({
      success: false,
      message: 'Gagal mengubah harga.'
    })
  }
})

module.exports = router
