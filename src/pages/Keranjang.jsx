import { useState } from 'react'
import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'
import Navbar from '../components/Navbar'
import CTASection from '../components/CTASection'
import Footer from '../components/Footer'
import CheckoutModals from '../components/CheckoutModals'

function formatRp(n) {
  return 'Rp ' + (n || 0).toLocaleString('id-ID')
}

function ImgOrPh({ src, alt }) {
  return src
    ? <img src={src} alt={alt} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
    : null
}

export default function Keranjang({ cartCount, cartItems = [], updateCartQty, removeCartItem, clearCart }) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const total = subtotal

  return (
    <>
      <TopBar />
      <Navbar cartCount={cartCount} />

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Beranda</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-cur">Keranjang</span>
      </div>

      <div className="container">
        <h1 className="cart-page-title" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: '900' }}>KERANJANG</h1>

        <div className="cart-layout">
          {/* CART ITEMS */}
          <div>
            <div className="cart-card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              {cartItems.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: '#888' }}>
                  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" style={{ margin: '0 auto 14px' }}>
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                  <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: '#1e293b' }}>Keranjang Anda Kosong</p>
                  <p style={{ fontSize: 13, marginBottom: 20 }}>Yuk mulai belanja kerajinan batu pilihan Anda!</p>
                  <Link to="/katalog" className="btn-primary" style={{ display: 'inline-flex', background: '#0f5132' }}>
                    Belanja Sekarang →
                  </Link>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="cart-item" style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <div className="cart-item-img">
                      <ImgOrPh src={item.image} alt={item.name} />
                      <div className="cart-item-img-ph" style={{ display: item.image ? 'none' : 'flex' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                    </div>

                    <div className="cart-item-info">
                      <div className="cart-item-name" style={{ color: '#1e293b' }}>{item.name}</div>
                      <div className="cart-item-meta">Ukuran: <strong>{item.size}</strong></div>
                      <div className="cart-item-meta">Warna/Tipe: <strong>{item.color}</strong></div>
                      <div className="cart-item-price" style={{ color: '#0f5132' }}>{formatRp(item.price)}</div>
                    </div>

                    <div className="cart-item-right">
                      <button
                        className="cart-del-btn"
                        onClick={() => removeCartItem(item.id)}
                        aria-label="Hapus produk"
                        title="Hapus dari keranjang"
                        style={{ color: '#ef4444', cursor: 'pointer' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                      </button>
                      
                      <div className="cart-qty-ctrl" style={{ border: '1.5px solid #cbd5e1', borderRadius: '8px' }}>
                        <button className="cart-qty-btn" onClick={() => updateCartQty(item.id, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>−</button>
                        <span className="cart-qty-val" style={{ fontWeight: '700' }}>{item.qty}</span>
                        <button className="cart-qty-btn" onClick={() => updateCartQty(item.id, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>+</button>
                      </div>
                      
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f5132' }}>
                        {formatRp(item.price * item.qty)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/katalog" style={{ fontSize: 13, color: '#0f5132', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  ← Lanjut Belanja
                </Link>
                <span style={{ fontSize: 13, color: 'var(--gray-text)' }}>
                  {cartItems.reduce((s, i) => s + i.qty, 0)} item dalam keranjang
                </span>
              </div>
            )}
          </div>

          {/* ORDER SUMMARY */}
          <div>
            <div className="order-card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
              <div className="order-title" style={{ fontWeight: '800', fontSize: '18px', borderBottom: '1px solid #cbd5e1', paddingBottom: '12px', marginBottom: '16px' }}>
                Ringkasan Order
              </div>

              {cartItems.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--gray-text)', textAlign: 'center', padding: '20px 0' }}>
                  Belum ada produk di keranjang
                </p>
              ) : (
                <>
                  <div className="order-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '13px' }}>
                    <span>Subtotal</span>
                    <span style={{ fontWeight: 600 }}>{formatRp(subtotal)}</span>
                  </div>

                  <div className="order-total" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', padding: '16px 0 8px', fontSize: '18px', fontWeight: '800', color: '#0f5132' }}>
                    <span>Total Tagihan</span>
                    <span>{formatRp(total)}</span>
                  </div>

                  <button 
                    className="btn-checkout" 
                    onClick={() => setIsCheckoutOpen(true)}
                    style={{
                      width: '100%', background: '#0f5132', color: '#fff', padding: '14px',
                      borderRadius: '8px', fontWeight: '800', fontSize: '14px', border: 'none',
                      cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1a3c2e'}
                    onMouseLeave={e => e.currentTarget.style.background = '#0f5132'}
                  >
                    Checkout Baru
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modals Dialog */}
      <CheckoutModals 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        totalAmount={total} 
        cartItems={cartItems} 
        onPaymentSuccess={clearCart} 
      />

      <CTASection />
      <Footer />
    </>
  )
}
