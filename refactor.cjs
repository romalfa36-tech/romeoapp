const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lib', 'context.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update syncData signature
content = content.replace(
  'const syncData = async () => {',
  'const syncData = async (tablesToSync?: string[]) => {'
);

// 2. Wrap fetches in if statements
const tables = [
  { name: 'users', fetchCode: "const { data: usersData, error: uErr } = await supabase.from('users').select('*');" },
  { name: 'projects', fetchCode: "const { data: projectsData, error: pErr } = await supabase.from('projects').select('*').order('created_at', { ascending: false });" },
  { name: 'transactions', fetchCode: "const { data: transactionsData, error: tErr } = await supabase.from('transactions').select('*').order('date', { ascending: false });" },
  { name: 'clients', fetchCode: "const { data: clientsData, error: cErr } = await supabase.from('clients').select('*').order('created_at', { ascending: false });" },
  { name: 'stock_items', fetchCode: "const { data: stockData, error: sErr } = await supabase.from('stock_items').select('*').order('created_at', { ascending: false });" },
  { name: 'units', fetchCode: "const { data: unitsData, error: unErr } = await supabase.from('units').select('*').order('created_at', { ascending: false });" },
  { name: 'invoices', fetchCode: "const { data: invoicesData, error: iErr } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });" },
  { name: 'notifications', fetchCode: "const { data: notificationsData, error: nErr } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });" }
];

for (const t of tables) {
  content = content.replace(
    `try {\n        ${t.fetchCode}`,
    `if (!tablesToSync || tablesToSync.includes('${t.name}')) {\n      try {\n        ${t.fetchCode}`
  );
  
  // Find the matching catch block for this try
  // This is a bit tricky with simple string replacement, so we'll do it specifically for each block based on the error message
  let errMsg = '';
  if (t.name === 'users') errMsg = "'Fetch users error:'";
  if (t.name === 'projects') errMsg = "'Fetch projects error:'";
  if (t.name === 'transactions') errMsg = "'Fetch transactions error:'";
  if (t.name === 'clients') errMsg = "'Fetch clients error:'";
  if (t.name === 'stock_items') errMsg = "'Fetch stock error:'";
  if (t.name === 'units') errMsg = "'Fetch units error:'";
  if (t.name === 'invoices') errMsg = "'Fetch invoices error:'";
  if (t.name === 'notifications') errMsg = "'Fetch notifications error:'";
  
  const catchPattern = new RegExp(`catch \\(err\\) \\{\\s*console\\.error\\(${errMsg}, err\\);\\s*\\}`, 'g');
  content = content.replace(catchPattern, (match) => {
    return `${match}\n      }`;
  });
}

// Fix Realtime listeners
content = content.replace(
  /const shouldAlert = currentUser\?\.role === 'admin' \|\| !isAdminAction;/g,
  "const shouldAlert = currentUser?.role === 'admin' || currentUser?.role === 'accountant' || !isAdminAction;"
);

content = content.replace(
  /\}\n          catch \(err\) \{\n            console\.error\('Error handling realtime notification toast:', err\);\n          \}\n          syncData\(\);\n        \}\)/g,
  "}\n          catch (err) {\n            console.error('Error handling realtime notification toast:', err);\n          }\n          syncData(['notifications']);\n        })"
);

content = content.replace(
  /\.on\('postgres_changes', \{ event: '\*', schema: 'public' \}, \(payload\) => \{\n          console\.log\('Realtime DB change caught:', payload\);\n          \/\/ When any change happens, trigger syncData to update state & LocalStorage\n          syncData\(\);\n        \}\)/g,
  ".on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {\n          console.log('Realtime DB change caught:', payload);\n          if (payload.table && payload.table !== 'notifications') {\n            syncData([payload.table]);\n          } else if (!payload.table) {\n            syncData();\n          }\n        })"
);

// Fallback interval
content = content.replace(
  /const interval = setInterval\(\(\) => \{\n        syncData\(\);\n      \}, 10000\);/g,
  "const interval = setInterval(() => {\n        syncData();\n      }, 300000);"
);

// Detailed notifications
content = content.replace(
  /message: \`قام \$\{currentUser\?\.name \|\| 'مستخدم'\} بإضافة معاملة: \$\{transaction\.description\}\`,/g,
  "message: `قام ${currentUser?.name || 'مستخدم'} بإضافة معاملة بقيمة ${transaction.debit || transaction.credit} للمورد ${transaction.supplierName} في مشروع ${transaction.projectName || 'عام'}: ${transaction.description}`,",
);

content = content.replace(
  /message: \`قام \$\{currentUser\?\.name \|\| 'مستخدم'\} بتعديل المعاملة: \$\{targetTransaction\?\.description \|\| id\}\`,/g,
  "message: `قام ${currentUser?.name || 'مستخدم'} بتعديل المعاملة (${targetTransaction?.description}) للمورد ${transactionData.supplierName || targetTransaction?.supplierName}`,",
);

content = content.replace(
  /message: \`قام \$\{currentUser\?\.name \|\| 'مستخدم'\} بإضافة عميل جديد: \$\{newClient\.name\}\`,/g,
  "message: `قام ${currentUser?.name || 'مستخدم'} بإضافة عميل جديد: ${newClient.name} (${newClient.company || 'بدون شركة'})`,",
);

fs.writeFileSync(filePath, content);
console.log('Refactoring complete.');
