import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Search, ShoppingCart, ChevronDown } from 'lucide-react'

export default function Navbar({ cartCount = 0 }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [katalogOpen, setKatalogOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchVal.trim()) {
      navigate(`/katalog?q=${encodeURIComponent(searchVal.trim())}`)
      setSearchVal('')
    }
  }

  return (
    <nav className="navbar" onClick={() => setKatalogOpen(false)}>
      <div className="navbar-inner" onClick={e => e.stopPropagation()}>
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          BATU<br />MERAPI
        </Link>

        {/* Nav Links */}
        <div className="navbar-nav">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Beranda</Link>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setKatalogOpen(o => !o)}
              className={location.pathname === '/katalog' ? 'active' : ''}
            >
              Katalog
              <ChevronDown size={14} style={{ transition: 'transform .2s', transform: katalogOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
            </button>
            {katalogOpen && (
              <div style={{
                position: 'absolute', top: '110%', left: 0, background: '#fff',
                border: '1px solid #e0e0e0', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,.1)',
                minWidth: 170, zIndex: 100, padding: '6px 0'
              }}>
                <Link
                  to="/katalog"
                  style={{ display: 'block', padding: '9px 18px', fontSize: 13, fontWeight: 600, borderBottom: '1px solid #f0f0f0' }}
                  onClick={() => setKatalogOpen(false)}
                  onMouseEnter={e => e.currentTarget.style.background = '#f2f2f2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Semua Produk
                </Link>
                {['Alat Dapur', 'Interior', 'Eksterior', 'Ornamen Dinding', 'Dinding & Lantai'].map(cat => (
                  <Link
                    key={cat}
                    to={`/katalog?kategori=${encodeURIComponent(cat)}`}
                    style={{ display: 'block', padding: '9px 18px', fontSize: 13, transition: 'background .15s' }}
                    onClick={() => setKatalogOpen(false)}
                    onMouseEnter={e => e.currentTarget.style.background = '#f2f2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/cara-pesan" className={location.pathname === '/cara-pesan' ? 'active' : ''}>
            Cara Pesan
          </Link>

          <Link to="/konfirmasi" className={location.pathname === '/konfirmasi' ? 'active' : ''}>
            Konfirmasi Pembayaran
          </Link>
          <Link to="/tentang" className={location.pathname === '/tentang' ? 'active' : ''}>
            Tentang Kami
          </Link>
        </div>

        {/* Right */}
        <div className="navbar-right">
          <form onSubmit={handleSearch} style={{ display: 'contents' }}>
            <div className="search-bar">
              <button type="submit" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Search size={16} color="#888" />
              </button>
              <input
                type="text"
                placeholder="Cari Produk"
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
              />
            </div>
          </form>

          <Link to="/keranjang" className="cart-btn">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </div>
      </div>
    </nav>
  )
}
