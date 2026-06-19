import { useState, useMemo } from 'react'


export default function CheckoutModals({
  isOpen,
  onClose,
  totalAmount,
  cartItems = [],
  onPaymentSuccess
}) {
  const [step, setStep] = useState(1) // 1: Shipping Details, 2: Payment Instructions, 3: Success Checkmark
  const [copiedText, setCopiedText] = useState('')

  // Shipping Form State
  const [shippingData, setShippingData] = useState({
    nama: '',
    telepon: '',
    provinsi: 'Jawa Tengah',
    kabupaten: 'Wonosobo',
    kecamatan: '',
    kelurahan: '',
    alamat: '',
    koordinat: ''
  })

  // Mock interactive map coordinate state
  const [mapPin, setMapPin] = useState(null) // { x, y, lat, lng }

  // Dynamic 3-digit code
  const uniqueCode = useMemo(() => {
    return Math.floor(100 + Math.random() * 900)
  }, [])

  const finalTotalAmount = totalAmount + uniqueCode

  if (!isOpen) return null

  // Copy to clipboard helper
  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopiedText(type)
    setTimeout(() => setCopiedText(''), 2000)
  }

  // Invoice generator — opens styled HTML in new tab, triggers browser Print-to-PDF
  const handleDownloadInvoice = () => {
    const invoiceNo = `BM-${Date.now().toString().slice(-6)}`
    const now = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })

    const itemsHtml = cartItems.map((item, idx) => `
      <tr>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;color:#374151;">${idx + 1}. ${item.name}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;color:#6b7280;text-align:center;">${item.size}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;color:#6b7280;text-align:center;">${item.qty}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;color:#374151;text-align:right;">Rp ${(item.price).toLocaleString('id-ID')}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-weight:700;color:#064e3b;text-align:right;">Rp ${(item.price * item.qty).toLocaleString('id-ID')}</td>
      </tr>`).join('')

    const subtotalVal = totalAmount

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${invoiceNo} - Batu Merapi</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Outfit',sans-serif;background:#f8fafc;color:#1e293b;padding:40px 24px}
    .page{max-width:720px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)}
    .header{background:linear-gradient(135deg,#064e3b,#0f5132);color:#fff;padding:36px 40px;display:flex;justify-content:space-between;align-items:flex-start}
    .brand{font-size:28px;font-weight:900;letter-spacing:2px}
    .brand-sub{font-size:11px;opacity:.75;letter-spacing:1px;margin-top:4px}
    .inv-meta{text-align:right;font-size:12px;opacity:.85;line-height:1.8}
    .inv-meta strong{font-size:18px;font-weight:900;display:block;margin-bottom:4px}
    .body{padding:36px 40px}
    .section-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;margin-bottom:12px}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px;padding:20px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0}
    .info-block label{font-size:10px;font-weight:600;color:#94a3b8;text-transform:uppercase;display:block;margin-bottom:3px}
    .info-block span{font-size:13px;font-weight:600;color:#1e293b}
    table{width:100%;border-collapse:collapse;margin-bottom:24px}
    thead tr{background:#f1f5f9}
    thead th{padding:10px 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;text-align:left}
    thead th:nth-child(3),thead th:nth-child(4),thead th:nth-child(5){text-align:center}
    thead th:nth-child(4),thead th:nth-child(5){text-align:right}
    .summary{margin-left:auto;width:280px}
    .sum-row{display:flex;justify-content:space-between;padding:7px 0;font-size:13px;border-bottom:1px solid #f1f5f9}
    .sum-row.total{border-top:2px solid #064e3b;border-bottom:none;padding-top:12px;font-size:16px;font-weight:900;color:#064e3b}
    .banks{margin-top:28px;padding:20px;background:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0}
    .banks-title{font-size:12px;font-weight:700;color:#064e3b;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px}
    .bank-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #d1fae5}
    .bank-row:last-child{border-bottom:none}
    .bank-name{font-size:13px;font-weight:700;color:#1e293b}
    .bank-num{font-family:monospace;font-size:15px;font-weight:700;color:#064e3b}
    .note{margin-top:20px;font-size:11px;color:#64748b;line-height:1.7;padding:14px;background:#fffbeb;border-radius:8px;border-left:4px solid #f59e0b}
    .footer-bar{background:#064e3b;color:#fff;text-align:center;font-size:11px;padding:16px;opacity:.9;letter-spacing:.5px}
    @media print{body{background:#fff;padding:0}.page{box-shadow:none;border-radius:0}}
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>
        <div class="brand">BATU MERAPI</div>
        <div class="brand-sub">KERAJINAN BATU PREMIUM — WONOSOBO</div>
      </div>
      <div class="inv-meta">
        <strong>INVOICE</strong>
        No: ${invoiceNo}<br/>
        Tanggal: ${now}
      </div>
    </div>

    <div class="body">
      <div class="section-title">Detail Penerima</div>
      <div class="info-grid">
        <div class="info-block"><label>Nama Pembeli</label><span>${shippingData.nama || '-'}</span></div>
        <div class="info-block"><label>No. Telepon</label><span>${shippingData.telepon || '-'}</span></div>
        <div class="info-block"><label>Provinsi</label><span>${shippingData.provinsi}</span></div>
        <div class="info-block"><label>Kabupaten/Kota</label><span>${shippingData.kabupaten}</span></div>
        <div class="info-block"><label>Kecamatan</label><span>${shippingData.kecamatan || '-'}</span></div>
        <div class="info-block"><label>Desa/Kelurahan</label><span>${shippingData.kelurahan || '-'}</span></div>
        <div class="info-block" style="grid-column:1/-1"><label>Alamat Lengkap</label><span>${shippingData.alamat || '-'}</span></div>
        ${shippingData.koordinat ? `<div class="info-block" style="grid-column:1/-1"><label>Koordinat Peta</label><span>📍 ${shippingData.koordinat}</span></div>` : ''}
      </div>

      <div class="section-title">Daftar Produk</div>
      <table>
        <thead>
          <tr>
            <th>Produk</th><th style="text-align:center">Ukuran</th>
            <th style="text-align:center">Qty</th>
            <th style="text-align:right">Harga Satuan</th>
            <th style="text-align:right">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <div class="summary">
        <div class="sum-row"><span>Subtotal Produk</span><span>Rp ${subtotalVal.toLocaleString('id-ID')}</span></div>
        <div class="sum-row"><span>Kode Unik</span><span>+ Rp ${uniqueCode}</span></div>
        <div class="sum-row total"><span>TOTAL TAGIHAN</span><span>Rp ${finalTotalAmount.toLocaleString('id-ID')}</span></div>
      </div>

      <div class="banks">
        <div class="banks-title">📤 Transfer Pembayaran Ke:</div>
        <div class="bank-row">
          <div>
            <div class="bank-name">🏦 Bank Central Asia (BCA)</div>
            <div style="font-size:11px;color:#6b7280">a/n PAYMENT SYSTEMS INC</div>
          </div>
          <div class="bank-num">1234 5678 90</div>
        </div>
        <div class="bank-row">
          <div>
            <div class="bank-name">🏦 Bank Rakyat Indonesia (BRI)</div>
            <div style="font-size:11px;color:#6b7280">a/n PAYMENT SYSTEMS INC</div>
          </div>
          <div class="bank-num">1234 5678 90</div>
        </div>
      </div>

      <div class="note">
        ⚠️ Mohon transfer sesuai nominal <strong>hingga 3 digit terakhir (Rp ${uniqueCode})</strong> agar pembayaran dapat diverifikasi oleh admin. Kode unik ini akan disumbangkan kepada pengrajin lokal.
      </div>
    </div>

    <div class="footer-bar">Terima kasih telah berbelanja di Batu Merapi • batumerapi.co.id</div>
  </div>

  <script>window.onload = () => { window.print() }<\/script>
</body>
</html>`

    const win = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
  }

  // Handle map click
  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Wonosobo latitude is roughly -7.35, longitude is roughly 109.90
    const lat = (-7.3562 - (y - 100) * 0.0005).toFixed(6)
    const lng = (109.9024 + (x - 150) * 0.0005).toFixed(6)

    setMapPin({ x, y, lat, lng })
    setShippingData(prev => ({
      ...prev,
      koordinat: `${lat}, ${lng}`,
      kecamatan: prev.kecamatan || 'Kejajar',
      kelurahan: prev.kelurahan || 'Dieng'
    }))
  }

  const handleShippingSubmit = (e) => {
    e.preventDefault()
    setStep(2)
  }

  const handleCheckoutFinished = () => {
    onPaymentSuccess()
    onClose()
    setStep(1)
    setMapPin(null)
    setShippingData({
      nama: '',
      telepon: '',
      provinsi: 'Jawa Tengah',
      kabupaten: 'Wonosobo',
      kecamatan: '',
      kelurahan: '',
      alamat: '',
      koordinat: ''
    })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px',
        width: '100%', maxWidth: step === 1 ? '540px' : '450px',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        position: 'relative', border: '1px solid #e2e8f0',
        transition: 'all 0.3s ease-in-out'
      }}>

        {/* Header (Only shown in Step 1) */}
        {step === 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, background: '#fff', zIndex: 10
          }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: '800', textTransform: 'uppercase', margin: 0 }}>
              Lengkapi Data Pengiriman
            </h2>
            <button
              onClick={onClose}
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center',
                background: '#f1f5f9', cursor: 'pointer', border: 'none', color: '#64748b', transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
              onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
            >
              ✕
            </button>
          </div>
        )}

        {/* STEP 1: SHIPPING DETAILS FORM */}
        {step === 1 && (
          <form onSubmit={handleShippingSubmit} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Nama Lengkap *</label>
                  <input
                    type="text" required
                    placeholder="Contoh: Budi Santoso"
                    value={shippingData.nama}
                    onChange={e => setShippingData({ ...shippingData, nama: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1',
                      borderRadius: '8px', fontSize: '13px', outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Nomor Telepon *</label>
                  <input
                    type="tel" required
                    placeholder="Contoh: 081234567890"
                    value={shippingData.telepon}
                    onChange={e => setShippingData({ ...shippingData, telepon: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1',
                      borderRadius: '8px', fontSize: '13px', outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Provinsi *</label>
                  <input
                    type="text" required
                    value={shippingData.provinsi}
                    onChange={e => setShippingData({ ...shippingData, provinsi: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1',
                      borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#f8fafc'
                    }}
                    readOnly
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Kabupaten/Kota *</label>
                  <input
                    type="text" required
                    value={shippingData.kabupaten}
                    onChange={e => setShippingData({ ...shippingData, kabupaten: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1',
                      borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#f8fafc'
                    }}
                    readOnly
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Kecamatan *</label>
                  <input
                    type="text" required
                    placeholder="Contoh: Kejajar"
                    value={shippingData.kecamatan}
                    onChange={e => setShippingData({ ...shippingData, kecamatan: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1',
                      borderRadius: '8px', fontSize: '13px', outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Desa/Kelurahan *</label>
                  <input
                    type="text" required
                    placeholder="Contoh: Dieng"
                    value={shippingData.kelurahan}
                    onChange={e => setShippingData({ ...shippingData, kelurahan: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1',
                      borderRadius: '8px', fontSize: '13px', outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Alamat Lengkap Pengiriman *</label>
                <textarea
                  required rows={2}
                  placeholder="Nama Jalan, Blok, No. Rumah, RT/RW"
                  value={shippingData.alamat}
                  onChange={e => setShippingData({ ...shippingData, alamat: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 14px', border: '1.5px solid #cbd5e1',
                    borderRadius: '8px', fontSize: '13px', outline: 'none', resize: 'vertical'
                  }}
                />
              </div>

              {/* MAP SELECTOR SECTION */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                  Pilih Lokasi di Peta (Wonosobo)
                </label>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                  Klik pada peta untuk menaruh pin koordinat pengiriman Anda secara presisi.
                </span>

                {/* Mock Map Canvas */}
                <div
                  onClick={handleMapClick}
                  style={{
                    height: '150px', background: '#e2f0d9', borderRadius: '8px',
                    position: 'relative', overflow: 'hidden', border: '1.5px solid #cbd5e1',
                    cursor: 'crosshair', backgroundImage: 'radial-gradient(#a3c293 20%, transparent 20%), radial-gradient(#a3c293 20%, transparent 20%)',
                    backgroundSize: '15px 15px', backgroundPosition: '0 0, 7.5px 7.5px'
                  }}
                >
                  {/* Mock roads */}
                  <div style={{ position: 'absolute', top: '40px', left: 0, right: 0, height: '8px', background: '#fff' }}></div>
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: '60%', width: '8px', background: '#fff' }}></div>

                  {/* Mock Lake */}
                  <div style={{
                    position: 'absolute', top: '65px', left: '20px', width: '50px', height: '40px',
                    borderRadius: '40% 60% 70% 30%', background: '#a0c4ff', opacity: 0.8
                  }}></div>

                  {/* Mock Label */}
                  <div style={{
                    position: 'absolute', top: '75px', left: '65%', background: '#064e3b',
                    color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px'
                  }}>
                    Wonosobo Town
                  </div>

                  {/* Red Pin Marker */}
                  {mapPin && (
                    <div style={{
                      position: 'absolute', left: `${mapPin.x - 12}px`, top: `${mapPin.y - 24}px`,
                      width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      pointerEvents: 'none'
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#ef4444" stroke="#b91c1c" />
                        <circle cx="12" cy="10" r="3" fill="#fff" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Coordinates Display */}
                {shippingData.koordinat && (
                  <div style={{
                    marginTop: '8px', padding: '8px 12px', background: '#f0fdf4',
                    border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '12px',
                    color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    <span>📍</span>
                    <span><strong>Pin diturunkan:</strong> {shippingData.koordinat} (Kec: {shippingData.kecamatan}, Desa: {shippingData.kelurahan})</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%', background: '#0f5132', color: '#fff', padding: '12px',
                borderRadius: '8px', fontWeight: '700', fontSize: '14px', marginTop: '24px',
                border: 'none', cursor: 'pointer', transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#1a3c2e'}
              onMouseLeave={e => e.currentTarget.style.background = '#0f5132'}
            >
              Lanjutkan ke Pembayaran →
            </button>
          </form>
        )}

        {/* STEP 2: WHATSAPP SIMULATION NOTIFICATION */}
        {step === 2 && (
          <div style={{ padding: '36px 24px', textAlign: 'center' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', background: '#dcfce7',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
            }}>
              <span style={{ fontSize: '42px', color: '#15803d' }}>💬</span>
            </div>

            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '20px', fontWeight: '900', color: '#1e293b', marginBottom: '12px', textTransform: 'uppercase' }}>
              Selesaikan Pemesanan di WhatsApp
            </h2>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.8', maxWidth: '340px', margin: '0 auto 24px' }}>
              Rincian pesanan Anda telah berhasil dibuat. Silakan periksa WhatsApp Anda untuk melihat pesan rincian pesanan yang dikirimkan oleh sistem kami.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', maxWidth: '320px', margin: '0 auto' }}>
              <button
                onClick={handleCheckoutFinished}
                style={{
                  width: '100%', background: '#0f5132', color: '#fff', border: 'none',
                  padding: '12px 32px', borderRadius: '8px', fontWeight: '700', fontSize: '14px',
                  cursor: 'pointer', transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#1a3c2e'}
                onMouseLeave={e => e.currentTarget.style.background = '#0f5132'}
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
