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
  { id: 'dinding-lantai', name: 'Dinding & Lantai', image: 'images/media__1780324641278.jpg' },
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
        image: p.image_url || '../images/media__1780324962198.jpg',
        image2: p.image_url_2 || null,
        image3: p.image_url_3 || null,
        image4: p.image_url_4 || null,
        price: formatRupiah(p.harga_min),
        priceNum: p.harga_min,
        rating: 5.0, // Default statis
        ratingCount: 10,
        desc: p.deskripsi,
        desc_short: p.deskripsi_singkat || p.deskripsi,
        ukuran: p.ukuran || ''
        // Fitur diskon dihapus, jadi tidak ada discount atau originalPrice
      }));

      // Update kategori unik berdasarkan data backend
      window.allCategories = [...new Set(window.products.map(p => p.category))];
    }
  } catch (error) {
    console.error("Gagal mengambil data produk dari server:", error);
    // Jika server mati, products tetap array kosong
  }
};
