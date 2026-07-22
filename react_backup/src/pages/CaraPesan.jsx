import TopBar from '../components/TopBar'
import Navbar from '../components/Navbar'
import CTASection from '../components/CTASection'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

const steps = [
  {
    number: '01',
    title: 'Pilih Produk',
    desc: 'Jelajahi katalog produk kerajinan batu kami. Gunakan filter kategori dan rentang harga untuk menemukan produk yang sesuai kebutuhan Anda.',
    detail: ['Buka halaman Katalog', 'Pilih kategori (Alat Dapur, Interior, Eksterior, dll)', 'Klik produk untuk melihat detail lengkap', 'Pilih ukuran yang diinginkan'],
  },
  {
    number: '02',
    title: 'Masukkan Keranjang',
    desc: 'Setelah menemukan produk yang Anda inginkan, pilih ukuran dan jumlah, lalu klik tombol "Masukkan Keranjang".',
    detail: ['Pilih ukuran produk (Kecil/Sedang/Besar/Extra Besar)', 'Tentukan jumlah yang diinginkan', 'Klik tombol hijau "Masukkan Keranjang"', 'Lanjutkan belanja atau langsung checkout'],
  },
  {
    number: '03',
    title: 'Checkout & Pembayaran',
    desc: 'Di halaman keranjang, periksa kembali pesanan Anda lalu klik Checkout. Anda akan diarahkan untuk mengisi data pengiriman dan memilih metode pembayaran.',
    detail: ['Cek kembali item di keranjang', 'Klik tombol Checkout', 'Isi alamat pengiriman lengkap', 'Pilih metode pembayaran (Transfer Bank / COD / E-wallet)'],
  },
  {
    number: '04',
    title: 'Konfirmasi Pembayaran',
    desc: 'Setelah melakukan pembayaran, segera lakukan konfirmasi melalui halaman Konfirmasi Pembayaran agar pesanan Anda diproses lebih cepat.',
    detail: ['Lakukan transfer sesuai nominal', 'Screenshot bukti transfer', 'Upload bukti di halaman Konfirmasi Pembayaran', 'Tunggu konfirmasi dari kami (max 1x24 jam)'],
  },
  {
    number: '05',
    title: 'Pengiriman',
    desc: 'Pesanan Anda akan dikemas dengan aman dan dikirim menggunakan jasa ekspedisi terpercaya. Kami akan mengirimkan nomor resi setelah barang dikirim.',
    detail: ['Pengemasan aman menggunakan bubble wrap & kayu', 'Pengiriman via JNE / TIKI / SiCepat / J&T', 'Nomor resi dikirim via WhatsApp/Email', 'Estimasi tiba 2–5 hari kerja'],
  },
]

const paymentMethods = [
  { name: 'BCA', detail: '1234567890 a/n BATU MERAPI' },
  { name: 'BRI', detail: '0987654321 a/n BATU MERAPI' },
  { name: 'Mandiri', detail: '1122334455 a/n BATU MERAPI' },
  { name: 'GoPay / OVO', detail: '082112345678' },
  { name: 'COD', detail: 'Tersedia untuk area Wonosobo & sekitarnya' },
]

const faqs = [
  { q: 'Apakah produk bisa custom ukuran?', a: 'Ya, kami melayani custom ukuran dengan waktu produksi 7–14 hari kerja. Hubungi kami via WhatsApp untuk informasi lebih lanjut.' },
  { q: 'Bagaimana jika produk rusak saat pengiriman?', a: 'Semua produk dikemas dengan sangat aman. Jika terjadi kerusakan, dokumentasikan dan hubungi kami dalam 2×24 jam. Kami akan segera menangani klaim Anda.' },
  { q: 'Apakah ada garansi produk?', a: 'Produk kami terbuat dari batu alam asli yang sangat tahan lama. Kami memberikan garansi kepuasan produk selama 7 hari setelah penerimaan.' },
  { q: 'Berapa lama waktu pengiriman?', a: 'Estimasi pengiriman 2–5 hari kerja untuk Pulau Jawa, 5–10 hari kerja untuk luar Jawa, setelah pembayaran dikonfirmasi.' },
]

export default function CaraPesan({ cartCount }) {
  return (
    <>
      <TopBar />
      <Navbar cartCount={cartCount} />

      {/* HERO */}
      <section style={{ background: 'var(--green-dark)', padding: '60px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 40, fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: 14 }}>
            Cara Pesan
          </h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 15, maxWidth: 520, margin: '0 auto' }}>
            Ikuti langkah-langkah mudah berikut untuk memesan kerajinan batu pilihan Anda. Proses cepat, aman, dan terpercaya.
          </p>
        </div>
      </section>

      {/* STEPS */}
      <section style={{ padding: '64px 0' }}>
        <div className="container">
          <div style={{ position: 'relative' }}>
            {/* Connector line */}
            <div style={{
              position: 'absolute', left: 31, top: 0, bottom: 0,
              width: 2, background: 'linear-gradient(to bottom, var(--green-primary), var(--green-accent))',
              zIndex: 0
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
              {steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 28, position: 'relative', zIndex: 1 }}>
                  {/* Number bubble */}
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%', background: 'var(--green-primary)',
                    color: '#fff', fontWeight: 900, fontSize: 18, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0, border: '4px solid #fff',
                    boxShadow: '0 0 0 2px var(--green-primary)'
                  }}>
                    {step.number}
                  </div>

                  {/* Content */}
                  <div style={{
                    flex: 1, background: '#fff', border: '1px solid var(--gray-mid)',
                    borderRadius: 'var(--radius-md)', padding: '24px 28px',
                    boxShadow: 'var(--shadow-sm)', marginTop: 4
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 20, fontWeight: 800 }}>{step.title}</h2>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14 }}>{step.desc}</p>
                    <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px' }}>
                      {step.detail.map((d, j) => (
                        <li key={j} style={{ fontSize: 13, color: 'var(--gray-dark)', display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                          <span style={{ color: 'var(--green-primary)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PAYMENT METHODS */}
      <section style={{ background: 'var(--off-white)', padding: '56px 0' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 32 }}>METODE PEMBAYARAN</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {paymentMethods.map((p, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid var(--gray-mid)', borderRadius: 'var(--radius-md)',
                padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16,
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-text)' }}>{p.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '56px 0' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 32 }}>PERTANYAAN UMUM</h2>
          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid var(--gray-mid)', borderRadius: 'var(--radius-md)',
                padding: '20px 24px', boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--green-primary)', fontWeight: 900 }}>Q</span>
                  {faq.q}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: 20 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Hubungi */}
      <section style={{ background: 'var(--off-white)', padding: '48px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 26, fontWeight: 800, marginBottom: 12 }}>Masih Ada Pertanyaan?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Tim kami siap membantu Anda melalui WhatsApp setiap hari pukul 08.00–21.00 WIB</p>
          <a
            href="https://wa.me/6287846725184"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: '#25D366', color: '#fff', padding: '13px 32px',
              borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: 15,
              textDecoration: 'none', transition: 'opacity .2s'
            }}
          >
            Chat via WhatsApp
          </a>
        </div>
      </section>

      <CTASection />
      <Footer />
    </>
  )
}
