const fs = require('fs');

let code = fs.readFileSync('D:/git/BanditRock/backend-express/routes/admin-routes.js', 'utf8');

// Normalize newlines
code = code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// Update destructuring
const targetDestruct = `const { nama, kategori, harga_min, harga_max, tipe_harga, deskripsi, image_url, status_stok } = req.body`;
const replaceDestruct = `const { nama, kategori, harga_min, harga_max, tipe_harga, deskripsi, deskripsi_singkat, ukuran, image_url, image_url_2, image_url_3, image_url_4, status_stok } = req.body`;

if (code.includes(targetDestruct)) {
    code = code.replace(targetDestruct, replaceDestruct);
}

// Update insert object
const targetInsert = `.insert({
        nama,
        kategori,
        harga_min: harga_min || 0,
        harga_max: harga_max || harga_min || 0,
        tipe_harga: tipe_harga || 'fixed',
        deskripsi: deskripsi || '',
        image_url: image_url || '',
        status_stok: status_stok || 'ready'
      })`;

const replaceInsert = `.insert({
        nama,
        kategori,
        harga_min: harga_min || 0,
        harga_max: harga_max || harga_min || 0,
        tipe_harga: tipe_harga || 'fixed',
        deskripsi: deskripsi || '',
        deskripsi_singkat: deskripsi_singkat || '',
        ukuran: ukuran || '',
        image_url: image_url || '',
        image_url_2: image_url_2 || '',
        image_url_3: image_url_3 || '',
        image_url_4: image_url_4 || '',
        status_stok: status_stok || 'ready'
      })`;

if (code.includes(targetInsert)) {
    code = code.replace(targetInsert, replaceInsert);
    console.log("Backend updated successfully.");
} else {
    console.log("Failed to find targetInsert.");
}

fs.writeFileSync('D:/git/BanditRock/backend-express/routes/admin-routes.js', code);
