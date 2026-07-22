const { Client } = require('/home/batumera/nodevenv/api-batumerapi/20/lib/node_modules/pg');

async function main() {
  const client = new Client({
    host: 'aws-0-ap-southeast-1.pooler.supabase.com',
    port: 5432,
    user: 'postgres.eclrrunfkcklctbengnu',
    password: 'BanditApi?2026',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    await client.query('ALTER TABLE admins ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(50) DEFAULT \'6287846725184\';');
    await client.query('ALTER TABLE admins ADD COLUMN IF NOT EXISTS avatar_url TEXT;');
    console.log('SUCCESSFULLY_ALTERED_ADMINS_TABLE');
    await client.end();
  } catch (err) {
    console.error('Pooler Error:', err.message);
  }
}
main();
