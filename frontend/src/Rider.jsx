import { useEffect, useState } from 'react';
import { api, rwf } from './lib.js';
import { Pill, Skeletons, Empty, Icon } from './ui.jsx';

export default function Rider({ notify }) {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ permit_number: '', years_experience: '3', cooperative: 'Inziza Taxi Moto Cooperative', daily_income: '15000' });

  const load = () => api('/applications').then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await api('/applications', { method: 'POST', body: f });
      notify('Lease application submitted successfully.');
      await load();
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  };

  if (!rows) return <Skeletons n={1} />;
  const activeApp = rows.find((r) => r.status !== 'rejected');

  const steps = [
    { num: 1, title: 'Submitted', desc: 'Application received' },
    { num: 2, title: 'Verification', desc: 'Permit & Cooperative check' },
    { num: 3, title: 'Allocation', desc: 'E-Moto assignment' },
    { num: 4, title: 'Active Lease', desc: 'Road-ready with daily tracking' }
  ];

  const getStepIndex = (status) => {
    if (status === 'pending') return 1; // Step 1 done, 2 in progress
    if (status === 'approved') return 3; // Step 3/4 done
    return 0;
  };

  return (
    <div className="dashboard-view" style={{ maxWidth: 760, margin: '0 auto' }}>
      <div className="section-head">
        <div>
          <h2>Rider Lease Portal</h2>
          <p className="muted">Lease a brand-new electric moto-taxi with daily income-based repayments.</p>
        </div>
      </div>

      {activeApp && (
        <div className="card status-tracker-card">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="row" style={{ gap: 10, alignItems: 'center' }}>
              <span className="brand-logo sm"><Icon n="document-text" size={18} /></span>
              <h3 style={{ margin: 0 }}>Lease Application Progress</h3>
            </div>
            <Pill s={activeApp.status} />
          </div>

          <div className="tracker-steps">
            {steps.map((st, idx) => {
              const currentStep = getStepIndex(activeApp.status);
              const isDone = idx < currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div key={st.num} className={'step-item' + (isDone ? ' done' : '') + (isCurrent ? ' active' : '')}>
                  <div className="step-circle">
                    {isDone ? <Icon n="check-circle" size={18} /> : st.num}
                  </div>
                  <div className="step-content">
                    <span className="step-title">{st.title}</span>
                    <span className="step-desc muted small-text">{st.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="app-summary-box">
            <div className="app-data-row">
              <span className="muted small-text">Permit Number:</span>
              <strong>{activeApp.permit_number}</strong>
            </div>
            <div className="app-data-row">
              <span className="muted small-text">Cooperative:</span>
              <strong>{activeApp.cooperative || 'Independent'}</strong>
            </div>
            <div className="app-data-row">
              <span className="muted small-text">Experience:</span>
              <strong>{activeApp.years_experience} Years</strong>
            </div>
            <div className="app-data-row">
              <span className="muted small-text">Expected Daily Income:</span>
              <strong>{rwf(activeApp.daily_income)}</strong>
            </div>
          </div>
        </div>
      )}

      {rows.map((r) => (
        r.status === 'rejected' && (
          <div className="card err-card" key={r.id} style={{ marginBottom: 16 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div className="row" style={{ gap: 8, color: 'var(--err)' }}>
                <Icon n="danger-triangle" size={20} />
                <strong>Application Status: Rejected</strong>
              </div>
              <Pill s="rejected" />
            </div>
            {r.reason && <p style={{ marginTop: 8 }}><strong>Reason provided:</strong> {r.reason}</p>}
          </div>
        )
      ))}

      {!activeApp && (
        <div className="card form-card">
          <div className="form-head">
            <h3>Apply for an Electric Moto Lease</h3>
            <p className="muted small-text">
              Zero upfront vehicle cost. Verified riders receive an e-moto with battery swapping in Kigali.
            </p>
          </div>

          <form onSubmit={submit}>
            <div className="form-grid">
              <label>
                Rwandan Driving Permit Number (Category A)
                <input
                  required
                  value={f.permit_number}
                  onChange={set('permit_number')}
                  placeholder="e.g. RW-DL-2023-88371"
                />
              </label>

              <label>
                Years of Riding Experience
                <input
                  required
                  type="number"
                  min="0"
                  max="40"
                  value={f.years_experience}
                  onChange={set('years_experience')}
                  placeholder="3"
                />
              </label>

              <label>
                Cooperative / Station Name
                <input
                  value={f.cooperative}
                  onChange={set('cooperative')}
                  placeholder="e.g. Inziza Taxi Moto Co-op"
                />
              </label>

              <label>
                Average Daily Income (RWF)
                <input
                  required
                  type="number"
                  min="1000"
                  step="500"
                  value={f.daily_income}
                  onChange={set('daily_income')}
                  placeholder="15000"
                />
              </label>
            </div>

            {err && <div className="err" role="alert">{err}</div>}

            <button className="btn btn-primary" style={{ marginTop: 12 }} disabled={busy}>
              {busy ? 'Submitting Application...' : 'Submit Lease Application'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
