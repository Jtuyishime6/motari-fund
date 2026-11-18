import { useEffect, useState } from 'react';
import { api, rwf } from './lib.js';
import { Icon, Pill, Skeletons, Empty, Modal } from './ui.jsx';
import { Stagger, Item, motion } from './motion.jsx';

const PRESETS = [10000, 25000, 50000, 100000];
const fmt = (n) => new Intl.NumberFormat('en-RW').format(n);

export default function Campaigns({ profile, notify, onSignIn, onPledged, limit }) {
  const [items, setItems] = useState(null);
  const [pick, setPick] = useState(null);
  const [f, setF] = useState({ amount: '25000', momo_ref: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api('/campaigns').then(setItems).catch(() => setItems([]));
  useEffect(() => { load(); }, []);

  const open = (c) => {
    const left = Math.max(0, c.target - c.raised);
    setF({ amount: String(Math.min(25000, left)), momo_ref: '' });
    setErr('');
    setPick(c);
  };

  const pledge = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await api('/pledges', { method: 'POST', body: { campaign_id: pick.id, ...f } });
      setPick(null);
      notify('Pledge sent. We will confirm it once the payment is verified.');
      load();
      onPledged?.();
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  };

  if (!items) return <Skeletons n={3} />;
  if (!items.length) return <Empty icon="bolt" text="No e-motos are open for funding right now." />;

  const isInvestor = profile?.role === 'investor';

  return (
    <>
      <Stagger className="moto-grid">
        {(limit ? items.slice(0, limit) : items).map((c) => {
          const pct = Math.min(100, Math.round((c.raised / c.target) * 100));
          const left = Math.max(0, c.target - c.raised);
          const funded = c.status === 'funded' || left === 0;

          return (
            <Item as="article" className="moto" key={c.id} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
              <div className="moto-img">
                {c.photo_url
                  ? <img src={c.photo_url} alt={c.model} loading="lazy" className={/\.png$/i.test(c.photo_url) ? 'cutout' : undefined} />
                  : <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--text-3)' }}><Icon n="bolt" size={36} /></div>}
                <Pill s={funded ? 'funded' : 'open'} />
              </div>

              <div className="moto-body">
                <div className="moto-top">
                  <h4>{c.model}</h4>
                  <span className="moto-meta">{c.lease_months} mo lease</span>
                </div>

                <div className={'bar' + (funded ? ' full' : '')} role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100" aria-label={`${pct}% funded`}>
                  <motion.i initial={{ width: 0 }} whileInView={{ width: pct + '%' }} viewport={{ once: true }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }} />
                </div>

                <div className="moto-figures">
                  <span><strong>{rwf(c.raised)}</strong> raised</span>
                  <span>{pct}% · {c.backers || 0} {c.backers === 1 ? 'backer' : 'backers'}</span>
                </div>
                <div className="tiny">{funded ? `Goal of ${rwf(c.target)} reached` : `${rwf(left)} to go`}</div>

                {funded ? (
                  <button className="btn secondary block" disabled>Fully funded</button>
                ) : !profile ? (
                  <button className="btn block" onClick={onSignIn}>Sign in to invest</button>
                ) : isInvestor ? (
                  <button className="btn block" onClick={() => open(c)}>Invest</button>
                ) : null}
              </div>
            </Item>
          );
        })}
      </Stagger>

      {pick && (
        <Modal title="Invest in this e-moto" onClose={() => setPick(null)}>
          <div className="modal-sum">
            {pick.photo_url && <img src={pick.photo_url} alt="" />}
            <div>
              <strong>{pick.model}</strong>
              <div className="tiny">{rwf(Math.max(0, pick.target - pick.raised))} still needed</div>
            </div>
          </div>

          <form onSubmit={pledge}>
            <label>
              Amount (RWF)
              <div className="chips">
                {PRESETS.filter((a) => a <= pick.target - pick.raised).map((a) => (
                  <button key={a} type="button" className={'chip' + (Number(f.amount) === a ? ' on' : '')} onClick={() => setF({ ...f, amount: String(a) })}>
                    {fmt(a)}
                  </button>
                ))}
              </div>
              <input required type="number" min="10000" max={pick.target - pick.raised} step="1000" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
              <span className="hint">Minimum 10,000 RWF</span>
            </label>

            <ol className="modal-steps">
              <li>Send this amount with Mobile Money.</li>
              <li>Paste the transaction ID from your SMS below.</li>
            </ol>

            <label>
              Mobile Money transaction ID
              <input required value={f.momo_ref} onChange={(e) => setF({ ...f, momo_ref: e.target.value })} placeholder="e.g. 1234567890" />
            </label>

            {err && <div className="err" role="alert">{err}</div>}

            <div className="form-actions">
              <button className="btn" disabled={busy}>{busy ? 'Sending...' : 'Confirm pledge'}</button>
              <button type="button" className="btn ghost" onClick={() => setPick(null)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
