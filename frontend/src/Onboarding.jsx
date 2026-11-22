import { useState } from 'react';
import { api } from './lib.js';
import { DISTRICTS, normPhone } from '../../shared/rules.js';
import { Icon } from './ui.jsx';
import { Reveal } from './motion.jsx';

export default function Onboarding({ profile, onDone }) {
  const [f, setF] = useState({ full_name: profile.full_name || '', phone: profile.phone || '', district: profile.district || '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!normPhone(f.phone)) { setErr('Enter a valid MTN or Airtel number, e.g. 0788123456'); return; }
    setBusy(true);
    setErr('');
    try {
      onDone(await api('/me', { method: 'PUT', body: f }));
    } catch (x) {
      setErr(x.message);
      setBusy(false);
    }
  };

  return (
    <Reveal className="narrow" y={16}>
      <div style={{ maxWidth: 460, margin: '0 auto' }}>
        <div className="page-head">
          <div>
            <h1>Set up your investor account</h1>
            <p>We pay returns to your Mobile Money number, so make sure it is yours.</p>
          </div>
        </div>

        <form className="panel form" onSubmit={submit}>
          <label>
            Full name
            <input required value={f.full_name} onChange={set('full_name')} autoComplete="name" />
          </label>
          <label>
            Mobile Money number
            <input required inputMode="tel" value={f.phone} onChange={set('phone')} placeholder="0788123456" autoComplete="tel" />
          </label>
          <label>
            District
            <select required value={f.district} onChange={set('district')}>
              <option value="" disabled>Select</option>
              {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>

          {err && <div className="err" role="alert"><Icon n="alert" size={16} /> {err}</div>}

          <button className="btn lg block" disabled={busy}>{busy ? 'Saving...' : 'Continue to e-motos'}</button>
        </form>
      </div>
    </Reveal>
  );
}
