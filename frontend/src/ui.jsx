import { Icon as Iconify } from '@iconify/react';
export const Icon = ({ n, size = 22 }) => <Iconify icon={`solar:${n}-linear`} width={size} height={size} aria-hidden="true" />;
export const Pill = ({ s }) => <span className={`pill ${s}`}>{s[0].toUpperCase() + s.slice(1)}</span>;
export const Skeletons = ({ n = 3 }) => (
  <div className="grid" aria-busy="true" aria-label="Loading">
    {Array.from({ length: n }, (_, i) => (
      <div className="card" key={i}><div className="sk" style={{ width: '60%' }} /><div className="sk" /><div className="sk" style={{ width: '40%' }} /></div>
    ))}
  </div>
);
export const Empty = ({ icon, text, action }) => (
  <div className="empty"><div className="badge"><Icon n={icon} /></div><p>{text}</p>{action}</div>
);
export const Modal = ({ title, onClose, children }) => (
  <div className="sheet" onClick={onClose}>
    <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}><h3>{title}</h3>{children}</div>
  </div>
);
