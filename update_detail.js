const fs = require('fs');

let html = fs.readFileSync('D:/git/BanditRock/detail.html', 'utf8');

// 1. Move Deskripsi Lengkap into a toggleable section below "Pilih Ukuran"
const targetInfo = `      <!-- Info -->
      <div>
        <h1 class="detail-name" id="prod-name" style="font-family: 'Poppins', sans-serif; font-weight: 900; color: var(--text-primary);"></h1>
        <div class="detail-price" style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <span id="prod-price" style="color: var(--green-primary); font-weight: 900; font-size: 24px;"></span>
        </div>
        <p class="detail-desc" id="prod-desc" style="color: var(--gray-dark); line-height: 1.7; font-size: 14px; margin-bottom: 20px;"></p>

        <!-- Size Selector -->
        <div class="detail-label" style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 8px;">Pilih Ukuran</div>
        <div class="size-options" id="size-options" style="display: flex; gap: 10px; margin-bottom: 24px;"></div>

        <!-- Qty & ATC -->`;

const replaceInfo = `      <!-- Info -->
      <div>
        <h1 class="detail-name" id="prod-name" style="font-family: 'Poppins', sans-serif; font-weight: 900; color: var(--text-primary);"></h1>
        <div class="detail-price" style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <span id="prod-price" style="color: var(--green-primary); font-weight: 900; font-size: 24px;"></span>
        </div>
        
        <!-- Deskripsi Singkat -->
        <p class="detail-desc" id="prod-desc-short" style="color: var(--gray-dark); line-height: 1.7; font-size: 14px; margin-bottom: 20px;"></p>

        <!-- Size Selector -->
        <div class="detail-label" style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 8px;">Pilih Ukuran</div>
        <div class="size-options" id="size-options" style="display: flex; gap: 10px; margin-bottom: 24px;"></div>

        <!-- Read More Button -->
        <button id="btn-read-more" style="background: none; border: 1px solid var(--gray-mid); border-radius: 8px; padding: 8px 16px; font-weight: 600; font-size: 13px; cursor: pointer; margin-bottom: 24px; color: var(--text-primary);" onclick="toggleFullDesc()">Baca Selengkapnya / Deskripsi Lengkap <i data-lucide="chevron-down" style="width: 14px; height: 14px; vertical-align: middle;"></i></button>

        <div id="full-desc-container" style="display: none; margin-bottom: 24px; padding: 16px; background: #F8FAFC; border-radius: 8px; border: 1px solid #e2e8f0;">
          <p id="prod-desc-full-text" style="font-size: 13px; line-height: 1.6; color: var(--text-secondary);"></p>
        </div>

        <!-- Qty & ATC -->`;

if (html.includes(targetInfo)) {
    html = html.replace(targetInfo, replaceInfo);
}

// 2. Add the toggle script at the bottom
const toggleScript = `  <script>
    function toggleFullDesc() {
      const container = document.getElementById('full-desc-container');
      if (container.style.display === 'none') {
        container.style.display = 'block';
      } else {
        container.style.display = 'none';
      }
    }
  </script>`;

if (!html.includes('toggleFullDesc()')) {
    html = html.replace('</body>', toggleScript + '\n</body>');
}

fs.writeFileSync('D:/git/BanditRock/detail.html', html);

let js = fs.readFileSync('D:/git/BanditRock/js/products.js', 'utf8');

// Normalize newlines in js
js = js.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// 3. Update products.js renderDetail()
// We need to inject the images, short desc, long desc, and sizes.
const renderTarget = `        document.getElementById('prod-name').textContent = p.nama;
        document.getElementById('prod-price').textContent = formatRp(p.harga_min);
        document.getElementById('prod-desc').textContent = p.deskripsi;
        document.getElementById('prod-desc-full').textContent = p.deskripsi;
        
        // Setup images
        const mainGal = document.getElementById('gallery-main');
        mainGal.innerHTML = \`<img src="\${p.image_url}" alt="\${p.nama}" style="width:100%; display:block; border-radius:12px;">\`;

        // (Thumbnail dummy - in real scenario, iterate p.images)
        const thumbs = document.getElementById('gallery-thumbs');
        thumbs.innerHTML = '';
        for (let i=0; i<4; i++) {
          thumbs.innerHTML += \`<div class="thumb-item" style="border-radius:8px; overflow:hidden; cursor:pointer; border:2px solid \${i===0 ? 'var(--green-primary)' : 'transparent'};"><img src="\${p.image_url}" style="width:100%; display:block;"></div>\`;
        }

        // Setup sizes (Dummy sizes for now)
        const sizes = ['Kecil', 'Sedang', 'Besar', 'Ekstra Besar'];
        const sizeContainer = document.getElementById('size-options');
        sizeContainer.innerHTML = '';
        sizes.forEach((sz, idx) => {
          const btn = document.createElement('button');
          btn.textContent = sz;
          btn.style.cssText = \`
            background: \${idx===0 ? 'var(--green-primary)' : '#fff'};
            color: \${idx===0 ? '#fff' : 'var(--text-secondary)'};
            border: 1px solid \${idx===0 ? 'var(--green-primary)' : 'var(--gray-mid)'};
            padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px;
          \`;
          btn.onclick = () => {
            Array.from(sizeContainer.children).forEach(c => {
              c.style.background = '#fff';
              c.style.color = 'var(--text-secondary)';
              c.style.borderColor = 'var(--gray-mid)';
            });
            btn.style.background = 'var(--green-primary)';
            btn.style.color = '#fff';
            btn.style.borderColor = 'var(--green-primary)';
          };
          sizeContainer.appendChild(btn);
        });`;

const renderReplace = `        document.getElementById('prod-name').textContent = p.nama;
        document.getElementById('prod-price').textContent = formatRp(p.harga_min);
        
        if (document.getElementById('prod-desc-short')) {
           document.getElementById('prod-desc-short').textContent = p.deskripsi_singkat || p.deskripsi.substring(0, 100) + '...';
        }
        
        if (document.getElementById('prod-desc-full-text')) {
           document.getElementById('prod-desc-full-text').textContent = p.deskripsi;
        }
        
        // Setup images array
        const images = [p.image_url, p.image_url_2, p.image_url_3, p.image_url_4].filter(Boolean);
        if (images.length === 0) images.push('https://via.placeholder.com/600');
        
        const mainGal = document.getElementById('gallery-main');
        mainGal.innerHTML = \`<img id="main-img-display" src="\${images[0]}" alt="\${p.nama}" style="width:100%; display:block; border-radius:12px; object-fit:cover; aspect-ratio:1/1;">\`;

        const thumbs = document.getElementById('gallery-thumbs');
        thumbs.innerHTML = '';
        images.forEach((imgUrl, i) => {
          const thumbDiv = document.createElement('div');
          thumbDiv.className = 'thumb-item';
          thumbDiv.style.cssText = \`border-radius:8px; overflow:hidden; cursor:pointer; border:2px solid \${i===0 ? 'var(--green-primary)' : 'transparent'};\`;
          thumbDiv.innerHTML = \`<img src="\${imgUrl}" style="width:100%; height:100%; display:block; object-fit:cover;">\`;
          thumbDiv.onclick = () => {
             document.getElementById('main-img-display').src = imgUrl;
             Array.from(thumbs.children).forEach(c => c.style.borderColor = 'transparent');
             thumbDiv.style.borderColor = 'var(--green-primary)';
          };
          thumbs.appendChild(thumbDiv);
        });

        // Setup sizes dynamically
        const sizeContainer = document.getElementById('size-options');
        sizeContainer.innerHTML = '';
        if (p.ukuran) {
          const sizes = p.ukuran.split(',').map(s => s.trim()).filter(Boolean);
          if (sizes.length === 0) {
             sizeContainer.innerHTML = '<span style="font-size:13px; color:var(--text-muted);">Satu Ukuran</span>';
          } else {
             sizes.forEach((sz, idx) => {
               const btn = document.createElement('button');
               btn.textContent = sz;
               btn.style.cssText = \`
                 background: \${idx===0 ? 'var(--green-primary)' : '#fff'};
                 color: \${idx===0 ? '#fff' : 'var(--text-secondary)'};
                 border: 1px solid \${idx===0 ? 'var(--green-primary)' : 'var(--gray-mid)'};
                 padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px;
               \`;
               btn.onclick = () => {
                 Array.from(sizeContainer.children).forEach(c => {
                   c.style.background = '#fff';
                   c.style.color = 'var(--text-secondary)';
                   c.style.borderColor = 'var(--gray-mid)';
                 });
                 btn.style.background = 'var(--green-primary)';
                 btn.style.color = '#fff';
                 btn.style.borderColor = 'var(--green-primary)';
               };
               sizeContainer.appendChild(btn);
             });
          }
        } else {
          sizeContainer.innerHTML = '<span style="font-size:13px; color:var(--text-muted);">Satu Ukuran</span>';
        }`;

if (js.includes('document.getElementById(\'prod-desc-full\').textContent = p.deskripsi;')) {
    js = js.replace(renderTarget, renderReplace);
    fs.writeFileSync('D:/git/BanditRock/js/products.js', js);
    console.log("products.js updated!");
} else {
    console.log("Could not find render target in products.js");
}
