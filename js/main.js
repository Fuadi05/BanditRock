// Initialize Lucide icons and common elements
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }
  updateNavbarCartCount();
  setupNavbar();
  setupTopbar();
});

// TOPBAR LOGIC
function setupTopbar() {
  const topbar = document.getElementById('topbar');
  if (topbar) {
    if (sessionStorage.getItem('hideTopbar') === 'true') {
      topbar.style.display = 'none';
    }
    const closeBtn = topbar.querySelector('.topbar-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        sessionStorage.setItem('hideTopbar', 'true');
        topbar.style.display = 'none';
      });
    }
  }
}

// CART LOGIC
function getCart() {
  const cart = localStorage.getItem('banditrock_cart');
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem('banditrock_cart', JSON.stringify(cart));
  updateNavbarCartCount();
}

function addToCart(product, size, qty) {
  const cart = getCart();
  const existing = cart.find(item => item.product_id === product.id && item.size === size);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: Date.now(),
      product_id: product.id,
      name: product.name,
      size,
      color: 'Alami',
      price: product.priceNum,
      qty,
      image: product.image,
    });
  }
  saveCart(cart);
}

function updateCartQty(id, delta) {
  const cart = getCart();
  const item = cart.find(item => item.id === id);
  if (item) {
    item.qty = Math.max(1, item.qty + delta);
    saveCart(cart);
  }
}

function removeCartItem(id) {
  const cart = getCart();
  const newCart = cart.filter(item => item.id !== id);
  saveCart(newCart);
}

function clearCart() {
  saveCart([]);
}

function getCartCount() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateNavbarCartCount() {
  const badge = document.getElementById('navbar-cart-badge');
  const count = getCartCount();
  if (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

// NAVBAR LOGIC
function setupNavbar() {
  const katalogBtn = document.getElementById('nav-katalog-btn');
  const katalogDropdown = document.getElementById('nav-katalog-dropdown');
  if (katalogBtn && katalogDropdown) {
    katalogBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = katalogDropdown.style.display === 'none';
      katalogDropdown.style.display = isHidden ? 'block' : 'none';
    });
    document.addEventListener('click', () => {
      katalogDropdown.style.display = 'none';
    });
  }

  const searchForm = document.getElementById('navbar-search-form');
  const searchInput = document.getElementById('navbar-search-input');
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = searchInput.value.trim();
      if (val) {
        window.location.href = `katalog.html?q=${encodeURIComponent(val)}`;
      }
    });
  }
}

// TRACKING MODAL LOGIC (Lacak Pesanan)
function openTrackModal(orderId = '') {
  const modal = document.getElementById('track-modal');
  const input = document.getElementById('track-input');
  if (modal) {
    modal.style.display = 'flex';
    if (input && orderId) {
      input.value = orderId;
      searchTrack(orderId);
    }
  }
}

function closeTrackModal() {
  const modal = document.getElementById('track-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

const mockOrders = {
  'BM-2025-001': {
    id: 'BM-2025-001',
    status: 'Dalam Pengiriman',
    statusColor: '#0f5132',
    pemesan: 'Aditya Nugraha',
    tanggal: '18 Maret 2025',
    total: 625000,
    products: [
      { name: 'Vas Bunga Batu Andesit Minimalis', qty: 2, price: 450000, img: '../images/media__1780324641278.jpg' },
      { name: 'Asbak Batu Ukir Signature', qty: 1, price: 125000, img: '../images/stone_product2_1780322918796.png' }
    ],
    timeline: [
      { title: 'Konfirmasi', time: '18 Mar 2025 - 10:24', desc: 'Pesanan Anda telah diterima oleh sistem kami.', completed: true },
      { title: 'Disetujui', time: '18 Mar 2025 - 11:05', desc: 'Pesanan telah disetujui dan siap untuk diproses.', completed: true },
      { title: 'Diproses', time: '19 Mar 2025 - 09:15', desc: 'Tim pengrajin sedang menyiapkan pesanan Anda.', completed: true },
      { title: 'Dibatalkan', time: '20 Mar 2025 - 10:00', desc: 'Pesanan ini telah dibatalkan.', completed: false, isCanceled: true },
      { title: 'Dikirim', time: '20 Mar 2025 - 14:30', desc: 'Pesanan sedang dalam perjalanan ke alamat tujuan.', completed: false, active: true }
    ]
  }
};

async function searchTrack(query) {
  const resultsContainer = document.getElementById('track-results');
  if (!resultsContainer) return;
  const cleanId = String(query || '').trim().replace(/^#/, '');

  if (!cleanId) {
    resultsContainer.innerHTML = '<div style="text-align:center; padding:20px; color:#ef4444">Masukkan nomor ID pesanan Anda.</div>';
    return;
  }

  resultsContainer.innerHTML = '<div style="text-align:center; padding:30px; color:#64748b">🔍 Mencari data pesanan...</div>';

  try {
    const res = await fetch(`https://batumerapi.biz.id/api/order/track/${encodeURIComponent(cleanId)}`);
    const json = await res.json();

    if (!json.success || !json.data) {
      resultsContainer.innerHTML = `<div style="text-align:center; padding:20px; color:#ef4444">${json.message || 'Pesanan tidak ditemukan. Periksa kembali nomor resi/order Anda.'}</div>`;
      return;
    }

    const order = json.data;
    const dateFormatted = new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const currentStatus = order.status;
    const isCanceled = (currentStatus === 'cancelled');

    const timeline = [
      {
        title: 'Pesanan Dibuat',
        time: dateFormatted,
        desc: 'Pesanan telah dicatat di sistem.',
        completed: true
      },
      {
        title: 'Verifikasi Pembayaran',
        time: ['waiting_verification', 'paid', 'processing', 'shipped'].includes(currentStatus) ? 'Selesai / Dalam Proses' : '-',
        desc: 'Bukti pembayaran diperiksa oleh admin.',
        completed: ['waiting_verification', 'paid', 'processing', 'shipped'].includes(currentStatus),
        active: currentStatus === 'waiting_verification'
      },
      {
        title: 'Disetujui (Lunas)',
        time: ['paid', 'processing', 'shipped'].includes(currentStatus) ? 'Terverifikasi' : '-',
        desc: 'Pembayaran terkonfirmasi lunas.',
        completed: ['paid', 'processing', 'shipped'].includes(currentStatus),
        active: currentStatus === 'paid'
      },
      {
        title: 'Diproses / Dikirim',
        time: ['processing', 'shipped'].includes(currentStatus) ? 'Pengiriman' : '-',
        desc: isCanceled ? 'Pesanan ini telah dibatalkan.' : (currentStatus === 'shipped' ? 'Pesanan sedang dalam pengiriman ke lokasi tujuan.' : 'Pesanan diproses tim pengrajin.'),
        completed: ['processing', 'shipped'].includes(currentStatus),
        active: ['processing', 'shipped'].includes(currentStatus),
        isCanceled: isCanceled
      }
    ];

    const statusLabels = {
      'pending_payment': 'Menunggu Pembayaran',
      'waiting_verification': 'Verifikasi Pembayaran',
      'paid': 'Pesanan Disetujui (Lunas)',
      'processing': 'Pesanan Diproses',
      'shipped': 'Dalam Pengiriman',
      'cancelled': 'Pesanan Dibatalkan'
    };

    let timelineHtml = `
      <div style="position:relative; padding-left:8px; margin-top:20px;">
        <div style="position:absolute; top:12px; bottom:20px; left:22px; width:2px; background:#e2e8f0; z-index:1;"></div>
        ${timeline.map(step => {
          let stepCanceled = step.isCanceled;
          let iconColor = stepCanceled ? '#ef4444' : (step.completed || step.active ? '#0f5132' : '#94a3b8');
          let bgColor = stepCanceled ? '#fff' : (step.completed || step.active ? '#0f5132' : '#fff');
          let txtColor = bgColor === '#fff' ? iconColor : '#fff';
          let icon = step.title === 'Pesanan Dibuat' ? 'check' : 
                     step.title === 'Verifikasi Pembayaran' ? 'clock' : 
                     step.title === 'Disetujui (Lunas)' ? 'check-circle' : 
                     stepCanceled ? 'x' : 'truck';
          return `
            <div style="display:flex; gap:20px; margin-bottom:24px; position:relative; z-index:2; align-items:flex-start;">
              <div style="width:30px; height:30px; border-radius:50%; background:${bgColor}; border:2px solid ${iconColor}; color:${txtColor}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                <i data-lucide="${icon}" style="width:16px; height:16px;"></i>
              </div>
              <div style="${stepCanceled ? 'opacity:0.8;' : ''}">
                <div style="font-size:14px; font-weight:700; color:${stepCanceled ? '#ef4444' : (step.completed || step.active ? '#0f5132' : '#1e293b')}; margin-bottom:2px;">${step.title}</div>
                <div style="font-size:12px; color:#64748b; margin-bottom:4px;">${step.time}</div>
                <div style="font-size:13px; color:#475569;">${step.desc}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    let productsHtml = (order.order_items && order.order_items.length > 0) ? order.order_items.map(item => `
      <div style="display:flex; gap:12px; margin-bottom:12px; align-items:center;">
        <img src="${item.products && item.products.image_url ? item.products.image_url : '../images/media__1780324962198.jpg'}" alt="${item.products ? item.products.nama : 'Produk'}" style="width:48px; height:48px; border-radius:8px; object-fit:cover; background:#f1f5f9; border:1px solid #e2e8f0;">
        <div style="flex:1;">
          <div style="font-size:13px; font-weight:700; color:#1e293b;">${item.products ? item.products.nama : 'Produk'}</div>
          <div style="font-size:12px; color:#64748b;">x${item.qty} Unit</div>
        </div>
        <div style="font-size:13px; font-weight:800; color:#0f5132;">${formatRp((item.harga_disepakati || 0) * item.qty)}</div>
      </div>
    `).join('') : '<div style="font-size:13px; color:#64748b;">Tidak ada rincian produk</div>';

    resultsContainer.innerHTML = `
      <div style="display:grid; grid-template-columns: 1fr 340px; gap:24px; text-align:left; background:#e2e8f0; padding:24px; border-radius:16px; margin-top:20px;">
        <div style="background:#fff; border-radius:12px; padding:24px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:16px; border-bottom:1px solid #e2e8f0;">
            <div style="display:flex; gap:14px; align-items:center;">
              <div style="width:46px; height:46px; border-radius:10px; background:#f0fdf4; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                <i data-lucide="truck" style="width:24px; height:24px; color:#0f5132;"></i>
              </div>
              <div>
                <div style="font-size:11px; color:#64748b; font-weight:600; margin-bottom:2px;">Status Saat Ini</div>
                <div style="font-size:18px; font-weight:800; color:${isCanceled ? '#ef4444' : '#0f5132'};">${statusLabels[order.status] || order.status}</div>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:13px; font-weight:800; color:#1e293b;">Order ID: ${order.id}</div>
            </div>
          </div>
          ${timelineHtml}
        </div>

        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="background:#fff; border-radius:12px; padding:20px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="display:flex; gap:10px; align-items:center; margin-bottom:16px;">
              <i data-lucide="user" style="width:18px; height:18px; color:#0f5132;"></i>
              <div style="font-size:14px; font-weight:800; color:#0f5132;">Detail Pemesan</div>
            </div>
            <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.5px;">Nama Lengkap</div>
            <div style="font-size:13px; color:#1e293b; margin-bottom:12px; font-weight:500;">${order.nama_pembeli}</div>
            <div style="font-size:10px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.5px;">Tanggal Pesanan</div>
            <div style="font-size:13px; color:#1e293b; font-weight:500;">${dateFormatted}</div>
          </div>

          <div style="background:#fff; border-radius:12px; padding:20px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="display:flex; gap:10px; align-items:center; margin-bottom:16px;">
              <i data-lucide="package" style="width:18px; height:18px; color:#0f5132;"></i>
              <div style="font-size:14px; font-weight:800; color:#0f5132;">Rincian Produk</div>
            </div>
            <div>${productsHtml}</div>
            <hr style="border:none; border-top:1px dashed #cbd5e1; margin:16px 0;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div style="font-size:13px; font-weight:600; color:#475569;">Total Pembayaran</div>
              <div style="font-size:16px; font-weight:800; color:#0f5132;">${formatRp(order.total_tagihan)}</div>
            </div>
          </div>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error('Error tracking order:', err);
    resultsContainer.innerHTML = '<div style="text-align:center; padding:20px; color:#ef4444">Gagal menghubungkan ke server untuk melacak pesanan.</div>';
  }
}

// Global modal injection
document.addEventListener('DOMContentLoaded', () => {
  const modalHtml = `
    <div id="track-modal" style="display:none; position:fixed; inset:0; z-index:1100; background:rgba(0,0,0,0.6); backdrop-filter:blur(5px); align-items:center; justify-content:center; padding:20px;">
      <div style="background:#fff; border-radius:16px; width:100%; max-width:860px; max-height:90vh; overflow-y:auto; box-shadow:0 20px 25px -5px rgba(0,0,0,0.15);">
        <div style="display:flex; align-items:center; justify-content:space-between; padding:16px 24px; border-bottom:1px solid #e2e8f0; position:sticky; top:0; background:#fff; z-index:10;">
          <h2 style="font-family:'Inter', sans-serif; font-size:18px; font-weight:800; text-transform:uppercase; margin:0">Lacak Pesanan</h2>
          <button onclick="closeTrackModal()" style="width:32px; height:32px; border-radius:50%; background:#f1f5f9; border:none; cursor:pointer; font-weight:bold; color:#64748b;">✕</button>
        </div>
        <div style="padding:24px;">
          <form onsubmit="event.preventDefault(); searchTrack(document.getElementById('track-input').value)" style="display:flex; gap:8px; background:#f8fafc; padding:6px; border-radius:10px; border:1px solid #cbd5e1; margin-bottom:24px;">
            <input id="track-input" type="text" placeholder="Masukkan ID Pesanan... (Contoh: BM-2025-001)" style="flex:1; border:none; background:transparent; outline:none; padding-left:12px; font-size:13px;">
            <button type="submit" class="btn-primary" style="padding:8px 20px; font-size:12px;">Cari</button>
          </form>
          <div id="track-results"></div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
});

// Format Rupiah
function formatRp(n) {
  return 'Rp ' + (n || 0).toLocaleString('id-ID');
}

// GLOBAL TOAST SYSTEM
document.addEventListener('DOMContentLoaded', () => {
  const toastHtml = `
    <div id="global-toast" style="position: fixed; top: -100px; left: 50%; transform: translateX(-50%); background: var(--grad-primary); border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 12px 32px rgba(91,192,27,0.35); border-radius: var(--radius-md); padding: 16px 20px; display: flex; align-items: center; gap: 14px; z-index: 9999; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); opacity: 0; pointer-events: none; min-width: 340px; max-width: 90%; color: var(--white);">
      <div id="global-toast-icon-bg" style="display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.25); border-radius: 50%; width: 40px; height: 40px; flex-shrink: 0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
        <span style="font-size: 20px; color: var(--white); display: inline-flex; align-items: center;"><i id="global-toast-icon" data-lucide="check-circle" style="width: 1em; height: 1em;"></i></span>
      </div>
      <div style="flex: 1; font-family: 'Inter', sans-serif;">
        <div id="global-toast-title" style="font-weight: 800; font-size: 14px; margin-bottom: 3px; letter-spacing: 0.3px;">BERHASIL!</div>
        <div id="global-toast-desc" style="font-size: 12px; color: rgba(255,255,255,0.9); line-height: 1.4;">Tindakan berhasil dilakukan.</div>
      </div>
      <div id="global-toast-actions" style="display: flex; align-items: center; gap: 12px; margin-left: 12px;">
        <a id="global-toast-link" href="keranjang.html" style="font-size: 12px; font-weight: 700; color: var(--green-dark); text-decoration: none; background: var(--white); padding: 8px 14px; border-radius: 99px; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" onmouseenter="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';" onmouseleave="this.style.transform=''; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)';">Lihat Keranjang</a>
        <button onclick="hideGlobalToast()" style="background: rgba(255,255,255,0.15); border: none; color: var(--white); font-size: 14px; cursor: pointer; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background 0.2s;" onmouseenter="this.style.background='rgba(255,255,255,0.3)'" onmouseleave="this.style.background='rgba(255,255,255,0.15)'"><i data-lucide="x" style="width: 16px; height: 16px;"></i></button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', toastHtml);
  if (window.lucide) window.lucide.createIcons();
});

let globalToastTimeout = null;

window.showGlobalToast = function(title, desc, type = 'success', showCartLink = false) {
  const toast = document.getElementById('global-toast');
  if (!toast) return;

  document.getElementById('global-toast-title').textContent = title.toUpperCase();
  document.getElementById('global-toast-desc').textContent = desc;
  document.getElementById('global-toast-link').style.display = showCartLink ? 'block' : 'none';

  const iconEl = document.getElementById('global-toast-icon');
  
  if (type === 'error') {
    toast.style.background = 'linear-gradient(135deg, #ef144a, #ff4d6d)';
    toast.style.boxShadow = '0 12px 32px rgba(239, 20, 74, 0.35)';
    iconEl.setAttribute('data-lucide', 'alert-circle');
    document.getElementById('global-toast-link').style.color = '#ef144a';
  } else if (type === 'warning') {
    toast.style.background = 'var(--grad-yellow)';
    toast.style.boxShadow = '0 12px 32px rgba(255, 191, 0, 0.35)';
    toast.style.color = 'var(--gray-dark)';
    document.getElementById('global-toast-icon-bg').style.background = 'rgba(0,0,0,0.1)';
    iconEl.style.color = 'var(--gray-dark)';
    iconEl.setAttribute('data-lucide', 'alert-triangle');
    document.getElementById('global-toast-title').style.color = 'var(--gray-dark)';
    document.getElementById('global-toast-desc').style.color = 'var(--gray-dark)';
    document.getElementById('global-toast-link').style.color = 'var(--gray-dark)';
  } else {
    toast.style.background = 'var(--grad-primary)';
    toast.style.boxShadow = '0 12px 32px rgba(91,192,27,0.35)';
    toast.style.color = 'var(--white)';
    document.getElementById('global-toast-icon-bg').style.background = 'rgba(255,255,255,0.25)';
    iconEl.style.color = 'var(--white)';
    iconEl.setAttribute('data-lucide', 'check-circle');
    document.getElementById('global-toast-title').style.color = 'var(--white)';
    document.getElementById('global-toast-desc').style.color = 'rgba(255,255,255,0.9)';
    document.getElementById('global-toast-link').style.color = 'var(--green-dark)';
  }
  
  if (window.lucide) window.lucide.createIcons();

  toast.style.top = '24px';
  toast.style.opacity = '1';
  toast.style.pointerEvents = 'auto';

  if (globalToastTimeout) clearTimeout(globalToastTimeout);
  globalToastTimeout = setTimeout(() => {
    hideGlobalToast();
  }, 4000);
}

window.hideGlobalToast = function() {
  const toast = document.getElementById('global-toast');
  if (toast) {
    toast.style.top = '-100px';
    toast.style.opacity = '0';
    toast.style.pointerEvents = 'none';
  }
}
