import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bgoepilmrozycsbgpsku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnb2VwaWxtcm96eWNzYmdwc2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4ODgwNjgsImV4cCI6MjA5MzQ2NDA2OH0.vFIMyze_vSAipdhCpg78vEWA6NqhfNNTvWkTmO6RPC4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  // Let's create a temp project first
  const id = '00000000-0000-0000-0000-000000000001';
  await supabase.from('projects').insert([{ id, name: 'delete test', client_name: 'test' }]);
  
  // Now try to delete it
  console.log('Testing delete with ID:', id);
  const { data, error } = await supabase.from('projects').delete().eq('id', id);

  if (error) {
    console.error('Delete Error:', error);
  } else {
    console.log('Delete Success!', data);
  }
}

main();
