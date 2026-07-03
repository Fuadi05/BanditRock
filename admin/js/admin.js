// admin.js

document.addEventListener('DOMContentLoaded', () => {
  // Check login
  const isLoggedIn = localStorage.getItem('banditrock_admin_auth');
  const currentPage = window.location.pathname.split('/').pop();

  if (!isLoggedIn && currentPage !== 'login.html') {
    window.location.href = 'login.html';
  } else if (isLoggedIn && currentPage === 'login.html') {
    window.location.href = 'index.html';
  }

  // Handle logout
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('banditrock_admin_auth');
      window.location.href = 'login.html';
    });
  }

  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Notification system
  const notifBtns = document.querySelectorAll('.notif-btn');
  if (notifBtns.length > 0) {
    notifBtns.forEach(btn => {
      const container = document.createElement('div');
      container.className = 'notif-container';
      btn.parentNode.insertBefore(container, btn);
      container.appendChild(btn);

      const dropdown = document.createElement('div');
      dropdown.className = 'notif-dropdown';
      
      const header = document.createElement('div');
      header.className = 'notif-header';
      header.textContent = 'Notifikasi Terbaru';
      dropdown.appendChild(header);

      const list = document.createElement('div');
      list.className = 'notif-list';
      dropdown.appendChild(list);

      container.appendChild(dropdown);

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
        renderNotifs(list, btn);
      });

      document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
          dropdown.classList.remove('show');
        }
      });

      // Initial render
      renderNotifs(list, btn);
    });
  }
});

function renderNotifs(listEl, btnEl) {
  const sales = JSON.parse(localStorage.getItem('banditrock_sales') || '[]');
  const dismissed = JSON.parse(localStorage.getItem('banditrock_dismissed_notifs') || '[]');
  
  const activeNotifs = [...sales].reverse().filter(s => !dismissed.includes(s.id));
  
  const badge = btnEl.querySelector('.notif-badge');
  if (badge) {
    badge.textContent = activeNotifs.length;
    badge.style.display = activeNotifs.length > 0 ? 'flex' : 'none';
  }

  if (activeNotifs.length === 0) {
    listEl.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">Tidak ada notifikasi baru.</div>';
    return;
  }

  listEl.innerHTML = activeNotifs.map(n => `
    <div class="notif-item" data-id="${n.id}">
      <div class="notif-icon"><i data-lucide="shopping-bag" style="width:16px;height:16px;"></i></div>
      <div class="notif-content">
        <div class="notif-title">Pesanan Baru (${n.id})</div>
        <div class="notif-desc"><span style="font-weight:600;">${n.pelanggan}</span> telah melakukan pemesanan sebesar ${formatRpAdmin(n.total)}.</div>
        <div class="notif-time">${n.tgl}</div>
      </div>
      <button class="notif-dismiss" onclick="dismissNotif(event, '${n.id}')">
        <i data-lucide="x" style="width:14px;height:14px;"></i>
      </button>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

window.dismissNotif = function(e, id) {
  e.stopPropagation();
  const dismissed = JSON.parse(localStorage.getItem('banditrock_dismissed_notifs') || '[]');
  if (!dismissed.includes(id)) {
    dismissed.push(id);
    localStorage.setItem('banditrock_dismissed_notifs', JSON.stringify(dismissed));
  }
  
  const item = e.target.closest('.notif-item');
  if (item) {
    item.classList.add('swiping');
    setTimeout(() => {
      document.querySelectorAll('.notif-btn').forEach(btn => {
        if(btn.nextElementSibling && btn.nextElementSibling.classList.contains('notif-dropdown')) {
           const list = btn.nextElementSibling.querySelector('.notif-list');
           if(list) renderNotifs(list, btn);
        }
      });
    }, 300);
  }
};

// Helper for formatting currency
function formatRpAdmin(number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
}
