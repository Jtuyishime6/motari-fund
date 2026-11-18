import { useEffect, useState } from 'react';
import { api, rwf } from './lib.js';
import { Pill, Skeletons, Empty } from './ui.jsx';
export function Review({ notify }) {
  const [pl, setPl] = useState(null); const [ap, setAp] = useState(null);
  const load = () => { api('/pledges').then(setPl).catch(() => setPl([])); api('/applications').then(setAp).catch(() => setAp([])); };
  useEffect(load, []);
  const act = async (path, body, msg) => { try { await api(path, { method: 'PATCH', body }); notify(msg); load(); } catch (x) { notify(x.message); } };
  const reject = (id) => { const reason = window.prompt('Reason for rejecting'); if (reason) act('/applications/' + id, { status: 'rejected', reason }, 'Application rejected.'); };
  if (!pl || !ap) return <Skeletons n={2} />;
  const pend = pl.filter((p) => p.status === 'pending'); const apps = ap.filter((a) => a.status === 'pending');
  return (
    <div>
      <section className="section" style={{ marginTop: 0 }}><h3>Pledges to confirm</h3>
        {!pend.length ? <Empty icon="shield-check" text="No pledges waiting." /> : <div className="list">{pend.map((p) => (
          <div className="item" key={p.id}><div><strong>{rwf(p.amount)}</strong> for {p.campaigns?.model}<p className="muted">{p.profiles?.full_name} · Ref {p.momo_ref}</p></div>
            <div className="row"><button className="btn" onClick={() => act('/pledges/' + p.id, { status: 'confirmed' }, 'Pledge confirmed.')}>Confirm</button><button className="btn danger" onClick={() => act('/pledges/' + p.id, { status: 'rejected' }, 'Pledge rejected.')}>Reject</button></div></div>
        ))}</div>}
      </section>
      <section className="section"><h3>Rider applications</h3>
        {!apps.length ? <Empty icon="document-text" text="No applications waiting." /> : <div className="list">{apps.map((a) => (
          <div className="item" key={a.id}><div><strong>{a.profiles?.full_name}</strong><p className="muted">Permit {a.permit_number} · {a.years_experience} yrs · {rwf(a.daily_income)} a day</p></div>
            <div className="row"><button className="btn" onClick={() => act('/applications/' + a.id, { status: 'approved' }, 'Application approved.')}>Approve</button><button className="btn danger" onClick={() => reject(a.id)}>Reject</button></div></div>
        ))}</div>}
      </section>
    </div>
  );
}
export function NewCampaign({ notify }) {
  const [f, setF] = useState({ model: '', target: '', lease_months: 24, photo_url: '' }); const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    try { await api('/campaigns', { method: 'POST', body: f }); setF({ model: '', target: '', lease_months: 24, photo_url: '' }); notify('Campaign created.'); } catch (x) { setErr(x.message); }
  };
  return (
    <form className="card" style={{ maxWidth: 520 }} onSubmit={submit}>
      <label>E-moto model<input required value={f.model} onChange={set('model')} /></label>
      <label>Funding target (RWF)<input required type="number" min="1" value={f.target} onChange={set('target')} /></label>
      <label>Lease term (months)<input required type="number" min="1" value={f.lease_months} onChange={set('lease_months')} /></label>
      {err && <div className="err" role="alert">{err}</div>}
      <button className="btn">Create campaign</button>
    </form>
  );
}
