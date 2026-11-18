import { useEffect, useState } from 'react';
import { api, rwf } from './lib.js';
import { Pill, Empty, Icon, PageHead } from './ui.jsx';
import { CountUp, Stagger, Item } from './motion.jsx';

const RATE = 0.65;

export default function Investor({ goCampaigns, name }) {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    api('/pledges').then(setRows).catch(() => setRows([]));
  }, []);

  const action = <button className="btn sm" onClick={goCampaigns}><Icon n="add-circle" size={16} /> Invest</button>;

  if (!rows) {
    return (
      <>
        <PageHead title={`Hi ${name}`} />
        <div className="stats">{[0, 1, 2].map((i) => <div className="stat" key={i}><div className="sk" style={{ height: 52 }} /></div>)}</div>
      </>
    );
  }

  const confirmed = rows.filter((r) => r.status === 'confirmed');
  const total = confirmed.reduce((s, r) => s + r.amount, 0);
  const pending = rows.filter((r) => r.status === 'pending').reduce((s, r) => s + r.amount, 0);
  const bikes = new Set(confirmed.map((r) => r.campaign_id)).size;

  if (!rows.length) {
    return (
      <>
        <PageHead title={`Hi ${name}`} />
        <div className="card">
          <Empty icon="bolt" text="Back your first e-moto from 10,000 RWF." action={<button className="btn" onClick={goCampaigns}>Browse e-motos</button>} />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead title={`Hi ${name}`} action={action} />

      <Stagger className="stats">
        <Item className="stat">
          <div className="stat-lbl"><Icon n="wallet-2" size={18} /> Invested</div>
          <div className="stat-val"><CountUp to={total} suffix=" RWF" duration={1.2} /></div>
          {pending > 0 && <div className="stat-sub">+{rwf(pending)} pending</div>}
        </Item>
        <Item className="stat">
          <div className="stat-lbl"><Icon n="chart-2" size={18} /> Projected return</div>
          <div className="stat-val"><CountUp to={Math.round(total * RATE)} prefix="+" suffix=" RWF" duration={1.2} /></div>
          <div className="stat-sub">Up to 65% over 24 months</div>
        </Item>
        <Item className="stat">
          <div className="stat-lbl"><Icon n="bolt" size={18} /> E-motos backed</div>
          <div className="stat-val"><CountUp to={bikes} duration={1.2} /></div>
        </Item>
      </Stagger>

      <div className="card">
        <div className="card-head"><h3>Pledges</h3></div>
        <div className="rows">
          {rows.map((r) => (
            <div className="row-item" key={r.id}>
              <div className="row-lead">
                <div className="thumb">{r.campaigns?.photo_url ? <img src={r.campaigns.photo_url} alt="" /> : <Icon n="bolt" />}</div>
                <div className="row-main">
                  <strong>{r.campaigns?.model || 'E-moto'}</strong>
                  <div className="tiny">{new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · <code className="ref">{r.momo_ref}</code></div>
                </div>
              </div>
              <div className="row-side">
                <strong>{rwf(r.amount)}</strong>
                <Pill s={r.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
