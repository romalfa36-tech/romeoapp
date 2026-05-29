import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bgoepilmrozycsbgpsku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnb2VwaWxtcm96eWNzYmdwc2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4ODgwNjgsImV4cCI6MjA5MzQ2NDA2OH0.vFIMyze_vSAipdhCpg78vEWA6NqhfNNTvWkTmO6RPC4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('projects').select('id, name, created_at').order('created_at', { ascending: false });
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`Fetched ${data.length} projects`);
  console.log(data.map(p => p.name).join(', '));
}

main();
