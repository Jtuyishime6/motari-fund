import { useState } from 'react';
import { Icon, Pill, GoogleIcon } from './ui.jsx';
import Campaigns from './Campaigns.jsx';

export default function LandingPage({ profile, notify, onSignIn }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="motari-landing">
      {/* 1. HERO SECTION */}
      <section className="hero-banner gradient-hero">
        <div className="hero-inner">
          <div className="hero-text-center">
            <h1 className="hero-main-title">
              Powering the Future of <br />
              <span className="text-accent">Clean Transport</span>
            </h1>
            <p className="hero-lead">
              Invest directly in Kigali's electric mobility. Earn returns from 10,000 RWF while funding clean moto-taxis.
            </p>
            <div className="hero-cta-group">
              <button className="btn btn-primary btn-lg" onClick={onSignIn}>
                <GoogleIcon />
                <span>Start Investing</span>
              </button>
              <button className="btn ghost btn-lg" onClick={() => scrollTo('how-it-works')}>
                <span>How It Works</span>
                <Icon n="arrow-right" size={18} />
              </button>
            </div>

            {/* 3 Stats */}
            <div className="hero-stat-cards">
              <div className="hero-stat-card">
                <span className="hero-stat-num">50,000+</span>
                <span className="hero-stat-label">Motorcycles in Kigali</span>
              </div>
              <div className="hero-stat-card">
                <span className="hero-stat-num">1.5M+</span>
                <span className="hero-stat-label">Daily Moto Trips</span>
              </div>
              <div className="hero-stat-card">
                <span className="hero-stat-num">Up to 65%</span>
                <span className="hero-stat-label">Return Over 2 Years</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE CHALLENGE */}
      <section id="problem" className="landing-section bg-alt">
        <div className="wrap">
          <div className="section-header-center">
            <span className="eyebrow">The Challenge</span>
            <h2>Urban Transport at a Crossroads</h2>
            <p className="section-sub">
              Kigali banned new petrol motorbikes in 2025, but individual riders face high upfront barriers.
            </p>
          </div>

          <div className="split-grid-2">
            <div className="media-frame">
              <img
                src="/images/motari.jpg"
                alt="Traffic in African city"
                className="rounded-img"
              />
            </div>

            <div className="challenge-cards">
              <div className="challenge-card">
                <div className="challenge-icon warn-icon">
                  <Icon n="danger-triangle" size={24} />
                </div>
                <div>
                  <h4>High Upfront Cost</h4>
                  <p className="muted small-text">
                    New electric bikes cost up to 2.5M RWF, out of reach for individual taxi drivers without financing.
                  </p>
                </div>
              </div>

              <div className="challenge-card">
                <div className="challenge-icon err-icon">
                  <Icon n="card-2" size={24} />
                </div>
                <div>
                  <h4>Limited Credit</h4>
                  <p className="muted small-text">
                    Commercial banks demand collateral that informal moto riders do not possess.
                  </p>
                </div>
              </div>

              <div className="challenge-card">
                <div className="challenge-icon info-icon">
                  <Icon n="routing-2" size={24} />
                </div>
                <div>
                  <h4>Slow Transition</h4>
                  <p className="muted small-text">
                    Without community capital, Kigali's clean air and 2030 net-zero targets stall.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR SOLUTION */}
      <section id="solution" className="landing-section">
        <div className="wrap">
          <div className="section-header-center">
            <span className="eyebrow">Our Solution</span>
            <h2>Electric Motorbikes. Backed by People.</h2>
            <p className="section-sub">
              We connect micro-investors directly with vetted riders through transparent lease-to-own agreements.
            </p>
          </div>

          <div className="split-grid-2">
            <div className="solution-features">
              <div className="solution-pill-item">
                <div className="solution-check"><Icon n="check-circle" size={20} /></div>
                <div>
                  <strong>Electric Fleet</strong>
                  <p className="muted small-text">Proven SPIRO and Ampersand bikes built for Rwandan roads.</p>
                </div>
              </div>

              <div className="solution-pill-item">
                <div className="solution-check"><Icon n="check-circle" size={20} /></div>
                <div>
                  <strong>Micro-Investments</strong>
                  <p className="muted small-text">Co-fund vehicles starting from 10,000 RWF.</p>
                </div>
              </div>

              <div className="solution-pill-item">
                <div className="solution-check"><Icon n="check-circle" size={20} /></div>
                <div>
                  <strong>Automated Telematics</strong>
                  <p className="muted small-text">Daily MoMo collections, GPS tracking, and battery health monitoring.</p>
                </div>
              </div>

              <div className="solution-highlights-box">
                <div className="highlight-bullet">
                  <Icon n="wallet-money" size={18} />
                  <span>Weekly payouts directly to Mobile Money</span>
                </div>
                <div className="highlight-bullet">
                  <Icon n="shield-check" size={18} />
                  <span>Maintenance managed by MOTARI team</span>
                </div>
              </div>
            </div>

            <div className="solution-image-container">
              <img
                src="/images/SPIRO EKON M3 1.png"
                alt="SPIRO EKON M3"
                className="solution-featured-moto"
              />
              <div className="moto-spec-card">
                <span className="spec-badge">Featured EV</span>
                <h4>SPIRO EKON M3</h4>
                <div className="spec-row">
                  <span>Range: <strong>90 km/swap</strong></span>
                  <span>Swap: <strong>&lt; 2 mins</strong></span>
                  <span>Savings: <strong>40% vs Petrol</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FLEET IN ACTION */}
      <section id="fleet" className="landing-section bg-alt">
        <div className="wrap">
          <div className="section-header-center">
            <span className="eyebrow">Fleet in Action</span>
            <h2>Proven Electric Bikes on Kigali Roads</h2>
          </div>

          <div className="fleet-gallery-grid">
            <div className="fleet-item-card">
              <div className="fleet-img-box">
                <img src="/images/spiro-ekon-450m2-1400x933.webp" alt="SPIRO Commando" />
                <span className="fleet-badge">SPIRO Commando</span>
              </div>
              <div className="fleet-desc">
                <h4>SPIRO Commando</h4>
                <p className="muted small-text">High-torque dual pack with rapid swap battery network.</p>
              </div>
            </div>

            <div className="fleet-item-card">
              <div className="fleet-img-box">
                <img src="/images/download.w-Ampersand2.webp" alt="Ampersand Model 1" />
                <span className="fleet-badge">Ampersand Pro</span>
              </div>
              <div className="fleet-desc">
                <h4>Ampersand Model 1 Pro</h4>
                <p className="muted small-text">Engineered in Rwanda with 100 km real-world range.</p>
              </div>
            </div>

            <div className="fleet-item-card">
              <div className="fleet-img-box">
                <img src="/images/motari 2.webp" alt="Kigali Fleet" />
                <span className="fleet-badge">Fleet Operations</span>
              </div>
              <div className="fleet-desc">
                <h4>Kigali Urban Fleet</h4>
                <p className="muted small-text">Full telemetry, regular servicing, and comprehensive coverage.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="landing-section">
        <div className="wrap">
          <div className="section-header-center">
            <span className="eyebrow">How It Works</span>
            <h2>Simple. Scalable. Transparent.</h2>
          </div>

          <div className="steps-cards-grid">
            <div className="step-card">
              <div className="step-number-tag">01</div>
              <div className="step-icon-wrap"><Icon n="wallet-2" size={24} /></div>
              <h4>Invest</h4>
              <p className="muted small-text">Pledge from 10,000 RWF via Mobile Money.</p>
            </div>

            <div className="step-card">
              <div className="step-number-tag">02</div>
              <div className="step-icon-wrap"><Icon n="document-text" size={24} /></div>
              <h4>Pair</h4>
              <p className="muted small-text">Matched with a vetted, cooperative-endorsed taxi rider.</p>
            </div>

            <div className="step-card">
              <div className="step-number-tag">03</div>
              <div className="step-icon-wrap"><Icon n="bolt" size={24} /></div>
              <h4>Deploy</h4>
              <p className="muted small-text">E-moto enters commercial taxi service with telemetry.</p>
            </div>

            <div className="step-card">
              <div className="step-number-tag">04</div>
              <div className="step-icon-wrap"><Icon n="money-bag" size={24} /></div>
              <h4>Earn</h4>
              <p className="muted small-text">Receive regular returns directly to your phone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRACTION */}
      <section className="landing-section bg-primary-dark">
        <div className="wrap">
          <div className="traction-grid">
            <div className="traction-item">
              <span className="traction-val">50,000+</span>
              <span className="traction-lbl">Motorcycles in Kigali</span>
            </div>
            <div className="traction-item">
              <span className="traction-val">60%</span>
              <span className="traction-lbl">Of All City Transport</span>
            </div>
            <div className="traction-item">
              <span className="traction-val">15,000 Rwf</span>
              <span className="traction-lbl">Weekly Returns</span>
            </div>
            <div className="traction-item">
              <span className="traction-val">Up to 65%</span>
              <span className="traction-lbl">Return Over 2 Years</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. LIVE CAMPAIGNS FOR FUNDING */}
      <section id="campaigns" className="landing-section">
        <div className="wrap">
          <Campaigns profile={profile} notify={notify} onSignIn={onSignIn} />
        </div>
      </section>

      {/* 8. IMPACT */}
      <section id="impact" className="landing-section bg-alt">
        <div className="wrap">
          <div className="section-header-center">
            <span className="eyebrow">Impact</span>
            <h2>Cleaner Cities, Better Incomes</h2>
          </div>

          <div className="impact-grid-4">
            <div className="impact-card">
              <div className="impact-icon-wrap" style={{ background: 'var(--ok-bg)', color: 'var(--ok)' }}>
                <Icon n="leaf" size={22} />
              </div>
              <h4>Zero Emissions</h4>
              <p className="muted small-text">4.2 tonnes of CO2 saved per vehicle each year.</p>
            </div>

            <div className="impact-card">
              <div className="impact-icon-wrap" style={{ background: 'var(--mist)', color: 'var(--accent)' }}>
                <Icon n="users-group-two-rounded" size={22} />
              </div>
              <h4>Community Wealth</h4>
              <p className="muted small-text">Accessible micro-yields for everyday citizens.</p>
            </div>

            <div className="impact-card">
              <div className="impact-icon-wrap" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
                <Icon n="case" size={22} />
              </div>
              <h4>Dignified Jobs</h4>
              <p className="muted small-text">Drivers build equity toward full moto ownership.</p>
            </div>

            <div className="impact-card">
              <div className="impact-icon-wrap" style={{ background: 'var(--warn-bg)', color: 'var(--warn)' }}>
                <Icon n="city" size={22} />
              </div>
              <h4>Quiet Streets</h4>
              <p className="muted small-text">Zero engine noise and cleaner city air.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. LEADERSHIP */}
      <section id="team" className="landing-section">
        <div className="wrap">
          <div className="team-container">
            <div className="team-card-profile">
              <div className="team-avatar-box">
                <img
                  src="/images/JD.jpeg"
                  alt="Jean de Dieu Tuyishime"
                  className="team-avatar-img"
                />
              </div>
              <h3>Jean de Dieu Tuyishime</h3>
              <span className="team-role-tag">Founder & CEO</span>
              <p className="muted small-text team-bio">
                Building clean transport infrastructure and automated fleet micro-finance in Kigali.
              </p>
              <div className="team-social-links">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-pill" aria-label="LinkedIn">
                  <Icon n="link-circle" size={16} />
                  <span>LinkedIn</span>
                </a>
                <a href="https://github.com/Jtuyishime6" target="_blank" rel="noopener noreferrer" className="social-pill" aria-label="GitHub">
                  <Icon n="code-circle" size={16} />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="footer">
        <div className="wrap footer-wrap">
          <div className="footer-col-main">
            <img src="/images/MOTARI Logo.png" alt="MOTARI Logo" className="footer-logo" />
            <p className="muted small-text" style={{ marginTop: 8 }}>
              Clean transport infrastructure for Kigali's electric moto-taxis.
            </p>
          </div>

          <div className="footer-col">
            <span className="footer-heading">Sections</span>
            <button type="button" className="footer-link" onClick={() => scrollTo('problem')}>Challenge</button>
            <button type="button" className="footer-link" onClick={() => scrollTo('solution')}>Solution</button>
            <button type="button" className="footer-link" onClick={() => scrollTo('how-it-works')}>How It Works</button>
            <button type="button" className="footer-link" onClick={() => scrollTo('campaigns')}>E-Motos</button>
          </div>

          <div className="footer-col">
            <span className="footer-heading">Impact</span>
            <button type="button" className="footer-link" onClick={() => scrollTo('fleet')}>Fleet</button>
            <button type="button" className="footer-link" onClick={() => scrollTo('impact')}>Emissions</button>
            <button type="button" className="footer-link" onClick={() => scrollTo('team')}>Team</button>
          </div>

          <div className="footer-col">
            <span className="footer-heading">Kigali</span>
            <p className="muted small-text">Gasabo, Kigali, Rwanda</p>
            <p className="muted small-text">contact@motari.rw</p>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="wrap row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="muted small-text">© {new Date().getFullYear()} MOTARI. All rights reserved.</p>
            <p className="muted small-text">Kigali Green Mobility</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
