import { useState } from 'react'
import TopBar from '../components/TopBar'
import Navbar from '../components/Navbar'
import CTASection from '../components/CTASection'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { Link } from 'react-router-dom'
import { products, categories } from '../data/products'
import LacakPesananModal from '../components/LacakPesananModal'

const newProducts = products.slice(0, 4)
// Choose products that have high ratings or are marked as best seller
const bestSeller = products.slice(4, 8)



function ImgOrPh({ src, alt, className, style }) {
  return src
    ? <img src={src} alt={alt} className={className} style={style} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
    : <div className={className || 'hero-img-ph'} style={style}>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <span style={{ fontSize: 12, color: '#bbb' }}>{alt}</span>
    </div>
}

export default function Home({ cartCount }) {
  const [isLacakOpen, setIsLacakOpen] = useState(false)
  const [lacakOrderId, setLacakOrderId] = useState('')

  return (
    <>
      <TopBar />
      <Navbar cartCount={cartCount} />

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-content">
            <h1 className="hero-title" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              TEMUKAN<br />KERAJINAN BATU<br />FAVORITMU
            </h1>
            <p className="hero-desc" style={{ maxWidth: '500px' }}>
              Koleksi wastafel, cobek estetik, hingga dekorasi taman berkualitas tinggi yang dikerjakan langsung oleh pengrajin ahli untuk hunian premium Anda.
            </p>
            <div className="hero-buttons">
              <Link to="/katalog" className="btn-primary" style={{ background: '#0f5132', borderRadius: '9999px', padding: '12px 28px' }}>Belanja Sekarang</Link>
              <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ background: '#0f5132', borderRadius: '9999px', padding: '12px 28px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '2px' }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Hubungi
              </a>
            </div>
          </div>
          <div className="hero-image">
            <ImgOrPh src="/images/hero_stone_1780322879376.png" alt="Hero Stone Craft" />
          </div>
        </div>
      </section>

      {/* PARTNER STRIP */}
      <div className="partner-strip" style={{ background: '#064e3b' }}>
        <div className="partner-track">
          {Array.from({ length: 40 }).map((_, repeatIdx) => (
            <span key={repeatIdx} style={{ display: 'flex', gap: '32px' }}>
              <div className="partner-badge" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/images/logo-pemkab.png" alt="Logo Pemkab Wonosobo" style={{ height: '32px', width: 'auto', maxWidth: 'none', objectFit: 'contain' }} />
              </div>
              <div className="partner-badge" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/images/logo-geopark.png" alt="Logo Geopark Dieng" style={{ height: '32px', width: 'auto', maxWidth: 'none', objectFit: 'contain' }} />
              </div>
            </span>
          ))}
        </div>
      </div>

      {/* LACAK PESANAN */}
      <section style={{ padding: '56px 0', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '640px' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', fontWeight: '800', color: 'var(--green-dark)', marginBottom: '8px', textTransform: 'uppercase' }}>
            Lacak Pesanan Anda
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
            Masukkan nomor order Anda untuk memantau status pembuatan dan pengiriman produk batu alam Anda secara real-time.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const orderId = e.target.orderId.value.trim()
              if (orderId) {
                setLacakOrderId(orderId)
                setIsLacakOpen(true)
              }
            }}
            style={{ display: 'flex', gap: '8px', background: '#fff', padding: '6px', borderRadius: '10px', boxShadow: 'var(--shadow-sm)', border: '1px solid #cbd5e1' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, paddingLeft: '10px' }}>
              <span style={{ color: '#94a3b8', fontSize: '16px' }}>🔍</span>
              <input
                name="orderId"
                required
                placeholder="Masukkan nomor order Anda... (Contoh: BM-2025-001)"
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: 'var(--text-primary)' }}
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ background: '#0f5132', padding: '10px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}
            >
              Lacak Pesanan
            </button>
          </form>
        </div>
      </section>

      {/* PRODUK BARU */}
      <section className="home-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">PRODUK BARU</h2>
            <Link to="/katalog?kategori=" className="section-link" style={{ color: '#0f5132' }}>Lihat Semua →</Link>
          </div>
          <div className="product-grid">
            {newProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* TERLARIS */}
      <section className="home-section gray-bg" style={{ background: '#f7f7f7' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">TERLARIS</h2>
            <Link to="/katalog?sort=Rating+Tertinggi" className="section-link" style={{ color: '#0f5132' }}>Lihat Semua →</Link>
          </div>
          <div className="product-grid">
            {bestSeller.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* KATEGORI */}
      <section className="home-section">
        <div className="container">
          <div className="section-header" style={{ marginBottom: '32px' }}>
            <h2 className="section-title" style={{ textAlign: 'center', flex: 1 }}>KATEGORI</h2>
          </div>
          <div className="category-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {categories.map(cat => (
              <Link to={`/katalog?kategori=${encodeURIComponent(cat.name)}`} key={cat.id} className="cat-card">
                {cat.image
                  ? <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div className="cat-card-ph">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                }
                <div className="cat-label" style={{ background: 'linear-gradient(to top, rgba(15, 81, 50, 0.8) 10%, transparent 100%)' }}>
                  <span style={{ fontSize: '16px', fontWeight: '800' }}>{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      <CTASection />
      <Footer />
      <LacakPesananModal isOpen={isLacakOpen} onClose={() => setIsLacakOpen(false)} initialOrderId={lacakOrderId} />
    </>
  )
}
