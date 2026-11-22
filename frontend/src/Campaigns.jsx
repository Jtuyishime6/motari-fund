import { useEffect, useState } from 'react';
import { api, fmt, rwf, pct as pctOf } from './lib.js';
import { MIN_PLEDGE, projectReturn } from '../../shared/rules.js';
import { Icon, Pill, Skeletons, Empty, Modal, Progress } from './ui.jsx';
import { Stagger, Item } from './motion.jsx';

const PRESETS = [10000, 25000, 50000, 100000, 250000];

function PledgeDialog({ campaign, onClose, onDone }) {
  const left = Math.max(0, campaign.target - campaign.raised);
  const [amount, setAmount] = useState(String(Math.min(25000, left)));
  const [ref, setRef] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const n = Number(amount) || 0;
  const tooSmall = n > 0 && n < MIN_PLEDGE;
  const tooBig = n > left;
  const { total } = projectReturn(n, campaign.lease_months);

  const submit = async (e) => {
    e.preventDefault();
    if (tooSmall || tooBig) return;
    setBusy(true);
    setErr('');
    try {
      await api('/pledges', { method: 'POST', body: { campaign_id: campaign.id, amount: n, momo_ref: ref.trim() } });
      onDone();
    } catch (x) {
      setErr(x.message);
      setBusy(false);
    }
  };

  return (
    <Modal title={`Back the ${campaign.model}`} sub={`${rwf(left)} still needed`} onClose={onClose}>
      <form onSubmit={submit} className="pledge-form">
        <fieldset>
          <legend>1. Choose an amount</legend>
          <div className="chips">
            {PRESETS.filter((a) => a <= left).map((a) => (
              <button key={a} type="button" className={'chip' + (n === a ? ' on' : '')} aria-pressed={n === a} onClick={() => setAmount(String(a))}>
                {fmt(a)}
              </button>
            ))}
          </div>
          <div className="input-affix">
            <input
              required inputMode="numeric" type="number" min={MIN_PLEDGE} max={left} step="1000" value={amount}
              onChange={(e) => setAmount(e.target.value)} aria-label="Amount in RWF" aria-invalid={tooSmall || tooBig}
            />
            <span>RWF</span>
          </div>
          <span className={'hint' + (tooSmall || tooBig ? ' bad' : '')}>
            {tooBig ? `This bike needs ${rwf(left)} more at most` : tooSmall ? `The minimum is ${rwf(MIN_PLEDGE)}` : n >= MIN_PLEDGE ? `Projected back: up to ${rwf(total)} over ${campaign.lease_months} months` : `Minimum ${rwf(MIN_PLEDGE)}`}
          </span>
        </fieldset>

        <fieldset>
          <legend>2. Send it with Mobile Money</legend>
          <p className="muted small">Send exactly <strong>{rwf(n)}</strong> from your MTN MoMo or Airtel Money account. Keep the confirmation SMS.</p>
        </fieldset>

        <fieldset>
          <legend>3. Paste the transaction ID</legend>
          <input required value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. MP2611041298" autoComplete="off" spellCheck="false" aria-label="Mobile Money transaction ID" />
          <span className="hint">You will find it in the SMS. We match it before the pledge counts.</span>
        </fieldset>

        {err && <div className="err" role="alert"><Icon n="alert" size={16} /> {err}</div>}

        <div className="form-actions">
          <button className="btn lg" disabled={busy || tooSmall || tooBig}>{busy ? 'Sending pledge...' : 'Send pledge'}</button>
          <button type="button" className="btn ghost lg" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

export function CampaignCard({ c, action }) {
  const pctDone = pctOf(c.raised, c.target);
  const left = Math.max(0, c.target - c.raised);
  const funded = c.status === 'funded' || left === 0;
  return (
    <Item as="article" className="moto">
      <div className="moto-img">
        {c.photo_url
          ? <img src={c.photo_url} alt={c.model} loading="lazy" className={/\.png$/i.test(c.photo_url) ? 'cutout' : undefined} />
          : <div className="moto-noimg"><Icon n="scooter" size={36} /></div>}
        <Pill s={funded ? 'funded' : 'open'} />
      </div>
      <div className="moto-body">
        <div className="moto-top">
          <h3>{c.model}</h3>
          <span className="moto-meta">{c.lease_months} mo lease</span>
        </div>
        <div className="moto-raised">
          <strong className="tnum">{fmt(c.raised)}</strong>
          <span className="tnum">of {fmt(c.target)} RWF</span>
        </div>
        <Progress value={pctDone} tone={funded ? 'done' : undefined} />
        <div className="moto-figures">
          <span>{funded ? 'Target reached' : `${rwf(left)} to go`}</span>
          <span>{c.backers || 0} {c.backers === 1 ? 'backer' : 'backers'}</span>
        </div>
        {action(funded)}
      </div>
    </Item>
  );
}

export default function Campaigns({ profile, notify, onSignIn, onPledged, limit }) {
  const [items, setItems] = useState(null);
  const [failed, setFailed] = useState(false);
  const [pick, setPick] = useState(null);

  const load = () => api('/campaigns').then((d) => { setItems(d); setFailed(false); }).catch(() => { setItems([]); setFailed(true); });
  useEffect(() => { load(); }, []);

  if (!items) return <Skeletons n={3} />;
  if (failed) return <Empty icon="alert" title="Could not load e-motos" text="Check your connection and try again." action={<button className="btn secondary" onClick={load}>Try again</button>} />;
  if (!items.length) return <Empty icon="scooter" title="No e-motos open right now" text="New bikes appear here as soon as they are listed." />;

  const isInvestor = profile?.role === 'investor';
  const shown = limit ? items.slice(0, limit) : items;

  return (
    <>
      <Stagger className="moto-grid">
        {shown.map((c) => (
          <CampaignCard
            key={c.id} c={c}
            action={(funded) => (funded
              ? <div className="moto-done"><Icon n="checkCircle" size={16} /> Fully funded</div>
              : !profile
                ? <button className="btn block" onClick={onSignIn}>Sign in to invest</button>
                : isInvestor
                  ? <button className="btn block" onClick={() => setPick(c)}>Invest in this e-moto</button>
                  : null)}
          />
        ))}
      </Stagger>

      {pick && (
        <PledgeDialog
          campaign={pick} onClose={() => setPick(null)}
          onDone={() => { setPick(null); notify('Pledge sent. It counts once we confirm the payment.'); load(); onPledged?.(); }}
        />
      )}
    </>
  );
}
