import { useEffect, useState } from 'react';
import { api, rwf } from './lib.js';
import { Pill, Skeletons, Empty, Icon } from './ui.jsx';

export default function Investor({ goCampaigns }) {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    api('/pledges').then(setRows).catch(() => setRows([]));
  }, []);

  if (!rows) return <Skeletons n={2} />;

  const confirmedRows = rows.filter((r) => r.status === 'confirmed');
  const total = confirmedRows.reduce((s, r) => s + r.amount, 0);
  const pendingTotal = rows.filter((r) => r.status === 'pending').reduce((s, r) => s + r.amount, 0);
  const distinctMotos = new Set(confirmedRows.map((r) => r.campaign_id)).size;
  const cleanKm = Math.round(total / 80);

  return (
    <div className="dashboard-view">
      <div className="section-head">
        <div>
          <h2>Investor Portfolio</h2>
        </div>
        <button className="btn sm" onClick={goCampaigns}>
          <Icon n="add-circle" size={16} />
          <span>New Pledge</span>
        </button>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--mist)', color: 'var(--accent)' }}>
            <Icon n="wallet-2" size={22} />
          </div>
          <div className="stat-info">
            <span className="muted small-text">Total Invested</span>
            <h3 className="stat-number">{rwf(total)}</h3>
            {pendingTotal > 0 && (
              <span className="pending-badge">+{rwf(pendingTotal)} pending</span>
            )}
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--ok-bg)', color: 'var(--ok)' }}>
            <Icon n="bolt" size={22} />
          </div>
          <div className="stat-info">
            <span className="muted small-text">Active E-Motos</span>
            <h3 className="stat-number">{distinctMotos}</h3>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
            <Icon n="leaf" size={22} />
          </div>
          <div className="stat-info">
            <span className="muted small-text">Clean Impact</span>
            <h3 className="stat-number">{cleanKm.toLocaleString()} KM</h3>
          </div>
        </div>
      </div>

      <div className="section" style={{ marginTop: 24 }}>
        <h3>Pledges</h3>

        {!rows.length ? (
          <Empty
            icon="wallet-2"
            text="No pledges yet."
            action={
              <button className="btn sm" onClick={goCampaigns}>
                Browse E-Motos
              </button>
            }
          />
        ) : (
          <div className="list">
            {rows.map((r) => (
              <div className="item pledge-item" key={r.id}>
                <div className="row" style={{ gap: 12, alignItems: 'center' }}>
                  <div className="moto-mini-avatar">
                    <Icon n="bolt" size={18} />
                  </div>
                  <div>
                    <strong>{r.campaigns?.model || 'E-Moto'}</strong>
                    <p className="muted small-text">
                      Ref: <code className="ref-code">{r.momo_ref}</code> · {new Date(r.created_at).toLocaleDateString('en-RW', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="row" style={{ gap: 12, alignItems: 'center' }}>
                  <strong>{rwf(r.amount)}</strong>
                  <Pill s={r.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
