import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const supabaseUrl = 'https://bgoepilmrozycsbgpsku.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnb2VwaWxtcm96eWNzYmdwc2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4ODgwNjgsImV4cCI6MjA5MzQ2NDA2OH0.vFIMyze_vSAipdhCpg78vEWA6NqhfNNTvWkTmO6RPC4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check connection
export async function checkConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count').single();
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    console.log('Supabase connected successfully');
    return true;
  } catch (err) {
    console.error('Connection failed:', err);
    return false;
  }
}
