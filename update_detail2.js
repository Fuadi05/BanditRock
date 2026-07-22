const fs = require('fs');
let html = fs.readFileSync('D:/git/BanditRock/detail.html', 'utf8');

// Update UI Layout
const targetUI = `<h1 class="detail-name" id="prod-name" style="font-family: 'Poppins', sans-serif; font-weight: 900; color: var(--text-primary);"></h1>
        <div class="detail-price" style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <span id="prod-price" style="color: var(--green-primary); font-weight: 900; font-size: 24px;"></span>
        </div>
        <p class="detail-desc" id="prod-desc" style="color: var(--gray-dark); line-height: 1.7; font-size: 14px; margin-bottom: 20px;"></p>

        <!-- Size Selector -->
        <div class="detail-label" style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 8px;">Pilih Ukuran</div>`;

const replaceUI = `<h1 class="detail-name" id="prod-name" style="font-family: 'Poppins', sans-serif; font-weight: 900; color: var(--text-primary);"></h1>
        <div class="detail-price" style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <span id="prod-price" style="color: var(--green-primary); font-weight: 900; font-size: 24px;"></span>
        </div>
        
        <p class="detail-desc" id="prod-desc-short" style="color: var(--gray-dark); line-height: 1.7; font-size: 14px; margin-bottom: 20px;"></p>
        
        <!-- Size Selector -->
        <div class="detail-label" style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 8px;">Pilih Ukuran</div>`;

html = html.replace(targetUI, replaceUI);

const targetSizes = `<div class="size-options" id="size-options" style="display: flex; gap: 10px; margin-bottom: 24px;"></div>`;
const replaceSizes = `<div class="size-options" id="size-options" style="display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap;"></div>
        
        <button id="btn-read-more" style="background: none; border: 1px solid var(--gray-mid); border-radius: 8px; padding: 8px 16px; font-weight: 600; font-size: 13px; cursor: pointer; margin-bottom: 24px; color: var(--text-primary);" onclick="toggleFullDesc()">Baca Selengkapnya / Deskripsi Lengkap <i data-lucide="chevron-down" style="width: 14px; height: 14px; vertical-align: middle;"></i></button>

        <div id="full-desc-container" style="display: none; margin-bottom: 24px; padding: 16px; background: #F8FAFC; border-radius: 8px; border: 1px solid #e2e8f0;">
          <p id="prod-desc-full-text" style="font-size: 13px; line-height: 1.6; color: var(--text-secondary);"></p>
        </div>`;

if(html.includes(targetSizes) && !html.includes('toggleFullDesc()')) {
    html = html.replace(targetSizes, replaceSizes);
}

// Ensure toggleFullDesc() is added to scripts
const toggleScript = `
  <script>
    function toggleFullDesc() {
      const container = document.getElementById('full-desc-container');
      if (container.style.display === 'none') {
        container.style.display = 'block';
      } else {
        container.style.display = 'none';
      }
    }
  </script>`;
if(!html.includes('function toggleFullDesc()')) {
    html = html.replace('</body>', toggleScript + '\n</body>');
}


// Update rendering logic
const renderTarget = `      // Title, Price, Desc
      document.getElementById('prod-name').textContent = currentProduct.name;
      document.getElementById('prod-price').textContent = currentProduct.price;
      document.getElementById('prod-desc').textContent = currentProduct.desc;
      document.getElementById('prod-desc-full').innerHTML = \`Kerajinan batu alam <strong>"\${currentProduct.name}"</strong> merupakan hasil karya tangan dari pengrajin lokal Wonosobo yang berpengalaman luas. Diukir secara manual dari bongkahan batu candi vulkanik andesit utuh, menjadikannya sangat kuat dan tahan terhadap cuaca panas maupun hujan. Sangat bernilai estetika tinggi, cocok diletakkan sebagai ornamen interior ruangan modern minimalis maupun dekorasi eksterior taman tropis Anda.\`;

      // Sizes
      if (currentProduct.ukuran && Array.isArray(currentProduct.ukuran) && currentProduct.ukuran.length > 0) {
        sizes = currentProduct.ukuran;
      } else {
        sizes = ['Kecil', 'Sedang', 'Besar', 'Ekstra Besar'];
      }
      activeSize = sizes[0] || 'Besar';
      renderSizes();

      // Gallery
      let thumbHtml = '';
      for(let i=0; i<4; i++) {
        thumbHtml += \`
          <div class="gallery-thumb \${i===0 ? 'active' : ''}" onclick="changeThumb(this)" style="border: 2px solid \${i===0 ? 'var(--green-primary)' : 'transparent'};">
            <img src="\${currentProduct.image}" alt="Thumb \${i+1}" onerror="this.style.display='none'">
          </div>
        \`;
      }
      document.getElementById('gallery-thumbs').innerHTML = thumbHtml;
      document.getElementById('gallery-main').innerHTML = \`
        <img src="\${currentProduct.image}" alt="\${currentProduct.name}" onerror="this.style.display='none'">
      \`;`;

const renderReplace = `      // Title, Price, Desc
      document.getElementById('prod-name').textContent = currentProduct.name;
      document.getElementById('prod-price').textContent = currentProduct.price;
      
      const shortDesc = document.getElementById('prod-desc-short');
      if (shortDesc) shortDesc.textContent = currentProduct.desc_short || (currentProduct.desc ? currentProduct.desc.substring(0, 100) + '...' : '');
      
      const fullDescText = document.getElementById('prod-desc-full-text');
      if (fullDescText) fullDescText.innerHTML = currentProduct.desc || '';
      
      const oldFullDesc = document.getElementById('prod-desc-full');
      if (oldFullDesc) oldFullDesc.innerHTML = currentProduct.desc || '';

      // Sizes dynamically populated
      if (currentProduct.ukuran) {
        sizes = currentProduct.ukuran.split(',').map(s => s.trim()).filter(Boolean);
        if (sizes.length === 0) sizes = ['Satu Ukuran'];
      } else {
        sizes = ['Satu Ukuran'];
      }
      activeSize = sizes[0];
      renderSizes();

      // Gallery
      const images = [currentProduct.image, currentProduct.image2, currentProduct.image3, currentProduct.image4].filter(Boolean);
      if (images.length === 0) images.push('https://via.placeholder.com/600');
      
      let thumbHtml = '';
      images.forEach((imgUrl, i) => {
        thumbHtml += \`
          <div class="gallery-thumb \${i===0 ? 'active' : ''}" onclick="changeThumb(this, '\${imgUrl}')" style="border: 2px solid \${i===0 ? 'var(--green-primary)' : 'transparent'}; cursor: pointer;">
            <img src="\${imgUrl}" alt="Thumb \${i+1}" style="width:100%; height:100%; object-fit:cover;">
          </div>
        \`;
      });
      document.getElementById('gallery-thumbs').innerHTML = thumbHtml;
      
      document.getElementById('gallery-main').innerHTML = \`
        <img id="main-img-display" src="\${images[0]}" alt="\${currentProduct.name}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">
      \`;`;

html = html.replace(renderTarget, renderReplace);

const changeThumbTarget = `    function changeThumb(el) {
      document.querySelectorAll('.gallery-thumb').forEach(t => {
        t.classList.remove('active');
        t.style.borderColor = 'transparent';
      });
      el.classList.add('active');
      el.style.borderColor = 'var(--green-primary)';
    }`;
    
const changeThumbReplace = `    function changeThumb(el, imgUrl) {
      document.querySelectorAll('.gallery-thumb').forEach(t => {
        t.classList.remove('active');
        t.style.borderColor = 'transparent';
      });
      el.classList.add('active');
      el.style.borderColor = 'var(--green-primary)';
      if (imgUrl) document.getElementById('main-img-display').src = imgUrl;
    }`;

html = html.replace(changeThumbTarget, changeThumbReplace);

fs.writeFileSync('D:/git/BanditRock/detail.html', html);
console.log("detail.html updated!");
