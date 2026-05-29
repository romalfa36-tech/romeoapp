const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bgoepilmrozycsbgpsku.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzg4ODA2OCwiZXhwIjoyMDkzNDY0MDY4fQ.U4Za27aRLimziSHY3GAEcAaS7oAokSx7AAcvB80A2bw';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function applyRLS() {
  const queries = [
    // Users table
    // Allow public select so loginWithUsername can find email by username
    `DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;`,
    `DROP POLICY IF EXISTS "Users can be modified by authenticated users" ON users;`,
    `CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);`,
    `CREATE POLICY "Users can be modified by authenticated users" ON users FOR ALL USING (auth.uid() IS NOT NULL);`,
    
    // Projects table
    `DROP POLICY IF EXISTS "Projects are viewable by everyone" ON projects;`,
    `DROP POLICY IF EXISTS "Projects can be modified by authenticated users" ON projects;`,
    `CREATE POLICY "Projects are viewable by authenticated" ON projects FOR SELECT USING (auth.uid() IS NOT NULL);`,
    `CREATE POLICY "Projects can be modified by authenticated" ON projects FOR ALL USING (auth.uid() IS NOT NULL);`,

    // Transactions table
    `DROP POLICY IF EXISTS "Transactions are viewable by everyone" ON transactions;`,
    `DROP POLICY IF EXISTS "Transactions can be modified by authenticated users" ON transactions;`,
    `CREATE POLICY "Transactions are viewable by authenticated" ON transactions FOR SELECT USING (auth.uid() IS NOT NULL);`,
    `CREATE POLICY "Transactions can be modified by authenticated" ON transactions FOR ALL USING (auth.uid() IS NOT NULL);`,

    // Clients table
    `DROP POLICY IF EXISTS "Clients are viewable by everyone" ON clients;`,
    `DROP POLICY IF EXISTS "Clients can be modified by authenticated users" ON clients;`,
    `CREATE POLICY "Clients are viewable by authenticated" ON clients FOR SELECT USING (auth.uid() IS NOT NULL);`,
    `CREATE POLICY "Clients can be modified by authenticated" ON clients FOR ALL USING (auth.uid() IS NOT NULL);`,

    // Stock items table
    `DROP POLICY IF EXISTS "Stock items are viewable by everyone" ON stock_items;`,
    `DROP POLICY IF EXISTS "Stock items can be modified by authenticated users" ON stock_items;`,
    `CREATE POLICY "Stock items are viewable by authenticated" ON stock_items FOR SELECT USING (auth.uid() IS NOT NULL);`,
    `CREATE POLICY "Stock items can be modified by authenticated" ON stock_items FOR ALL USING (auth.uid() IS NOT NULL);`,

    // Units table
    `DROP POLICY IF EXISTS "Units are viewable by everyone" ON units;`,
    `DROP POLICY IF EXISTS "Units can be modified by authenticated users" ON units;`,
    `CREATE POLICY "Units are viewable by authenticated" ON units FOR SELECT USING (auth.uid() IS NOT NULL);`,
    `CREATE POLICY "Units can be modified by authenticated" ON units FOR ALL USING (auth.uid() IS NOT NULL);`,

    // Invoices table
    `DROP POLICY IF EXISTS "Invoices are viewable by everyone" ON invoices;`,
    `DROP POLICY IF EXISTS "Invoices can be modified by authenticated users" ON invoices;`,
    `CREATE POLICY "Invoices are viewable by authenticated" ON invoices FOR SELECT USING (auth.uid() IS NOT NULL);`,
    `CREATE POLICY "Invoices can be modified by authenticated" ON invoices FOR ALL USING (auth.uid() IS NOT NULL);`,

    // Notifications table
    `DROP POLICY IF EXISTS "Notifications are viewable by everyone" ON notifications;`,
    `DROP POLICY IF EXISTS "Notifications can be modified by authenticated users" ON notifications;`,
    `CREATE POLICY "Notifications are viewable by authenticated" ON notifications FOR SELECT USING (auth.uid() IS NOT NULL);`,
    `CREATE POLICY "Notifications can be modified by authenticated" ON notifications FOR ALL USING (auth.uid() IS NOT NULL);`
  ];

  for (const q of queries) {
    console.log('Executing:', q);
    // Use an existing arbitrary table or just a dummy query because there is no direct "execute raw sql" from the JS client without an RPC function.
    // Wait! supabase-js does NOT have a way to run arbitrary SQL. We must use an RPC or just ask the user to run the SQL in their dashboard!
  }
}

applyRLS();
