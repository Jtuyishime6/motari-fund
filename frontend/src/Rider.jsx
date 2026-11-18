import { useState } from 'react';
import { api } from './lib.js';
import { Icon, Modal } from './ui.jsx';

export const DISTRICTS = ['Gasabo', 'Kicukiro', 'Nyarugenge', 'Other'];

const EMPTY = { full_name: '', phone: '', district: '', permit_number: '', years_experience: '', cooperative: '', daily_income: '', website: '' };

/** Public rider application. No account, no uploads: the team calls to verify. */
export default function RiderApply({ onClose }) {
  const [f, setF] = useState(EMPTY);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await api('/apply', { method: 'POST', body: f });
      setDone(true);
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  };

  if (done) {
    return (
      <Modal title="Application received" onClose={onClose}>
        <div className="success">
          <div className="success-ic"><Icon n="check-circle" size={30} /></div>
          <p>Thank you, {f.full_name.split(' ')[0]}. We will call you on <strong>{f.phone}</strong> to verify your details.</p>
          <button className="btn block" onClick={onClose}>Done</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Apply as a rider" onClose={onClose}>
      <p className="muted small" style={{ marginBottom: 18 }}>Takes 1 minute. No account needed.</p>
      <form onSubmit={submit}>
        <label>
          Full name
          <input required value={f.full_name} onChange={set('full_name')} autoComplete="name" />
        </label>
        <div className="form-grid">
          <label>
            Phone number
            <input required inputMode="tel" value={f.phone} onChange={set('phone')} placeholder="0788123456" autoComplete="tel" />
          </label>
          <label>
            District
            <select required value={f.district} onChange={set('district')}>
              <option value="" disabled>Select</option>
              {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
          <label>
            Driving permit no.
            <input required value={f.permit_number} onChange={set('permit_number')} placeholder="RW-DL-..." />
          </label>
          <label>
            Years riding
            <input required type="number" min="0" max="50" value={f.years_experience} onChange={set('years_experience')} placeholder="3" />
          </label>
          <label>
            Daily income (RWF)
            <input required type="number" min="1000" step="500" value={f.daily_income} onChange={set('daily_income')} placeholder="15000" />
          </label>
          <label>
            Cooperative
            <input value={f.cooperative} onChange={set('cooperative')} placeholder="Optional" />
          </label>
        </div>
        <input className="hp" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} aria-hidden="true" />

        {err && <div className="err" role="alert">{err}</div>}

        <button className="btn lg block" disabled={busy}>{busy ? 'Sending...' : 'Send application'}</button>
      </form>
    </Modal>
  );
}
