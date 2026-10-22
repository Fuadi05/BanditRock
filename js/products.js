// ============================================
// js/products.js
// Mengambil data katalog dari Backend API
// ============================================

window.products = [];

// Data kategori statis untuk homepage
window.categories = [
  { id: 'alat-dapur', name: 'Alat Dapur', image: 'images/media__1780324962198.jpg' },
  { id: 'interior', name: 'Interior', image: 'images/media__1780324641278.jpg' },
  { id: 'eksterior', name: 'Eksterior', image: 'images/stone_product2_1780322918796.png' },
  { id: 'ornamen-dinding', name: 'Ornamen Dinding', image: 'images/media__1780324962433.jpg' },
]

window.allCategories = [];

// Helper fungsi untuk format rupiah
function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
}

// Fungsi utama untuk mengambil data dari backend
window.fetchProducts = async () => {
  try {
    const res = await fetch('https://batumerapi.biz.id/api/produk');
    const json = await res.json();
    
    if (json.success && json.data) {
      // Map data backend ke struktur yang diharapkan frontend
      window.products = json.data.map(p => ({
        id: p.id,
        name: p.nama,
        category: p.kategori,
        image: p.image_url || 'images/media__1780324962198.jpg',
        image2: p.image_url_2 || null,
        image3: p.image_url_3 || null,
        image4: p.image_url_4 || null,
        price: formatRupiah(p.harga_min),
        priceNum: Number(p.harga_min) || 0,
        rating: 5.0, // Default statis
        ratingCount: 10,
        desc: p.deskripsi,
        desc_short: p.deskripsi_singkat || p.deskripsi,
        ukuran: p.ukuran || '',
        status_stok: p.status_stok !== false,
        created_at: p.created_at || null
      }));

      // Update kategori unik berdasarkan data backend
      window.allCategories = [...new Set(window.products.map(p => p.category).filter(Boolean))];
    }
  } catch (error) {
    console.error("Gagal mengambil data produk dari server:", error);
  }
};

// Shared Product Card Renderer (Single Source of Truth)
window.createProductCard = function(p) {
  const esc = window.escapeHtml || ((s) => String(s || ''));
  const uArr = p.ukuran ? p.ukuran.split(',').map(s => s.trim()).filter(Boolean) : [];
  const sizeLabels = uArr.length > 0
    ? uArr.map(u => u === 'Kecil' ? 'S' : u === 'Sedang' ? 'M' : u === 'Besar' ? 'L' : u === 'Ekstra Besar' ? 'XL' : u)
    : ['S', 'M', 'L', 'XL'];
  const sizesHtml = sizeLabels.map(s =>
    `<span style="font-size:10px; font-weight:700; padding:2px 7px; border-radius:4px; background:var(--gray-light); color:var(--gray-dark); border:1px solid var(--gray-mid);">${esc(s)}</span>`
  ).join('');

  return `
    <a href="detail.html?id=${encodeURIComponent(p.id)}" class="product-card">
      <div class="product-card-img" style="position:relative; aspect-ratio:1/1; overflow:hidden; background:var(--gray-light);">
        <img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;transition:transform .35s;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
        <div class="product-img-ph" style="display:none;"><i data-lucide="image" style="width:32px;height:32px;color:var(--gray-mid);"></i></div>
      </div>
      <div class="product-card-body">
        <div class="product-category">${esc(p.category)}</div>
        <h3 class="product-card-name" style="font-size:clamp(12px,1.2vw,15px);">${esc(p.name)}</h3>
        <div class="price-row">
          <span class="product-price" style="color:var(--green-primary);">${esc(p.price)}</span>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:8px;">${sizesHtml}</div>
      </div>
    </a>
  `;
};
