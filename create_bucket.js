// Script untuk membuat bucket "bukti-transfer" di Supabase Storage
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://eclrrunfkcklctbengnu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjbHJydW5ma2NrbGN0YmVuZ251Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzA4MzMwMywiZXhwIjoyMDk4NjU5MzAzfQ.leqgA6Fv0JQPSt8TflFErTWzTwJD9rI3F5qHQUbKqww'
);

async function main() {
  // 1. List existing buckets
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    console.error('Error listing buckets:', listErr.message);
    return;
  }
  console.log('Existing buckets:', buckets.map(b => b.name));

  // 2. Check if bukti-transfer exists
  const exists = buckets.some(b => b.name === 'bukti-transfer');
  if (exists) {
    console.log('✅ Bucket "bukti-transfer" already exists!');
    return;
  }

  // 3. Create the bucket
  const { data, error } = await supabase.storage.createBucket('bukti-transfer', {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  });

  if (error) {
    console.error('Error creating bucket:', error.message);
  } else {
    console.log('✅ Bucket "bukti-transfer" created successfully!', data);
  }
}

main();
