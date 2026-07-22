require('dotenv').config({ path: '/home/batumera/api-batumerapi/.env' });
const supabase = require('./config/supabase');

async function main() {
  const { data, error } = await supabase.from('admins').select('*');
  console.log('Admins data:', data);
  console.log('Admins error:', error);
}

main();
