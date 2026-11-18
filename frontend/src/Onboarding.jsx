import { useState } from 'react';
import { api } from './lib.js';
export default function Onboarding({ profile, onDone }) {
  const [f, setF] = useState({ full_name: profile.full_name || '', phone: '', district: '', role: 'investor' });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { onDone(await api('/me', { method: 'PUT', body: f })); } catch (x) { setErr(x.message); setBusy(false); }
  };
  return (
    <div className="wrap" style={{ maxWidth: 520 }}>
      <h2>Finish your profile</h2><p className="muted" style={{ margin: '8px 0 24px' }}>Tell us who you are so we can set up your account.</p>
      <form className="card" onSubmit={submit}>
        <label>I want to<select value={f.role} onChange={set('role')}><option value="investor">Invest in e-motos</option><option value="rider">Lease an e-moto as a rider</option></select></label>
        <label>Full name<input required value={f.full_name} onChange={set('full_name')} autoComplete="name" /></label>
        <label>Phone number<input required inputMode="tel" value={f.phone} onChange={set('phone')} placeholder="07XXXXXXXX" autoComplete="tel" /></label>
        <label>District<input required value={f.district} onChange={set('district')} placeholder="Gasabo" /></label>
        {err && <div className="err" role="alert">{err}</div>}
        <button className="btn" disabled={busy}>{busy ? 'Saving...' : 'Save profile'}</button>
      </form>
    </div>
  );
}
