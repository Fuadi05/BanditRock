const { Client } = require('/home/batumera/nodevenv/api-batumerapi/20/lib/node_modules/pg');

async function main() {
  const client = new Client({
    host: 'db.eclrrunfkcklctbengnu.supabase.co',
    port: 5432,
    user: 'postgres',
    password: 'BanditApi?2026',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    await client.query('ALTER TABLE admins ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(50) DEFAULT \'6287846725184\';');
    console.log('SUCCESS_ADDED_WHATSAPP_COLUMN!');
    await client.end();
  } catch (err) {
    console.error('PG Direct Error:', err.message);
  }
}
main();
