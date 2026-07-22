const { Client } = require('./backend-express/node_modules/pg');

const client = new Client({
  connectionString: 'postgresql://postgres.eclrrunfkcklctbengnu:BanditApi%3F2026@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  console.log('✅ Connected via Supabase Pooler 6543!');
  await client.query('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;');
  await client.query("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending_payment', 'waiting_verification', 'paid', 'processing', 'shipped', 'completed', 'cancelled'));");
  console.log('🎉 SUCCESSFULLY UPDATED orders_status_check CONSTRAINT IN SUPABASE DATABASE!');
  await client.end();
}

run().catch(err => {
  console.error('Constraint update error:', err);
  process.exit(1);
});
