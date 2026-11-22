import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from './icons.jsx';

export { Icon };

const LABELS = { open: 'Open', funded: 'Funded', pending: 'Pending', confirmed: 'Confirmed', rejected: 'Rejected', approved: 'Approved' };
export const Pill = ({ s, children }) => <span className={`pill ${s}`}><i aria-hidden="true" />{children || LABELS[s] || s}</span>;

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
      <div className="moto" key={i}>
        <div className="sk" style={{ aspectRatio: '3 / 2', borderRadius: 0 }} />
        <div style={{ padding: 20 }}>
          <div className="sk" style={{ height: 18, width: '60%', marginBottom: 14 }} />
          <div className="sk" style={{ height: 8, marginBottom: 14 }} />
          <div className="sk" style={{ height: 12, width: '40%' }} />
        </div>
      </div>
    ))}
  </div>
);

export const Empty = ({ icon, title, text, action }) => (
  <div className="empty">
    <div className="empty-ic"><Icon n={icon} size={22} /></div>
    {title && <h4>{title}</h4>}
    <p>{text}</p>
    {action}
  </div>
);

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select, textarea, [tabindex]:not([tabindex="-1"])';

/** Accessible dialog: traps focus, closes on Escape or backdrop, and returns focus to the opener. */
export function Modal({ title, sub, onClose, children, wide }) {
  const ref = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const opener = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const first = ref.current?.querySelector('[autofocus], input, select, textarea') || ref.current?.querySelector(FOCUSABLE);
    first?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') close.current();
      if (e.key !== 'Tab' || !ref.current) return;
      const els = [...ref.current.querySelectorAll(FOCUSABLE)];
      if (!els.length) return;
      const [a, z] = [els[0], els[els.length - 1]];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      opener?.focus?.();
    };
  }, []);

  return (
    <motion.div className="sheet" onMouseDown={(e) => e.target === e.currentTarget && onClose()} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}>
      <motion.div
        ref={ref} className={'dialog' + (wide ? ' wide' : '')} role="dialog" aria-modal="true" aria-labelledby="dialog-title"
        initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="dialog-head">
          <div>
            <h3 id="dialog-title">{title}</h3>
            {sub && <p className="dialog-sub">{sub}</p>}
          </div>
          <button type="button" className="btn ghost icon-btn" onClick={onClose} aria-label="Close">
            <Icon n="x" size={20} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

export const PageHead = ({ title, sub, action }) => (
  <div className="page-head">
    <div>
      <h1>{title}</h1>
      {sub && <p>{sub}</p>}
    </div>
    {action && <div className="page-actions">{action}</div>}
  </div>
);

export function Toast({ message }) {
  return (
    <div className="toast-region" aria-live="polite">
      <AnimatePresence>
        {message && (
          <motion.div
            key={message} className="toast" role="status"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.22 }}
          >
            <Icon n="checkCircle" size={18} /> {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Progress({ value, tone }) {
  return (
    <div className={'bar' + (tone ? ' ' + tone : '')} role="progressbar" aria-valuenow={value} aria-valuemin="0" aria-valuemax="100" aria-label={`${value}% funded`}>
      <motion.i initial={{ width: 0 }} whileInView={{ width: value + '%' }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
    </div>
  );
}
