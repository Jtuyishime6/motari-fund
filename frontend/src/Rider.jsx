import { useEffect, useState } from 'react';
import { api, rwf } from './lib.js';
import { Pill, Skeletons, Empty, Icon } from './ui.jsx';

export default function Rider({ notify }) {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ permit_number: '', years_experience: '3', cooperative: 'Inziza Taxi Moto Co-op', daily_income: '15000' });

  const load = () => api('/applications').then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await api('/applications', { method: 'POST', body: f });
      notify('Application sent.');
      await load();
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  };

  if (!rows) return <Skeletons n={1} />;
  const activeApp = rows.find((r) => r.status !== 'rejected');

  const steps = [
    { num: 1, title: 'Submitted' },
    { num: 2, title: 'Verification' },
    { num: 3, title: 'Allocation' },
    { num: 4, title: 'Active Lease' }
  ];

  const getStepIndex = (status) => {
    if (status === 'pending') return 1;
    if (status === 'approved') return 3;
    return 0;
  };

  return (
    <div className="dashboard-view" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="section-head">
        <div>
          <h2>Rider Portal</h2>
        </div>
      </div>

      {activeApp && (
        <div className="card status-tracker-card">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Application Status</h3>
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
                    {isDone ? <Icon n="check-circle" size={16} /> : st.num}
                  </div>
                  <span className="step-title">{st.title}</span>
                </div>
              );
            })}
          </div>

          <div className="app-summary-box">
            <div className="app-data-row">
              <span className="muted small-text">Permit:</span>
              <strong>{activeApp.permit_number}</strong>
            </div>
            <div className="app-data-row">
              <span className="muted small-text">Cooperative:</span>
              <strong>{activeApp.cooperative || 'N/A'}</strong>
            </div>
            <div className="app-data-row">
              <span className="muted small-text">Experience:</span>
              <strong>{activeApp.years_experience} Yrs</strong>
            </div>
            <div className="app-data-row">
              <span className="muted small-text">Daily Income:</span>
              <strong>{rwf(activeApp.daily_income)}</strong>
            </div>
          </div>
        </div>
      )}

      {rows.map((r) => (
        r.status === 'rejected' && (
          <div className="card err-card" key={r.id} style={{ marginBottom: 16 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <strong>Application Rejected</strong>
              <Pill s="rejected" />
            </div>
            {r.reason && <p style={{ marginTop: 8 }}><strong>Reason:</strong> {r.reason}</p>}
          </div>
        )
      ))}

      {!activeApp && (
        <form className="card" onSubmit={submit}>
          <h3>Apply for an E-Moto Lease</h3>
          <div className="form-grid">
            <label>
              Permit Number
              <input required value={f.permit_number} onChange={set('permit_number')} placeholder="RW-DL-2023-88371" />
            </label>

            <label>
              Years Riding
              <input required type="number" min="0" max="40" value={f.years_experience} onChange={set('years_experience')} />
            </label>

            <label>
              Cooperative
              <input value={f.cooperative} onChange={set('cooperative')} placeholder="Inziza Taxi Moto Co-op" />
            </label>

            <label>
              Daily Income (RWF)
              <input required type="number" min="1000" step="500" value={f.daily_income} onChange={set('daily_income')} />
            </label>
          </div>

          {err && <div className="err" role="alert">{err}</div>}

          <button className="btn btn-primary sm" style={{ marginTop: 8, alignSelf: 'flex-start' }} disabled={busy}>
            {busy ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      )}
    </div>
  );
}
