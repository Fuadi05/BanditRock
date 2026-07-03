import { useState, useEffect } from 'react'
import { Truck, CheckCircle, Clock, XCircle, Settings, User, Package, Search } from 'lucide-react'

// Mock database orders
const mockOrders = {
  'BM-2025-001': {
    id: 'BM-2025-001',
    status: 'Dalam Pengiriman',
    statusColor: '#0f5132',
    pemesan: 'Aditya Nugraha',
    tanggal: '18 Maret 2025',
    total: 625000,
    items: [
      { name: 'Vas Bunga Batu Andesit Minimalis', qty: 2, price: 450000 / 2, image: '/images/stone_product1_1780322903232.png' },
      { name: 'Asbak Batu Ukir Signature', qty: 1, price: 125000, image: '/images/media__1780324641579.jpg' }
    ],
    timeline: [
      { title: 'Konfirmasi', time: '18 Mar 2025 - 10:24', desc: 'Pesanan Anda telah diterima oleh sistem kami.', completed: true, icon: 'check' },
      { title: 'Disetujui', time: '18 Mar 2025 - 11:05', desc: 'Pesanan telah disetujui dan siap untuk diproses.', completed: true, icon: 'approve' },
      { title: 'Diproses', time: '19 Mar 2025 - 09:15', desc: 'Tim pengrajin sedang menyiapkan pesanan Anda.', completed: true, icon: 'process' },
      { title: 'Dikirim', time: '20 Mar 2025 - 14:30', desc: 'Pesanan sedang dalam perjalanan ke alamat tujuan.', completed: true, icon: 'shipping', active: true }
    ]
  },
  'BM-2025-002': {
    id: 'BM-2025-002',
    status: 'Diproses',
    statusColor: '#00AED6',
    pemesan: 'Rian Hidayat',
    tanggal: '07 Juni 2026',
    total: 185000,
    items: [
      { name: 'Cobek Batu Premium', qty: 1, price: 185000, image: '/images/media__1780324962198.jpg' }
    ],
    timeline: [
      { title: 'Konfirmasi', time: '07 Jun 2026 - 09:10', desc: 'Pesanan Anda telah diterima oleh sistem kami.', completed: true, icon: 'check' },
      { title: 'Disetujui', time: '07 Jun 2026 - 10:30', desc: 'Pesanan telah disetujui dan siap untuk diproses.', completed: true, icon: 'approve' },
      { title: 'Diproses', time: '08 Jun 2026 - 08:00', desc: 'Tim pengrajin sedang menyiapkan pesanan Anda.', completed: true, icon: 'process', active: true },
      { title: 'Dikirim', time: '-', desc: 'Pesanan akan dikirim setelah proses pembuatan selesai.', completed: false, icon: 'shipping' }
    ]
  },
  'BM-2025-003': {
    id: 'BM-2025-003',
    status: 'Dibatalkan',
    statusColor: '#dc2626',
    pemesan: 'Siti Zubaidah',
    tanggal: '05 Juni 2026',
    total: 999000,
    items: [
      { name: 'Patung Buddha Meditasi', qty: 1, price: 999000, image: '/images/stone_product2_1780322918796.png' }
    ],
    timeline: [
      { title: 'Konfirmasi', time: '05 Jun 2026 - 14:20', desc: 'Pesanan Anda telah diterima oleh sistem kami.', completed: true, icon: 'check' },
      { title: 'Dibatalkan', time: '06 Jun 2026 - 11:00', desc: 'Pesanan ini telah dibatalkan karena tidak ada transfer masuk.', completed: true, icon: 'cancel', active: true }
    ]
  },
  'BM-2025-004': {
    id: 'BM-2025-004',
    status: 'Menunggu Verifikasi',
    statusColor: '#d97706',
    pemesan: 'Hendra Wijaya',
    tanggal: '08 Juni 2026',
    total: 689000,
    items: [
      { name: 'Patung Kura-Kura Hias', qty: 1, price: 689000, image: '/images/media__1780324641579.jpg' }
    ],
    timeline: [
      { title: 'Konfirmasi', time: '08 Jun 2026 - 15:40', desc: 'Pesanan Anda telah diterima oleh sistem kami.', completed: true, icon: 'check' },
      { title: 'Menunggu Verifikasi', time: '08 Jun 2026 - 15:45', desc: 'Bukti transfer sedang diverifikasi oleh admin.', completed: true, icon: 'process', active: true }
    ]
  }
}

export default function LacakPesananModal({ isOpen, onClose, initialOrderId = '' }) {
  const [orderIdInput, setOrderIdInput] = useState('')
  const [searchedId, setSearchedId] = useState('')

  useEffect(() => {
    if (isOpen) {
      setOrderIdInput(initialOrderId)
      setSearchedId(initialOrderId)
    }
  }, [isOpen, initialOrderId])

  if (!isOpen) return null

  const order = mockOrders[searchedId.toUpperCase().trim()]

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchedId(orderIdInput.trim())
  }

  const renderTimelineIcon = (iconType, completed, active) => {
    const size = 16
    const color = active ? '#ffffff' : completed ? '#ffffff' : '#64748b'
    const bg = active ? '#0f5132' : completed ? '#064e3b' : '#f1f5f9'
    const border = active ? '2px solid #0f5132' : completed ? '2px solid #064e3b' : '2px solid #cbd5e1'

    const style = {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: bg,
      border: border,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
      flexShrink: 0
    }

    if (iconType === 'check') return <div style={style}><CheckCircle size={size} color={color} /></div>
    if (iconType === 'approve') return <div style={style}><Settings size={size} color={color} /></div>
    if (iconType === 'process') return <div style={style}><Clock size={size} color={color} /></div>
    if (iconType === 'cancel') return <div style={{ ...style, background: '#fee2e2', borderColor: '#f87171' }}><XCircle size={size} color="#dc2626" /></div>
    if (iconType === 'shipping') return <div style={style}><Truck size={size} color={color} /></div>
    return <div style={style}><CheckCircle size={size} color={color} /></div>
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(5px)',
      padding: '20px'
    }} onClick={onClose}>
      <div 
        style={{
          background: '#fff', borderRadius: '16px',
          width: '100%', maxWidth: order ? '800px' : '500px',
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          position: 'relative', border: '1px solid #e2e8f0',
          display: 'flex', flexDirection: 'column'
        }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, background: '#fff', zIndex: 10
        }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: '800', textTransform: 'uppercase', margin: 0 }}>
            Lacak Pesanan
          </h2>
          <button 
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#f1f5f9', cursor: 'pointer', border: 'none', color: '#64748b', transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', flex: 1 }}>
          {/* Search Form */}
          <form 
            onSubmit={handleSearch}
            style={{ 
              display: 'flex', 
              gap: '8px', 
              background: '#f8fafc', 
              padding: '6px', 
              borderRadius: '10px', 
              border: '1px solid #cbd5e1',
              marginBottom: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, paddingLeft: '12px' }}>
              <Search size={16} color="#94a3b8" />
              <input 
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="Masukkan ID Pesanan... (Contoh: BM-2025-001)" 
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px', color: 'var(--text-primary)' }}
              />
            </div>
            <button 
              type="submit"
              className="btn-primary"
              style={{ background: '#0f5132', padding: '8px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}
            >
              Cari
            </button>
          </form>

          {order ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
              
              {/* Timeline */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', background: '#fafafa' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Truck size={18} color="#0f5132" />
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', display: 'block' }}>Status</span>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: order.statusColor }}>{order.status}</span>
                  </div>
                </div>

                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ position: 'absolute', top: '12px', bottom: '12px', left: '15px', width: '2px', background: '#e2e8f0', zIndex: 1 }} />

                  {order.timeline.map((step, index) => (
                    <div key={index} style={{ display: 'flex', gap: '12px', opacity: step.completed ? 1 : 0.5 }}>
                      {renderTimelineIcon(step.icon, step.completed, step.active)}
                      <div style={{ paddingTop: '2px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: '700', color: step.active ? order.statusColor : '#1e293b', margin: '0 0 1px' }}>
                          {step.title}
                        </h4>
                        <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>{step.time}</span>
                        <p style={{ fontSize: '11px', color: '#475569', margin: 0 }}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Detail Pemesan */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <User size={16} color="#0f5132" />
                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', margin: 0 }}>Detail Pemesan</h3>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '9px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Nama Lengkap</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', display: 'block', marginBottom: '8px' }}>{order.pemesan}</span>
                    
                    <span style={{ display: 'block', fontSize: '9px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Tanggal Pesanan</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{order.tanggal}</span>
                  </div>
                </div>

                {/* Rincian Produk */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <Package size={16} color="#0f5132" />
                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', margin: 0 }}>Rincian Produk</h3>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
                    {order.items.map((item, index) => (
                      <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '4px', overflow: 'hidden', background: '#f1f5f9', flexShrink: 0 }}>
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', lineHeight: '1.3' }}>{item.name}</div>
                          <div style={{ fontSize: '10px', color: '#64748b' }}>x{item.qty} Unit • Rp {item.price.toLocaleString('id-ID')}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifycontent: 'space-between', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>Total Bayar</span>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f5132' }}>Rp {order.total.toLocaleString('id-ID')}</span>
                  </div>
                </div>

              </div>

            </div>
          ) : searchedId ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>⚠️</div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>Pesanan Tidak Ditemukan</h3>
              <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>
                ID Pesanan <strong>"{searchedId}"</strong> tidak terdaftar.
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔍</div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>Masukkan ID Pesanan</h3>
              <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>
                Masukkan ID Pesanan Anda di kolom pencarian di atas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
