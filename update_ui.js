const fs = require('fs');

let html = fs.readFileSync('D:/git/BanditRock/admin/tambah-produk.html', 'utf8');

// Normalize newlines
html = html.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// 1. Replace Ukuran input
const targetUkuran = `<input type="text" class="form-control" placeholder="Ukuran (misal: 20x20 cm)">`;
const replaceUkuran = `
<div style="margin-bottom: 16px;">
  <label style="font-size: 12px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 8px;">Pilih Ukuran Tersedia</label>
  <div style="display: flex; gap: 12px; flex-wrap: wrap;" id="p-ukuran-container">
    <label style="display: flex; align-items: center; gap: 4px; font-size: 13px; cursor: pointer;">
      <input type="checkbox" value="Kecil" class="ukuran-cb"> Kecil
    </label>
    <label style="display: flex; align-items: center; gap: 4px; font-size: 13px; cursor: pointer;">
      <input type="checkbox" value="Sedang" class="ukuran-cb"> Sedang
    </label>
    <label style="display: flex; align-items: center; gap: 4px; font-size: 13px; cursor: pointer;">
      <input type="checkbox" value="Besar" class="ukuran-cb"> Besar
    </label>
    <label style="display: flex; align-items: center; gap: 4px; font-size: 13px; cursor: pointer;">
      <input type="checkbox" value="Ekstra Besar" class="ukuran-cb"> Ekstra Besar
    </label>
  </div>
</div>`;
html = html.replace(targetUkuran, replaceUkuran);

// 2. Replace Deskripsi Singkat textarea
const targetDescShort = `<textarea class="form-control" rows="3" placeholder="..."></textarea>`;
const replaceDescShort = `<textarea id="p-desc-short" class="form-control" rows="3" placeholder="Deskripsi Singkat"></textarea>`;
html = html.replace(targetDescShort, replaceDescShort);

// 3. Update Upload Section for 4 images
const targetUpload = `          <div class="card" style="display: flex; flex-direction: column; gap: 16px;">
            <label style="font-size: 12px; font-weight: 600; color: var(--text-muted); display: block;">URL Gambar Utama</label>
            <div id="upload-box" style="border: 2px dashed var(--border-color); border-radius: 8px; padding: 32px; text-align: center; background: #F8FAFC; cursor: pointer;" onclick="document.getElementById('file-upload').click()">
              <i data-lucide="image" style="color: var(--primary); width: 32px; height: 32px; margin-bottom: 8px;"></i>
              <p id="upload-text" style="font-size: 13px; color: var(--primary); font-weight: 600;">Klik untuk Unggah Gambar</p>
              <p style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Pilih file dari komputer Anda (Maks: 5MB)</p>
            </div>
            <input type="file" id="file-upload" accept="image/png, image/jpeg, image/jpg" style="display: none;" onchange="handleFileUpload(event, 1)">
            <input type="hidden" id="p-img" class="form-control" value="" required>
            
            <label style="font-size: 12px; font-weight: 600; color: var(--text-muted); display: block; margin-top: 16px;">Pratinjau Gambar Utama</label>
            <div id="preview-container" style="display: none; width: 100%; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: #F8FAFC;">
              <img id="preview-img" src="" alt="Pratinjau" style="width: 100%; display: block; object-fit: cover;">
            </div>
          </div>`;

// Wait, the existing code has onchange="handleFileUpload(event)" without the index.
const exactTargetUpload = html.substring(html.indexOf('<!-- Right Card / Image Upload -->') + '<!-- Right Card / Image Upload -->'.length, html.indexOf('</div>\n\n        </div>')).trim();

const replaceUpload = `<div class="card" style="display: flex; flex-direction: column; gap: 16px;">
            <label style="font-size: 12px; font-weight: 600; color: var(--text-muted); display: block;">Gambar Produk (Maks 4)</label>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <!-- Upload 1 -->
              <div>
                <div id="upload-box-1" style="border: 1px dashed var(--border-color); border-radius: 8px; padding: 16px; text-align: center; background: #F8FAFC; cursor: pointer; height: 120px; display: flex; flex-direction: column; justify-content: center; align-items: center;" onclick="document.getElementById('file-upload-1').click()">
                  <i data-lucide="image" style="color: var(--primary); width: 24px; height: 24px; margin-bottom: 8px;"></i>
                  <p id="upload-text-1" style="font-size: 11px; color: var(--primary); font-weight: 600;">Gambar 1 (Utama)</p>
                </div>
                <input type="file" id="file-upload-1" accept="image/png, image/jpeg, image/jpg" style="display: none;" onchange="handleGenericUpload(event, 1)">
                <input type="hidden" id="p-img" value="" required>
                <div id="preview-container-1" style="display: none; width: 100%; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: #F8FAFC; margin-top: 8px; height: 120px;">
                  <img id="preview-img-1" src="" style="width: 100%; height: 100%; display: block; object-fit: cover;">
                </div>
              </div>

              <!-- Upload 2 -->
              <div>
                <div id="upload-box-2" style="border: 1px dashed var(--border-color); border-radius: 8px; padding: 16px; text-align: center; background: #F8FAFC; cursor: pointer; height: 120px; display: flex; flex-direction: column; justify-content: center; align-items: center;" onclick="document.getElementById('file-upload-2').click()">
                  <i data-lucide="image" style="color: var(--text-muted); width: 24px; height: 24px; margin-bottom: 8px;"></i>
                  <p id="upload-text-2" style="font-size: 11px; color: var(--text-muted); font-weight: 600;">Gambar 2</p>
                </div>
                <input type="file" id="file-upload-2" accept="image/png, image/jpeg, image/jpg" style="display: none;" onchange="handleGenericUpload(event, 2)">
                <input type="hidden" id="p-img2" value="">
                <div id="preview-container-2" style="display: none; width: 100%; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: #F8FAFC; margin-top: 8px; height: 120px;">
                  <img id="preview-img-2" src="" style="width: 100%; height: 100%; display: block; object-fit: cover;">
                </div>
              </div>

              <!-- Upload 3 -->
              <div>
                <div id="upload-box-3" style="border: 1px dashed var(--border-color); border-radius: 8px; padding: 16px; text-align: center; background: #F8FAFC; cursor: pointer; height: 120px; display: flex; flex-direction: column; justify-content: center; align-items: center;" onclick="document.getElementById('file-upload-3').click()">
                  <i data-lucide="image" style="color: var(--text-muted); width: 24px; height: 24px; margin-bottom: 8px;"></i>
                  <p id="upload-text-3" style="font-size: 11px; color: var(--text-muted); font-weight: 600;">Gambar 3</p>
                </div>
                <input type="file" id="file-upload-3" accept="image/png, image/jpeg, image/jpg" style="display: none;" onchange="handleGenericUpload(event, 3)">
                <input type="hidden" id="p-img3" value="">
                <div id="preview-container-3" style="display: none; width: 100%; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: #F8FAFC; margin-top: 8px; height: 120px;">
                  <img id="preview-img-3" src="" style="width: 100%; height: 100%; display: block; object-fit: cover;">
                </div>
              </div>

              <!-- Upload 4 -->
              <div>
                <div id="upload-box-4" style="border: 1px dashed var(--border-color); border-radius: 8px; padding: 16px; text-align: center; background: #F8FAFC; cursor: pointer; height: 120px; display: flex; flex-direction: column; justify-content: center; align-items: center;" onclick="document.getElementById('file-upload-4').click()">
                  <i data-lucide="image" style="color: var(--text-muted); width: 24px; height: 24px; margin-bottom: 8px;"></i>
                  <p id="upload-text-4" style="font-size: 11px; color: var(--text-muted); font-weight: 600;">Gambar 4</p>
                </div>
                <input type="file" id="file-upload-4" accept="image/png, image/jpeg, image/jpg" style="display: none;" onchange="handleGenericUpload(event, 4)">
                <input type="hidden" id="p-img4" value="">
                <div id="preview-container-4" style="display: none; width: 100%; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: #F8FAFC; margin-top: 8px; height: 120px;">
                  <img id="preview-img-4" src="" style="width: 100%; height: 100%; display: block; object-fit: cover;">
                </div>
              </div>
            </div>
          </div>`;

html = html.replace(exactTargetUpload, replaceUpload);

// 4. Update JS functions
const jsFunctionGeneric = `    async function handleGenericUpload(event, index) {
      const file = event.target.files[0];
      if (!file) return;
      const uploadText = document.getElementById('upload-text-' + index);
      const originalText = uploadText.textContent;
      uploadText.textContent = 'Mengunggah...';
      const formData = new FormData();
      formData.append('image', file);
      try {
        const res = await fetch(\`\${API_BASE}/admin/upload\`, {
          method: 'POST',
          headers: { 'Authorization': \`Bearer \${getToken()}\` },
          body: formData
        });
        const json = await res.json();
        if (json.success) {
          document.getElementById(index === 1 ? 'p-img' : 'p-img' + index).value = json.url;
          uploadText.textContent = 'Berhasil!';
          document.getElementById('preview-container-' + index).style.display = 'block';
          document.getElementById('preview-img-' + index).src = json.url;
          document.getElementById('upload-box-' + index).style.display = 'none';
        } else {
          alert('Gagal mengunggah: ' + (json.error || json.message));
          uploadText.textContent = originalText;
        }
      } catch (err) {
        alert('Terjadi kesalahan saat mengunggah gambar.');
        uploadText.textContent = originalText;
      }
    }`;

const oldJsFunctionStart = `    async function handleFileUpload(event) {`;
const oldJsFunctionEnd = `        uploadText.textContent = 'Klik untuk Unggah Gambar';\n      }\n    }`;

if (html.includes(oldJsFunctionStart)) {
    const startIdx = html.indexOf(oldJsFunctionStart);
    const endIdx = html.indexOf(oldJsFunctionEnd) + oldJsFunctionEnd.length;
    html = html.substring(0, startIdx) + jsFunctionGeneric + html.substring(endIdx);
} else {
    // maybe already replaced? Or we just append it.
    html = html.replace('<script>', '<script>\n' + jsFunctionGeneric);
}

// 5. Update submit object mapping
const oldSubmitTarget = `const produk = {
        nama: document.getElementById('p-name').value,
        kategori: document.getElementById('p-cat').value,
        harga_min: parseInt(document.getElementById('p-price').value) || 0,
        harga_max: parseInt(document.getElementById('p-price').value) || 0,
        deskripsi: document.getElementById('p-desc').value,
        image_url: document.getElementById('p-img').value,
      };`;

const newSubmitReplace = `
      // Ambil ukuran yang dicentang
      const ukuranChecked = Array.from(document.querySelectorAll('.ukuran-cb:checked')).map(cb => cb.value).join(', ');
      
      const produk = {
        nama: document.getElementById('p-name').value,
        kategori: document.getElementById('p-cat').value,
        harga_min: parseInt(document.getElementById('p-price').value) || 0,
        harga_max: parseInt(document.getElementById('p-price').value) || 0,
        deskripsi: document.getElementById('p-desc').value,
        deskripsi_singkat: document.getElementById('p-desc-short').value,
        ukuran: ukuranChecked,
        image_url: document.getElementById('p-img').value,
        image_url_2: document.getElementById('p-img2').value,
        image_url_3: document.getElementById('p-img3').value,
        image_url_4: document.getElementById('p-img4').value,
      };`;

html = html.replace(oldSubmitTarget, newSubmitReplace);

// 6. Fix fetching details logic for Edit mode
const detailLogicTarget = `          document.getElementById('p-name').value = p.nama;
          document.getElementById('p-cat').value = p.kategori;
          document.getElementById('p-price').value = p.harga_min;
          document.getElementById('p-desc').value = p.deskripsi || '';
          document.getElementById('p-img').value = p.image_url || '';`;

const detailLogicReplace = `          document.getElementById('p-name').value = p.nama;
          document.getElementById('p-cat').value = p.kategori;
          document.getElementById('p-price').value = p.harga_min;
          document.getElementById('p-desc').value = p.deskripsi || '';
          if (document.getElementById('p-desc-short')) {
             document.getElementById('p-desc-short').value = p.deskripsi_singkat || '';
          }
          
          if (p.ukuran) {
             const ukuranArr = p.ukuran.split(',').map(s => s.trim());
             document.querySelectorAll('.ukuran-cb').forEach(cb => {
                 cb.checked = ukuranArr.includes(cb.value);
             });
          }

          const setImg = (index, url) => {
             if (url) {
                document.getElementById(index === 1 ? 'p-img' : 'p-img'+index).value = url;
                document.getElementById('preview-container-'+index).style.display = 'block';
                document.getElementById('preview-img-'+index).src = url;
                document.getElementById('upload-box-'+index).style.display = 'none';
             }
          };
          setImg(1, p.image_url);
          setImg(2, p.image_url_2);
          setImg(3, p.image_url_3);
          setImg(4, p.image_url_4);`;

html = html.replace(detailLogicTarget, detailLogicReplace);

fs.writeFileSync('D:/git/BanditRock/admin/tambah-produk.html', html);
console.log("UI updated!");
