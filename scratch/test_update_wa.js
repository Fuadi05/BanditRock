require('dotenv').config({ path: '/home/batumera/api-batumerapi/.env' });
const supabase = require('./config/supabase');

async function main() {
  const { data, error } = await supabase
    .from('admins')
    .update({ whatsapp: '6287846725184' })
    .eq('username', 'admin');
    
  console.log('Update result - Data:', data, 'Error:', error);
}

main();
