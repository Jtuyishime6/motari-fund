// Creates (or updates) the MOTARI admin login.
// Set ADMIN_EMAIL and ADMIN_PASSWORD in .env, then run:  npm run admin:create
// Sign in at /admin (the page is not linked anywhere on the site).
import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Add ADMIN_EMAIL and ADMIN_PASSWORD to .env first.');
  process.exit(1);
}
if (ADMIN_PASSWORD.length < 12) {
  console.error('Use an admin password of at least 12 characters.');
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const email = ADMIN_EMAIL.trim().toLowerCase();

const { data: list, error: listErr } = await db.auth.admin.listUsers({ perPage: 1000 });
if (listErr) throw listErr;
let user = list.users.find((u) => u.email === email);

if (user) {
  const { error } = await db.auth.admin.updateUserById(user.id, { password: ADMIN_PASSWORD, email_confirm: true });
  if (error) throw error;
  console.log('Updated password for existing user.');
} else {
  const { data, error } = await db.auth.admin.createUser({ email, password: ADMIN_PASSWORD, email_confirm: true, user_metadata: { full_name: ADMIN_NAME || 'MOTARI Admin' } });
  if (error) throw error;
  user = data.user;
  console.log('Created admin user.');
}

const { error: pErr } = await db.from('profiles').upsert({ id: user.id, full_name: ADMIN_NAME || 'MOTARI Admin', role: 'admin', district: 'Kigali', phone: null });
if (pErr) throw pErr;
console.log(`Done. Sign in at /admin with ${email}.`);
