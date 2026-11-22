import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import {
  MIN_PLEDGE, DEFAULT_LEASE_MONTHS, LEASE_MONTHS, MIN_CAMPAIGN_TARGET,
  normPhone, toInt, cleanText, isUuid, isPhotoUrl
} from '../../shared/rules.js';

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const app = express();

// Same-origin on Vercel. Set ALLOWED_ORIGINS (comma separated) when the web app lives elsewhere.
const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(cors({ origin: allowed.length ? allowed : true }));
app.use(express.json({ limit: '20kb' }));
app.use((_req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
    'Cache-Control': 'no-store'
  });
  next();
});

const fail = (status, message) => Object.assign(new Error(message), { status });
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch((e) => {
  if (!e.status) console.error(`[api] ${req.method} ${req.path}`, e);
  res.status(e.status || 500).json({ error: e.status ? e.message : 'Something went wrong. Try again.' });
});
const must = ({ data, error }) => { if (error) throw Object.assign(new Error(error.message), { cause: error }); return data; };

const auth = wrap(async (req, _res, next) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) throw fail(401, 'Please sign in to continue');
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) throw fail(401, 'Please sign in to continue');
  req.user = data.user;
  req.profile = must(await db.from('profiles').select('*').eq('id', data.user.id).maybeSingle())
    || must(await db.from('profiles').upsert({ id: data.user.id, full_name: data.user.user_metadata?.full_name || '' }).select().single());
  next();
});
const onlyAdmin = (req, res, next) => (req.profile.role === 'admin' ? next() : res.status(403).json({ error: 'Only admins can do this' }));

// Small in-memory limiter for public endpoints. Per instance, which is enough to slow down spam.
const hits = new Map();
const limit = (max, windowMs) => (req, res, next) => {
  const now = Date.now();
  if (hits.size > 5000) for (const [k, list] of hits) if (!list.some((t) => now - t < windowMs)) hits.delete(k);
  const key = req.ip + req.path;
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (list.length >= max) return res.status(429).json({ error: 'Too many attempts. Try again in an hour.' });
  list.push(now);
  hits.set(key, list);
  next();
};

const confirmedPledges = async (columns) => must(await db.from('pledges').select(columns).eq('status', 'confirmed'));
const sum = (rows) => rows.reduce((s, r) => s + r.amount, 0);

app.get('/api/health', (_q, res) => res.json({ ok: true }));

// Public numbers for the landing page
app.get('/api/stats', wrap(async (_req, res) => {
  const [campaigns, pledges] = await Promise.all([
    db.from('campaigns').select('id, status').then(must),
    confirmedPledges('investor_id, amount')
  ]);
  res.set('Cache-Control', 'public, max-age=60');
  res.json({
    raised: sum(pledges),
    investors: new Set(pledges.map((p) => p.investor_id)).size,
    funded: campaigns.filter((c) => c.status === 'funded').length,
    campaigns: campaigns.length
  });
}));

app.get('/api/campaigns', wrap(async (_req, res) => {
  const [campaigns, pledges] = await Promise.all([
    db.from('campaigns').select('*').order('created_at', { ascending: false }).then(must),
    confirmedPledges('campaign_id, investor_id, amount')
  ]);
  res.json(campaigns.map((c) => {
    const mine = pledges.filter((p) => p.campaign_id === c.id);
    return { ...c, raised: sum(mine), backers: new Set(mine.map((p) => p.investor_id)).size };
  }).sort((a, b) => (a.status === b.status ? 0 : a.status === 'open' ? -1 : 1)));
}));

app.post('/api/campaigns', auth, onlyAdmin, wrap(async (req, res) => {
  const model = cleanText(req.body.model);
  const target = toInt(req.body.target);
  const lease = toInt(req.body.lease_months);
  const photo = cleanText(req.body.photo_url, 500) || null;
  if (!model) throw fail(400, 'Enter a model name');
  if (!(target >= MIN_CAMPAIGN_TARGET)) throw fail(400, `The funding target must be at least ${MIN_CAMPAIGN_TARGET.toLocaleString('en-US')} RWF`);
  const lease_months = Number.isNaN(lease) ? DEFAULT_LEASE_MONTHS : lease;
  if (lease_months < LEASE_MONTHS.min || lease_months > LEASE_MONTHS.max) throw fail(400, `Lease length must be ${LEASE_MONTHS.min} to ${LEASE_MONTHS.max} months`);
  if (photo && !isPhotoUrl(photo)) throw fail(400, 'Use an https link or a /images path for the photo');
  res.status(201).json(must(await db.from('campaigns').insert({ model, photo_url: photo, target, lease_months }).select().single()));
}));

app.get('/api/me', auth, (req, res) => res.json(req.profile));

// Sign-in is for investors (and admins). Riders apply through the public form.
app.put('/api/me', auth, wrap(async (req, res) => {
  const full_name = cleanText(req.body.full_name);
  const phone = normPhone(req.body.phone);
  const district = cleanText(req.body.district, 40);
  if (!full_name || !district) throw fail(400, 'Fill in your name and district');
  if (!phone) throw fail(400, 'Enter a valid MTN or Airtel number, e.g. 0788123456');
  const patch = { full_name, phone, district };
  if (!req.profile.role) patch.role = 'investor';
  res.json(must(await db.from('profiles').update(patch).eq('id', req.user.id).select().single()));
}));

app.get('/api/pledges', auth, wrap(async (req, res) => {
  let q = db.from('pledges').select('*, campaigns(model, photo_url, status, lease_months, target), profiles!pledges_investor_id_fkey(full_name, phone)').order('created_at', { ascending: false });
  if (req.profile.role !== 'admin') q = q.eq('investor_id', req.user.id);
  res.json(must(await q));
}));

app.post('/api/pledges', auth, wrap(async (req, res) => {
  if (req.profile.role !== 'investor') throw fail(403, 'Only investor accounts can pledge');
  const { campaign_id } = req.body;
  const amount = toInt(req.body.amount);
  const momo_ref = cleanText(req.body.momo_ref, 40);
  if (!isUuid(campaign_id)) throw fail(400, 'Choose an e-moto to back');
  if (!(amount >= MIN_PLEDGE)) throw fail(400, `The minimum pledge is ${MIN_PLEDGE.toLocaleString('en-US')} RWF`);
  if (momo_ref.length < 6) throw fail(400, 'Enter the transaction ID from your Mobile Money SMS');
  const [dup, c, pledged] = await Promise.all([
    db.from('pledges').select('id').eq('momo_ref', momo_ref).neq('status', 'rejected').then(must),
    db.from('campaigns').select('*').eq('id', campaign_id).maybeSingle().then(must),
    db.from('pledges').select('amount').eq('campaign_id', campaign_id).eq('status', 'confirmed').then(must)
  ]);
  if (dup.length) throw fail(400, 'This transaction ID has already been used');
  if (!c || c.status !== 'open') throw fail(400, 'This e-moto is no longer open for pledges');
  if (amount > c.target - sum(pledged)) throw fail(400, 'Your pledge is more than the amount still needed');
  res.status(201).json(must(await db.from('pledges').insert({ campaign_id, investor_id: req.user.id, amount, momo_ref }).select().single()));
}));

app.patch('/api/pledges/:id', auth, onlyAdmin, wrap(async (req, res) => {
  const { status } = req.body;
  if (!['confirmed', 'rejected'].includes(status)) throw fail(400, 'Status must be confirmed or rejected');
  const p = must(await db.from('pledges').select('*').eq('id', req.params.id).maybeSingle());
  if (!p || p.status !== 'pending') throw fail(400, 'This pledge was already reviewed');

  let reachesTarget = false;
  if (status === 'confirmed') {
    const c = must(await db.from('campaigns').select('*').eq('id', p.campaign_id).single());
    const raised = sum(must(await db.from('pledges').select('amount').eq('campaign_id', c.id).eq('status', 'confirmed')));
    if (p.amount > c.target - raised) throw fail(400, 'This pledge is more than the amount still needed');
    reachesTarget = raised + p.amount >= c.target;
  }
  // Only flip a pledge that is still pending, so two admins clicking at once cannot both confirm it.
  const updated = must(await db.from('pledges')
    .update({ status, confirmed_by: req.user.id, confirmed_at: new Date().toISOString() })
    .eq('id', p.id).eq('status', 'pending').select().maybeSingle());
  if (!updated) throw fail(409, 'This pledge was already reviewed');
  if (reachesTarget) must(await db.from('campaigns').update({ status: 'funded' }).eq('id', p.campaign_id));
  res.json(updated);
}));

// Public rider application. No account or uploads: the team calls the rider to verify.
app.post('/api/apply', limit(5, 60 * 60 * 1000), wrap(async (req, res) => {
  const b = req.body || {};
  if (b.website) return res.status(201).json({ ok: true }); // honeypot
  const full_name = cleanText(b.full_name);
  const phone = normPhone(b.phone);
  const district = cleanText(b.district, 40);
  const permit_number = cleanText(b.permit_number, 40);
  const cooperative = cleanText(b.cooperative) || null;
  const years = toInt(b.years_experience);
  const income = toInt(b.daily_income);
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
  const { status } = req.body;
  const reason = cleanText(req.body.reason, 300);
  if (!['approved', 'rejected'].includes(status)) throw fail(400, 'Status must be approved or rejected');
  if (status === 'rejected' && !reason) throw fail(400, 'Give a reason for rejecting');
  const updated = must(await db.from('rider_applications')
    .update({ status, reason: reason || null })
    .eq('id', req.params.id).eq('status', 'pending').select().maybeSingle());
  if (!updated) throw fail(409, 'This application was already reviewed');
  res.json(updated);
}));

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

export default app;
