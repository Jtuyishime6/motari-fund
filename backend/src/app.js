import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const fail = (status, message) => Object.assign(new Error(message), { status });
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch((e) => res.status(e.status || 500).json({ error: e.status ? e.message : 'Something went wrong' }));
const must = ({ data, error }) => { if (error) throw fail(500, error.message); return data; };

const auth = wrap(async (req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) throw fail(401, 'Please sign in to continue');
  req.user = data.user;
  let profile = must(await db.from('profiles').select('*').eq('id', data.user.id).maybeSingle());
  if (!profile) profile = must(await db.from('profiles').insert({ id: data.user.id, full_name: data.user.user_metadata?.full_name || '' }).select().single());
  req.profile = profile;
  next();
});
const onlyAdmin = (req, res, next) => (req.profile.role === 'admin' ? next() : res.status(403).json({ error: 'Only admins can do this' }));
const int = (v) => (Number.isInteger(Number(v)) ? Number(v) : NaN);

async function raisedFor(campaignId) {
  const rows = must(await db.from('pledges').select('amount').eq('campaign_id', campaignId).eq('status', 'confirmed'));
  return rows.reduce((s, r) => s + r.amount, 0);
}

app.get('/api/health', (_q, res) => res.json({ ok: true }));

app.get('/api/campaigns', wrap(async (_req, res) => {
  const campaigns = must(await db.from('campaigns').select('*').order('created_at', { ascending: false }));
  const pledges = must(await db.from('pledges').select('campaign_id, amount').eq('status', 'confirmed'));
  res.json(campaigns.map((c) => ({ ...c, raised: pledges.filter((p) => p.campaign_id === c.id).reduce((s, p) => s + p.amount, 0) })));
}));

app.post('/api/campaigns', auth, onlyAdmin, wrap(async (req, res) => {
  const { model, photo_url, target, lease_months } = req.body;
  if (!model || !(int(target) > 0)) throw fail(400, 'Enter a model name and a funding target');
  res.status(201).json(must(await db.from('campaigns').insert({ model, photo_url: photo_url || null, target: int(target), lease_months: int(lease_months) || 24 }).select().single()));
}));

app.get('/api/me', auth, (req, res) => res.json(req.profile));

app.put('/api/me', auth, wrap(async (req, res) => {
  const { full_name, phone, district, role } = req.body;
  if (!full_name || !phone || !district) throw fail(400, 'Fill in your name, phone number and district');
  const patch = { full_name, phone, district };
  if (req.profile.role !== 'admin') {
    if (!['investor', 'rider'].includes(role || req.profile.role)) throw fail(400, 'Choose investor or rider');
    patch.role = role || req.profile.role;
  }
  res.json(must(await db.from('profiles').update(patch).eq('id', req.user.id).select().single()));
}));

app.get('/api/pledges', auth, wrap(async (req, res) => {
  let q = db.from('pledges').select('*, campaigns(model), profiles!pledges_investor_id_fkey(full_name, phone)').order('created_at', { ascending: false });
  if (req.profile.role !== 'admin') q = q.eq('investor_id', req.user.id);
  res.json(must(await q));
}));

app.post('/api/pledges', auth, wrap(async (req, res) => {
  if (req.profile.role !== 'investor') throw fail(403, 'Only investors can pledge');
  const { campaign_id, amount, momo_ref } = req.body;
  const amt = int(amount);
  if (!(amt >= 10000)) throw fail(400, 'The minimum pledge is 10,000 RWF');
  if (!momo_ref || String(momo_ref).trim().length < 4) throw fail(400, 'Enter your mobile money transaction ID');
  const c = must(await db.from('campaigns').select('*').eq('id', campaign_id).maybeSingle());
  if (!c || c.status !== 'open') throw fail(400, 'This campaign is not open for pledges');
  if (amt > c.target - (await raisedFor(c.id))) throw fail(400, 'Your pledge is more than the amount still needed');
  res.status(201).json(must(await db.from('pledges').insert({ campaign_id, investor_id: req.user.id, amount: amt, momo_ref: String(momo_ref).trim() }).select().single()));
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

app.get('/api/applications', auth, wrap(async (req, res) => {
  let q = db.from('rider_applications').select('*, profiles(full_name, phone)').order('created_at', { ascending: false });
  if (req.profile.role !== 'admin') q = q.eq('rider_id', req.user.id);
  res.json(must(await q));
}));

app.post('/api/applications', auth, wrap(async (req, res) => {
  if (req.profile.role !== 'rider') throw fail(403, 'Only riders can apply');
  const { permit_number, years_experience, cooperative, daily_income } = req.body;
  if (!permit_number || !(int(years_experience) >= 0) || !(int(daily_income) > 0)) throw fail(400, 'Fill in your permit number, experience and daily income');
  const open = must(await db.from('rider_applications').select('id').eq('rider_id', req.user.id).in('status', ['pending', 'approved']));
  if (open.length) throw fail(400, 'You already have an application in progress');
  res.status(201).json(must(await db.from('rider_applications').insert({ rider_id: req.user.id, permit_number, years_experience: int(years_experience), cooperative, daily_income: int(daily_income) }).select().single()));
}));

app.patch('/api/applications/:id', auth, onlyAdmin, wrap(async (req, res) => {
  const { status, reason } = req.body;
  if (!['approved', 'rejected'].includes(status)) throw fail(400, 'Status must be approved or rejected');
  if (status === 'rejected' && !reason) throw fail(400, 'Give a reason for rejecting');
  res.json(must(await db.from('rider_applications').update({ status, reason: reason || null }).eq('id', req.params.id).select().single()));
}));

export default app;
