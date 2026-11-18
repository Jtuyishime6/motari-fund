import { useEffect, useState } from 'react';
import { api, rwf } from './lib.js';
import { Icon, Pill, Skeletons, Empty, Modal } from './ui.jsx';

export default function Campaigns({ profile, notify, onSignIn }) {
  const [items, setItems] = useState(null);
  const [pick, setPick] = useState(null);
  const [f, setF] = useState({ amount: '25000', momo_ref: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api('/campaigns').then(setItems).catch(() => setItems([]));
  useEffect(() => { load(); }, []);

  const pledge = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await api('/pledges', { method: 'POST', body: { campaign_id: pick.id, ...f } });
      setPick(null);
      setF({ amount: '25000', momo_ref: '' });
      notify('Pledge sent. An admin will confirm your payment.');
      load();
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  };

  const presets = [10000, 25000, 50000, 100000];

  if (!items) return <Skeletons />;
  if (!items.length) return <Empty icon="bolt" text="No e-motos need funding yet. Check back soon." />;

  return (
    <section id="campaigns-section" className="section" style={{ marginTop: 0 }}>
      <div className="section-head">
        <div>
          <h2>Available E-Motos for Funding</h2>
          <p className="muted">Select a verified electric moto-taxi to back and track its lease progress.</p>
        </div>
        <div className="tag-count">
          <Icon n="bolt" size={18} />
          <span>{items.length} Campaigns</span>
        </div>
      </div>

      <div className="grid campaigns-grid-3">
        {items.map((c, i) => {
          const pct = Math.min(100, Math.round((c.raised / c.target) * 100));
          const remaining = Math.max(0, c.target - c.raised);

          return (
            <article className="card moto-card fade" style={{ '--i': i }} key={c.id}>
              <div className="moto-thumb">
                {c.photo_url ? (
                  <img src={c.photo_url} alt={c.model} className="moto-img" loading="lazy" />
                ) : (
                  <div className="moto-placeholder"><Icon n="bolt" size={40} /></div>
                )}
                <div className="moto-overlay">
                  <Pill s={c.status} />
                  <span className="pill dark-glass">{c.lease_months} mo. lease</span>
                </div>
              </div>

              <div className="moto-body">
                <div className="moto-meta">
                  <span className="location-tag"><Icon n="map-point" size={14} /> Kigali · Gasabo</span>
                  <span className="eco-tag"><Icon n="leaf" size={14} /> 100% Electric</span>
                </div>

                <h3 className="moto-title">{c.model}</h3>

                <div className="progress-wrap">
                  <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100">
                    <i style={{ width: pct + '%' }} />
                  </div>
                  <div className="stats">
                    <strong>{rwf(c.raised)} ({pct}%)</strong>
                    <span className="muted">Target {rwf(c.target)}</span>
                  </div>
                </div>

                <div className="moto-footer">
                  <span className="muted small-text">
                    {c.status === 'funded' ? 'Fully Funded' : `${rwf(remaining)} still needed`}
                  </span>

                  {c.status === 'open' && (
                    profile?.role === 'investor' || profile?.role === 'admin' ? (
                      <button className="btn sm" onClick={() => { setPick(c); setF({ amount: '25000', momo_ref: '' }); }}>
                        Pledge
                      </button>
                    ) : !profile ? (
                      <button className="btn sm ghost" onClick={onSignIn}>
                        Sign in to pledge
                      </button>
                    ) : null
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {pick && (
        <Modal title={`Pledge to ${pick.model}`} onClose={() => setPick(null)}>
          <div className="pledge-modal-meta">
            <div className="row" style={{ gap: 12 }}>
              {pick.photo_url && <img src={pick.photo_url} alt="" className="modal-mini-thumb" />}
              <div>
                <strong>{pick.model}</strong>
                <p className="muted small-text">Still needed: {rwf(Math.max(0, pick.target - pick.raised))}</p>
              </div>
            </div>
          </div>

          <form onSubmit={pledge}>
            <label>
              Pledge amount (RWF)
              <div className="preset-row">
                {presets.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={'preset-btn' + (Number(f.amount) === amt ? ' on' : '')}
                    onClick={() => setF({ ...f, amount: String(amt) })}
                  >
                    {new Intl.NumberFormat('en-RW').format(amt)}
                  </button>
                ))}
              </div>
              <input
                required
                type="number"
                min="10000"
                step="1000"
                value={f.amount}
                onChange={(e) => setF({ ...f, amount: e.target.value })}
                placeholder="25000"
              />
            </label>

            <label>
              Mobile Money Transaction ID (MTN / Airtel)
              <input
                required
                value={f.momo_ref}
                onChange={(e) => setF({ ...f, momo_ref: e.target.value })}
                placeholder="e.g. MTN-RW-948201"
              />
              <span className="muted small-text">Enter the reference code received in your MoMo confirmation SMS.</span>
            </label>

            {err && <div className="err" role="alert">{err}</div>}

            <div className="row" style={{ marginTop: 8 }}>
              <button className="btn" disabled={busy}>
                {busy ? 'Sending...' : 'Confirm Pledge'}
              </button>
              <button type="button" className="btn ghost" onClick={() => setPick(null)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
