const fs = require('fs');

let html = fs.readFileSync('D:/git/BanditRock/admin/tambah-produk.html', 'utf8');

// Normalize newlines to \n
html = html.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

const targetStr = `            <label style="font-size: 12px; font-weight: 600; color: var(--text-muted); display: block; margin-top: 16px;">Gambar Tambahan</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div style="border: 1px dashed var(--border-color); height: 80px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #F8FAFC; color: var(--primary); cursor: pointer;">
                <i data-lucide="image"></i>
              </div>
              <div style="border: 1px dashed var(--border-color); height: 80px; border-radius: 8px;"></div>
            </div>`;

const replaceStr = `            <label style="font-size: 12px; font-weight: 600; color: var(--text-muted); display: block; margin-top: 16px;">Pratinjau Gambar Utama</label>
            <div id="preview-container" style="display: none; width: 100%; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: #F8FAFC;">
              <img id="preview-img" src="" alt="Pratinjau" style="width: 100%; display: block; object-fit: cover;">
            </div>`;

if (html.includes(targetStr)) {
    html = html.replace(targetStr, replaceStr);
    console.log("HTML structure replaced!");
} else {
    console.log("Target HTML structure not found!");
}

const jsTarget = `        if (json.success) {
          document.getElementById('p-img').value = json.url;
          uploadText.textContent = 'Gambar Berhasil Diunggah!';
        }`;

const jsReplace = `        if (json.success) {
          document.getElementById('p-img').value = json.url;
          uploadText.textContent = 'Gambar Berhasil Diunggah!';
          document.getElementById('preview-container').style.display = 'block';
          document.getElementById('preview-img').src = json.url;
        }`;

if (html.includes(jsTarget)) {
    html = html.replace(jsTarget, jsReplace);
    console.log("JS code replaced!");
} else {
    console.log("Target JS code not found! It might already be replaced.");
}

fs.writeFileSync('D:/git/BanditRock/admin/tambah-produk.html', html);
