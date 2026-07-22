require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
supabase.from('products').select('*').limit(1).then(res => {
  if (res.data && res.data.length > 0) console.log(Object.keys(res.data[0]));
  else console.log("Empty or Error");
});
