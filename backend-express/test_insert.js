require('dotenv').config({ path: './backend-express/.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testInsert() {
  const { data, error } = await supabase.from('products').insert({
    nama: 'Test',
    kategori: 'Alat Dapur',
    harga_min: 1000,
    harga_max: 2000,
    tipe_harga: 'fixed',
    deskripsi: 'Test',
    deskripsi_singkat: 'Test',
    ukuran: 'Kecil',
    image_url: 'test.jpg',
    image_url_2: '',
    image_url_3: '',
    image_url_4: '',
    status_stok: 'Ready Stock'
  }).select();
  if (error) console.error("Error:", error);
  else {
     console.log("Success:", data);
     await supabase.from('products').delete().eq('id', data[0].id);
  }
}
testInsert();
