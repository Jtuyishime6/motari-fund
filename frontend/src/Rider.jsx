import { useEffect, useState } from 'react';
import { api } from './lib.js';
import { Pill, Skeletons, Empty } from './ui.jsx';
export default function Rider({ notify }) {
  const [rows, setRows] = useState(null); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ permit_number: '', years_experience: '', cooperative: '', daily_income: '' });
  const load = () => api('/applications').then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await api('/applications', { method: 'POST', body: f }); notify('Application sent.'); await load(); } catch (x) { setErr(x.message); } setBusy(false);
  };
  if (!rows) return <Skeletons n={1} />;
  const open = rows.find((r) => r.status !== 'rejected');
  return (
    <div style={{ maxWidth: 560 }}>
      {rows.map((r) => (
        <div className="card" key={r.id} style={{ marginBottom: 16 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}><h3>Your lease application</h3><Pill s={r.status} /></div>
          <p className="muted">Permit {r.permit_number} · {r.years_experience} years riding</p>
          {r.reason && <p>Reason: {r.reason}</p>}
        </div>
      ))}
      {!rows.length && <Empty icon="document-text" text="Apply to lease an e-moto. It takes one minute." />}
      {!open && (
        <form className="card" onSubmit={submit} style={{ marginTop: 16 }}>
          <label>Riding permit number<input required value={f.permit_number} onChange={set('permit_number')} /></label>
          <label>Years of experience<input required type="number" min="0" value={f.years_experience} onChange={set('years_experience')} /></label>
          <label>Cooperative name<input value={f.cooperative} onChange={set('cooperative')} /></label>
          <label>Expected daily income (RWF)<input required type="number" min="1" value={f.daily_income} onChange={set('daily_income')} /></label>
          {err && <div className="err" role="alert">{err}</div>}
          <button className="btn" disabled={busy}>Send application</button>
        </form>
      )}
    </div>
  );
}
