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
  const co2Kg = Math.round(cleanKm * 0.08);

  return (
    <div className="dashboard-view">
      <div className="section-head">
        <div>
          <h2>Investor Portfolio</h2>
          <p className="muted">Track your micro-investments, active e-motos and environmental impact.</p>
        </div>
        <button className="btn" onClick={goCampaigns}>
          <Icon n="add-circle" size={18} />
          <span>New Pledge</span>
        </button>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--mist)', color: 'var(--primary)' }}>
            <Icon n="wallet-2" size={24} />
          </div>
          <div className="stat-info">
            <span className="muted small-text">Total Invested (Confirmed)</span>
            <h3 className="stat-number">{rwf(total)}</h3>
            {pendingTotal > 0 && (
              <span className="pending-badge">+{rwf(pendingTotal)} pending review</span>
            )}
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--ok-bg)', color: 'var(--ok)' }}>
            <Icon n="bolt" size={24} />
          </div>
          <div className="stat-info">
            <span className="muted small-text">Active E-Motos Backed</span>
            <h3 className="stat-number">{distinctMotos} Vehicles</h3>
            <span className="eco-highlight">Leased to Kigali Riders</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
            <Icon n="leaf" size={24} />
          </div>
          <div className="stat-info">
            <span className="muted small-text">Green Impact Electrified</span>
            <h3 className="stat-number">{cleanKm.toLocaleString()} KM</h3>
            <span className="eco-highlight">~{co2Kg.toLocaleString()} kg CO2 displaced</span>
          </div>
        </div>
      </div>

      <div className="section" style={{ marginTop: 24 }}>
        <h3>Your Pledges History</h3>

        {!rows.length ? (
          <Empty
            icon="wallet-2"
            text="You have not pledged to any e-motos yet."
            action={
              <button className="btn" onClick={goCampaigns}>
                Browse Kigali E-Motos
              </button>
            }
          />
        ) : (
          <div className="list">
            {rows.map((r) => (
              <div className="item pledge-item" key={r.id}>
                <div className="row" style={{ gap: 14, alignItems: 'center' }}>
                  <div className="moto-mini-avatar">
                    <Icon n="bolt" size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0 }}>{r.campaigns?.model || 'E-Moto Campaign'}</h4>
                    <p className="muted small-text" style={{ marginTop: 2 }}>
                      Ref: <code className="ref-code">{r.momo_ref}</code> · {new Date(r.created_at).toLocaleDateString('en-RW', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="row" style={{ gap: 16, alignItems: 'center' }}>
                  <div className="text-right">
                    <strong style={{ fontSize: 17 }}>{rwf(r.amount)}</strong>
                  </div>
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
