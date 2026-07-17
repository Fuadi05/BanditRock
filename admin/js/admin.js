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

document.addEventListener('DOMContentLoaded', () => {
  // Check login via token
  const token = getToken();
  const currentPage = window.location.pathname.split('/').pop();

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
      e.preventDefault();
      localStorage.removeItem('banditrock_token');
      sessionStorage.removeItem('banditrock_token');
      window.location.href = 'login.html';
    });
  }

  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Reset notification badge ke 0 (notifikasi real-time belum diimplementasi)
  const badges = document.querySelectorAll('.notif-badge');
  badges.forEach(b => {
    b.textContent = '0';
    b.style.display = 'none';
  });

  // Handle Notifikasi Dropdown
  const topbarRight = document.querySelector('.topbar-right');
  const notifBtn = document.querySelector('.notif-btn');
  if (topbarRight && notifBtn) {
    topbarRight.style.position = 'relative';
    const notifDropdown = document.createElement('div');
    notifDropdown.style.cssText = 'display:none; position:absolute; top:120%; right:0; background:white; width:280px; border-radius:12px; box-shadow:0 10px 25px rgba(0,0,0,0.1); border:1px solid #e2e8f0; z-index:999; padding:16px;';
    notifDropdown.innerHTML = `
      <div style="font-weight:700; font-size:14px; border-bottom:1px solid #e2e8f0; padding-bottom:10px; margin-bottom:10px; color:#1e293b; display:flex; justify-content:space-between; align-items:center;">
        <span>Notifikasi</span>
        <span style="font-size:11px; background:#f1f5f9; padding:2px 8px; border-radius:10px; color:#64748b;">0 Baru</span>
      </div>
      <div style="text-align:center; color:#94a3b8; font-size:13px; padding:30px 0;">
        <i data-lucide="bell-off" style="width:32px; height:32px; margin-bottom:8px; opacity:0.5;"></i>
        <div>Belum ada notifikasi baru</div>
      </div>
    `;
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

    if (window.lucide) window.lucide.createIcons();
  }
});

// Helper for formatting currency
function formatRpAdmin(number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
}
