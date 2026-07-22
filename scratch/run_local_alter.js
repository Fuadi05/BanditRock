const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:BanditApi%3F2026@db.eclrrunfkcklctbengnu.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  await client.query('ALTER TABLE admins ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(50) DEFAULT \'6287846725184\';');
  console.log('SUCCESSFULLY_ADDED_WHATSAPP_COLUMN_TO_ADMINS');
  await client.end();
}

main().catch(console.error);
