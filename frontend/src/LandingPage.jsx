import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Icon, GoogleIcon } from './ui.jsx';
import { api, rwf } from './lib.js';
import Campaigns from './Campaigns.jsx';
import { CountUp, Reveal, Stagger, Item, SplitText, motion, EASE } from './motion.jsx';

export const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const header = document.querySelector('.header')?.offsetHeight || 0;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - header, behavior: 'smooth' });
};

const STEPS = {
  investor: [
    ['login-3', 'Sign in with Google', 'Your investor account is ready in a minute.'],
    ['bolt', 'Back an e-moto', 'Pledge from 10,000 RWF with Mobile Money.'],
    ['chart-2', 'Earn from repayments', 'Follow every pledge and payout in your portfolio.']
  ],
  rider: [
    ['document-text', 'Fill in one form', 'Name, phone, permit and daily income. No account.'],
    ['phone-calling', 'We call to verify', 'Our team checks your permit and cooperative.'],
    ['key', 'Ride to ownership', 'Lease a funded e-moto. It is yours after 24 months.']
  ]
};

const FAQ = [
  ['How much do I need to start?', 'The minimum pledge is 10,000 RWF. You can back as many e-motos as you like.'],
  ['How do I pay?', 'Send your pledge with Mobile Money, then paste the transaction ID from your SMS. Our team confirms it and it appears in your portfolio.'],
  ['Who rides the e-motos?', 'Licensed moto-taxi riders who apply and are verified by our team, including their permit and cooperative.'],
  ['How do returns work?', 'Riders repay daily over a 24-month lease, and investor returns come from those repayments. Up to 65% is a projection, not a guarantee.'],
  ['What happens when a bike is fully funded?', 'The campaign closes and the e-moto goes to a verified rider. Your share stays in your portfolio.']
];

const AVG_BIKE = 2100000;
const RATE = 0.65;

function Calculator({ onSignIn }) {
  const [amount, setAmount] = useState(100000);
  const total = Math.round(amount * (1 + RATE));
  const monthly = Math.round((amount * (1 + RATE)) / 24);
  const share = ((amount / AVG_BIKE) * 100).toFixed(1);
  const pct = ((amount - 10000) / (1000000 - 10000)) * 100;

  return (
    <div className="calc">
      <div className="calc-input">
        <div className="calc-label">
          <span>If I pledge</span>
          <strong>{rwf(amount)}</strong>
        </div>
        <input
          type="range" min="10000" max="1000000" step="10000" value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          style={{ '--p': pct + '%' }} aria-label="Pledge amount"
        />
        <div className="calc-scale"><span>10,000</span><span>1,000,000</span></div>
        <div className="chips" style={{ marginTop: 16 }}>
          {[25000, 100000, 250000, 500000].map((a) => (
            <button key={a} type="button" className={'chip' + (amount === a ? ' on' : '')} onClick={() => setAmount(a)}>
              {new Intl.NumberFormat('en-US').format(a)}
            </button>
          ))}
        </div>
      </div>

      <div className="calc-out">
        <div className="calc-row big">
          <span>Projected back over 24 months</span>
          <motion.strong key={total} initial={{ opacity: 0.4, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            up to {rwf(total)}
          </motion.strong>
        </div>
        <div className="calc-row"><span>Average per month</span><strong>{rwf(monthly)}</strong></div>
        <div className="calc-row"><span>Your share of one e-moto</span><strong>{share}%</strong></div>
        <button className="btn on-dark lg block" onClick={onSignIn}><GoogleIcon /> Start investing</button>
        <p className="calc-note">Projection based on up to 65% over the lease. Returns depend on rider repayments and are not guaranteed.</p>
      </div>
    </div>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="faq">
      {FAQ.map(([q, a], i) => (
        <div className={'faq-item' + (open === i ? ' open' : '')} key={q}>
          <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
            <span>{q}</span>
            <motion.span animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: 0.2 }} className="faq-plus">
              <Icon n="add-circle" size={22} />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }} style={{ overflow: 'hidden' }}
              >
                <p className="faq-a">{a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export default function LandingPage({ notify, onSignIn, onApply }) {
  const [audience, setAudience] = useState('investor');
  const [stats, setStats] = useState(null);

  useEffect(() => { api('/stats').then(setStats).catch(() => setStats(null)); }, []);

  const millions = (stats?.raised || 0) / 1e6;

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <motion.span className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                E-moto financing in Kigali
              </motion.span>
              <h1><SplitText text="Fund the e-motos moving Kigali." accent={[3, 4]} /></h1>
              <Reveal delay={0.35}>
                <p className="hero-lead">
                  Invest from 10,000 RWF in electric motorcycles for verified riders. They lease to own. You earn from every repayment.
                </p>
              </Reveal>
              <Reveal delay={0.5}>
                <div className="hero-ctas">
                  <button className="btn lg" onClick={onSignIn}><GoogleIcon /> Start investing</button>
                  <button className="btn secondary lg" onClick={onApply}>Apply as a rider</button>
                </div>
              </Reveal>
            </div>

            <motion.div
              className="hero-media"
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
            >
              <img src="/images/motari.jpg" alt="A Kigali moto-taxi rider with an electric motorcycle" />
              <motion.div
                className="hero-badge"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
                transition={{ opacity: { delay: 0.8, duration: 0.5 }, x: { delay: 0.8, duration: 0.5 }, y: { delay: 1.4, duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
              >
                <div className="ic"><Icon n="leaf" size={22} /></div>
                <div>
                  <strong>100% electric fleet</strong>
                  <span className="tiny">Spiro, Ampersand and Roam</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          <Stagger className="facts">
            <Item className="fact">
              <div className="fact-num"><CountUp to={millions} decimals={2} suffix="M RWF" /></div>
              <div className="fact-lbl"><span className="live-dot" /> Raised on MOTARI</div>
            </Item>
            <Item className="fact">
              <div className="fact-num"><CountUp to={stats?.investors || 0} /></div>
              <div className="fact-lbl">Investors backing e-motos</div>
            </Item>
            <Item className="fact">
              <div className="fact-num"><CountUp to={stats?.campaigns || 0} /></div>
              <div className="fact-lbl">E-motos listed, {stats?.funded || 0} fully funded</div>
            </Item>
          </Stagger>
        </div>
      </section>

      {/* Why */}
      <section id="why" className="section soft">
        <div className="wrap">
          <div className="why-grid">
            <Reveal as="figure" className="why-media">
              <img src="/images/motari 2.webp" alt="Petrol motorcycles in heavy traffic" />
              <figcaption>50,000+ moto-taxis in Kigali, most still on petrol</figcaption>
            </Reveal>
            <div>
              <Reveal>
                <span className="eyebrow">Why MOTARI</span>
                <h2>Riders want electric. The upfront cost stops them.</h2>
              </Reveal>
              <Stagger className="why-list">
                {[
                  ['tag-price', 'E-motos cost up to 2.5M RWF', 'Too much for one rider to pay at once.'],
                  ['card-2', 'Banks ask for collateral', 'Most riders work informally and cannot get a loan.'],
                  ['users-group-rounded', 'MOTARI pools the capital', 'Investors fund the bike together. The rider repays daily and owns it.']
                ].map(([ic, t, d]) => (
                  <Item className="why-item" key={t}>
                    <div className="ic"><Icon n={ic} size={20} /></div>
                    <div><h4>{t}</h4><p>{d}</p></div>
                  </Item>
                ))}
              </Stagger>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="section">
        <div className="wrap">
          <Reveal className="section-head center">
            <span className="eyebrow">How it works</span>
            <h2>Simple for investors and riders</h2>
          </Reveal>

          <div className="seg-row">
            <div className="seg" role="tablist" aria-label="Choose your path">
              {[['investor', 'For investors'], ['rider', 'For riders']].map(([k, l]) => (
                <button key={k} role="tab" aria-selected={audience === k} className={audience === k ? 'on' : ''} onClick={() => setAudience(k)}>
                  {audience === k && <motion.span layoutId="seg-pill" className="seg-pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                  <span className="seg-txt">{l}</span>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={audience}
              className="steps"
              initial="hidden" animate="show" exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            >
              {STEPS[audience].map(([ic, title, text], i) => (
                <Item className="step" key={title}>
                  <div className="step-top">
                    <div className="step-ic"><Icon n={ic} size={22} /></div>
                    <span className="step-n">0{i + 1}</span>
                  </div>
                  <h4>{title}</h4>
                  <p>{text}</p>
                </Item>
              ))}
            </motion.div>
          </AnimatePresence>

          <div className="steps-cta">
            {audience === 'investor'
              ? <button className="btn lg" onClick={onSignIn}><GoogleIcon /> Sign in to invest</button>
              : <button className="btn lg" onClick={onApply}>Apply as a rider</button>}
          </div>
        </div>
      </section>

      {/* Returns */}
      <section id="returns" className="section returns">
        <div className="wrap">
          <Reveal className="section-head">
            <span className="eyebrow light">Returns</span>
            <h2>See what your pledge could earn</h2>
          </Reveal>
          <Reveal delay={0.1}><Calculator onSignIn={onSignIn} /></Reveal>
        </div>
      </section>

      {/* E-motos */}
      <section id="emotos" className="section soft">
        <div className="wrap">
          <Reveal className="section-head">
            <span className="eyebrow">Open for funding</span>
            <h2>Choose an e-moto to back</h2>
          </Reveal>
          <Campaigns profile={null} notify={notify} onSignIn={onSignIn} limit={6} animate />
        </div>
      </section>

      {/* Impact */}
      <section className="impact">
        <div className="wrap">
          <Stagger className="impact-grid">
            <Item>
              <div className="impact-num"><CountUp to={4.2} decimals={1} suffix=" t" /></div>
              <div className="impact-lbl">CO2 saved per e-moto each year</div>
            </Item>
            <Item>
              <div className="impact-num"><CountUp to={40} suffix="%" /></div>
              <div className="impact-lbl">Lower running cost than petrol</div>
            </Item>
            <Item>
              <div className="impact-num"><CountUp to={1.5} decimals={1} suffix="M+" /></div>
              <div className="impact-lbl">Moto trips in Kigali every day</div>
            </Item>
            <Item>
              <div className="impact-num"><CountUp from={85} to={0} suffix=" dB" duration={2} /></div>
              <div className="impact-lbl">Engine noise on city streets</div>
            </Item>
          </Stagger>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section">
        <div className="wrap faq-wrap">
          <Reveal className="section-head">
            <span className="eyebrow">FAQ</span>
            <h2>Questions investors ask</h2>
          </Reveal>
          <Reveal delay={0.1}><Faq /></Reveal>
        </div>
      </section>

      {/* Founder */}
      <section id="about" className="section soft">
        <div className="wrap">
          <Reveal className="founder">
            <img src="/images/JD.jpeg" alt="Jean de Dieu Tuyishime" />
            <div>
              <span className="eyebrow">Founder</span>
              <h3>Jean de Dieu Tuyishime</h3>
              <div className="role">Founder and CEO, MOTARI</div>
              <p className="bio">Building community-owned clean transport for Kigali, so every moto-taxi rider can afford an electric bike.</p>
              <div className="links">
                <a className="btn secondary sm" href="mailto:contact@motari.rw"><Icon n="letter" size={16} /> contact@motari.rw</a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="wrap">
          <Reveal className="cta-band">
            <div>
              <h2>Back your first e-moto today</h2>
              <p>From 10,000 RWF. Sign in with Google in one click.</p>
            </div>
            <div className="actions">
              <button className="btn on-dark lg" onClick={onSignIn}><GoogleIcon /> Start investing</button>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap footer-inner">
          <img src="/images/motari-wordmark.png" alt="MOTARI" />
          <span className="tiny">Kigali, Rwanda · <a href="mailto:contact@motari.rw">contact@motari.rw</a></span>
          <span className="tiny">
            <button className="link-btn" onClick={onApply}>Ride with MOTARI</button> · © {new Date().getFullYear()} MOTARI
          </span>
        </div>
      </footer>
    </>
  );
}
