// Adds demo data so the platform looks alive in a demo.
//   npm run seed:demo           add demo campaigns, investors, pledges and rider applications
//   npm run seed:demo -- --reset   remove everything this script added
// Demo people use @demo.motari.rw emails and cannot sign in (no password).
import { createClient } from '@supabase/supabase-js';

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const DOMAIN = '@demo.motari.rw';
const must = ({ data, error }) => { if (error) throw error; return data; };

const CAMPAIGNS = [
  { model: 'Spiro Ekon 450 M1', target: 1850000, photo_url: '/images/OIP.webp', fill: 1 },
  { model: 'Spiro Ekon Red Edition', target: 1900000, photo_url: '/images/OIP (1).webp', fill: 0.62 },
  { model: 'Ampersand Gen-3 Fleet', target: 2300000, photo_url: '/images/OIP (5).webp-Ampersand.webp', fill: 0.34 },
  { model: 'Spiro Ekon Fleet Pack', target: 2000000, photo_url: '/images/OIP (4).webp', fill: 0.18 }
];

const INVESTORS = [
  ['Diane Mukamana', 'Kicukiro'], ['Eric Niyonzima', 'Gasabo'], ['Grace Ingabire', 'Nyarugenge'],
  ['Patrick Habimana', 'Gasabo'], ['Alice Umutoni', 'Kicukiro'], ['Olivier Mugisha', 'Gasabo'],
  ['Sandrine Uwimana', 'Nyarugenge'], ['Jean Paul Nsengimana', 'Kicukiro']
];

const RIDERS = [
  ['Innocent Bizimana', 'Gasabo', 'Inziza Taxi Moto', 6, 18000],
  ['Theogene Nshimiyimana', 'Kicukiro', 'Kigali Moto Union', 4, 15000],
  ['Fabrice Ndayisaba', 'Nyarugenge', null, 2, 12000],
  ['Jean Bosco Hategekimana', 'Gasabo', 'Twiyubake Moto Co-op', 9, 21000]
];

const slug = (s) => s.toLowerCase().replace(/[^a-z]+/g, '.');

async function demoUsers() {
  const { data } = await db.auth.admin.listUsers({ perPage: 1000 });
  return data.users.filter((u) => u.email?.endsWith(DOMAIN));
}

async function reset() {
  const users = await demoUsers();
  for (const u of users) await db.auth.admin.deleteUser(u.id); // cascades to profiles, pledges, applications
  must(await db.from('campaigns').delete().in('model', CAMPAIGNS.map((c) => c.model)));
  console.log(`Removed ${users.length} demo people and ${CAMPAIGNS.length} demo campaigns.`);
}

async function person(name, district, role, i) {
  const email = `${slug(name)}${DOMAIN}`;
  const existing = (await demoUsers()).find((u) => u.email === email);
  const user = existing || must(await db.auth.admin.createUser({ email, email_confirm: true, user_metadata: { full_name: name } })).user;
  const phone = `078${String(8100000 + i * 7919).slice(-7)}`;
  must(await db.from('profiles').upsert({ id: user.id, full_name: name, district, role, phone }));
  return user.id;
}

const daysAgo = (d) => new Date(Date.now() - d * 86400000).toISOString();

async function seed() {
  const investorIds = [];
  for (const [i, [name, district]] of INVESTORS.entries()) investorIds.push(await person(name, district, 'investor', i));

  const existing = must(await db.from('campaigns').select('model'));
  let k = 0;
  for (const [ci, c] of CAMPAIGNS.entries()) {
    if (existing.some((e) => e.model === c.model)) continue;
    const camp = must(await db.from('campaigns').insert({ model: c.model, target: c.target, photo_url: c.photo_url, lease_months: 24, created_at: daysAgo(30 - ci * 5) }).select().single());
    let left = Math.round((c.target * c.fill) / 10000) * 10000;
    const rows = [];
    while (left >= 10000) {
      const amt = Math.min(left, [50000, 100000, 150000, 250000, 300000][k % 5]);
      rows.push({ campaign_id: camp.id, investor_id: investorIds[k % investorIds.length], amount: amt, momo_ref: `MP${2611000000 + k * 137 + ci}`, status: 'confirmed', confirmed_at: daysAgo(20 - (k % 15)), created_at: daysAgo(21 - (k % 15)) });
      left -= amt;
      k++;
    }
    if (c.fill < 1) rows.push({ campaign_id: camp.id, investor_id: investorIds[(k + 3) % investorIds.length], amount: 25000, momo_ref: `MP${2611900000 + ci}`, status: 'pending', created_at: daysAgo(1) });
    must(await db.from('pledges').insert(rows));
    if (c.fill >= 1) must(await db.from('campaigns').update({ status: 'funded' }).eq('id', camp.id));
  }

  for (const [i, [name, district, coop, yrs, income]] of RIDERS.entries()) {
    const id = await person(name, district, 'rider', 50 + i);
    const open = must(await db.from('rider_applications').select('id').eq('rider_id', id));
    if (!open.length) {
      must(await db.from('rider_applications').insert({ rider_id: id, permit_number: `RW-DL-${2019 + (i % 5)}-${40210 + i * 913}`, years_experience: yrs, cooperative: coop, daily_income: income, created_at: daysAgo(i + 1) }));
    }
  }
  console.log('Demo data ready.');
}

if (process.argv.includes('--reset')) await reset(); else await seed();
