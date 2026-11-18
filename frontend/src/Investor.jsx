import { useEffect, useState } from 'react';
import { api, rwf } from './lib.js';
import { Pill, Skeletons, Empty } from './ui.jsx';
export default function Investor({ goCampaigns }) {
  const [rows, setRows] = useState(null);
  useEffect(() => { api('/pledges').then(setRows).catch(() => setRows([])); }, []);
  if (!rows) return <Skeletons n={2} />;
  const total = rows.filter((r) => r.status === 'confirmed').reduce((s, r) => s + r.amount, 0);
  return (
    <div>
      <div className="card" style={{ marginBottom: 24 }}><p className="muted">Total invested (confirmed)</p><h2>{rwf(total)}</h2></div>
      {!rows.length ? <Empty icon="wallet-2" text="You have not pledged yet." action={<button className="btn" onClick={goCampaigns}>Browse e-motos</button>} /> : (
        <div className="list">{rows.map((r) => (
          <div className="item" key={r.id}><div><strong>{r.campaigns?.model}</strong><p className="muted">{rwf(r.amount)} · Ref {r.momo_ref}</p></div><Pill s={r.status} /></div>
        ))}</div>
      )}
    </div>
  );
}
