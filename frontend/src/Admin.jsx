import { useEffect, useState } from 'react';
import { api, rwf } from './lib.js';
import { Pill, Skeletons, Empty, Icon } from './ui.jsx';

export function Review({ notify }) {
  const [pl, setPl] = useState(null);
  const [ap, setAp] = useState(null);

  const load = () => {
    api('/pledges').then(setPl).catch(() => setPl([]));
    api('/applications').then(setAp).catch(() => setAp([]));
  };
  useEffect(load, []);

  const act = async (path, body, msg) => {
    try {
      await api(path, { method: 'PATCH', body });
      notify(msg);
      load();
    } catch (x) {
      notify(x.message);
    }
  };

  const reject = (id) => {
    const reason = window.prompt('Reason for rejection:');
    if (reason) act('/applications/' + id, { status: 'rejected', reason }, 'Rejected.');
  };

  if (!pl || !ap) return <Skeletons n={2} />;

  const pend = pl.filter((p) => p.status === 'pending');
  const apps = ap.filter((a) => a.status === 'pending');

  return (
    <div className="dashboard-view">
      <div className="section-head">
        <h2>Admin Review</h2>
      </div>

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="card stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--warn-bg)', color: 'var(--warn)' }}>
            <Icon n="clock-circle" size={22} />
          </div>
          <div className="stat-info">
            <span className="muted small-text">Pending Pledges</span>
            <h3 className="stat-number">{pend.length}</h3>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
            <Icon n="document-text" size={22} />
          </div>
          <div className="stat-info">
            <span className="muted small-text">Pending Applications</span>
            <h3 className="stat-number">{apps.length}</h3>
          </div>
        </div>
      </div>

      <section className="section" style={{ marginTop: 0 }}>
        <h3>Pledges</h3>
        {!pend.length ? (
          <Empty icon="shield-check" text="No pledges waiting." />
        ) : (
          <div className="list">
            {pend.map((p) => (
              <div className="item" key={p.id}>
                <div>
                  <strong>{rwf(p.amount)}</strong> for {p.campaigns?.model}
                  <p className="muted small-text">
                    {p.profiles?.full_name} · Ref: <code className="ref-code">{p.momo_ref}</code>
                  </p>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <button className="btn sm" onClick={() => act('/pledges/' + p.id, { status: 'confirmed' }, 'Pledge confirmed.')}>
                    Confirm
                  </button>
                  <button className="btn sm danger" onClick={() => act('/pledges/' + p.id, { status: 'rejected' }, 'Pledge rejected.')}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section" style={{ marginTop: 24 }}>
        <h3>Rider Applications</h3>
        {!apps.length ? (
          <Empty icon="document-text" text="No applications waiting." />
        ) : (
          <div className="list">
            {apps.map((a) => (
              <div className="item" key={a.id}>
                <div>
                  <strong>{a.profiles?.full_name}</strong>
                  <p className="muted small-text">
                    Permit: <code className="ref-code">{a.permit_number}</code> · {a.years_experience} yrs · {a.cooperative || 'N/A'} · {rwf(a.daily_income)}/day
                  </p>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <button className="btn sm" onClick={() => act('/applications/' + a.id, { status: 'approved' }, 'Approved.')}>
                    Approve
                  </button>
                  <button className="btn sm danger" onClick={() => reject(a.id)}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function NewCampaign({ notify }) {
  const [f, setF] = useState({ model: '', target: '', lease_months: 24, photo_url: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const presets = [
    { model: 'Ampersand Model 1 Pro', target: '2200000', lease_months: 24, photo_url: '/images/download.w-Ampersand2.webp' },
    { model: 'Spiro Commando E-Bike', target: '1950000', lease_months: 24, photo_url: '/images/SPIRO EKON M3 1.png' },
    { model: 'Roam Air Gen-2 Urban', target: '2400000', lease_months: 24, photo_url: '/images/spiro-ekon-450m2-1400x933.webp' }
  ];

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await api('/campaigns', { method: 'POST', body: f });
      setF({ model: '', target: '', lease_months: 24, photo_url: '' });
      notify('Campaign created.');
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <div className="section-head">
        <h2>New Campaign</h2>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <span className="muted small-text">Quick Presets:</span>
        <div className="row" style={{ marginTop: 8, gap: 8 }}>
          {presets.map((p) => (
            <button key={p.model} type="button" className="btn sm ghost" onClick={() => setF({ ...p })}>
              {p.model.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <form className="card" onSubmit={submit}>
        <label>
          Model Name
          <input required value={f.model} onChange={set('model')} placeholder="Ampersand Model 1 Pro" />
        </label>

        <label>
          Target (RWF)
          <input required type="number" min="100000" step="50000" value={f.target} onChange={set('target')} placeholder="2200000" />
        </label>

        <label>
          Lease Months
          <input required type="number" min="6" max="48" value={f.lease_months} onChange={set('lease_months')} />
        </label>

        <label>
          Photo URL
          <input value={f.photo_url} onChange={set('photo_url')} placeholder="/images/..." />
        </label>

        {f.photo_url && (
          <img src={f.photo_url} alt="Preview" className="form-img-preview" />
        )}

        {err && <div className="err" role="alert">{err}</div>}

        <button className="btn btn-primary sm" style={{ marginTop: 8, alignSelf: 'flex-start' }} disabled={busy}>
          {busy ? 'Saving...' : 'Create Campaign'}
        </button>
      </form>
    </div>
  );
}
