import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bgoepilmrozycsbgpsku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnb2VwaWxtcm96eWNzYmdwc2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4ODgwNjgsImV4cCI6MjA5MzQ2NDA2OH0.vFIMyze_vSAipdhCpg78vEWA6NqhfNNTvWkTmO6RPC4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('transactions').select('project_name, created_by').limit(1);
  if (error) {
    console.error('Transactions Error:', error);
  } else {
    console.log('Transactions Success!', data);
  }
}

main();
