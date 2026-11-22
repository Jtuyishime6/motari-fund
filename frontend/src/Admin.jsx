import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, rwf, fmt, compact, ago, longDate, pct, sb } from './lib.js';
import { MIN_CAMPAIGN_TARGET, LEASE_MONTHS, DEFAULT_LEASE_MONTHS } from '../../shared/rules.js';
import { Empty, Icon, Modal, PageHead, Pill, Progress } from './ui.jsx';
import { CampaignCard } from './Campaigns.jsx';
import { AreaChart, cumulativeByDay } from './charts.jsx';
import { CountUp, Stagger, Item, motion, EASE } from './motion.jsx';

/** One loader for every admin screen, so counts in the sidebar, overview and queue always agree. */
export function useAdminData(enabled = true) {
  const [data, setData] = useState({ pledges: null, applications: null, campaigns: null });
  const [error, setError] = useState('');
  const reload = useCallback(async () => {
    if (!enabled) return;
    try {
      const [pledges, applications, campaigns] = await Promise.all([api('/pledges'), api('/applications'), api('/campaigns')]);
      setData({ pledges, applications, campaigns });
      setError('');
    } catch (x) {
      setError(x.message);
    }
  }, [enabled]);
  useEffect(() => { reload(); }, [reload]);
  const ready = !!(data.pledges && data.applications && data.campaigns);
  const queue = ready ? data.pledges.filter((p) => p.status === 'pending').length + data.applications.filter((a) => a.status === 'pending').length : 0;
  return { ...data, ready, error, reload, queue };
}

function Kpi({ icon, label, value, sub, tone }) {
  return (
    <Item className="kpi">
      <div className="kpi-top"><span className="kpi-ic"><Icon n={icon} size={16} /></span>{label}</div>
      <div className={'kpi-val' + (tone ? ' ' + tone : '')}>{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </Item>
  );
}

const LoadError = ({ error, reload }) => (
  <div className="panel"><Empty icon="alert" title="Could not load data" text={error} action={<button className="btn secondary" onClick={reload}>Try again</button>} /></div>
);

export function Overview({ data, go }) {
  const { pledges, applications, campaigns, ready, error, reload } = data;

  const m = useMemo(() => {
    if (!ready) return null;
    const confirmed = pledges.filter((p) => p.status === 'confirmed');
    const pending = pledges.filter((p) => p.status === 'pending');
    const sum = (rows) => rows.reduce((s, r) => s + r.amount, 0);
    const series = cumulativeByDay(confirmed.map((p) => ({ date: p.confirmed_at || p.created_at, amount: p.amount })), 30);
    const monthAgo = series[0]?.value || 0;
    const now = series[series.length - 1]?.value || 0;
    const activity = [
      ...pledges.map((p) => ({ id: p.id, at: p.confirmed_at || p.created_at, icon: 'wallet', text: <><strong>{p.profiles?.full_name || 'An investor'}</strong> pledged {compact(p.amount)} to {p.campaigns?.model}</>, s: p.status })),
      ...applications.map((a) => ({ id: a.id, at: a.created_at, icon: 'userCheck', text: <><strong>{a.profiles?.full_name || 'A rider'}</strong> applied from {a.profiles?.district}</>, s: a.status }))
    ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 6);
    return {
      raised: sum(confirmed), pendingSum: sum(pending), pendingN: pending.length,
      investors: new Set(confirmed.map((p) => p.investor_id)).size,
      funded: campaigns.filter((c) => c.status === 'funded').length,
      appsN: applications.filter((a) => a.status === 'pending').length,
      series, growth: now - monthAgo, activity
    };
  }, [ready, pledges, applications, campaigns]);

  if (error && !ready) return <LoadError error={error} reload={reload} />;

  return (
    <>
      <PageHead
        title="Overview"
        sub="Capital, campaigns and the review queue at a glance."
        action={<button className="btn sm" onClick={() => go('new')}><Icon n="plus" size={16} /> New campaign</button>}
      />

      {!m ? <div className="kpis">{[0, 1, 2, 3].map((i) => <div className="kpi" key={i}><div className="sk" style={{ height: 76 }} /></div>)}</div> : (
        <>
          <Stagger className="kpis">
            <Kpi icon="wallet" label="Capital confirmed" value={<><CountUp to={m.raised} duration={1} /> <small>RWF</small></>} sub={m.growth > 0 ? <span className="up">+{compact(m.growth)} in 30 days</span> : 'No new capital in 30 days'} />
            <Kpi icon="clock" label="Awaiting confirmation" value={<><CountUp to={m.pendingSum} duration={1} /> <small>RWF</small></>} sub={`${m.pendingN} ${m.pendingN === 1 ? 'pledge' : 'pledges'} to match`} tone={m.pendingN ? 'warn' : ''} />
            <Kpi icon="users" label="Investors" value={<CountUp to={m.investors} duration={1} />} sub="With at least one confirmed pledge" />
            <Kpi icon="scooter" label="E-motos funded" value={<>{m.funded}<small> of {campaigns.length}</small></>} sub={`${m.appsN} ${m.appsN === 1 ? 'rider' : 'riders'} waiting for review`} />
          </Stagger>

          <div className="grid-2-1">
            <div className="col">
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>Capital raised</h2>
                  <p>Confirmed pledges, cumulative, last 30 days</p>
                </div>
                <div className="panel-figure tnum">{rwf(m.raised)}</div>
              </div>
              <AreaChart points={m.series} label="Cumulative confirmed capital over the last 30 days" />
            </section>
            <section className="panel">
              <div className="panel-head">
                <div><h2>Funding by e-moto</h2><p>Confirmed capital against each target</p></div>
                <button className="btn ghost sm" onClick={() => go('emotos')}>All campaigns <Icon n="chevronRight" size={14} /></button>
              </div>
              <div className="funding-list">
                {campaigns.slice(0, 6).map((c) => (
                  <div className="funding-row" key={c.id}>
                    <div className="funding-name">
                      {c.photo_url ? <img src={c.photo_url} alt="" /> : <span className="thumb-ph"><Icon n="scooter" size={16} /></span>}
                      <div><strong>{c.model}</strong><span>{c.backers} backers</span></div>
                    </div>
                    <Progress value={pct(c.raised, c.target)} tone={c.status === 'funded' ? 'done' : undefined} />
                    <div className="funding-num tnum"><strong>{pct(c.raised, c.target)}%</strong><span>{compact(c.raised)} of {compact(c.target)}</span></div>
                  </div>
                ))}
                {!campaigns.length && <Empty icon="scooter" text="Create your first campaign to start raising." action={<button className="btn" onClick={() => go('new')}>New campaign</button>} />}
              </div>
            </section>
            </div>
            <div className="col">
            <section className="panel">
              <div className="panel-head">
                <div><h2>Needs you</h2><p>Items in the review queue</p></div>
              </div>
              <div className="attention">
                <button className="attn" onClick={() => go('review')}>
                  <span className="attn-ic warn"><Icon n="wallet" size={18} /></span>
                  <span><span><strong>{m.pendingN}</strong> {m.pendingN === 1 ? 'pledge' : 'pledges'} to match</span><em>{rwf(m.pendingSum)} waiting</em></span>
                  <Icon n="chevronRight" size={16} />
                </button>
                <button className="attn" onClick={() => go('review', 'riders')}>
                  <span className="attn-ic"><Icon n="userCheck" size={18} /></span>
                  <span><span><strong>{m.appsN}</strong> rider {m.appsN === 1 ? 'application' : 'applications'}</span><em>Call each rider to verify</em></span>
                  <Icon n="chevronRight" size={16} />
                </button>
              </div>
              <h3 className="panel-sub">Recent activity</h3>
              <ul className="feed">
                {m.activity.map((a) => (
                  <li key={a.id}>
                    <span className="feed-ic"><Icon n={a.icon} size={14} /></span>
                    <span className="feed-txt">{a.text}<em>{ago(a.at)}</em></span>
                    <Pill s={a.s} />
                  </li>
                ))}
                {!m.activity.length && <li className="muted small">Nothing yet.</li>}
              </ul>
            </section>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function ConfirmDialog({ title, text, cta, danger, onConfirm, onClose, busy, children }) {
  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onConfirm(); }}>
        {text && <p className="muted">{text}</p>}
        {children}
        <div className="form-actions">
          <button className={'btn' + (danger ? ' danger-solid' : '')} disabled={busy}>{cta}</button>
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

export function Review({ data, notify, initialTab }) {
  const { pledges, applications, ready, error, reload } = data;
  const [tab, setTab] = useState(initialTab || 'pledges');
  const [busyId, setBusyId] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [reason, setReason] = useState('');

  useEffect(() => { if (initialTab) setTab(initialTab); }, [initialTab]);

  const act = async (id, path, body, msg) => {
    setBusyId(id);
    try {
      await api(path, { method: 'PATCH', body });
      notify(msg);
      setDialog(null);
      setReason('');
      await reload();
    } catch (x) {
      notify(x.message);
    }
    setBusyId(null);
  };

  if (error && !ready) return <LoadError error={error} reload={reload} />;

  const pend = pledges?.filter((p) => p.status === 'pending') || [];
  const apps = applications?.filter((a) => a.status === 'pending') || [];
  const history = ready ? [...pledges.filter((p) => p.status !== 'pending').map((p) => ({ ...p, kind: 'pledge' })), ...applications.filter((a) => a.status !== 'pending').map((a) => ({ ...a, kind: 'rider' }))]
    .sort((a, b) => new Date(b.confirmed_at || b.created_at) - new Date(a.confirmed_at || a.created_at)).slice(0, 30) : [];

  const TABS = [['pledges', 'Pledges', pend.length], ['riders', 'Rider applications', apps.length], ['history', 'History', null]];

  return (
    <>
      <PageHead title="Review" sub="Match each pledge to its Mobile Money record, and call riders before approving them." />

      <div className="tabs" role="tablist">
        {TABS.map(([k, l, n]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
            {l}{n != null && <span className="count">{n}</span>}
            {tab === k && <motion.span layoutId="tab-line" className="tab-line" transition={{ duration: 0.25, ease: EASE }} />}
          </button>
        ))}
      </div>

      <section className="panel flush">
        {!ready ? <div style={{ padding: 20 }}><div className="sk" style={{ height: 56, marginBottom: 10 }} /><div className="sk" style={{ height: 56 }} /></div>

          : tab === 'pledges' ? (!pend.length ? <Empty icon="checkCircle" title="All caught up" text="Every pledge has been reviewed." /> : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Investor</th><th>E-moto</th><th className="num">Amount</th><th>Transaction ID</th><th>Sent</th><th aria-label="Actions" /></tr></thead>
                <tbody>
                  {pend.map((p) => (
                    <tr key={p.id}>
                      <td><div className="cell-person"><span className="avatar sm">{(p.profiles?.full_name || 'I')[0]}</span><div><strong>{p.profiles?.full_name || 'Investor'}</strong><span>{p.profiles?.phone}</span></div></div></td>
                      <td>{p.campaigns?.model}</td>
                      <td className="num tnum"><strong>{fmt(p.amount)}</strong></td>
                      <td><code className="ref">{p.momo_ref}</code></td>
                      <td className="muted">{ago(p.created_at)}</td>
                      <td className="actions">
                        <button className="btn sm" disabled={busyId === p.id} onClick={() => act(p.id, '/pledges/' + p.id, { status: 'confirmed' }, 'Pledge confirmed.')}><Icon n="check" size={14} /> Confirm</button>
                        <button className="btn sm ghost danger" disabled={busyId === p.id} onClick={() => setDialog({ kind: 'pledge', row: p })}>Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))

          : tab === 'riders' ? (!apps.length ? <Empty icon="checkCircle" title="No applications waiting" text="New rider applications will appear here." /> : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Rider</th><th>District</th><th>Permit</th><th className="num">Experience</th><th className="num">Daily income (RWF)</th><th>Cooperative</th><th aria-label="Actions" /></tr></thead>
                <tbody>
                  {apps.map((a) => (
                    <tr key={a.id}>
                      <td><div className="cell-person"><span className="avatar sm">{(a.profiles?.full_name || 'R')[0]}</span><div><strong>{a.profiles?.full_name || 'Rider'}</strong><a href={`tel:${a.profiles?.phone}`}>{a.profiles?.phone}</a></div></div></td>
                      <td>{a.profiles?.district}</td>
                      <td><code className="ref">{a.permit_number}</code></td>
                      <td className="num tnum">{a.years_experience} yrs</td>
                      <td className="num tnum">{fmt(a.daily_income)}</td>
                      <td>{a.cooperative || <span className="muted">None</span>}</td>
                      <td className="actions">
                        <button className="btn sm" disabled={busyId === a.id} onClick={() => act(a.id, '/applications/' + a.id, { status: 'approved' }, 'Rider approved.')}><Icon n="check" size={14} /> Approve</button>
                        <button className="btn sm ghost danger" disabled={busyId === a.id} onClick={() => setDialog({ kind: 'rider', row: a })}>Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))

          : (!history.length ? <Empty icon="clock" text="Reviewed items will appear here." /> : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Item</th><th>Detail</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.kind + h.id}>
                      <td><strong>{h.profiles?.full_name || (h.kind === 'pledge' ? 'Investor' : 'Rider')}</strong></td>
                      <td className="muted">{h.kind === 'pledge' ? `${rwf(h.amount)} to ${h.campaigns?.model}` : h.reason ? `Rider application: ${h.reason}` : 'Rider application'}</td>
                      <td><Pill s={h.status} /></td>
                      <td className="muted">{longDate(h.confirmed_at || h.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </section>

      {dialog?.kind === 'pledge' && (
        <ConfirmDialog
          title="Reject this pledge?" danger cta="Reject pledge" busy={busyId === dialog.row.id}
          text={`${rwf(dialog.row.amount)} from ${dialog.row.profiles?.full_name || 'this investor'} will not count toward ${dialog.row.campaigns?.model}. Do this only if the transaction ID does not match a payment.`}
          onClose={() => setDialog(null)}
          onConfirm={() => act(dialog.row.id, '/pledges/' + dialog.row.id, { status: 'rejected' }, 'Pledge rejected.')}
        />
      )}
      {dialog?.kind === 'rider' && (
        <ConfirmDialog
          title="Reject application" danger cta="Reject application" busy={busyId === dialog.row.id}
          onClose={() => setDialog(null)}
          onConfirm={() => reason.trim() && act(dialog.row.id, '/applications/' + dialog.row.id, { status: 'rejected', reason }, 'Application rejected.')}
        >
          <label>
            Reason for {dialog.row.profiles?.full_name || 'the rider'}
            <textarea required autoFocus value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Permit number could not be verified" />
          </label>
        </ConfirmDialog>
      )}
    </>
  );
}

export function CampaignTable({ data, go }) {
  const { campaigns, ready, error, reload } = data;
  if (error && !ready) return <LoadError error={error} reload={reload} />;
  return (
    <>
      <PageHead title="E-motos" sub="Every campaign and how close it is to the road." action={<button className="btn sm" onClick={() => go('new')}><Icon n="plus" size={16} /> New campaign</button>} />
      <section className="panel flush">
        {!ready ? <div style={{ padding: 20 }}><div className="sk" style={{ height: 160 }} /></div> : !campaigns.length ? (
          <Empty icon="scooter" title="No campaigns yet" text="Create one to start raising." action={<button className="btn" onClick={() => go('new')}>New campaign</button>} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>E-moto</th><th>Status</th><th style={{ width: '28%' }}>Progress</th><th className="num">Raised</th><th className="num">Target</th><th className="num">Backers</th><th>Listed</th></tr></thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id}>
                    <td><div className="cell-person">{c.photo_url ? <img src={c.photo_url} alt="" className="thumb" /> : <span className="thumb-ph"><Icon n="scooter" size={16} /></span>}<div><strong>{c.model}</strong><span>{c.lease_months} month lease</span></div></div></td>
                    <td><Pill s={c.status} /></td>
                    <td><div className="cell-progress"><Progress value={pct(c.raised, c.target)} tone={c.status === 'funded' ? 'done' : undefined} /><span className="tnum">{pct(c.raised, c.target)}%</span></div></td>
                    <td className="num tnum">{fmt(c.raised)}</td>
                    <td className="num tnum">{fmt(c.target)}</td>
                    <td className="num tnum">{c.backers}</td>
                    <td className="muted">{longDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

const MODELS = [
  { model: 'Ampersand Model 1 Pro', target: '2200000', photo_url: '/images/download.w-Ampersand2.webp' },
  { model: 'Spiro Ekon 450 M3', target: '1950000', photo_url: '/images/SPIRO EKON M3 1.png' },
  { model: 'Roam Air Gen-2 Urban', target: '2400000', photo_url: '/images/spiro-ekon-450m2-1400x933.webp' }
];
const EMPTY = { model: '', target: '', lease_months: DEFAULT_LEASE_MONTHS, photo_url: '' };

export function NewCampaign({ notify, onCreated }) {
  const [f, setF] = useState(EMPTY);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await api('/campaigns', { method: 'POST', body: f });
      notify('Campaign published.');
      setF(EMPTY);
      onCreated?.();
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  };

  const preview = { id: 'preview', model: f.model || 'Model name', photo_url: f.photo_url, target: Number(f.target) || 0, raised: 0, backers: 0, lease_months: Number(f.lease_months) || DEFAULT_LEASE_MONTHS, status: 'open' };

  return (
    <>
      <PageHead title="New campaign" sub="List an e-moto for investors to fund. It goes live as soon as you publish." />
      <div className="new-grid">
        <form className="panel form" onSubmit={submit}>
          <div>
            <div className="field-label">Start from a model</div>
            <div className="chips">
              {MODELS.map((p) => (
                <button key={p.model} type="button" className={'chip' + (f.model === p.model ? ' on' : '')} aria-pressed={f.model === p.model} onClick={() => setF({ ...f, ...p })}>
                  {p.model}
                </button>
              ))}
            </div>
          </div>
          <label>
            Model name
            <input required value={f.model} onChange={set('model')} placeholder="Ampersand Model 1 Pro" />
          </label>
          <div className="form-grid">
            <label>
              Funding target (RWF)
              <input required type="number" min={MIN_CAMPAIGN_TARGET} step="50000" value={f.target} onChange={set('target')} placeholder="2200000" />
            </label>
            <label>
              Lease length (months)
              <input required type="number" min={LEASE_MONTHS.min} max={LEASE_MONTHS.max} value={f.lease_months} onChange={set('lease_months')} />
            </label>
          </div>
          <label>
            Photo
            <input value={f.photo_url} onChange={set('photo_url')} placeholder="https://... or /images/..." />
            <span className="hint">An https link or a file in /images. Wide photos look best.</span>
          </label>
          {err && <div className="err" role="alert"><Icon n="alert" size={16} /> {err}</div>}
          <div className="form-actions">
            <button className="btn lg" disabled={busy}>{busy ? 'Publishing...' : 'Publish campaign'}</button>
          </div>
        </form>
        <div className="new-preview">
          <div className="field-label">Preview for investors</div>
          <motion.div initial="hidden" animate="show">
            <CampaignCard c={preview} action={() => <button className="btn block" type="button" disabled>Invest in this e-moto</button>} />
          </motion.div>
        </div>
      </div>
    </>
  );
}

export function AdminLogin() {
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    const { error } = await sb.auth.signInWithPassword({ email: f.email.trim(), password: f.password });
    if (error) {
      setErr('That email and password do not match an admin account.');
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-side">
        <img src="/images/motari-wordmark.png" alt="MOTARI" className="auth-logo" />
        <div>
          <h2>Operations console</h2>
          <p>Confirm pledges, verify riders and publish new e-motos.</p>
        </div>
        <img src="/images/motari.jpg" alt="" className="auth-photo" />
      </div>
      <div className="auth-main">
        <form className="auth-form" onSubmit={submit}>
          <h1>Admin sign in</h1>
          <p className="muted">Use the email and password your team set up for you.</p>
          <label>
            Email
            <input required type="email" autoComplete="username" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </label>
          <label>
            Password
            <input required type="password" autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
          </label>
          {err && <div className="err" role="alert"><Icon n="alert" size={16} /> {err}</div>}
          <button className="btn lg block" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
          <a href="/" className="auth-back">Back to motari.rw</a>
        </form>
      </div>
    </div>
  );
}
