import { useEffect, useState } from 'react';
import { api, rwf, sb } from './lib.js';
import { Empty, Icon, Modal, PageHead } from './ui.jsx';

export function Review({ notify }) {
  const [pl, setPl] = useState(null);
  const [ap, setAp] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    api('/pledges').then(setPl).catch(() => setPl([]));
    api('/applications').then(setAp).catch(() => setAp([]));
  };
  useEffect(load, []);

  const act = async (id, path, body, msg) => {
    setBusyId(id);
    try {
      await api(path, { method: 'PATCH', body });
      notify(msg);
      load();
    } catch (x) {
      notify(x.message);
    }
    setBusyId(null);
  };

  const confirmReject = async (e) => {
    e.preventDefault();
    await act(rejecting.id, '/applications/' + rejecting.id, { status: 'rejected', reason }, 'Application rejected.');
    setRejecting(null);
    setReason('');
  };

  const pend = pl?.filter((p) => p.status === 'pending') || [];
  const apps = ap?.filter((a) => a.status === 'pending') || [];
  const loading = !pl || !ap;

  return (
    <>
      <PageHead title="Review" />

      <div className="stats two">
        <div className="stat">
          <div className="stat-lbl"><Icon n="wallet-2" size={18} /> Pledges to confirm</div>
          <div className="stat-val">{loading ? '…' : pend.length}</div>
        </div>
        <div className="stat">
          <div className="stat-lbl"><Icon n="user-check" size={18} /> Riders to review</div>
          <div className="stat-val">{loading ? '…' : apps.length}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3>Pledges</h3></div>
        {loading ? <div className="sk" style={{ height: 60 }} /> : !pend.length ? (
          <Empty icon="check-circle" text="All pledges are reviewed." />
        ) : (
          <div className="rows">
            {pend.map((p) => (
              <div className="row-item" key={p.id}>
                <div className="row-main">
                  <strong>{rwf(p.amount)} · {p.campaigns?.model}</strong>
                  <div className="tiny">{p.profiles?.full_name || 'Investor'} · Ref <code className="ref">{p.momo_ref}</code></div>
                </div>
                <div className="row-side">
                  <button className="btn sm" disabled={busyId === p.id} onClick={() => act(p.id, '/pledges/' + p.id, { status: 'confirmed' }, 'Pledge confirmed.')}>Confirm</button>
                  <button className="btn sm danger" disabled={busyId === p.id} onClick={() => act(p.id, '/pledges/' + p.id, { status: 'rejected' }, 'Pledge rejected.')}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-head"><h3>Rider applications</h3></div>
        {loading ? <div className="sk" style={{ height: 60 }} /> : !apps.length ? (
          <Empty icon="check-circle" text="No applications waiting." />
        ) : (
          <div className="rows">
            {apps.map((a) => (
              <div className="row-item" key={a.id}>
                <div className="row-main">
                  <strong>{a.profiles?.full_name || 'Rider'}</strong>
                  <div className="tiny">
                    <a href={`tel:${a.profiles?.phone}`}>{a.profiles?.phone}</a> · {a.profiles?.district} · Permit <code className="ref">{a.permit_number}</code> · {a.years_experience} yrs · {a.cooperative || 'No co-op'} · {rwf(a.daily_income)}/day
                  </div>
                </div>
                <div className="row-side">
                  <button className="btn sm" disabled={busyId === a.id} onClick={() => act(a.id, '/applications/' + a.id, { status: 'approved' }, 'Rider approved.')}>Approve</button>
                  <button className="btn sm danger" disabled={busyId === a.id} onClick={() => setRejecting(a)}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {rejecting && (
        <Modal title="Reject application" onClose={() => setRejecting(null)}>
          <form onSubmit={confirmReject}>
            <label>
              Reason shown to {rejecting.profiles?.full_name || 'the rider'}
              <textarea required autoFocus value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Permit number could not be verified" />
            </label>
            <div className="form-actions">
              <button className="btn danger" disabled={busyId === rejecting.id}>Reject application</button>
              <button type="button" className="btn ghost" onClick={() => setRejecting(null)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

const PRESETS = [
  { model: 'Ampersand Model 1 Pro', target: '2200000', lease_months: 24, photo_url: '/images/download.w-Ampersand2.webp' },
  { model: 'Spiro Commando E-Bike', target: '1950000', lease_months: 24, photo_url: '/images/SPIRO EKON M3 1.png' },
  { model: 'Roam Air Gen-2 Urban', target: '2400000', lease_months: 24, photo_url: '/images/spiro-ekon-450m2-1400x933.webp' }
];
const EMPTY = { model: '', target: '', lease_months: 24, photo_url: '' };

export function NewCampaign({ notify, onCreated }) {
  const [f, setF] = useState(EMPTY);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await api('/campaigns', { method: 'POST', body: f });
      notify('Campaign created.');
      setF(EMPTY);
      onCreated?.();
    } catch (x) {
      setErr(x.message);
      setBusy(false);
    }
  };

  return (
    <div className="narrow" style={{ maxWidth: 560 }}>
      <PageHead title="New campaign" />

      <form className="card" onSubmit={submit}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Start from a model</div>
          <div className="chips">
            {PRESETS.map((p) => (
              <button key={p.model} type="button" className={'chip' + (f.model === p.model ? ' on' : '')} onClick={() => setF({ ...p })}>
                {p.model.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <label>
          Model name
          <input required value={f.model} onChange={set('model')} placeholder="Ampersand Model 1 Pro" />
        </label>
        <div className="form-grid">
          <label>
            Funding target (RWF)
            <input required type="number" min="100000" step="50000" value={f.target} onChange={set('target')} placeholder="2200000" />
          </label>
          <label>
            Lease length (months)
            <input required type="number" min="6" max="48" value={f.lease_months} onChange={set('lease_months')} />
          </label>
        </div>
        <label>
          Photo URL
          <input value={f.photo_url} onChange={set('photo_url')} placeholder="/images/..." />
        </label>
        {f.photo_url && <img src={f.photo_url} alt="Preview" className="preview-img" />}

        {err && <div className="err" role="alert">{err}</div>}

        <div className="form-actions">
          <button className="btn" disabled={busy}>{busy ? 'Saving...' : 'Create campaign'}</button>
        </div>
      </form>
    </div>
  );
}

export function AdminLogin() {
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    const { error } = await sb.auth.signInWithPassword({ email: f.email.trim(), password: f.password });
    if (error) {
      setErr('Wrong email or password.');
      setBusy(false);
    }
  };

  return (
    <div className="wrap dash">
      <div style={{ maxWidth: 400, margin: '40px auto 0' }}>
        <div className="page-head"><div><h1>Admin sign in</h1></div></div>
        <form className="card" onSubmit={submit}>
          <label>
            Email
            <input required type="email" autoComplete="username" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </label>
          <label>
            Password
            <input required type="password" autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
          </label>
          {err && <div className="err" role="alert">{err}</div>}
          <button className="btn lg block" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
        </form>
      </div>
    </div>
  );
}
