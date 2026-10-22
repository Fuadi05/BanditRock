// ============================================
// routes/user-routes.js
// Endpoint publik untuk pembeli / customer
// ============================================

const crypto = require('crypto')
const express = require('express')
const multer = require('multer')
const supabase = require('../config/supabase')

const router = express.Router()

// Kolom produk yang aman diekspos ke publik (TIDAK menyertakan harga_max / Harga Modal HPP)
const PUBLIC_PRODUCT_COLUMNS = 'id, nama, kategori, harga_min, tipe_harga, deskripsi, deskripsi_singkat, ukuran, image_url, image_url_2, image_url_3, image_url_4, status_stok, is_active, created_at'

// Helper: samarkan nomor telepon untuk endpoint pelacakan publik
function maskPhone(phone) {
  const str = String(phone || '').trim()
  if (str.length <= 6) return str
  return str.slice(0, 4) + '****' + str.slice(-3)
}

// Konfigurasi multer: simpan file sementara di memori (buffer)
// sebelum di-upload ke Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Maks 5 MB
  fileFilter: (req, file, cb) => {
    // Hanya terima gambar (JPG, PNG, WEBP) dan PDF
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Format file tidak didukung. Gunakan JPG, PNG, WEBP, atau PDF.'))
    }
  }
})


// GET /api/settings/whatsapp
// Ambil nomor WhatsApp admin aktif untuk checkout
router.get('/settings/whatsapp', async (req, res) => {
  try {
    const { data: admins } = await supabase
      .from('admins')
      .select('username, whatsapp, avatar_url')
      .not('username', 'like', 'admin_disabled_%')
      .order('avatar_url', { ascending: false, nullsFirst: false })
      .limit(1)

    const admin = admins && admins.length > 0 ? admins[0] : null
    const wa = (admin && admin.whatsapp) ? admin.whatsapp : '6287846725184'
    res.json({ success: true, whatsapp: wa })
  } catch (err) {
    res.json({ success: true, whatsapp: '6287846725184' })
  }
})


// ─────────────────────────────────────────────
// GET /api/produk
// Menarik katalog produk aktif (opsional: filter kategori)
// Query params: ?kategori=Eksterior
// ─────────────────────────────────────────────
router.get('/produk', async (req, res) => {
  try {
    const { kategori } = req.query

    let query = supabase
      .from('products')
      .select(PUBLIC_PRODUCT_COLUMNS)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (kategori) {
      query = query.eq('kategori', String(kategori).trim())
    }

    const { data, error } = await query

    if (error) throw error

    res.json({
      success: true,
      count: data.length,
      data
    })
  } catch (err) {
    console.error('Error GET /api/produk:', err.message)
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data produk.'
    })
  }
})


// ─────────────────────────────────────────────
// GET /api/produk/:id
// Menarik detail spesifik satu produk publik
// ─────────────────────────────────────────────
router.get('/produk/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('products')
      .select(PUBLIC_PRODUCT_COLUMNS)
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan.'
      })
    }

    res.json({ success: true, data })
  } catch (err) {
    console.error('Error GET /api/produk/:id:', err.message)
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail produk.'
    })
  }
})


// ─────────────────────────────────────────────
// POST /api/order
// Membuat pesanan baru (Sesi 1 — Produk Pasti / Keranjang)
// ─────────────────────────────────────────────
router.post('/order', async (req, res) => {
  try {
    const {
      nama_pembeli,
      telepon,
      provinsi,
      kabupaten,
      kecamatan,
      desa,
      alamat_lengkap,
      items
    } = req.body

    const cleanNama = String(nama_pembeli || '').trim()
    const cleanTelepon = String(telepon || '').trim()

    // --- Validasi input ---
    if (!cleanNama || !cleanTelepon || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap. Diperlukan: nama_pembeli, telepon, dan items (array).'
      })
    }

    if (cleanNama.length > 150 || cleanTelepon.length > 25) {
      return res.status(400).json({
        success: false,
        message: 'Nama pembeli atau nomor telepon melebihi batas karakter.'
      })
    }

    // Validasi setiap item
    for (const item of items) {
      const qtyNum = Number(item.qty)
      if (!item.product_id || !Number.isInteger(qtyNum) || qtyNum < 1 || qtyNum > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Data item produk atau jumlah (qty) tidak valid.'
        })
      }
    }

    // --- Generate Order ID unik: BMA-YYYYMMDD-XXXX ---
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const randomDigits = String(crypto.randomInt(1000, 10000))
    const orderId = `BMA-${dateStr}-${randomDigits}`

    // --- Ambil harga katalog untuk setiap item ---
    const productIds = [...new Set(items.map(item => item.product_id))]

    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('id, harga_min, tipe_harga, is_active')
      .in('id', productIds)

    if (prodErr) throw prodErr

    const priceMap = {}
    products.forEach(p => {
      if (p.is_active !== false) {
        priceMap[p.id] = Number(p.harga_min) || 0
      }
    })

    // Hitung total tagihan dan siapkan data order_items
    let totalTagihan = 0
    const orderItemsData = items.map(item => {
      const hargaSatuan = priceMap[item.product_id]
      if (hargaSatuan === undefined) {
        throw new Error(`PRODUCT_NOT_FOUND:${item.product_id}`)
      }
      const qty = Number(item.qty)
      const subtotal = hargaSatuan * qty
      totalTagihan += subtotal

      return {
        order_id: orderId,
        product_id: item.product_id,
        qty,
        ukuran: String(item.ukuran || item.size || '').trim().slice(0, 100),
        harga_disepakati: hargaSatuan
      }
    })

    // --- Simpan order ke tabel orders ---
    const { error: orderErr } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        nama_pembeli: cleanNama,
        telepon: cleanTelepon,
        provinsi: provinsi ? String(provinsi).trim().slice(0, 100) : null,
        kabupaten: kabupaten ? String(kabupaten).trim().slice(0, 100) : null,
        kecamatan: kecamatan ? String(kecamatan).trim().slice(0, 100) : null,
        desa: desa ? String(desa).trim().slice(0, 100) : null,
        alamat_lengkap: alamat_lengkap ? String(alamat_lengkap).trim().slice(0, 500) : null,
        total_tagihan: totalTagihan,
        status: 'pending_payment'
      })

    if (orderErr) throw orderErr

    // --- Simpan detail item ke tabel order_items ---
    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert(orderItemsData)

    if (itemsErr) throw itemsErr

    res.status(201).json({
      success: true,
      message: '✅ Pesanan berhasil dibuat!',
      data: {
        order_id: orderId,
        nama_pembeli: cleanNama,
        telepon: cleanTelepon,
        total_tagihan: totalTagihan,
        jumlah_item: items.length,
        status: 'pending_payment'
      }
    })
  } catch (err) {
    if (err.message && err.message.startsWith('PRODUCT_NOT_FOUND:')) {
      return res.status(400).json({
        success: false,
        message: 'Salah satu produk di keranjang sudah tidak tersedia di katalog.'
      })
    }
    console.error('Error POST /api/order:', err.message)
    res.status(500).json({
      success: false,
      message: 'Gagal membuat pesanan.'
    })
  }
})


// ─────────────────────────────────────────────
// GET /api/order/search
// Mencari pesanan berdasarkan nomor telepon
// Query params: ?telepon=081234567890
// ─────────────────────────────────────────────
router.get('/order/search', async (req, res) => {
  try {
    const cleanTelepon = String(req.query.telepon || '').trim()

    if (!cleanTelepon || cleanTelepon.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Parameter "telepon" wajib diisi dengan nomor yang valid.'
      })
    }

    const { data: dataNormal, error: err1 } = await supabase
      .from('orders')
      .select('id, nama_pembeli, telepon, total_tagihan, status, created_at')
      .eq('telepon', cleanTelepon)
      .order('created_at', { ascending: false })

    if (err1) throw err1

    const { data: dataKustom, error: err2 } = await supabase
      .from('custom_orders')
      .select('id, nama_pembeli, telepon, total_tagihan, status, created_at')
      .eq('telepon', cleanTelepon)
      .order('created_at', { ascending: false })

    if (err2) throw err2

    const combinedData = [...(dataNormal || []), ...(dataKustom || [])]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(o => ({
        ...o,
        telepon: maskPhone(o.telepon)
      }))

    res.json({
      success: true,
      count: combinedData.length,
      data: combinedData
    })
  } catch (err) {
    console.error('Error GET /api/order/search:', err.message)
    res.status(500).json({
      success: false,
      message: 'Gagal mencari pesanan.'
    })
  }
})


// ─────────────────────────────────────────────
// GET /api/order/track/:id
// Lacak pesanan secara real-time berdasarkan Order ID
// ─────────────────────────────────────────────
router.get('/order/track/:id', async (req, res) => {
  try {
    const cleanId = String(req.params.id || '').trim().replace(/^#/, '')

    if (!cleanId) {
      return res.status(400).json({
        success: false,
        message: 'ID Pesanan tidak valid.'
      })
    }

    let order = null
    let error = null

    if (cleanId.startsWith('BMA-K-')) {
      const result = await supabase
        .from('custom_orders')
        .select('id, nama_pembeli, telepon, total_tagihan, status, created_at, nama_produk, deskripsi, provinsi, kabupaten, kecamatan, desa, alamat_lengkap')
        .eq('id', cleanId)
        .single()

      error = result.error
      if (result.data) {
        order = {
          ...result.data,
          telepon: maskPhone(result.data.telepon),
          status: result.data.status === 'pending' ? 'pending_payment' : result.data.status,
          order_items: [
            {
              qty: 1,
              ukuran: '',
              harga_disepakati: result.data.total_tagihan,
              products: {
                nama: `KUSTOM: ${result.data.nama_produk}`,
                image_url: null
              }
            }
          ]
        }
      }
    } else {
      const result = await supabase
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
            products ( nama, image_url )
          )
        `)
        .eq('id', cleanId)
        .single()

      error = result.error
      if (result.data) {
        order = {
          ...result.data,
          telepon: maskPhone(result.data.telepon)
        }
      }
    }

    if (error || !order) {
      return res.status(404).json({
        success: false,
        message: 'Pesanan tidak ditemukan. Periksa kembali nomor resi/order Anda.'
      })
    }

    res.json({
      success: true,
      data: order
    })
  } catch (err) {
    console.error('Track order error:', err.message)
    res.status(500).json({
      success: false,
      message: 'Gagal melacak pesanan.'
    })
  }
})


// ─────────────────────────────────────────────
// POST /api/pembayaran
// Upload bukti transfer dan catat konfirmasi pembayaran
// ─────────────────────────────────────────────
router.post('/pembayaran', upload.single('bukti'), async (req, res) => {
  try {
    const {
      order_id,
      nama_pengirim,
      bank_pengirim,
      no_rekening,
      tanggal_transfer,
      nominal,
      catatan,
      provinsi,
      kabupaten,
      kecamatan,
      desa,
      alamat_lengkap
    } = req.body
    const file = req.file

    // --- Validasi input dasar ---
    if (!order_id || !bank_pengirim || !nominal || !file) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap. Diperlukan: order_id, bank_pengirim, nominal, dan file bukti transfer.'
      })
    }

    const cleanOrderId = String(order_id).trim().replace(/^#/, '')
    const cleanNamaPengirim = nama_pengirim ? String(nama_pengirim).trim().slice(0, 150) : null
    const cleanBank = String(bank_pengirim).trim().slice(0, 100)
    const cleanNoRek = no_rekening ? String(no_rekening).trim().slice(0, 100) : null
    const cleanTanggal = (tanggal_transfer && /^\d{4}-\d{2}-\d{2}$/.test(String(tanggal_transfer).trim()))
      ? String(tanggal_transfer).trim()
      : null
    const cleanCatatan = catatan ? String(catatan).trim().slice(0, 1000) : null
    const parsedNominal = Number(String(nominal).replace(/[^0-9]/g, ''))

    // Validasi nominal SEBELUM upload file ke storage (mencegah error 22003 & orphan file)
    if (!Number.isSafeInteger(parsedNominal) || parsedNominal <= 0 || parsedNominal > 100000000000) {
      return res.status(400).json({
        success: false,
        message: 'Nominal transfer tidak valid. Pastikan Anda memasukkan angka nominal Rupiah yang benar (bukan nomor rekening).'
      })
    }

    // --- Cek apakah order tersebut ada & statusnya masih bisa dibayar ---
    const isCustomOrder = cleanOrderId.startsWith('BMA-K-')
    const tableToCheck = isCustomOrder ? 'custom_orders' : 'orders'

    const { data: order, error: orderErr } = await supabase
      .from(tableToCheck)
      .select('id, status, provinsi, kabupaten, kecamatan, desa, alamat_lengkap')
      .eq('id', cleanOrderId)
      .single()

    if (orderErr || !order) {
      return res.status(404).json({
        success: false,
        message: `Order dengan ID "${cleanOrderId}" tidak ditemukan.`
      })
    }

    // Cegah manipulasi status jika order sudah lunas/diproses/dikirim/selesai/dibatalkan
    const allowedPaymentStatuses = ['pending', 'pending_payment', 'waiting_verification']
    if (!allowedPaymentStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Pesanan "${cleanOrderId}" sudah berstatus "${order.status}" dan tidak memerlukan konfirmasi pembayaran baru.`
      })
    }

    const cleanAlamatInput = alamat_lengkap ? String(alamat_lengkap).trim().slice(0, 500) : ''
    if (!order.alamat_lengkap && !cleanAlamatInput) {
      return res.status(400).json({
        success: false,
        message: 'Alamat pengiriman untuk pesanan ini belum tercatat. Mohon isi kolom Alamat Pengiriman.'
      })
    }

    // Tentukan ekstensi file yang aman dari mimetype
    const mimeToExt = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'application/pdf': 'pdf'
    }
    const safeExt = mimeToExt[file.mimetype] || 'jpg'
    const fileName = `${cleanOrderId}_${Date.now()}.${safeExt}`

    // --- Upload file bukti ke Supabase Storage bucket "bukti-transfer" ---
    const { error: uploadErr } = await supabase.storage
      .from('bukti-transfer')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      })

    if (uploadErr) {
      console.error('Supabase storage upload error:', uploadErr.message)
      throw uploadErr
    }

    const { data: urlData } = supabase.storage
      .from('bukti-transfer')
      .getPublicUrl(fileName)

    const buktiUrl = urlData.publicUrl

    // --- Simpan data pembayaran lengkap ke tabel payments ---
    const { error: payErr } = await supabase
      .from('payments')
      .insert({
        order_id: cleanOrderId,
        nama_pengirim: cleanNamaPengirim,
        bank_pengirim: cleanBank,
        no_rekening: cleanNoRek,
        tanggal_transfer: cleanTanggal,
        nominal: parsedNominal,
        catatan: cleanCatatan,
        bukti_url: buktiUrl,
        status_verifikasi: false
      })

    if (payErr) {
      console.error('Supabase payments insert error:', payErr.message)
      // Hapus file dari storage jika insert database gagal agar tidak menjadi orphan file
      await supabase.storage.from('bukti-transfer').remove([fileName])
      throw payErr
    }

    // --- Ubah status order menjadi "waiting_verification" & perbarui alamat pengiriman jika diisi ---
    const orderUpdates = { status: 'waiting_verification' }
    if (cleanAlamatInput) orderUpdates.alamat_lengkap = cleanAlamatInput
    if (provinsi && String(provinsi).trim()) orderUpdates.provinsi = String(provinsi).trim().slice(0, 100)
    if (kabupaten && String(kabupaten).trim()) orderUpdates.kabupaten = String(kabupaten).trim().slice(0, 100)
    if (kecamatan && String(kecamatan).trim()) orderUpdates.kecamatan = String(kecamatan).trim().slice(0, 100)
    if (desa && String(desa).trim()) orderUpdates.desa = String(desa).trim().slice(0, 100)

    const { error: updateErr } = await supabase
      .from(tableToCheck)
      .update(orderUpdates)
      .eq('id', cleanOrderId)

    if (updateErr) {
      console.error(`Supabase ${tableToCheck} update error:`, updateErr.message)
      throw updateErr
    }

    res.status(201).json({
      success: true,
      message: '✅ Bukti pembayaran berhasil diupload! Silakan tunggu verifikasi admin (maks 1x24 jam).',
      data: {
        order_id: cleanOrderId,
        bank_pengirim: cleanBank,
        nominal: parsedNominal,
        bukti_url: buktiUrl,
        status: 'waiting_verification'
      }
    })
  } catch (err) {
    console.error('Gagal /api/pembayaran:', err.message)
    res.status(500).json({
      success: false,
      message: 'Gagal mengupload bukti pembayaran.'
    })
  }
})


module.exports = router
