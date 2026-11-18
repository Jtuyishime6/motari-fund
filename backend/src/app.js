import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '20kb' }));

const fail = (status, message) => Object.assign(new Error(message), { status });
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch((e) => res.status(e.status || 500).json({ error: e.status ? e.message : 'Something went wrong' }));
const must = ({ data, error }) => { if (error) throw fail(500, error.message); return data; };
const int = (v) => (Number.isInteger(Number(v)) ? Number(v) : NaN);
const clean = (v, max = 80) => String(v ?? '').trim().slice(0, max);

// Rwandan mobile numbers: 07[2389]XXXXXXX, with or without +250
const normPhone = (v) => {
  const d = String(v || '').replace(/\D/g, '').replace(/^250/, '0');
  return /^07[2389]\d{7}$/.test(d) ? d : null;
};

const auth = wrap(async (req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) throw fail(401, 'Please sign in to continue');
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) throw fail(401, 'Please sign in to continue');
  req.user = data.user;
  let profile = must(await db.from('profiles').select('*').eq('id', data.user.id).maybeSingle());
  if (!profile) {
    profile = must(await db.from('profiles').upsert({ id: data.user.id, full_name: data.user.user_metadata?.full_name || '' }).select().single());
  }
  req.profile = profile;
  next();
});
const onlyAdmin = (req, res, next) => (req.profile.role === 'admin' ? next() : res.status(403).json({ error: 'Only admins can do this' }));

// Tiny in-memory limiter for the public rider form
const hits = new Map();
const limit = (max, windowMs) => (req, res, next) => {
  const key = req.ip + req.path;
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (list.length >= max) return res.status(429).json({ error: 'Too many attempts. Try again later.' });
  list.push(now);
  hits.set(key, list);
  next();
};

async function raisedFor(campaignId) {
  const rows = must(await db.from('pledges').select('amount').eq('campaign_id', campaignId).eq('status', 'confirmed'));
  return rows.reduce((s, r) => s + r.amount, 0);
}

app.get('/api/health', (_q, res) => res.json({ ok: true }));

// Public numbers for the landing page
app.get('/api/stats', wrap(async (_req, res) => {
  const campaigns = must(await db.from('campaigns').select('id, status'));
  const pledges = must(await db.from('pledges').select('investor_id, amount').eq('status', 'confirmed'));
  res.json({
    raised: pledges.reduce((s, p) => s + p.amount, 0),
    investors: new Set(pledges.map((p) => p.investor_id)).size,
    funded: campaigns.filter((c) => c.status === 'funded').length,
    campaigns: campaigns.length
  });
}));

app.get('/api/campaigns', wrap(async (_req, res) => {
  const campaigns = must(await db.from('campaigns').select('*').order('created_at', { ascending: false }));
  const pledges = must(await db.from('pledges').select('campaign_id, investor_id, amount').eq('status', 'confirmed'));
  res.json(campaigns.map((c) => {
    const mine = pledges.filter((p) => p.campaign_id === c.id);
    return { ...c, raised: mine.reduce((s, p) => s + p.amount, 0), backers: new Set(mine.map((p) => p.investor_id)).size };
  }).sort((a, b) => (a.status === b.status ? 0 : a.status === 'open' ? -1 : 1)));
}));

app.post('/api/campaigns', auth, onlyAdmin, wrap(async (req, res) => {
  const { model, photo_url, target, lease_months } = req.body;
  if (!model || !(int(target) > 0)) throw fail(400, 'Enter a model name and a funding target');
  res.status(201).json(must(await db.from('campaigns').insert({ model: clean(model), photo_url: photo_url || null, target: int(target), lease_months: int(lease_months) || 24 }).select().single()));
}));

app.get('/api/me', auth, (req, res) => res.json(req.profile));

// Sign-in is for investors (and admins). Riders apply through the public form.
app.put('/api/me', auth, wrap(async (req, res) => {
  const full_name = clean(req.body.full_name);
  const phone = normPhone(req.body.phone);
  const district = clean(req.body.district, 40);
  if (!full_name || !district) throw fail(400, 'Fill in your name and district');
  if (!phone) throw fail(400, 'Enter a valid MTN or Airtel number, e.g. 0788123456');
  const patch = { full_name, phone, district };
  if (!req.profile.role) patch.role = 'investor';
  res.json(must(await db.from('profiles').update(patch).eq('id', req.user.id).select().single()));
}));

app.get('/api/pledges', auth, wrap(async (req, res) => {
  let q = db.from('pledges').select('*, campaigns(model, photo_url, status, lease_months), profiles!pledges_investor_id_fkey(full_name, phone)').order('created_at', { ascending: false });
  if (req.profile.role !== 'admin') q = q.eq('investor_id', req.user.id);
  res.json(must(await q));
}));

app.post('/api/pledges', auth, wrap(async (req, res) => {
  if (req.profile.role !== 'investor') throw fail(403, 'Only investor accounts can pledge');
  const { campaign_id, amount, momo_ref } = req.body;
  const amt = int(amount);
  if (!(amt >= 10000)) throw fail(400, 'The minimum pledge is 10,000 RWF');
  const ref = clean(momo_ref, 40);
  if (ref.length < 6) throw fail(400, 'Enter the transaction ID from your Mobile Money SMS');
  const dup = must(await db.from('pledges').select('id').eq('momo_ref', ref).neq('status', 'rejected'));
  if (dup.length) throw fail(400, 'This transaction ID has already been used');
  const c = must(await db.from('campaigns').select('*').eq('id', campaign_id).maybeSingle());
  if (!c || c.status !== 'open') throw fail(400, 'This e-moto is no longer open for pledges');
  if (amt > c.target - (await raisedFor(c.id))) throw fail(400, 'Your pledge is more than the amount still needed');
  res.status(201).json(must(await db.from('pledges').insert({ campaign_id, investor_id: req.user.id, amount: amt, momo_ref: ref }).select().single()));
}));

app.patch('/api/pledges/:id', auth, onlyAdmin, wrap(async (req, res) => {
  const { status } = req.body;
  if (!['confirmed', 'rejected'].includes(status)) throw fail(400, 'Status must be confirmed or rejected');
  const p = must(await db.from('pledges').select('*').eq('id', req.params.id).maybeSingle());
  if (!p || p.status !== 'pending') throw fail(400, 'This pledge was already reviewed');
  if (status === 'confirmed') {
    const c = must(await db.from('campaigns').select('*').eq('id', p.campaign_id).single());
    const raised = await raisedFor(c.id);
    if (p.amount > c.target - raised) throw fail(400, 'This pledge is more than the amount still needed');
    if (raised + p.amount >= c.target) must(await db.from('campaigns').update({ status: 'funded' }).eq('id', c.id));
  }
  res.json(must(await db.from('pledges').update({ status, confirmed_by: req.user.id, confirmed_at: new Date().toISOString() }).eq('id', p.id).select().single()));
}));

// Public rider application. No account or uploads: the team calls the rider to verify.
app.post('/api/apply', limit(5, 60 * 60 * 1000), wrap(async (req, res) => {
  const b = req.body || {};
  if (b.website) return res.status(201).json({ ok: true }); // honeypot
  const full_name = clean(b.full_name);
  const phone = normPhone(b.phone);
  const district = clean(b.district, 40);
  const permit_number = clean(b.permit_number, 40);
  const cooperative = clean(b.cooperative) || null;
  const years = int(b.years_experience);
  const income = int(b.daily_income);
  if (!full_name || !district) throw fail(400, 'Fill in your name and district');
  if (!phone) throw fail(400, 'Enter a valid MTN or Airtel number, e.g. 0788123456');
  if (!permit_number) throw fail(400, 'Enter your driving permit number');
  if (!(years >= 0 && years <= 50)) throw fail(400, 'Enter your years of riding experience');
  if (!(income > 0)) throw fail(400, 'Enter your average daily income');

  let profile = must(await db.from('profiles').select('id, role').eq('phone', phone).eq('role', 'rider').maybeSingle());
  if (!profile) {
    const email = `rider.${phone}@riders.motari.rw`;
    let { data, error } = await db.auth.admin.createUser({ email, email_confirm: true, user_metadata: { full_name, source: 'rider_form' } });
    if (error) {
      const { data: list } = await db.auth.admin.listUsers({ perPage: 1000 });
      const found = list?.users?.find((u) => u.email === email);
      if (!found) throw fail(500, 'Could not save your application. Try again.');
      data = { user: found };
    }
    profile = must(await db.from('profiles').upsert({ id: data.user.id, full_name, phone, district, role: 'rider' }).select('id, role').single());
  } else {
    must(await db.from('profiles').update({ full_name, district }).eq('id', profile.id));
  }

  const open = must(await db.from('rider_applications').select('id').eq('rider_id', profile.id).in('status', ['pending', 'approved']));
  if (open.length) throw fail(400, 'We already have an application for this phone number. Our team will call you.');
  must(await db.from('rider_applications').insert({ rider_id: profile.id, permit_number, years_experience: years, cooperative, daily_income: income }));
  res.status(201).json({ ok: true });
}));

app.get('/api/applications', auth, onlyAdmin, wrap(async (_req, res) => {
  res.json(must(await db.from('rider_applications').select('*, profiles(full_name, phone, district)').order('created_at', { ascending: false })));
}));

app.patch('/api/applications/:id', auth, onlyAdmin, wrap(async (req, res) => {
  const { status, reason } = req.body;
  if (!['approved', 'rejected'].includes(status)) throw fail(400, 'Status must be approved or rejected');
  if (status === 'rejected' && !reason) throw fail(400, 'Give a reason for rejecting');
  res.json(must(await db.from('rider_applications').update({ status, reason: reason ? clean(reason, 300) : null }).eq('id', req.params.id).select().single()));
}));

export default app;
