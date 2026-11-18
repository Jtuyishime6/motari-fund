import { useEffect, useState } from 'react';
import { api, rwf } from './lib.js';
import { Icon, Pill, Skeletons, Empty, Modal } from './ui.jsx';
export default function Campaigns({ profile, notify, onSignIn }) {
  const [items, setItems] = useState(null); const [pick, setPick] = useState(null);
  const [f, setF] = useState({ amount: '', momo_ref: '' }); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const load = () => api('/campaigns').then(setItems).catch(() => setItems([]));
  useEffect(() => { load(); }, []);
  const pledge = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await api('/pledges', { method: 'POST', body: { campaign_id: pick.id, ...f } }); setPick(null); setF({ amount: '', momo_ref: '' }); notify('Pledge sent. An admin will confirm your payment.'); }
    catch (x) { setErr(x.message); } setBusy(false);
  };
  if (!items) return <Skeletons />;
  if (!items.length) return <Empty icon="bolt" text="No e-motos need funding yet. Check back soon." />;
  return (
    <>
      <div className="grid">
        {items.map((c, i) => {
          const pct = Math.min(100, Math.round((c.raised / c.target) * 100));
          return (
            <article className="card fade" style={{ '--i': i }} key={c.id}>
              <div className="row" style={{ justifyContent: 'space-between' }}><div className="badge"><Icon n="bolt" /></div><Pill s={c.status} /></div>
              <h3>{c.model}</h3>
              <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100"><i style={{ width: pct + '%' }} /></div>
              <div className="stats"><span>{rwf(c.raised)} raised</span><span>Target {rwf(c.target)}</span></div>
              <p className="muted">{c.lease_months} month lease-to-own</p>
              {c.status === 'open' && (profile?.role === 'investor'
                ? <button className="btn" onClick={() => setPick(c)}>Pledge</button>
                : !profile && <button className="btn ghost" onClick={onSignIn}>Sign in to pledge</button>)}
            </article>
          );
        })}
      </div>
      {pick && (
        <Modal title={`Pledge to ${pick.model}`} onClose={() => setPick(null)}>
          <form onSubmit={pledge}>
            <label>Amount (RWF, minimum 10,000)<input required type="number" min="10000" step="1000" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></label>
            <label>Mobile money transaction ID<input required value={f.momo_ref} onChange={(e) => setF({ ...f, momo_ref: e.target.value })} /></label>
            {err && <div className="err" role="alert">{err}</div>}
            <div className="row"><button className="btn" disabled={busy}>Send pledge</button><button type="button" className="btn ghost" onClick={() => setPick(null)}>Cancel</button></div>
          </form>
        </Modal>
      )}
    </>
  );
}
