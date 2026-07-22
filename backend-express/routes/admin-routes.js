// ============================================
// routes/admin-routes.js
// Endpoint khusus admin (dilindungi JWT)
// ============================================

const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const supabase = require('../config/supabase')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Hanya format JPG dan PNG yang diperbolehkan.'));
  }
});
const verifyToken = require('../middleware/auth')

const router = express.Router()


// ─────────────────────────────────────────────
// POST /api/admin/login
// Verifikasi kredensial admin → return token JWT
// ─────────────────────────────────────────────
// Body JSON:
// { "username": "admin", "password": "admin123" }
//
// ⚠️  Endpoint ini TIDAK memerlukan token (publik).
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password wajib diisi.'
      })
    }

    // Cari admin di database berdasarkan username
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !admin) {
      return res.status(401).json({
        success: false,
        message: '⛔ Username atau password salah.'
      })
    }

    // Bandingkan password dengan hash di database
    const isMatch = await bcrypt.compare(password, admin.password_hash)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '⛔ Username atau password salah.'
      })
    }

    // Generate token JWT (berlaku 24 jam)
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
    res.status(500).json({
      success: false,
      message: 'Gagal login.',
      error: err.message
    })
  }
})


// ═════════════════════════════════════════════
// Semua endpoint di bawah ini MEMERLUKAN TOKEN
// ═════════════════════════════════════════════
router.use(verifyToken)


// ─────────────────────────────────────────────
// POST /api/admin/upload
// Endpoint untuk mengunggah gambar produk
// ─────────────────────────────────────────────
router.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah.' });
  }
  
  try {
    const fileExt = req.file.originalname.split('.').pop()
    const fileName = `product_${Date.now()}.${fileExt}`
    const filePath = `products/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase
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

    res.json({ success: true, url: publicUrlData.publicUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal upload', error: err.message });
  }
})


// ─────────────────────────────────────────────
// POST /api/admin/produk
// Menambahkan produk baru ke katalog
// ─────────────────────────────────────────────
router.post('/produk', async (req, res) => {
  try {
    const { nama, kategori, harga_min, harga_max, tipe_harga, deskripsi, deskripsi_singkat, ukuran, image_url, image_url_2, image_url_3, image_url_4, status_stok } = req.body

    if (!nama || !kategori || harga_min === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap. Diperlukan: nama, kategori, harga_min.'
      })
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        nama,
        kategori,
        harga_min: harga_min || 0,
        harga_max: harga_max || harga_min || 0,
        tipe_harga: tipe_harga || 'fixed',
        deskripsi: deskripsi || '',
        deskripsi_singkat: deskripsi_singkat || '',
        ukuran: ukuran || '',
        image_url: image_url || '',
        image_url_2: image_url_2 || '',
        image_url_3: image_url_3 || '',
        image_url_4: image_url_4 || '',
        status_stok: status_stok || 'ready'
      })
      .select()

    if (error) throw error

    res.status(201).json({
      success: true,
      message: '✅ Produk berhasil ditambahkan!',
      data: data[0]
    })
  } catch (err) {
    console.error('Supabase Insert Error:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan produk.',
      error: err.message
    })
  }
})


// ─────────────────────────────────────────────
// PUT /api/admin/produk/:id
// Update data produk
// ─────────────────────────────────────────────
router.put('/produk/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

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
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui produk.',
      error: err.message
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
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus produk.',
      error: err.message
    })
  }
})


// ─────────────────────────────────────────────
// GET /api/admin/orders
// Mengambil seluruh pesanan (semua status)
// ─────────────────────────────────────────────
router.get('/orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        nama_pembeli,
        telepon,
        total_tagihan,
        status,
        created_at,
        order_items (
          qty,
          harga_disepakati,
          products ( nama )
        ),
        payments (
          id,
          bank_pengirim,
          nominal,
          bukti_url,
          status_verifikasi,
          created_at
        )
      `)
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
      message: 'Gagal mengambil data pesanan.',
      error: err.message
    })
  }
})

// ─────────────────────────────────────────────
// PUT /api/admin/orders/:id/status
// Update status pesanan (pending_payment, waiting_verification, paid, processing, shipped, cancelled)
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

    if (error) {
      if (error.code === '23514') {
        return res.status(400).json({
          success: false,
          message: `Aturan database (orders_status_check) membatasi status ini. Jalankan SQL update di Supabase SQL Editor.`
        })
      }
      throw error
    }

    res.json({
      success: true,
      message: `Status order "${id}" berhasil diubah menjadi "${status}".`
    })
  } catch (err) {
    console.error('Update order status error:', err)
    res.status(500).json({
      success: false,
      message: 'Gagal mengubah status pesanan.',
      error: err.message
    })
  }
})


// ─────────────────────────────────────────────
// POST /api/admin/order
// Input pesanan manual dari admin (Sesi 2 & 3)
// ─────────────────────────────────────────────
// Digunakan untuk merekam pesanan hasil kesepakatan
// nego WhatsApp (Produk Range & Pre-order).
// Admin menentukan harga final per item (harga_disepakati).
//
// Body JSON:
// {
//   "nama_pembeli": "Siti Nurhaliza",
//   "telepon": "085678901234",
//   "items": [
//     { "product_id": "uuid-produk", "qty": 1, "harga_disepakati": 750000 }
//   ]
// }
router.post('/order', async (req, res) => {
  try {
    const { nama_pembeli, telepon, items } = req.body

    // --- Validasi input ---
    if (!nama_pembeli || !telepon || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap. Diperlukan: nama_pembeli, telepon, dan items (array dengan harga_disepakati).'
      })
    }

    // Pastikan setiap item memiliki harga_disepakati
    for (const item of items) {
      if (!item.product_id || !item.qty || !item.harga_disepakati) {
        return res.status(400).json({
          success: false,
          message: 'Setiap item harus memiliki: product_id, qty, dan harga_disepakati.'
        })
      }
    }

    // --- Generate Order ID unik: BMA-YYYYMMDD-XXX ---
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const randomDigits = String(Math.floor(100 + Math.random() * 900))
    const orderId = `BMA-${dateStr}-${randomDigits}`

    // --- Hitung total tagihan dari harga yang disepakati ---
    let totalTagihan = 0
    const orderItemsData = items.map(item => {
      totalTagihan += item.harga_disepakati * item.qty
      return {
        order_id: orderId,
        product_id: item.product_id,
        qty: item.qty,
        harga_disepakati: item.harga_disepakati
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
        status: 'pending_payment' // Menunggu pembayaran dari pelanggan
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
      message: `✅ Pesanan manual berhasil dicatat oleh admin!`,
      data: {
        order_id: orderId,
        nama_pembeli,
        telepon,
        total_tagihan: totalTagihan,
        jumlah_item: items.length,
        status: 'pending_payment',
        dicatat_oleh: req.admin.username // Dari token JWT
      }
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Gagal mencatat pesanan manual.',
      error: err.message
    })
  }
})


// ─────────────────────────────────────────────
// GET /api/admin/verifikasi
// Menampilkan antrean bukti transfer yang belum diverifikasi
// ─────────────────────────────────────────────
router.get('/verifikasi', async (req, res) => {
  try {
    // Ambil semua payment yang belum diverifikasi,
    // beserta data order terkait (nama pembeli, telepon, total)
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id,
        order_id,
        bank_pengirim,
        nominal,
        bukti_url,
        status_verifikasi,
        created_at,
        orders (
          nama_pembeli,
          telepon,
          total_tagihan,
          status
        )
      `)
      .eq('status_verifikasi', false)
      .order('created_at', { ascending: true }) // FIFO: yang paling lama di atas

    if (error) throw error

    res.json({
      success: true,
      count: data.length,
      message: data.length > 0
        ? `📋 Ada ${data.length} bukti transfer menunggu verifikasi.`
        : '✅ Tidak ada bukti transfer yang perlu diverifikasi.',
      data
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil antrean verifikasi.',
      error: err.message
    })
  }
})


// ─────────────────────────────────────────────
// PUT /api/admin/verifikasi/:id
// Checklist persetujuan/penolakan pembayaran
// ─────────────────────────────────────────────
// Body JSON:
// { "aksi": "approve" }   → Setujui → status order = paid
// { "aksi": "reject" }    → Tolak   → status order = cancelled
router.put('/verifikasi/:id', async (req, res) => {
  try {
    const { id } = req.params       // ID payment (bukan order)
    const { aksi } = req.body       // "approve" atau "reject"

    if (!aksi || !['approve', 'reject'].includes(aksi)) {
      return res.status(400).json({
        success: false,
        message: 'Aksi harus berisi "approve" atau "reject".'
      })
    }

    // --- Ambil data payment untuk mendapatkan order_id ---
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

    if (aksi === 'approve') {
      // ✅ APPROVE: Tandai pembayaran sebagai terverifikasi
      const { error: updatePayErr } = await supabase
        .from('payments')
        .update({ status_verifikasi: true })
        .eq('id', id)

      if (updatePayErr) throw updatePayErr

      // Ubah status order menjadi "paid" (lunas)
      const { error: updateOrderErr } = await supabase
        .from('orders')
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
      // ❌ REJECT: Tolak pembayaran
      // Status verifikasi tetap false, status order diubah ke "cancelled"
      const { error: updateOrderErr } = await supabase
        .from('orders')
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
    res.status(500).json({
      success: false,
      message: 'Gagal memproses verifikasi.',
      error: err.message
    })
  }
})


// ─────────────────────────────────────────────
// GET /api/admin/laporan
// Rekapan penjualan untuk grafik dashboard admin
// ─────────────────────────────────────────────
// Menarik semua transaksi berstatus "paid" (lunas).
// Opsional filter per bulan: ?bulan=2025-07
router.get('/laporan', async (req, res) => {
  try {
    const { bulan } = req.query // Format: "2025-07"

    // Query dasar: ambil order yang sudah lunas beserta detail item & produk
    let query = supabase
      .from('orders')
      .select(`
        id,
        nama_pembeli,
        telepon,
        total_tagihan,
        status,
        created_at,
        order_items (
          qty,
          harga_disepakati,
          products (
            nama,
            kategori
          )
        )
      `)
      .in('status', ['paid', 'processing', 'shipped', 'completed'])
      .order('created_at', { ascending: false })

    // Filter berdasarkan bulan jika diberikan
    if (bulan) {
      // bulan format "2025-07" → start: "2025-07-01", end: "2025-08-01"
      const [year, month] = bulan.split('-').map(Number)
      const startDate = new Date(year, month - 1, 1).toISOString()
      const endDate = new Date(year, month, 1).toISOString()

      query = query
        .gte('created_at', startDate)
        .lt('created_at', endDate)
    }

    const { data, error } = await query

    if (error) throw error

    // --- Hitung ringkasan statistik ---
    const totalPendapatan = data.reduce((sum, order) => sum + order.total_tagihan, 0)
    const totalTransaksi = data.length

    res.json({
      success: true,
      message: `📊 Laporan penjualan${bulan ? ` bulan ${bulan}` : ''}: ${totalTransaksi} transaksi lunas.`,
      ringkasan: {
        total_transaksi: totalTransaksi,
        total_pendapatan: totalPendapatan,
        periode: bulan || 'Seluruh waktu'
      },
      data
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil laporan penjualan.',
      error: err.message
    })
  }
})


// ─────────────────────────────────────────────
// GET /api/admin/profile
// Ambil profil admin yang sedang login
// ─────────────────────────────────────────────
router.get('/profile', async (req, res) => {
  try {
    const adminId = req.admin.id;

    let { data: admin, error } = await supabase
      .from('admins')
      .select('id, username, whatsapp')
      .eq('id', adminId)
      .single();

    if (error && error.code === 'PGRST204') {
      const { data: fallback } = await supabase
        .from('admins')
        .select('id, username')
        .eq('id', adminId)
        .single();
      admin = { ...fallback, whatsapp: '6287846725184' };
    }

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin tidak ditemukan.' });
    }

    res.json({
      success: true,
      data: {
        id: admin.id,
        username: admin.username,
        whatsapp: admin.whatsapp || '6287846725184'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil profil admin.' });
  }
});

// ─────────────────────────────────────────────
// PUT /api/admin/profile
// Update akun admin yang sedang login (hanya 1 akun aktif yang diubah)
// ─────────────────────────────────────────────
router.put('/profile', async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { username, whatsapp, password } = req.body;

    const updates = {};
    if (username) updates.username = username.trim();
    if (password) {
      updates.password_hash = await bcrypt.hash(password, 10);
    }
    if (whatsapp) {
      updates.whatsapp = whatsapp.trim();
    }

    let { data: updatedAdmin, error } = await supabase
      .from('admins')
      .update(updates)
      .eq('id', adminId)
      .select('id, username')
      .single();

    if (error && error.code === 'PGRST204' && updates.whatsapp) {
      delete updates.whatsapp;
      const { data: retryData, error: retryErr } = await supabase
        .from('admins')
        .update(updates)
        .eq('id', adminId)
        .select('id, username')
        .single();

      if (retryErr) throw retryErr;
      updatedAdmin = retryData;
    } else if (error) {
      throw error;
    }

    const newToken = jwt.sign(
      { id: updatedAdmin.id, username: updatedAdmin.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: '✅ Profil akun admin berhasil diperbarui!',
      data: {
        token: newToken,
        admin: {
          id: updatedAdmin.id,
          username: updatedAdmin.username,
          whatsapp: whatsapp || '6287846725184'
        }
      }
    });
  } catch (err) {
    console.error('Error updating admin profile:', err);
    res.status(500).json({ success: false, message: 'Gagal mengupdate profil admin.', error: err.message });
  }
});

module.exports = router
