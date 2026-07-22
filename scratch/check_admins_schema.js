require('dotenv').config({ path: './backend-express/.env' });
const supabase = require('./backend-express/config/supabase');

async function test() {
  const { data, error } = await supabase.from('admins').select('*').limit(1);
  console.log('Admins table sample data:', data);
  console.log('Error:', error);
}

test();
