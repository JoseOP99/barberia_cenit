import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://oferbwqvmloyzcqsmprs.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mZXJid3F2bWxveXpjcXNtcHJzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTMyMjgwNCwiZXhwIjoyMDk0ODk4ODA0fQ.Enlij9zxS2WutGgpMZaG8SuXMKLnB-_juwCRbDzXKtI';

const headers = {
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'apikey': SERVICE_ROLE_KEY,
  'Content-Type': 'application/json'
};

async function createAdminUser() {
  console.log('\n=== Creating admin user ===');
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: 'barbercenit@gmail.com',
      password: 'nando1999.',
      email_confirm: true,
      user_metadata: { full_name: 'Admin Cénit' }
    })
  });
  const data = await res.json();
  if (res.ok) {
    console.log('Admin user created! ID:', data.id);
    return data;
  } else {
    console.log('Admin user response:', res.status, JSON.stringify(data));
    return data;
  }
}

async function checkTablesExist() {
  console.log('\n=== Checking if tables exist ===');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/barbers?select=id&limit=1`, { headers });
  console.log('Barbers table check:', res.status);
  return res.status !== 404;
}

async function trySqlExecution(sql, label) {
  const endpoints = [
    '/pg/query',
    '/rest/v1/rpc/exec_sql',
  ];

  for (const endpoint of endpoints) {
    try {
      const body = endpoint.includes('rpc')
        ? JSON.stringify({ query: sql })
        : JSON.stringify({ query: sql });

      const res = await fetch(`${SUPABASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body
      });
      const text = await res.text();
      console.log(`[${endpoint}] ${label}: ${res.status} - ${text.substring(0, 200)}`);
      if (res.ok) return true;
    } catch (e) {
      console.log(`[${endpoint}] ${label}: Error - ${e.message}`);
    }
  }
  return false;
}

async function main() {
  // Step 1: Create admin user
  const adminUser = await createAdminUser();

  // Step 2: Check if tables already exist
  const tablesExist = await checkTablesExist();
  console.log('Tables exist:', tablesExist);

  // Step 3: Try to execute schema SQL
  if (!tablesExist) {
    console.log('\n=== Attempting SQL execution ===');
    const testResult = await trySqlExecution('SELECT 1 as test', 'Test query');

    if (testResult) {
      console.log('SQL execution works! Running full schema...');
      const schema = readFileSync('./supabase/schema.sql', 'utf-8');
      await trySqlExecution(schema, 'Full schema');
    } else {
      console.log('\n⚠ Cannot execute SQL programmatically.');
      console.log('Please run the schema manually in Supabase Dashboard:');
      console.log(`https://supabase.com/dashboard/project/oferbwqvmloyzcqsmprs/sql/new`);
      console.log('Paste the contents of supabase/schema.sql and click Run.');
    }
  }

  // Step 4: If admin user was created and tables exist, create admin profile
  if (adminUser?.id && tablesExist) {
    console.log('\n=== Creating admin profile ===');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify({
        id: adminUser.id,
        full_name: 'Admin Cénit',
        email: 'barbercenit@gmail.com',
        role: 'admin'
      })
    });
    const data = await res.text();
    console.log('Admin profile:', res.status, data);
  } else if (adminUser?.id) {
    console.log('\nAdmin user ID for profile creation after tables exist:', adminUser.id);
  }
}

main().catch(console.error);
