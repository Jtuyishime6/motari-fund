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
    const reason = window.prompt('Reason for rejecting application:');
    if (reason) {
      act('/applications/' + id, { status: 'rejected', reason }, 'Application rejected.');
    }
  };

  if (!pl || !ap) return <Skeletons n={2} />;

  const pend = pl.filter((p) => p.status === 'pending');
  const apps = ap.filter((a) => a.status === 'pending');

  return (
    <div className="dashboard-view">
      <div className="section-head">
        <div>
          <h2>Admin Review Center</h2>
          <p className="muted">Verify incoming MoMo payments and review rider lease requests.</p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="card stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--warn-bg)', color: 'var(--warn)' }}>
            <Icon n="clock-circle" size={24} />
          </div>
          <div className="stat-info">
            <span className="muted small-text">Pending Pledges</span>
            <h3 className="stat-number">{pend.length} Waiting</h3>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
            <Icon n="document-text" size={24} />
          </div>
          <div className="stat-info">
            <span className="muted small-text">Pending Applications</span>
            <h3 className="stat-number">{apps.length} Waiting</h3>
          </div>
        </div>
      </div>

      <section className="section" style={{ marginTop: 0 }}>
        <h3>Pledges Awaiting Payment Confirmation</h3>
        {!pend.length ? (
          <Empty icon="shield-check" text="No pledges waiting. All payments are reviewed." />
        ) : (
          <div className="list">
            {pend.map((p) => (
              <div className="item" key={p.id}>
                <div>
                  <strong>{rwf(p.amount)}</strong> for {p.campaigns?.model}
                  <p className="muted small-text" style={{ marginTop: 2 }}>
                    Investor: {p.profiles?.full_name} ({p.profiles?.phone}) · Ref: <code className="ref-code">{p.momo_ref}</code>
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

      <section className="section">
        <h3>Rider Applications Awaiting Approval</h3>
        {!apps.length ? (
          <Empty icon="document-text" text="No rider applications waiting." />
        ) : (
          <div className="list">
            {apps.map((a) => (
              <div className="item" key={a.id}>
                <div>
                  <strong>{a.profiles?.full_name}</strong>
                  <p className="muted small-text" style={{ marginTop: 2 }}>
                    Permit: <code className="ref-code">{a.permit_number}</code> · {a.years_experience} yrs exp · Cooperative: {a.cooperative || 'N/A'} · Expected {rwf(a.daily_income)}/day
                  </p>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <button className="btn sm" onClick={() => act('/applications/' + a.id, { status: 'approved' }, 'Application approved.')}>
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
  const [f, setF] = useState({
    model: '',
    target: '',
    lease_months: 24,
    photo_url: ''
  });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const presets = [
    {
      model: 'Ampersand Model 1 Pro',
      target: '2200000',
      lease_months: 24,
      photo_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80'
    },
    {
      model: 'Spiro Commando E-Bike',
      target: '1950000',
      lease_months: 24,
      photo_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80'
    },
    {
      model: 'Roam Air Gen-2 Urban',
      target: '2400000',
      lease_months: 24,
      photo_url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await api('/campaigns', { method: 'POST', body: f });
      setF({ model: '', target: '', lease_months: 24, photo_url: '' });
      notify('New e-moto campaign created successfully.');
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  };

  return (
    <div style={{ maxWidth: 580, margin: '0 auto' }}>
      <div className="section-head">
        <div>
          <h2>Create New E-Moto Campaign</h2>
          <p className="muted">List a new electric motorcycle for micro-investment and rider leasing.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <span className="muted small-text">Quick Presets:</span>
        <div className="row" style={{ marginTop: 8, gap: 8 }}>
          {presets.map((p) => (
            <button
              key={p.model}
              type="button"
              className="btn sm ghost"
              onClick={() => setF({ ...p })}
            >
              {p.model.split(' ')[0]} Preset
            </button>
          ))}
        </div>
      </div>

      <form className="card" onSubmit={submit}>
        <label>
          E-Moto Model Name
          <input required value={f.model} onChange={set('model')} placeholder="e.g. Ampersand Model 1 Pro" />
        </label>

        <label>
          Funding Target (RWF)
          <input required type="number" min="100000" step="50000" value={f.target} onChange={set('target')} placeholder="2200000" />
        </label>

        <label>
          Lease Term (Months)
          <input required type="number" min="6" max="48" value={f.lease_months} onChange={set('lease_months')} />
        </label>

        <label>
          Photo URL (Image of E-Moto)
          <input value={f.photo_url} onChange={set('photo_url')} placeholder="https://..." />
        </label>

        {f.photo_url && (
          <div className="preview-mini-wrap">
            <span className="muted small-text">Image Preview:</span>
            <img src={f.photo_url} alt="Preview" className="form-img-preview" />
          </div>
        )}

        {err && <div className="err" role="alert">{err}</div>}

        <button className="btn btn-primary" style={{ marginTop: 8 }} disabled={busy}>
          {busy ? 'Creating Campaign...' : 'Launch Campaign'}
        </button>
      </form>
    </div>
  );
}
