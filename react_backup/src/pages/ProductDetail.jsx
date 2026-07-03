import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import TopBar from '../components/TopBar'
import Navbar from '../components/Navbar'
import CTASection from '../components/CTASection'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { Stars } from '../components/ProductCard'
import { products } from '../data/products'

const sizes = ['Kecil', 'Sedang', 'Besar', 'Ekstra Besar']

// Mock reviews data
const mockReviews = [
  { id: 1, name: 'Santri M.', rating: 5, date: '04 Juni 2026', text: 'Sangat halus pahatannya, dikemas dengan kayu sangat aman. Sangat cocok diletakkan di taman depan rumah.', verified: true },
  { id: 2, name: 'Rian H.', rating: 5, date: '28 Mei 2026', text: 'Berat dan mantap! Asli batu alam Gunung Merapi. Pelayanan tokonya sangat komunikatif, mantap.', verified: true },
  { id: 3, name: 'Siti Z.', rating: 4, date: '15 Mei 2026', text: 'Barang bagus sesuai pesanan. Hanya saja pengiriman ke luar kota agak lambat, tapi dimaklumi karena barangnya sangat berat.', verified: true }
]

function ThumbPh({ label }) {
  return (
    <div className="gallery-thumb-ph">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    </div>
  )
}

export default function ProductDetail({ cartCount, addToCart }) {
  const { id } = useParams()
  const product = products.find(p => p.id === id) || products[6] // default: Patung Buddha
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)

  const [activeThumb, setActiveThumb] = useState(0)
  const [activeSize, setActiveSize] = useState('Besar')
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('detail')
  const [reviewSort, setReviewSort] = useState('Terbaru')
  const [showToast, setShowToast] = useState(false)
  const [toastTimeoutId, setToastTimeoutId] = useState(null)

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutId) clearTimeout(toastTimeoutId)
    }
  }, [toastTimeoutId])

  const handleAddToCart = () => {
    addToCart(product, activeSize, qty)
    setShowToast(true)
    if (toastTimeoutId) {
      clearTimeout(toastTimeoutId)
    }
    const id = setTimeout(() => {
      setShowToast(false)
    }, 4000)
    setToastTimeoutId(id)
  }

  // Thumbnails — use main image and a few modified zooms/angles
  const thumbImages = [product.image, product.image, product.image, product.image]

  // Sort reviews logic
  const sortedReviews = [...mockReviews].sort((a, b) => {
    if (reviewSort === 'Rating Tertinggi') return b.rating - a.rating
    if (reviewSort === 'Rating Terendah') return a.rating - b.rating
    return b.id - a.id // Terbaru
  })

  return (
    <>
      <TopBar />
      <Navbar cartCount={cartCount} />

      {/* Toast Notification */}
      <div style={{
        position: 'fixed',
        top: showToast ? '24px' : '-100px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#ffffff',
        borderLeft: '4px solid #0f5132',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.15)',
        borderRadius: '8px',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 9999,
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        opacity: showToast ? 1 : 0,
        pointerEvents: showToast ? 'auto' : 'none',
        minWidth: '320px',
        maxWidth: '90%',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ecfdf5',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '16px', color: '#0f5132' }}>✓</span>
        </div>
        <div style={{ flex: 1, fontFamily: 'Inter, sans-serif' }}>
          <div style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b', marginBottom: '2px' }}>
            Berhasil Ditambahkan!
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
            {product.name} ({activeSize}) telah dimasukkan ke keranjang.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '12px' }}>
          <Link 
            to="/keranjang" 
            style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#0f5132',
              textDecoration: 'none',
              background: '#ecfdf5',
              padding: '6px 10px',
              borderRadius: '6px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#d1fae5'}
            onMouseLeave={e => e.currentTarget.style.background = '#ecfdf5'}
          >
            Lihat Keranjang
          </Link>
          <button 
            onClick={() => setShowToast(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '14px',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              fontWeight: 'bold',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Beranda</Link>
        <span className="breadcrumb-sep">›</span>
        <Link to="/katalog">Katalog</Link>
        <span className="breadcrumb-sep">›</span>
        <Link to={`/katalog?kategori=${encodeURIComponent(product.category)}`}>{product.category}</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-cur">{product.name}</span>
      </div>

      <div className="container">
        {/* DETAIL LAYOUT */}
        <div className="detail-layout">
          {/* Gallery */}
          <div className="gallery-wrap">
            <div className="gallery-thumbs">
              {thumbImages.map((img, i) => (
                <div
                  key={i}
                  className={`gallery-thumb ${activeThumb === i ? 'active' : ''}`}
                  onClick={() => setActiveThumb(i)}
                  style={{
                    borderColor: activeThumb === i ? '#0f5132' : 'transparent',
                    borderWidth: '2px', borderStyle: 'solid'
                  }}
                >
                  {img
                    ? <img src={img} alt={`Thumb ${i + 1}`} />
                    : <ThumbPh label={`${i + 1}`} />
                  }
                </div>
              ))}
            </div>
            <div className="gallery-main">
              {thumbImages[activeThumb]
                ? <img src={thumbImages[activeThumb]} alt={product.name} />
                : <div className="gallery-main-ph">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
              }
            </div>
          </div>

          {/* Info */}
          <div>
            <h1 className="detail-name" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: '900', color: '#111' }}>
              {product.name}
            </h1>
            


            {/* Price */}
            <div className="detail-price" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ color: '#0f5132', fontWeight: '900', fontSize: '24px' }}>{product.price}</span>
            </div>

            <p className="detail-desc" style={{ color: '#444', lineHeight: '1.7', fontSize: '14px', marginBottom: '20px' }}>
              {product.desc}
            </p>

            {/* Size Selector */}
            <div className="detail-label" style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b', marginBottom: '8px' }}>Pilih Ukuran</div>
            <div className="size-options" style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              {sizes.map(s => (
                <button
                  key={s}
                  className={`size-btn ${activeSize === s ? 'active' : ''}`}
                  onClick={() => setActiveSize(s)}
                  style={{
                    padding: '8px 16px', borderRadius: '6px', border: '1.5px solid #cbd5e1',
                    fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: activeSize === s ? '#0f5132' : '#fff',
                    color: activeSize === s ? '#fff' : '#475569', transition: 'all 0.2s', borderColor: activeSize === s ? '#0f5132' : '#cbd5e1'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Qty + Add to Cart */}
            <div className="qty-atc" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div className="qty-ctrl" style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: '40px', height: '42px', fontSize: '18px', background: '#f8fafc', border: 'none', cursor: 'pointer' }}>−</button>
                <span className="qty-val" style={{ width: '44px', textAlign: 'center', fontWeight: '700', fontSize: '14px' }}>{qty}</span>
                <button className="qty-btn" onClick={() => setQty(q => q + 1)} style={{ width: '40px', height: '42px', fontSize: '18px', background: '#f8fafc', border: 'none', cursor: 'pointer' }}>+</button>
              </div>
              <button 
                className="btn-atc" 
                onClick={handleAddToCart} 
                style={{
                  flex: 1, background: '#0f5132', color: '#fff', padding: '12px',
                  borderRadius: '8px', fontWeight: '700', fontSize: '14px', border: 'none',
                  cursor: 'pointer', transition: 'background 0.2s', textAlign: 'center'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#1a3c2e'}
                onMouseLeave={e => e.currentTarget.style.background = '#0f5132'}
              >
                Masukkan Keranjang
              </button>
            </div>
          </div>
        </div>

        {/* DETAIL INFO & DESKRIPSI */}
        <div style={{ marginTop: '48px', borderTop: '1px solid #cbd5e1', paddingTop: '36px' }}>
          <div className="tab-features" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div className="tab-feat-title" style={{ fontWeight: '700', fontSize: '14px', marginBottom: '10px', color: '#0f5132' }}>🧱 BAHAN &amp; SPESIFIKASI</div>
              <ul className="tab-feat-list" style={{ listStyleType: 'disc', paddingLeft: '20px', fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
                <li>100% Batu Alam Vulkanik (Andesit) Asli</li>
                <li>Dibuat oleh Pengrajin Tradisional Wonosobo</li>
                <li>Estu. Berat: 5 - 45 Kg (tergantung ukuran)</li>
              </ul>
            </div>
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div className="tab-feat-title" style={{ fontWeight: '700', fontSize: '14px', marginBottom: '10px', color: '#0f5132' }}>⚙️ FITUR &amp; KEUNGGULAN</div>
              <ul className="tab-feat-list" style={{ listStyleType: 'disc', paddingLeft: '20px', fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
                <li>Tahan cuaca ekstrem luar ruangan</li>
                <li>Detail pahatan sangat halus dan berkarakter</li>
                <li>Warna batu abu-abu alami candi eksklusif</li>
              </ul>
            </div>
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div className="tab-feat-title" style={{ fontWeight: '700', fontSize: '14px', marginBottom: '10px', color: '#0f5132' }}>🛡️ INSTRUKSI PERAWATAN</div>
              <ul className="tab-feat-list" style={{ listStyleType: 'disc', paddingLeft: '20px', fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
                <li>Bersihkan debu berkala dengan kuas kering</li>
                <li>Bilas air bersih saja bila terkena kotoran</li>
                <li>Bisa dilapisi coating batu alam setahun sekali</li>
              </ul>
            </div>
          </div>

          <div className="desc-block" style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>DESKRIPSI LENGKAP</h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.8' }}>
              Kerajinan batu alam <strong>"{product.name}"</strong> merupakan hasil karya tangan dari pengrajin lokal Wonosobo yang berpengalaman luas. Diukir secara manual dari bongkahan batu candi vulkanik andesit utuh, menjadikannya sangat kuat dan tahan terhadap cuaca panas maupun hujan. Sangat bernilai estetika tinggi, cocok diletakkan sebagai ornamen interior ruangan modern minimalis maupun dekorasi eksterior taman tropis Anda.
            </p>
          </div>
        </div>
      </div>

      {/* MUNGKIN KAMU SUKA */}
      <section className="maybe-section" style={{ borderTop: '1px solid #e2e8f0', marginTop: '48px' }}>
        <div className="container">
          <h2 className="maybe-title" style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', textAlign: 'center', marginBottom: '32px' }}>
            MUNGKIN KAMU SUKA
          </h2>
          <div className="product-grid">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </>
  )
}
