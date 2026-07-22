const { Client } = require('/home/batumera/nodevenv/api-batumerapi/20/lib/node_modules/pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.eclrrunfkcklctbengnu:BanditApi%3F2026@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres'
  });
  try {
    await client.connect();
    await client.query('ALTER TABLE admins ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(50) DEFAULT \'6287846725184\';');
    console.log('SUCCESS_ADDED_WHATSAPP_COLUMN');
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}
main();
