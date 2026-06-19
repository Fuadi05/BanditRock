import TopBar from '../components/TopBar'
import Navbar from '../components/Navbar'
import CTASection from '../components/CTASection'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

const teamMembers = [
  { name: 'Budi Santoso', role: 'Founder & Master Craftsman', initial: 'B', color: '#2d6a4f' },
  { name: 'Sari Wulandari', role: 'Head of Operations', initial: 'S', color: '#1f4d38' },
  { name: 'Ahmad Fauzi', role: 'Lead Stone Carver', initial: 'A', color: '#40916c' },
  { name: 'Dewi Rahayu', role: 'Customer Relations', initial: 'D', color: '#52b788' },
]

const values = [
  { icon: '', title: 'Batu Alam Asli', desc: 'Semua produk kami terbuat dari batu alam pilihan, dipilih langsung dari sumbernya untuk memastikan kualitas terbaik.' },
  { icon: '', title: 'Pengrajin Lokal', desc: 'Kami bekerja sama dengan pengrajin lokal berpengalaman dari Wonosobo yang mewarisi teknik pahat tradisional turun-temurun.' },
  { icon: '', title: 'Ramah Lingkungan', desc: 'Proses produksi kami memperhatikan kelestarian lingkungan, menggunakan bahan batu yang diambil secara bertanggung jawab.' },
  { icon: '', title: 'Kualitas Terjamin', desc: 'Setiap produk melewati quality control ketat sebelum dikirim ke pelanggan. Kepuasan Anda adalah prioritas kami.' },
]

const stats = [
  { number: '5.000+', label: 'Produk Terjual' },
  { number: '3.200+', label: 'Pelanggan Puas' },
  { number: '100+', label: 'Produk Tersedia' },
  { number: '8+', label: 'Tahun Pengalaman' },
]

const milestones = [
  { year: '2015', title: 'Awal Berdiri', desc: 'BATU MERAPI didirikan di Wonosobo dengan tim 3 pengrajin dan 12 produk perdana.' },
  { year: '2017', title: 'Ekspansi Online', desc: 'Mulai berjualan secara online, menjangkau pelanggan dari seluruh Indonesia.' },
  { year: '2019', title: 'Kolaborasi Pemkab', desc: 'Resmi bermitra dengan Pemerintah Kabupaten Wonosobo sebagai UMKM unggulan.' },
  { year: '2022', title: 'Ekspor Perdana', desc: 'Berhasil melakukan ekspor pertama ke Malaysia dan Singapura.' },
  { year: '2025', title: 'Platform Digital', desc: 'Meluncurkan platform e-commerce sendiri untuk pengalaman belanja yang lebih baik.' },
]

export default function TentangKami({ cartCount }) {
  return (
    <>
      <TopBar />
      <Navbar cartCount={cartCount} />

      {/* HERO */}
      <section style={{ background: 'var(--green-dark)', padding: '72px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 42, fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: 16, lineHeight: 1.1 }}>
            Tentang Batu Merapi
          </h1>
          <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 15, maxWidth: 580, margin: '0 auto', lineHeight: 1.7 }}>
            Kerajinan batu alam premium dari Wonosobo, Jawa Tengah. Kami menggabungkan warisan
            seni pahat tradisional dengan sentuhan desain modern untuk menghadirkan produk yang memukau.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: '#fff', padding: '48px 0', borderBottom: '1px solid var(--gray-mid)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 38, fontWeight: 900, color: 'var(--green-primary)', lineHeight: 1 }}>{s.number}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-text)', marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CERITA KAMI */}
      <section style={{ padding: '64px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
            <div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 30, fontWeight: 900, textTransform: 'uppercase', marginBottom: 16, lineHeight: 1.2 }}>
                Cerita di Balik<br />Setiap Batu
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 14 }}>
                BATU MERAPI lahir dari kecintaan mendalam terhadap kekayaan alam dan seni ukir tradisional
                Jawa Tengah. Berawal dari sebuah bengkel kecil di kaki Gunung Merapi, kami memulai perjalanan
                untuk memperkenalkan keindahan kerajinan batu alam kepada dunia.
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
                Setiap produk yang kami hasilkan merupakan karya tangan pengrajin lokal yang berpengalaman,
                menggunakan teknik pahat yang telah diwariskan secara turun-temurun selama berabad-abad.
                Kami bangga menjadi jembatan antara seni tradisional dan kebutuhan modern.
              </p>
              <Link to="/katalog" className="btn-primary">Jelajahi Produk Kami →</Link>
            </div>
            <div style={{
              background: 'var(--gray-light)', borderRadius: 'var(--radius-lg)',
              aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 10, color: 'var(--gray-text)', overflow: 'hidden'
            }}>
              {/* Placeholder for about image */}
              <img src="/images/about-workshop.jpg" alt="Workshop"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
              />
              <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%', height: '100%', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span style={{ fontSize: 13 }}>Foto Workshop</span>
                <span style={{ fontSize: 11, color: '#bbb' }}>/images/about-workshop.jpg</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NILAI KAMI */}
      <section style={{ background: 'var(--off-white)', padding: '64px 0' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 36 }}>NILAI-NILAI KAMI</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {values.map((v, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid var(--gray-mid)', borderRadius: 'var(--radius-md)',
                padding: '28px 22px', textAlign: 'center', boxShadow: 'var(--shadow-sm)',
                transition: 'transform .2s, box-shadow .2s'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
              >
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>{v.title}</div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section style={{ padding: '64px 0' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 40 }}>PERJALANAN KAMI</h2>
          <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative' }}>
            {/* Line */}
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: 'var(--gray-mid)', transform: 'translateX(-50%)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {milestones.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 24, alignItems: 'flex-start', justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end' }}>
                  {i % 2 === 0 ? (
                    <>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          background: '#fff', border: '1px solid var(--gray-mid)', borderRadius: 'var(--radius-md)',
                          padding: '16px 20px', boxShadow: 'var(--shadow-sm)', textAlign: 'right'
                        }}>
                          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{m.title}</div>
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{m.desc}</p>
                        </div>
                      </div>
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%', background: 'var(--green-primary)', color: '#fff',
                        fontWeight: 900, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, zIndex: 1, border: '3px solid #fff', boxShadow: '0 0 0 2px var(--green-primary)'
                      }}>{m.year}</div>
                      <div style={{ flex: 1 }} />
                    </>
                  ) : (
                    <>
                      <div style={{ flex: 1 }} />
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%', background: 'var(--green-medium)', color: '#fff',
                        fontWeight: 900, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, zIndex: 1, border: '3px solid #fff', boxShadow: '0 0 0 2px var(--green-medium)'
                      }}>{m.year}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          background: '#fff', border: '1px solid var(--gray-mid)', borderRadius: 'var(--radius-md)',
                          padding: '16px 20px', boxShadow: 'var(--shadow-sm)'
                        }}>
                          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{m.title}</div>
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{m.desc}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TIM KAMI */}
      <section style={{ background: 'var(--off-white)', padding: '64px 0' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 36 }}>TIM KAMI</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {teamMembers.map((t, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '28px 20px', textAlign: 'center', border: '1px solid var(--gray-mid)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', background: t.color, color: '#fff',
                  fontWeight: 900, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px'
                }}>
                  {t.initial}
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 5 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-text)' }}>{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOKASI */}
      <section style={{ padding: '64px 0' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 32 }}>LOKASI KAMI</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {[
                  { title: 'Alamat', desc: 'Jl. Kerajinan Batu No. 12, Wonosobo, Jawa Tengah 56314' },
                  { title: 'Telepon', desc: '+62 812-3456-7890' },
                  { title: 'Email', desc: 'info@batumerapi.id' },
                  { title: 'Jam Operasional', desc: 'Senin–Sabtu: 08.00–17.00 WIB' },
                ].map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{c.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Map placeholder */}
            <div style={{
              background: 'var(--gray-light)', borderRadius: 'var(--radius-md)', height: 280,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
              gap: 10, color: 'var(--gray-text)', border: '1px solid var(--gray-mid)'
            }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Google Maps</span>
              <span style={{ fontSize: 11, color: '#bbb' }}>Embed peta di sini</span>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </>
  )
}
