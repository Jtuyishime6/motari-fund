import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Icon } from '../icons.jsx';
import { EASE } from '../motion.jsx';
import { fmt } from '../lib.js';

// One funding round, told in beats. Each pledge is the cause; the bar and total move because of it.
const TARGET = 1850000;
const START = 1460000;
const PLEDGES = [
  { who: 'Diane M.', amount: 100000, via: 'MTN MoMo' },
  { who: 'Eric N.', amount: 150000, via: 'Airtel Money' },
  { who: 'Grace I.', amount: 140000, via: 'MTN MoMo' }
];
const BEAT_MS = 1700;

function RollingNumber({ value }) {
  // Only digits that change roll, like an odometer.
  const chars = fmt(value).split('');
  return (
    <span className="roll tnum" aria-label={fmt(value)}>
      {chars.map((c, i) => (
        <span className="roll-slot" key={chars.length - i} aria-hidden="true">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={c + '-' + i}
              initial={{ y: '-100%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              {c}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

export default function HeroDemo() {
  const reduce = useReducedMotion();
  // step 0: waiting, 1..3: pledges landed, 4: funded and assigned, 5: hold before reset
  const [step, setStep] = useState(reduce ? 4 : 0);

  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % 6), step === 0 ? 1200 : step === 5 ? 550 : step === 4 ? BEAT_MS * 1.8 : BEAT_MS);
    return () => clearTimeout(t);
  }, [step, reduce]);

  const landed = PLEDGES.slice(0, Math.min(step, 3));
  const raised = START + landed.reduce((s, p) => s + p.amount, 0);
  const pctDone = Math.round((raised / TARGET) * 100);
  const funded = step >= 4;
  const resetting = step === 5;

  return (
    <div className="demo" aria-label="Example: an e-moto getting fully funded by three investors">
      <div className="demo-window">
        <div className="demo-chrome">
          <span /><span /><span />
          <div className="demo-url">motari.rw/emotos</div>
        </div>

        <motion.div className="demo-body" animate={{ opacity: resetting ? 0.0 : 1 }} transition={{ duration: 0.5 }}>
          <div className="demo-bike">
            <img src="/images/spiro-ekon-450m2-1400x933.webp" alt="" />
            <div className="demo-bike-meta">
              <div>
                <strong>Spiro Ekon 450</strong>
                <span className="demo-line" style={{ width: 92 }} />
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={funded ? 'f' : 'o'} className={'pill ' + (funded ? 'funded' : 'open')}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.25 }}
                >
                  <i />{funded ? 'Funded' : 'Open'}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <div className="demo-money">
            <div>
              <div className="demo-label">Raised</div>
              <div className="demo-raised"><RollingNumber value={raised} /> <small>RWF</small></div>
            </div>
            <div className="demo-pct tnum">{pctDone}%</div>
          </div>
          <div className={'bar lg' + (funded ? ' done' : '')}>
            <motion.i animate={{ width: pctDone + '%' }} transition={{ duration: 0.8, ease: EASE, delay: 0.25 }} />
          </div>
          <div className="demo-target"><span>Target {fmt(TARGET)} RWF</span><span>24 month lease</span></div>

          <div className="demo-feed">
            <AnimatePresence initial={false}>
              {[...landed].reverse().map((p) => (
                <motion.div
                  layout key={p.who} className="demo-pledge"
                  initial={{ opacity: 0, y: -14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <span className="demo-avatar">{p.who[0]}</span>
                  <div className="demo-pledge-txt">
                    <strong>{p.who}</strong>
                    <span>{p.via}</span>
                  </div>
                  <span className="demo-amt tnum">+{fmt(p.amount)}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {!landed.length && (
              <div className="demo-wait"><span className="demo-line" style={{ width: '70%' }} /><span className="demo-line" style={{ width: '45%' }} /></div>
            )}
          </div>

          <AnimatePresence>
            {funded && (
              <motion.div
                className="demo-assigned" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.3 }}
              >
                <Icon n="key" size={16} /> Leased to a verified rider in Kicukiro
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
