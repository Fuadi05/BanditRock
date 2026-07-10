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
});

// Helper for formatting currency
function formatRpAdmin(number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
}
