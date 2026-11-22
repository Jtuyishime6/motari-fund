import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Icon, GoogleIcon } from './ui.jsx';
import { api, fmt, rwf } from './lib.js';
import { MIN_PLEDGE, DEFAULT_LEASE_MONTHS, projectReturn } from '../../shared/rules.js';
import Campaigns from './Campaigns.jsx';
import HeroDemo from './landing/HeroDemo.jsx';
import PortfolioPreview from './landing/PortfolioPreview.jsx';
import { CountUp, Reveal, Stagger, Item, Words, Marquee, ScrollTilt, ScrollRail, motion, EASE } from './motion.jsx';

export const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const header = document.querySelector('.header')?.offsetHeight || 0;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - header + 1, behavior: 'smooth' });
};

const FLEET = [
  ['/images/motari.jpg', 'Riders collecting new e-motos in Kigali'],
  ['/images/OIP (3).webp', 'Spiro Ekon in red'],
  ['/images/spiro-ekon-450m2-1400x933.webp', 'Spiro Ekon fleet before handover'],
  ['/images/OIP (2).webp', 'E-moto launch in Kigali'],
  ['/images/OIP (5).webp-Ampersand.webp', 'Ampersand battery swap station'],
  ['/images/OIP (4).webp', 'Riders on Spiro e-motos'],
  ['/images/OIP.webp', 'Spiro e-motos on display']
];

const STEPS = {
  investor: [
    ['login', 'Sign in with Google', 'One tap. Add your Mobile Money number so returns have somewhere to go.'],
    ['scooter', 'Pick an e-moto and pledge', `Back any open bike from ${fmt(MIN_PLEDGE)} RWF. Send it with MTN MoMo or Airtel Money and paste the transaction ID.`],
    ['shield', 'We verify the payment', 'Our team matches the ID against the SMS record. Confirmed pledges show up in your portfolio.'],
    ['trend', 'Earn as the rider repays', `When the bike is fully funded it goes to a verified rider, who repays daily over ${DEFAULT_LEASE_MONTHS} months.`]
  ],
  rider: [
    ['file', 'Fill in one short form', 'Name, phone, permit number and daily income. No account and no uploads.'],
    ['phone', 'We call you to verify', 'Our team checks your permit and cooperative membership over the phone.'],
    ['scooter', 'Collect your e-moto', 'When investors fully fund a bike, it is yours to ride and earn with.'],
    ['key', 'Own it outright', `Repay daily from your earnings. After ${DEFAULT_LEASE_MONTHS} months the bike is yours.`]
  ]
};

const FAQ = [
  ['How much do I need to start?', `The minimum pledge is ${fmt(MIN_PLEDGE)} RWF. You can back as many e-motos as you like, in any amount up to what a bike still needs.`],
  ['How do I pay?', 'Send your pledge with MTN MoMo or Airtel Money, then paste the transaction ID from your SMS. Our team confirms it against the payment record, and it appears in your portfolio.'],
  ['Who rides the e-motos?', 'Licensed moto-taxi riders who apply and pass our checks. We call every applicant and verify their driving permit and cooperative membership.'],
  ['How do returns work?', `Riders repay daily over a ${DEFAULT_LEASE_MONTHS} month lease, and investor returns come from those repayments. Up to 65% is a projection based on the lease terms, not a guarantee.`],
  ['What happens when a bike is fully funded?', 'The campaign closes, the e-moto is leased to a verified rider, and your share stays in your portfolio for the life of the lease.'],
];

function Calculator({ onSignIn }) {
  const [amount, setAmount] = useState(100000);
  const { total, profit, monthly } = projectReturn(amount);
  const fill = ((amount - MIN_PLEDGE) / (1000000 - MIN_PLEDGE)) * 100;

  return (
    <div className="calc">
      <div className="calc-input">
        <label className="calc-label" htmlFor="calc-range">If I pledge</label>
        <div className="calc-amount tnum">{fmt(amount)} <small>RWF</small></div>
        <input
          id="calc-range" type="range" min={MIN_PLEDGE} max="1000000" step="10000" value={amount}
          onChange={(e) => setAmount(Number(e.target.value))} style={{ '--p': fill + '%' }}
        />
        <div className="calc-scale"><span>10K</span><span>1M</span></div>
        <div className="chips">
          {[25000, 100000, 250000, 500000].map((a) => (
            <button key={a} type="button" className={'chip' + (amount === a ? ' on' : '')} onClick={() => setAmount(a)} aria-pressed={amount === a}>
              {fmt(a)}
            </button>
          ))}
        </div>
      </div>

      <div className="calc-out">
        <div className="calc-total">
          <span>Projected back over {DEFAULT_LEASE_MONTHS} months</span>
          <motion.strong key={total} className="tnum" initial={{ opacity: 0.3, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            up to {fmt(total)} RWF
          </motion.strong>
        </div>
        <dl className="calc-rows">
          <div><dt>Projected profit</dt><dd className="tnum">+{rwf(profit)}</dd></div>
          <div><dt>Average per month</dt><dd className="tnum">{rwf(monthly)}</dd></div>
          <div><dt>Share of a 2.1M RWF e-moto</dt><dd className="tnum">{((amount / 2100000) * 100).toFixed(1)}%</dd></div>
        </dl>
        <button className="btn sun lg block" onClick={onSignIn}><GoogleIcon /> Start investing</button>
        <p className="calc-note">Projection based on up to 65% over the lease. Returns depend on rider repayments and are not guaranteed.</p>
      </div>
    </div>
  );
}

function HowItWorks({ onSignIn, onApply }) {
  const [audience, setAudience] = useState('investor');
  const listRef = useRef(null);

  return (
    <section id="how" className="section">
      <div className="wrap how">
        <div className="how-intro">
          <Reveal>
            <h2>Four steps from your phone to a bike on the road</h2>
            <p className="lead">The same platform serves both sides of the lease, and every step is checked by a person.</p>
          </Reveal>
          <div className="seg" role="tablist" aria-label="Choose your path">
            {[['investor', 'I want to invest'], ['rider', 'I ride a moto']].map(([k, l]) => (
              <button key={k} role="tab" aria-selected={audience === k} className={audience === k ? 'on' : ''} onClick={() => setAudience(k)}>
                {audience === k && <motion.span layoutId="seg-pill" className="seg-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                <span className="seg-txt">{l}</span>
              </button>
            ))}
          </div>
          <div className="how-cta">
            {audience === 'investor'
              ? <button className="btn lg" onClick={onSignIn}><GoogleIcon /> Sign in to invest</button>
              : <button className="btn lg" onClick={onApply}>Apply as a rider</button>}
          </div>
        </div>

        <div className="timeline" ref={listRef}>
          <ScrollRail targetRef={listRef} />
          <AnimatePresence mode="wait">
            <motion.ol
              key={audience} className="timeline-list"
              initial="hidden" animate="show" exit={{ opacity: 0, transition: { duration: 0.15 } }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            >
              {STEPS[audience].map(([ic, title, text], i) => (
                <Item as="li" className="tl-step" key={title}>
                  <div className="tl-dot"><Icon n={ic} size={18} /></div>
                  <div>
                    <span className="tl-n">Step {i + 1}</span>
                    <h4>{title}</h4>
                    <p>{text}</p>
                  </div>
                </Item>
              ))}
            </motion.ol>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="faq">
      {FAQ.map(([q, a], i) => (
        <div className={'faq-item' + (open === i ? ' open' : '')} key={q}>
          <h3>
            <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} aria-controls={`faq-${i}`}>
              <span>{q}</span>
              <motion.span animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: 0.2 }} className="faq-plus"><Icon n="plus" size={18} /></motion.span>
            </button>
          </h3>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                id={`faq-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
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
  const [stats, setStats] = useState(null);
  useEffect(() => { api('/stats').then(setStats).catch(() => setStats(null)); }, []);

  return (
    <>
      {/* Hero: the one orchestrated moment on the page */}
      <section className="hero">
        <div className="hero-streets" aria-hidden="true" />
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <motion.a
              href="#emotos" className="hero-kicker" onClick={(e) => { e.preventDefault(); scrollToId('emotos'); }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}
            >
              <span className="kicker-dot" /> E-motos open for funding in Kigali <Icon n="chevronRight" size={14} />
            </motion.a>
            <h1><Words text="Own a share of Kigali's electric moto fleet." delay={0.1} /></h1>
            <motion.p className="hero-lead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.7 }}>
              Pool from {fmt(MIN_PLEDGE)} RWF with other investors to buy electric motorcycles for verified moto-taxi riders. They lease to own over {DEFAULT_LEASE_MONTHS} months, and you earn from every repayment.
            </motion.p>
            <motion.div className="hero-ctas" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.85, ease: EASE }}>
              <button className="btn sun lg" onClick={onSignIn}><GoogleIcon /> Start investing</button>
              <button className="btn outline-light lg" onClick={onApply}>Apply as a rider</button>
            </motion.div>
            <motion.ul className="hero-proof" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.1 }}>
              <li><Icon n="phoneMoney" size={16} /> Pay with MTN MoMo or Airtel Money</li>
              <li><Icon n="shield" size={16} /> Every payment and rider checked by our team</li>
            </motion.ul>
          </div>

          <motion.div className="hero-visual" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.3 }}>
            <HeroDemo />
          </motion.div>
        </div>

        <div className="wrap">
          <div className="ledger" aria-label="Live platform numbers">
            <div className="ledger-cell">
              <span className="ledger-k"><span className="live-dot" /> Raised on MOTARI</span>
              <span className="ledger-v"><CountUp to={(stats?.raised || 0) / 1e6} decimals={2} suffix="M" /> <small>RWF</small></span>
            </div>
            <div className="ledger-cell">
              <span className="ledger-k">Investors</span>
              <span className="ledger-v"><CountUp to={stats?.investors || 0} /></span>
            </div>
            <div className="ledger-cell">
              <span className="ledger-k">E-motos listed</span>
              <span className="ledger-v"><CountUp to={stats?.campaigns || 0} /></span>
            </div>
            <div className="ledger-cell">
              <span className="ledger-k">Fully funded</span>
              <span className="ledger-v"><CountUp to={stats?.funded || 0} /></span>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet photography */}
      <section className="fleet" aria-label="The fleet">
        <Marquee speed={55}>
          {FLEET.map(([src, alt]) => (
            <figure className="fleet-card" key={src}>
              <img src={src} alt={alt} loading="lazy" />
            </figure>
          ))}
        </Marquee>
        <p className="fleet-cap wrap">Bikes from Spiro, Ampersand and Roam, on the road in Kigali.</p>
      </section>

      {/* Problem */}
      <section id="why" className="section">
        <div className="wrap why">
          <Reveal className="why-head">
            <h2>Riders want electric. The upfront price stops them.</h2>
          </Reveal>
          <div className="why-grid">
            <Reveal as="figure" className="why-media">
              <img src="/images/motari 2.webp" alt="Petrol moto-taxis in heavy Kigali traffic" loading="lazy" />
              <figcaption>Around 30,000 moto-taxis work Kigali's streets, and most still burn petrol.</figcaption>
            </Reveal>
            <Stagger className="why-list">
              {[
                ['tag', 'Up to 2.5M RWF per e-moto', 'Too much for one rider to pay at once.'],
                ['bank', 'Banks ask for collateral', 'Most riders earn informally, so a loan is out of reach.'],
                ['users', 'MOTARI pools the capital', 'Investors fund each bike together. The rider repays daily, spends less on energy than on petrol, and ends up owning it.']
              ].map(([ic, t, d]) => (
                <Item className="why-item" key={t}>
                  <div className="why-ic"><Icon n={ic} size={20} /></div>
                  <div><h4>{t}</h4><p>{d}</p></div>
                </Item>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* Product */}
      <section className="section product">
        <div className="wrap">
          <Reveal className="section-head center">
            <h2>Every franc accounted for</h2>
            <p className="lead">Your portfolio shows what you pledged, what was confirmed, and how far each bike is from the road. Example portfolio shown.</p>
          </Reveal>
          <ScrollTilt><PortfolioPreview /></ScrollTilt>
        </div>
      </section>

      <HowItWorks onSignIn={onSignIn} onApply={onApply} />

      {/* Trust bento */}
      <section className="section soft">
        <div className="wrap">
          <Reveal className="section-head">
            <h2>Built so you can check our work</h2>
            <p className="lead">Small investors deserve the same controls as large ones.</p>
          </Reveal>
          <Stagger className="bento">
            <Item className="bento-cell b-momo">
              <div className="bento-ui receipt">
                <div className="receipt-row"><span className="demo-line" style={{ width: 90 }} /><strong className="tnum">100,000 RWF</strong></div>
                <div className="receipt-row"><span>Transaction ID</span><code>MP2611041298</code></div>
                <div className="receipt-match"><Icon n="checkCircle" size={16} /> Matched to MoMo record</div>
              </div>
              <h3>Payments matched by hand</h3>
              <p>Every pledge stays pending until our team matches its Mobile Money transaction ID. A reused ID is refused automatically.</p>
            </Item>
            <Item className="bento-cell b-riders">
              <div className="bento-ui queue">
                {['Permit checked', 'Cooperative confirmed', 'Phone interview'].map((t) => (
                  <div className="queue-row" key={t}><Icon n="check" size={14} /> {t}</div>
                ))}
              </div>
              <h3>Riders verified by phone</h3>
              <p>We call every applicant before they get a bike.</p>
            </Item>
            <Item className="bento-cell b-own">
              <div className="months" aria-hidden="true">
                {Array.from({ length: DEFAULT_LEASE_MONTHS }, (_, i) => <i key={i} className={i < 15 ? 'paid' : ''} />)}
              </div>
              <h3>Lease to own in {DEFAULT_LEASE_MONTHS} months</h3>
              <p>Riders build ownership with each daily payment instead of renting forever.</p>
            </Item>
            <Item className="bento-cell b-cap">
              <h3>Never over-funded</h3>
              <p>A pledge can never exceed what a bike still needs. When the target is hit, the campaign closes on its own.</p>
            </Item>
            <Item className="bento-cell b-green">
              <div className="green-stats">
                <div><strong className="tnum">~40%</strong><span>lower running cost than petrol</span></div>
                <div><strong className="tnum">0 g</strong><span>tailpipe emissions on the street</span></div>
              </div>
              <h3>Better for riders and the city</h3>
            </Item>
          </Stagger>
        </div>
      </section>

      {/* Returns */}
      <section id="returns" className="section returns">
        <div className="wrap">
          <Reveal className="section-head">
            <h2>See what a pledge could earn</h2>
            <p className="lead">Move the slider. Figures follow the published lease terms.</p>
          </Reveal>
          <Reveal delay={0.1}><Calculator onSignIn={onSignIn} /></Reveal>
        </div>
      </section>

      {/* Open campaigns */}
      <section id="emotos" className="section">
        <div className="wrap">
          <div className="section-head row">
            <Reveal>
              <h2>E-motos open for funding</h2>
              <p className="lead">Back one bike or several. Progress updates as payments are confirmed.</p>
            </Reveal>
          </div>
          <Campaigns profile={null} notify={notify} onSignIn={onSignIn} limit={6} />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section soft">
        <div className="wrap faq-wrap">
          <Reveal className="faq-head">
            <h2>Questions investors ask</h2>
            <p className="lead">Something else? Write to <a href="mailto:contact@motari.rw">contact@motari.rw</a> and the founder answers.</p>
          </Reveal>
          <Faq />
        </div>
      </section>

      {/* Founder */}
      <section id="about" className="section">
        <div className="wrap">
          <Reveal className="founder">
            <img src="/images/JD.jpeg" alt="Jean de Dieu Tuyishime, founder of MOTARI" loading="lazy" />
            <div>
              <blockquote>
                “We are building community-owned clean transport for Kigali, so every moto-taxi rider can afford an electric bike.”
              </blockquote>
              <div className="founder-name">Jean de Dieu Tuyishime</div>
              <div className="founder-role">Founder and CEO, MOTARI</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="wrap cta-inner">
          <Reveal>
            <h2>Put your first {fmt(MIN_PLEDGE)} RWF on the road.</h2>
            <p>Sign in with Google. It takes about a minute.</p>
          </Reveal>
          <div className="cta-actions">
            <button className="btn sun lg" onClick={onSignIn}><GoogleIcon /> Start investing</button>
            <button className="btn outline-light lg" onClick={onApply}>Apply as a rider</button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap footer-grid">
          <div className="footer-brand">
            <img src="/images/motari-wordmark.png" alt="MOTARI" />
            <p>Community financing for electric moto-taxis in Kigali, Rwanda.</p>
          </div>
          <nav aria-label="Footer">
            <h4>Platform</h4>
            <button className="link-btn" onClick={() => scrollToId('how')}>How it works</button>
            <button className="link-btn" onClick={() => scrollToId('emotos')}>Open e-motos</button>
            <button className="link-btn" onClick={() => scrollToId('returns')}>Returns</button>
          </nav>
          <nav aria-label="Riders">
            <h4>Riders</h4>
            <button className="link-btn" onClick={onApply}>Apply for an e-moto</button>
            <button className="link-btn" onClick={() => scrollToId('faq')}>FAQ</button>
          </nav>
          <div>
            <h4>Contact</h4>
            <a href="mailto:contact@motari.rw">contact@motari.rw</a>
            <span>Kigali, Rwanda</span>
          </div>
        </div>
        <div className="wrap footer-base">
          <span>© {new Date().getFullYear()} MOTARI</span>
          <span>Returns are projections, not guarantees. Capital is at risk.</span>
        </div>
      </footer>
    </>
  );
}
