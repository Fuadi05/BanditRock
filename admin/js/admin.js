// admin.js — Production Ready
// Auth guard menggunakan JWT token, bukan localStorage flag

const API_BASE = 'https://batumerapi.biz.id/api';

function getToken() {
  return localStorage.getItem('banditrock_token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

function logoutAdmin(e) {
  if (e) e.preventDefault();
  localStorage.removeItem('banditrock_token');
  sessionStorage.removeItem('banditrock_token');
  window.location.href = 'login.html';
}

function handleApiAuthError(res, json) {
  if (res.status === 401 || (json && json.message && (json.message.includes('Token') || json.message.includes('token')))) {
    console.warn('Session expired or token invalid. Redirecting to login...');
    logoutAdmin();
    return true;
  }
  return false;
}

document.addEventListener('DOMContentLoaded', () => {
  // Check login via token
  const token = getToken();
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  if (!token && currentPage !== 'login.html') {
    window.location.href = 'login.html';
    return;
  } else if (token && currentPage === 'login.html') {
    window.location.href = 'index.html';
    return;
  }

  // Handle logout
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      logoutAdmin(e);
    });
  }

  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Handle Topbar Avatar click & load
  loadTopbarAvatar();

  // Handle Notifikasi Dropdown & Real-time Fetch
  setupAdminNotifications();
});

async function loadTopbarAvatar() {
  const topbarAvatar = document.querySelector('.avatar');
  if (!topbarAvatar) return;

  topbarAvatar.style.cursor = 'pointer';
  topbarAvatar.title = 'Pengaturan Profil Admin';
  topbarAvatar.onclick = (e) => {
    e.preventDefault();
    window.location.href = 'profil.html';
  };

  try {
    const res = await fetch(`${API_BASE}/admin/profile`, {
      headers: authHeaders()
    });
    const json = await res.json();
    if (json.success && json.data) {
      if (json.data.avatar_url) {
        topbarAvatar.innerHTML = `<img src="${json.data.avatar_url}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        topbarAvatar.style.background = 'transparent';
      } else {
        topbarAvatar.textContent = (json.data.username || 'A').charAt(0).toUpperCase();
      }
    }
  } catch (err) {
    console.error('Error loading topbar avatar:', err);
  }
}

async function setupAdminNotifications() {
  const topbarRight = document.querySelector('.topbar-right');
  const notifBtn = document.querySelector('.notif-btn');
  if (!topbarRight || !notifBtn) return;

  topbarRight.style.position = 'relative';
  let notifDropdown = document.getElementById('global-notif-dropdown');
  if (!notifDropdown) {
    notifDropdown = document.createElement('div');
    notifDropdown.id = 'global-notif-dropdown';
    notifDropdown.style.cssText = 'display:none; position:absolute; top:120%; right:0; background:white; width:300px; border-radius:12px; box-shadow:0 10px 25px rgba(0,0,0,0.15); border:1px solid #e2e8f0; z-index:999; padding:16px;';
    topbarRight.appendChild(notifDropdown);

    notifBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isHidden = notifDropdown.style.display === 'none';
      notifDropdown.style.display = isHidden ? 'block' : 'none';
    });

    document.addEventListener('click', (e) => {
      if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
        notifDropdown.style.display = 'none';
      }
    });
  }

  try {
    const res = await fetch(`${API_BASE}/admin/orders`, {
      headers: authHeaders()
    });
    const json = await res.json();
    if (handleApiAuthError(res, json)) return;
    if (!json.success || !json.data) return;

    const newOrders = json.data.filter(o => o.status === 'waiting_verification' || o.status === 'pending_payment');
    const badgeCount = newOrders.length;

    const badges = document.querySelectorAll('.notif-badge');
    badges.forEach(b => {
      if (badgeCount > 0) {
        b.textContent = badgeCount;
        b.style.display = 'flex';
      } else {
        b.textContent = '0';
        b.style.display = 'none';
      }
    });

    if (badgeCount === 0) {
      notifDropdown.innerHTML = `
        <div style="font-weight:700; font-size:14px; border-bottom:1px solid #e2e8f0; padding-bottom:10px; margin-bottom:10px; color:#1e293b; display:flex; justify-content:space-between; align-items:center;">
          <span>Notifikasi</span>
          <span style="font-size:11px; background:#f1f5f9; padding:2px 8px; border-radius:10px; color:#64748b;">0 Baru</span>
        </div>
        <div style="text-align:center; color:#94a3b8; font-size:13px; padding:20px 0;">
          <i data-lucide="bell-off" style="width:32px; height:32px; margin-bottom:8px; opacity:0.5;"></i>
          <div>Belum ada notifikasi baru</div>
        </div>
      `;
    } else {
      let itemsHtml = newOrders.slice(0, 5).map(o => {
        const dateStr = new Date(o.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        const label = o.status === 'waiting_verification' ? '💡 Perlu Verifikasi Transfer' : '🕒 Pesanan Menunggu Pembayaran';
        return `
          <a href="penjualan.html" style="display:flex; gap:10px; align-items:flex-start; padding:10px; border-radius:8px; background:#F8FAFC; margin-bottom:8px; text-decoration:none; transition:background 0.2s; border:1px solid #E2E8F0;">
            <div style="width:32px; height:32px; border-radius:50%; background:#FEF3C7; color:#D97706; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <i data-lucide="shopping-bag" style="width:16px; height:16px;"></i>
            </div>
            <div style="flex:1;">
              <div style="font-size:12px; font-weight:700; color:#1E293B; display:flex; justify-content:space-between;">
                <span>${o.id}</span>
                <span style="font-size:10px; color:#94A3B8;">${dateStr}</span>
              </div>
              <div style="font-size:11px; color:#475569; margin-top:2px;">${o.nama_pembeli}</div>
              <div style="font-size:10px; font-weight:700; color:#D97706; margin-top:2px;">${label}</div>
            </div>
          </a>
        `;
      }).join('');

      notifDropdown.innerHTML = `
        <div style="font-weight:700; font-size:14px; border-bottom:1px solid #e2e8f0; padding-bottom:10px; margin-bottom:10px; color:#1e293b; display:flex; justify-content:space-between; align-items:center;">
          <span>Notifikasi Pesanan</span>
          <span style="font-size:11px; background:#EF4444; color:white; padding:2px 8px; border-radius:10px; font-weight:700;">${badgeCount} Baru</span>
        </div>
        <div style="max-height:260px; overflow-y:auto;">${itemsHtml}</div>
        <a href="penjualan.html" style="display:block; text-align:center; font-size:12px; font-weight:700; color:#7C3AED; text-decoration:none; margin-top:10px; padding-top:8px; border-top:1px solid #E2E8F0;">Lihat Semua Penjualan →</a>
      `;
    }
    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error('Error fetching admin notifications:', err);
  }
}

// Helper for formatting currency
function formatRpAdmin(number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);
}
