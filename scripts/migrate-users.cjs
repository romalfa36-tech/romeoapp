const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bgoepilmrozycsbgpsku.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnb2VwaWxtcm96eWNzYmdwc2t1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzg4ODA2OCwiZXhwIjoyMDkzNDY0MDY4fQ.U4Za27aRLimziSHY3GAEcAaS7oAokSx7AAcvB80A2bw';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function migrate() {
  console.log('Fetching public users...');
  const { data: users, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }
  console.log(`Found ${users.length} users.`);

  for (const user of users) {
    if (!user.email || !user.password) {
      console.log(`Skipping ${user.name} - No email or password.`);
      continue;
    }

    console.log(`Migrating ${user.email}...`);
    // Check if exists in auth
    const { data: existingAuth, error: listErr } = await supabase.auth.admin.listUsers();
    const exists = existingAuth?.users?.find(u => u.email === user.email);
    
    let authId = exists?.id;

    if (!exists) {
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { name: user.name, username: user.username, role: user.role }
      });
      if (createErr) {
        console.error(`Failed to create auth user for ${user.email}:`, createErr);
        continue;
      }
      authId = newUser.user.id;
      console.log(`Created auth user ${authId}`);
    } else {
      console.log(`Auth user already exists: ${authId}. Updating password...`);
      await supabase.auth.admin.updateUserById(authId, { password: user.password });
    }

    // Update public.users ID to match auth.users ID for RLS convenience
    if (user.id !== authId) {
      console.log(`Updating public.users ID from ${user.id} to ${authId}`);
      const { error: updateErr } = await supabase.from('users').update({ id: authId }).eq('id', user.id);
      if (updateErr) {
        console.error(`Failed to update public user ID for ${user.email}:`, updateErr);
      }
    }
  }
  console.log('Migration completed.');
}

migrate();
