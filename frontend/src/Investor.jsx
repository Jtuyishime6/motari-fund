import { useEffect, useMemo, useState } from 'react';
import { api, rwf, fmt, longDate, pct } from './lib.js';
import { PROJECTED_RETURN, DEFAULT_LEASE_MONTHS, MIN_PLEDGE } from '../../shared/rules.js';
import { Pill, Empty, Icon, PageHead, Progress } from './ui.jsx';
import { CountUp, Stagger, Item } from './motion.jsx';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export default function Investor({ goCampaigns, name }) {
  const [rows, setRows] = useState(null);
  const [failed, setFailed] = useState(false);
  const load = () => api('/pledges').then((d) => { setRows(d); setFailed(false); }).catch(() => setFailed(true));
  useEffect(() => { load(); }, []);

  const m = useMemo(() => {
    if (!rows) return null;
    const confirmed = rows.filter((r) => r.status === 'confirmed');
    const total = confirmed.reduce((s, r) => s + r.amount, 0);
    const pendingRows = rows.filter((r) => r.status === 'pending');
    const byBike = new Map();
    for (const r of confirmed) {
      const b = byBike.get(r.campaign_id) || { id: r.campaign_id, c: r.campaigns || {}, amount: 0 };
      b.amount += r.amount;
      byBike.set(r.campaign_id, b);
    }
    return { total, pending: pendingRows.reduce((s, r) => s + r.amount, 0), pendingN: pendingRows.length, holdings: [...byBike.values()] };
  }, [rows]);

  const title = `${greeting()}, ${name}`;
  const action = <button className="btn sm" onClick={goCampaigns}><Icon n="plus" size={16} /> Invest</button>;

  if (failed) return <><PageHead title={title} /><div className="panel"><Empty icon="alert" title="Could not load your portfolio" text="Check your connection and try again." action={<button className="btn secondary" onClick={load}>Try again</button>} /></div></>;

  if (!m) {
    return (
      <>
        <PageHead title={title} />
        <div className="kpis three">{[0, 1, 2].map((i) => <div className="kpi" key={i}><div className="sk" style={{ height: 76 }} /></div>)}</div>
      </>
    );
  }

  if (!rows.length) {
    return (
      <>
        <PageHead title={title} sub="Your portfolio will show every pledge and how close each bike is to the road." />
        <div className="panel welcome">
          <div className="welcome-copy">
            <h2>Back your first e-moto</h2>
            <p>Pick a bike, send from {fmt(MIN_PLEDGE)} RWF with Mobile Money, and paste the transaction ID. We confirm it, and it appears here.</p>
            <button className="btn lg" onClick={goCampaigns}>Browse e-motos</button>
          </div>
          <img src="/images/spiro-ekon-450m2-1400x933.webp" alt="" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead title={title} sub="Your pledges and the bikes they are funding." action={action} />

      {m.pendingN > 0 && (
        <div className="notice"><Icon n="clock" size={18} /> {m.pendingN} {m.pendingN === 1 ? 'pledge' : 'pledges'} worth {rwf(m.pending)} waiting for our team to match the payment.</div>
      )}

      <Stagger className="kpis three">
        <Item className="kpi">
          <div className="kpi-top"><span className="kpi-ic"><Icon n="wallet" size={16} /></span>Invested</div>
          <div className="kpi-val"><CountUp to={m.total} duration={1} /> <small>RWF</small></div>
          <div className="kpi-sub">Confirmed pledges</div>
        </Item>
        <Item className="kpi">
          <div className="kpi-top"><span className="kpi-ic"><Icon n="trend" size={16} /></span>Projected return</div>
          <div className="kpi-val up"><CountUp to={Math.round(m.total * PROJECTED_RETURN)} prefix="+" duration={1} /> <small>RWF</small></div>
          <div className="kpi-sub">Up to {Math.round(PROJECTED_RETURN * 100)}% over {DEFAULT_LEASE_MONTHS} months, not guaranteed</div>
        </Item>
        <Item className="kpi">
          <div className="kpi-top"><span className="kpi-ic"><Icon n="scooter" size={16} /></span>E-motos backed</div>
          <div className="kpi-val"><CountUp to={m.holdings.length} duration={1} /></div>
          <div className="kpi-sub">{m.holdings.filter((h) => h.c.status === 'funded').length} fully funded</div>
        </Item>
      </Stagger>

      {m.holdings.length > 0 && (
        <section className="panel">
          <div className="panel-head"><div><h2>Your e-motos</h2><p>Your confirmed share of each bike</p></div></div>
          <div className="holdings">
            {m.holdings.map((h) => (
              <div className="holding" key={h.id}>
                {h.c.photo_url ? <img src={h.c.photo_url} alt="" /> : <span className="thumb-ph lg"><Icon n="scooter" size={22} /></span>}
                <div className="holding-main">
                  <div className="holding-top">
                    <strong>{h.c.model || 'E-moto'}</strong>
                    <Pill s={h.c.status === 'funded' ? 'funded' : 'open'}>{h.c.status === 'funded' ? 'Funded' : 'Raising'}</Pill>
                  </div>
                  <div className="holding-figs">
                    <span>You put in <strong className="tnum">{rwf(h.amount)}</strong></span>
                    {h.c.target ? <span className="tnum">{pct(h.amount, h.c.target)}% of the bike</span> : null}
                  </div>
                  {h.c.target ? <Progress value={pct(h.amount, h.c.target)} /> : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="panel flush">
        <div className="panel-head pad"><div><h2>Pledge history</h2><p>Every pledge you sent, newest first</p></div></div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>E-moto</th><th>Date</th><th>Transaction ID</th><th className="num">Amount</th><th>Status</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><div className="cell-person">{r.campaigns?.photo_url ? <img src={r.campaigns.photo_url} alt="" className="thumb" /> : <span className="thumb-ph"><Icon n="scooter" size={16} /></span>}<strong>{r.campaigns?.model || 'E-moto'}</strong></div></td>
                  <td className="muted">{longDate(r.created_at)}</td>
                  <td><code className="ref">{r.momo_ref}</code></td>
                  <td className="num tnum"><strong>{fmt(r.amount)}</strong></td>
                  <td><Pill s={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
