import { useEffect } from 'react';
import { Icon as Iconify } from '@iconify/react';

export const Icon = ({ n, size = 20 }) => (
  <Iconify icon={`solar:${n}-linear`} width={size} height={size} aria-hidden="true" />
);

const LABELS = { open: 'Open', funded: 'Funded', pending: 'Pending', confirmed: 'Confirmed', rejected: 'Rejected', approved: 'Approved' };
export const Pill = ({ s }) => <span className={`pill ${s}`}>{LABELS[s] || s}</span>;

export const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.61z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.19l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H1.03v2.33C2.51 15.98 5.52 18 9 18z" />
    <path fill="#FBBC05" d="M3.97 10.7a5.4 5.4 0 0 1 0-3.4V4.97H1.03a9 9 0 0 0 0 8.06l2.94-2.33z" />
    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0 5.52 0 2.51 2.02 1.03 5.03l2.94 2.33c.71-2.13 2.69-3.78 5.03-3.78z" />
  </svg>
);

export const Skeletons = ({ n = 3 }) => (
  <div className="moto-grid" aria-busy="true" aria-label="Loading">
    {Array.from({ length: n }, (_, i) => (
      <div className="card" key={i}>
        <div className="sk" style={{ height: 160, marginBottom: 16 }} />
        <div className="sk" style={{ height: 16, width: '60%', marginBottom: 10 }} />
        <div className="sk" style={{ height: 12, width: '40%' }} />
      </div>
    ))}
  </div>
);

export const Empty = ({ icon, text, action }) => (
  <div className="empty">
    <div className="ic"><Icon n={icon} size={24} /></div>
    <p>{text}</p>
    {action}
  </div>
);

export const Modal = ({ title, onClose, children }) => {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  return (
    <div className="sheet" onClick={onClose}>
      <div className="dialog" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-head">
          <h3>{title}</h3>
          <button type="button" className="btn ghost icon-btn" onClick={onClose} aria-label="Close">
            <Icon n="close-circle" size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const PageHead = ({ title, sub, action }) => (
  <div className="page-head">
    <div>
      <h1>{title}</h1>
      {sub && <p>{sub}</p>}
    </div>
    {action}
  </div>
);
