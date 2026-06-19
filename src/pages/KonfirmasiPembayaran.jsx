import { useState } from 'react'
import TopBar from '../components/TopBar'
import Navbar from '../components/Navbar'
import CTASection from '../components/CTASection'
import Footer from '../components/Footer'

export default function KonfirmasiPembayaran({ cartCount }) {
  const [form, setForm] = useState({
    nama: '', noOrder: '', bank: '', tanggal: '',
    nominal: '', noRek: '', catatan: '', bukti: null,
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = e => {
    const { name, value, files } = e.target
    setForm(f => ({ ...f, [name]: files ? files[0] : value }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    setSubmitted(true)
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', border: '1.5px solid var(--gray-mid)',
    borderRadius: 'var(--radius-sm)', fontSize: 14, color: 'var(--text-primary)',
    background: '#fff', fontFamily: 'Inter, sans-serif', outline: 'none',
    transition: 'border .2s'
  }
  const labelStyle = { fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }

  return (
    <>
      <TopBar />
      <Navbar cartCount={cartCount} />

      {/* HERO */}
      <section style={{ background: 'var(--green-dark)', padding: '56px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 38, fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: 12 }}>
            Konfirmasi Pembayaran
          </h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 14, maxWidth: 480, margin: '0 auto' }}>
            Setelah melakukan transfer, isi formulir di bawah ini agar pesanan Anda segera diproses oleh tim kami.
          </p>
        </div>
      </section>

      <section style={{ padding: '56px 0', background: 'var(--off-white)' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {submitted ? (
              <div style={{
                background: '#fff', border: '1px solid var(--gray-mid)', borderRadius: 'var(--radius-md)',
                padding: 48, textAlign: 'center', boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
                  Konfirmasi Diterima!
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, maxWidth: 380, margin: '0 auto 24px' }}>
                  Terima kasih, <strong>{form.nama}</strong>! Konfirmasi pembayaran Anda telah kami terima.
                  Tim kami akan memverifikasi dalam 1×24 jam dan menghubungi Anda.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-primary"
                  style={{ display: 'inline-flex' }}
                >
                  Submit Lagi
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{
                  background: '#fff', border: '1px solid var(--gray-mid)',
                  borderRadius: 'var(--radius-md)', padding: '32px 36px', boxShadow: 'var(--shadow-sm)'
                }}
              >
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 20, fontWeight: 800, marginBottom: 24, textTransform: 'uppercase' }}>
                  Formulir Konfirmasi
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 20px' }}>
                  {/* Nama */}
                  <div>
                    <label style={labelStyle}>Nama Lengkap *</label>
                    <input
                      name="nama" required value={form.nama} onChange={handleChange}
                      placeholder="Masukkan nama lengkap" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'var(--green-accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--gray-mid)'}
                    />
                  </div>

                  {/* No Order */}
                  <div>
                    <label style={labelStyle}>Nomor Order *</label>
                    <input
                      name="noOrder" required value={form.noOrder} onChange={handleChange}
                      placeholder="Contoh: BM-2025-001" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'var(--green-accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--gray-mid)'}
                    />
                  </div>

                  {/* Bank */}
                  <div>
                    <label style={labelStyle}>Bank Pengirim *</label>
                    <select
                      name="bank" required value={form.bank} onChange={handleChange}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      <option value="">Pilih bank pengirim</option>
                      <option>BCA</option>
                      <option>BRI</option>
                      <option>BNI</option>
                      <option>Mandiri</option>
                      <option>GoPay</option>
                      <option>OVO</option>
                      <option>Dana</option>
                      <option>Lainnya</option>
                    </select>
                  </div>

                  {/* Tanggal */}
                  <div>
                    <label style={labelStyle}>Tanggal Transfer *</label>
                    <input
                      type="date" name="tanggal" required value={form.tanggal} onChange={handleChange}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'var(--green-accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--gray-mid)'}
                    />
                  </div>

                  {/* Nominal */}
                  <div>
                    <label style={labelStyle}>Nominal Transfer *</label>
                    <input
                      name="nominal" required value={form.nominal} onChange={handleChange}
                      placeholder="Contoh: 999000" type="number" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'var(--green-accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--gray-mid)'}
                    />
                  </div>

                  {/* No Rekening Pengirim */}
                  <div>
                    <label style={labelStyle}>No. Rekening / No. HP Pengirim *</label>
                    <input
                      name="noRek" required value={form.noRek} onChange={handleChange}
                      placeholder="Contoh: 081234567890" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'var(--green-accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--gray-mid)'}
                    />
                  </div>

                  {/* Upload Bukti */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Bukti Transfer *</label>
                    <div style={{
                      border: '2px dashed var(--gray-mid)', borderRadius: 'var(--radius-sm)',
                      padding: '28px', textAlign: 'center', background: 'var(--off-white)',
                      transition: 'border .2s', cursor: 'pointer', position: 'relative'
                    }}>
                      <input
                        type="file" name="bukti" accept="image/*,.pdf" onChange={handleChange}
                        required style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                      />
                      {form.bukti ? (
                        <div>
                          <span style={{ fontSize: 32 }}>📎</span>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-primary)', marginTop: 6 }}>{form.bukti.name}</p>
                        </div>
                      ) : (
                        <div>
                          <span style={{ fontSize: 36 }}>📁</span>
                          <p style={{ fontSize: 14, color: 'var(--gray-text)', marginTop: 8 }}>
                            Klik atau drag file bukti transfer di sini
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--gray-text)', marginTop: 4 }}>
                            Format: JPG, PNG, PDF (Maks 5MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Catatan */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Catatan (opsional)</label>
                    <textarea
                      name="catatan" value={form.catatan} onChange={handleChange}
                      placeholder="Tuliskan catatan tambahan jika ada..."
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical' }}
                      onFocus={e => e.target.style.borderColor = 'var(--green-accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--gray-mid)'}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 24, padding: '14px' }}
                >
                  Kirim Konfirmasi Pembayaran →
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </>
  )
}
