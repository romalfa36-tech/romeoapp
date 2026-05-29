import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bgoepilmrozycsbgpsku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnb2VwaWxtcm96eWNzYmdwc2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4ODgwNjgsImV4cCI6MjA5MzQ2NDA2OH0.vFIMyze_vSAipdhCpg78vEWA6NqhfNNTvWkTmO6RPC4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  // We can't query information_schema easily via postgrest without a specific view,
  // but let's try to delete a project that HAS transactions.
  
  // 1. Create a temp project
  const projectId = '00000000-0000-0000-0000-000000000002';
  await supabase.from('projects').insert([{ id: projectId, name: 'temp for delete test', client_name: 'test' }]);
  
  // 2. Add a transaction linking to it
  const { error: tErr } = await supabase.from('transactions').insert([{
    date: '2026-05-20',
    supplier_name: 'test supplier',
    category: 'Other Expenses',
    project_id: projectId
  }]);
  
  if (tErr) {
    console.error('Failed to create transaction:', tErr);
    return;
  }
  console.log('Created transaction linking to project');

  // 3. Try to delete the project
  console.log('Testing delete project...');
  const { data, error: dErr } = await supabase.from('projects').delete().eq('id', projectId);

  if (dErr) {
    console.error('Delete Error:', dErr);
  } else {
    console.log('Delete Success!', data);
  }
  
  // 4. Cleanup just in case
  await supabase.from('transactions').delete().eq('project_id', projectId);
}

main();
