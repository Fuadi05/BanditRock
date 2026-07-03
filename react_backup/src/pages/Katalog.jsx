import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import Navbar from '../components/Navbar'
import CTASection from '../components/CTASection'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { products, allCategories } from '../data/products'
import { SlidersHorizontal, Search, Check, ChevronRight, ChevronLeft, X } from 'lucide-react'

const PER_PAGE = 9
const MIN_PRICE = 100000
const MAX_PRICE = 3000000

function formatRpShort(n) {
  if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(1).replace('.0', '')} Jt`
  return `Rp ${(n / 1000).toFixed(0)}.000`
}

export default function Katalog({ cartCount }) {
  const [searchParams, setSearchParams] = useSearchParams()

  // Baca params dari URL
  const urlKategori = searchParams.get('kategori') || ''
  const urlQuery    = searchParams.get('q') || ''

  // State filter lokal
  const [selectedCategory, setSelectedCategory] = useState(urlKategori)
  const [priceMin, setPriceMin]   = useState(MIN_PRICE)
  const [priceMax, setPriceMax]   = useState(MAX_PRICE)
  const [pendingMin, setPendingMin] = useState(MIN_PRICE)
  const [pendingMax, setPendingMax] = useState(MAX_PRICE)
  const [sortBy, setSortBy]       = useState('Terpopuler')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchLocal, setSearchLocal] = useState(urlQuery)

  // Sync URL params ke state saat URL berubah (misal dari dropdown nav)
  useEffect(() => {
    setSelectedCategory(searchParams.get('kategori') || '')
    setSearchLocal(searchParams.get('q') || '')
    setCurrentPage(1)
  }, [searchParams])

  // Filter & sort produk
  const filtered = useMemo(() => {
    let result = [...products]

    // Filter kategori
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory)
    }

    // Filter harga
    result = result.filter(p => p.priceNum >= priceMin && p.priceNum <= priceMax)

    // Filter search
    if (searchLocal.trim()) {
      const q = searchLocal.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q)
      )
    }

    // Sort
    switch (sortBy) {
      case 'Harga Terendah':
        result.sort((a, b) => a.priceNum - b.priceNum)
        break
      case 'Harga Tertinggi':
        result.sort((a, b) => b.priceNum - a.priceNum)
        break
      case 'Terbaru':
        result.reverse()
        break
      default: // Terpopuler
        // Gunakan urutan default produk
    }

    return result
  }, [selectedCategory, priceMin, priceMax, searchLocal, sortBy])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated  = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  // Reset ke page 1 saat filter berubah
  useEffect(() => { setCurrentPage(1) }, [selectedCategory, priceMin, priceMax, searchLocal, sortBy])

  // Apply filter dari sidebar
  const handleApplyFilter = () => {
    setPriceMin(pendingMin)
    setPriceMax(pendingMax)
    const params = {}
    if (selectedCategory) params.kategori = selectedCategory
    if (searchLocal)      params.q        = searchLocal
    setSearchParams(params)
    setCurrentPage(1)
  }

  // Reset semua filter
  const handleReset = () => {
    setSelectedCategory('')
    setPriceMin(MIN_PRICE)
    setPriceMax(MAX_PRICE)
    setPendingMin(MIN_PRICE)
    setPendingMax(MAX_PRICE)
    setSearchLocal('')
    setSortBy('Terpopuler')
    setCurrentPage(1)
    setSearchParams({})
  }

  // Pilih kategori dari sidebar
  const handleSelectCategory = (cat) => {
    const next = selectedCategory === cat ? '' : cat
    setSelectedCategory(next)
    const params = {}
    if (next) params.kategori = next
    if (searchLocal) params.q = searchLocal
    setSearchParams(params)
  }

  // Halaman sebelum/sesudah
  const goPrev = () => setCurrentPage(p => Math.max(1, p - 1))
  const goNext = () => setCurrentPage(p => Math.min(totalPages, p + 1))

  // Render nomor halaman
  const renderPages = () => {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  const hasActiveFilter = selectedCategory || priceMin > MIN_PRICE || priceMax < MAX_PRICE || searchLocal

  return (
    <>
      <TopBar />
      <Navbar cartCount={cartCount} />

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Beranda</Link>
        <span className="breadcrumb-sep">›</span>
        {selectedCategory
          ? <><Link to="/katalog" onClick={() => { setSelectedCategory(''); setSearchParams({}) }}>Katalog</Link>
              <span className="breadcrumb-sep">›</span>
              <span className="breadcrumb-cur">{selectedCategory}</span></>
          : <span className="breadcrumb-cur">Katalog</span>
        }
      </div>

      <div className="container">
        <div className="catalog-layout">

          {/* ===== SIDEBAR ===== */}
          <aside className="sidebar">
            <div className="sidebar-head">
              <span>Filters</span>
              <SlidersHorizontal size={16} />
            </div>

            {/* Search lokal */}
            <div style={{ marginBottom: 16 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--gray-light)', borderRadius: 8, padding: '8px 12px',
                border: '1.5px solid transparent', transition: 'border .2s'
              }}
                onFocus={() => {}} id="sidebar-search-wrap"
              >
                <Search size={14} color="#888" />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchLocal}
                  onChange={e => setSearchLocal(e.target.value)}
                  style={{ background: 'none', border: 'none', fontSize: 13, width: '100%', outline: 'none' }}
                />
                {searchLocal && (
                  <button onClick={() => setSearchLocal('')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={14} color="#888" />
                  </button>
                )}
              </div>
            </div>

            {/* Kategori */}
            <div className="sidebar-section-title" style={{ marginTop: 4, marginBottom: 8 }}>Kategori</div>
            <div style={{ marginBottom: 4 }}>
              {allCategories.map(cat => {
                const count = products.filter(p => p.category === cat).length
                const isActive = selectedCategory === cat
                return (
                  <div
                    key={cat}
                    className="sidebar-filter-item"
                    onClick={() => handleSelectCategory(cat)}
                    style={{
                      cursor: 'pointer',
                      color: isActive ? 'var(--green-primary)' : 'inherit',
                      fontWeight: isActive ? 700 : 400,
                      background: isActive ? 'rgba(31,77,56,.06)' : 'transparent',
                      borderRadius: isActive ? 6 : 0,
                      padding: '9px 4px',
                      transition: 'all .15s',
                    }}
                  >
                    <span>{cat}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--gray-text)', background: 'var(--gray-light)', borderRadius: 10, padding: '1px 7px' }}>
                        {count}
                      </span>
                      {isActive ? <Check size={12} /> : <ChevronRight size={12} />}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Range Harga */}
            <div className="sidebar-section-title" style={{ marginTop: 16 }}>
              Harga
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
            </div>
            <div style={{ padding: '4px 0 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--green-primary)', fontWeight: 700, marginBottom: 10 }}>
                <span>{formatRpShort(pendingMin)}</span>
                <span>{formatRpShort(pendingMax)}</span>
              </div>

              {/* Slider min */}
              <div style={{ position: 'relative', marginBottom: 6 }}>
                <input
                  type="range"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  step={50000}
                  value={pendingMin}
                  onChange={e => {
                    const v = Number(e.target.value)
                    if (v < pendingMax - 50000) setPendingMin(v)
                  }}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Slider max */}
              <div style={{ position: 'relative' }}>
                <input
                  type="range"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  step={50000}
                  value={pendingMax}
                  onChange={e => {
                    const v = Number(e.target.value)
                    if (v > pendingMin + 50000) setPendingMax(v)
                  }}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <div style={{ flex: 1, border: '1px solid var(--gray-mid)', borderRadius: 6, padding: '6px 8px', fontSize: 12 }}>
                  <div style={{ color: 'var(--gray-text)', marginBottom: 2 }}>Min</div>
                  <input
                    type="number"
                    value={pendingMin}
                    onChange={e => { const v = Number(e.target.value); if (v >= MIN_PRICE && v < pendingMax) setPendingMin(v) }}
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: 12, fontWeight: 600 }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 6, color: 'var(--gray-text)' }}>—</div>
                <div style={{ flex: 1, border: '1px solid var(--gray-mid)', borderRadius: 6, padding: '6px 8px', fontSize: 12 }}>
                  <div style={{ color: 'var(--gray-text)', marginBottom: 2 }}>Maks</div>
                  <input
                    type="number"
                    value={pendingMax}
                    onChange={e => { const v = Number(e.target.value); if (v <= MAX_PRICE && v > pendingMin) setPendingMax(v) }}
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: 12, fontWeight: 600 }}
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <button className="btn-apply" onClick={handleApplyFilter}>
              Terapkan Filter
            </button>
            {hasActiveFilter && (
              <button
                onClick={handleReset}
                style={{
                  width: '100%', padding: '9px', borderRadius: 8, fontWeight: 600, fontSize: 13,
                  marginTop: 8, border: '1.5px solid var(--gray-mid)', background: '#fff',
                  cursor: 'pointer', color: 'var(--gray-dark)', transition: 'all .2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-mid)'; e.currentTarget.style.color = 'var(--gray-dark)' }}
              >
                Reset Filter
              </button>
            )}
          </aside>

          {/* ===== MAIN ===== */}
          <div className="catalog-main">
            {/* Header */}
            <div className="catalog-head">
              <h1 className="catalog-title-main">
                {selectedCategory || (searchLocal ? `Hasil: "${searchLocal}"` : 'Semua Produk')}
              </h1>
              <div className="catalog-meta">
                <span>
                  {filtered.length === 0
                    ? 'Tidak ada produk'
                    : `Menampilkan ${(currentPage - 1) * PER_PAGE + 1}–${Math.min(currentPage * PER_PAGE, filtered.length)} dari ${filtered.length} Produk`
                  }
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  Urutkan:
                  <select
                    className="sort-select"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                  >
                    <option>Terpopuler</option>
                    <option>Harga Terendah</option>
                    <option>Harga Tertinggi</option>
                    <option>Terbaru</option>
                  </select>
                </span>
              </div>
            </div>

            {/* Active filter tags */}
            {hasActiveFilter && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {selectedCategory && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'var(--green-primary)', color: '#fff',
                    borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 600
                  }}>
                    {selectedCategory}
                    <button
                      onClick={() => handleSelectCategory(selectedCategory)}
                      style={{ color: '#fff', fontSize: 16, lineHeight: 1 }}
                    >×</button>
                  </span>
                )}
                {searchLocal && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: '#1a3c2e', color: '#fff',
                    borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 600
                  }}>
                    🔍 {searchLocal}
                    <button onClick={() => setSearchLocal('')} style={{ color: '#fff', fontSize: 16, lineHeight: 1 }}>×</button>
                  </span>
                )}
                {(priceMin > MIN_PRICE || priceMax < MAX_PRICE) && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: '#444', color: '#fff',
                    borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 600
                  }}>
                    {formatRpShort(priceMin)} – {formatRpShort(priceMax)}
                    <button onClick={() => { setPriceMin(MIN_PRICE); setPriceMax(MAX_PRICE); setPendingMin(MIN_PRICE); setPendingMax(MAX_PRICE) }}
                      style={{ color: '#fff', fontSize: 16, lineHeight: 1 }}>×</button>
                  </span>
                )}
              </div>
            )}

            {/* Grid produk */}
            {paginated.length > 0 ? (
              <div className="product-grid cols-3">
                {paginated.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--gray-text)' }}>
                <Search size={56} color="#ccc" style={{ margin: '0 auto 16px' }} />
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Produk tidak ditemukan</p>
                <p style={{ fontSize: 13, marginBottom: 20 }}>Coba ubah filter atau kata kunci pencarian Anda</p>
                <button onClick={handleReset} className="btn-primary" style={{ display: 'inline-flex' }}>
                  Reset Semua Filter
                </button>
              </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn nav-btn"
                  onClick={goPrev}
                  disabled={currentPage === 1}
                  style={{ opacity: currentPage === 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <ChevronLeft size={16} /> Sebelumnya
                </button>

                {renderPages().map((p, i) =>
                  p === '...'
                    ? <span key={`dots-${i}`} style={{ padding: '0 6px', color: '#888', lineHeight: '36px' }}>...</span>
                    : <button
                        key={p}
                        className={`page-btn ${currentPage === p ? 'active' : ''}`}
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </button>
                )}

                <button
                  className="page-btn nav-btn"
                  onClick={goNext}
                  disabled={currentPage === totalPages}
                  style={{ opacity: currentPage === totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Berikutnya <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <CTASection />
      <Footer />
    </>
  )
}
