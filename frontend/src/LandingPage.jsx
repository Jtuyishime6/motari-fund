import { useState } from 'react';
import { Icon, Pill, GoogleIcon, Skeletons } from './ui.jsx';
import Campaigns from './Campaigns.jsx';

export default function LandingPage({ profile, notify, onSignIn }) {
  const [activeTab, setActiveTab] = useState('all');

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
              Invest directly in Kigali's electric mobility infrastructure. Earn predictable returns while supporting sustainable transport for Africa's growing cities.
            </p>
            <div className="hero-cta-group">
              <button className="btn btn-primary btn-lg" onClick={onSignIn}>
                <GoogleIcon />
                <span>Start Investing Today</span>
              </button>
              <button className="btn ghost btn-lg" onClick={() => scrollTo('how-it-works')}>
                <span>How It Works</span>
                <Icon n="arrow-right" size={18} />
              </button>
            </div>

            {/* 3 Key Stats */}
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
              Kigali banned new petrol-powered motorcycles in 2025, but the transition to electric is moving too slowly.
            </p>
          </div>

          <div className="split-grid-2" style={{ alignItems: 'center' }}>
            <div className="media-frame">
              <img
                src="/images/motari.jpg"
                alt="Traffic pollution from petrol motorcycles in African city"
                className="rounded-img shadow-lg"
              />
              <div className="media-caption">
                <Icon n="info-circle" size={16} />
                <span>Over 50,000 petrol motos create heavy urban air & noise pollution across Kigali</span>
              </div>
            </div>

            <div className="challenge-cards">
              <div className="challenge-card">
                <div className="challenge-icon warn-icon">
                  <Icon n="danger-triangle" size={24} />
                </div>
                <div>
                  <h4>High Upfront Equipment Costs</h4>
                  <p className="muted small-text">
                    New electric motorcycles cost up to 2,500,000 RWF, making direct cash purchase impossible for everyday taxi riders without structured financing.
                  </p>
                </div>
              </div>

              <div className="challenge-card">
                <div className="challenge-icon err-icon">
                  <Icon n="card-2" size={24} />
                </div>
                <div>
                  <h4>Limited Commercial Lending</h4>
                  <p className="muted small-text">
                    Traditional banks classify moto-taxi drivers as high-risk, demanding collateral and charging prohibitive interest rates upwards of 28%.
                  </p>
                </div>
              </div>

              <div className="challenge-card">
                <div className="challenge-icon info-icon">
                  <Icon n="routing-2" size={24} />
                </div>
                <div>
                  <h4>Fragmented Transition</h4>
                  <p className="muted small-text">
                    Without community-pooled capital and automated telematics, the city risks falling behind its statutory clean-air and net-zero targets.
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
            <h2>Electric Motorbikes. Backed by People. Powered by Automation.</h2>
            <p className="section-sub">
              MOTARI connects everyday investors directly with vetted taxi operators through transparent lease-to-own agreements.
            </p>
          </div>

          <div className="split-grid-2" style={{ alignItems: 'center' }}>
            <div className="solution-features">
              <div className="solution-pill-item">
                <div className="solution-check">
                  <Icon n="check-circle" size={20} />
                </div>
                <div>
                  <strong>Electric Fleet</strong>
                  <p className="muted small-text">Growing fleet of high-efficiency SPIRO & Ampersand electric motorbikes.</p>
                </div>
              </div>

              <div className="solution-pill-item">
                <div className="solution-check">
                  <Icon n="check-circle" size={20} />
                </div>
                <div>
                  <strong>Democratized Micro-Investing</strong>
                  <p className="muted small-text">Anyone can invest from 10,000 RWF and co-own profitable clean transit assets.</p>
                </div>
              </div>

              <div className="solution-pill-item">
                <div className="solution-check">
                  <Icon n="check-circle" size={20} />
                </div>
                <div>
                  <strong>Smart Telematics & MoMo Automation</strong>
                  <p className="muted small-text">Automated daily mobile money collections, battery health telemetry, and GPS tracking.</p>
                </div>
              </div>

              <div className="solution-pill-item">
                <div className="solution-check">
                  <Icon n="check-circle" size={20} />
                </div>
                <div>
                  <strong>Scalable Urban Growth</strong>
                  <p className="muted small-text">Pool investments to scale city fleets without capital bottlenecks or debt load.</p>
                </div>
              </div>

              <div className="solution-highlights-box">
                <div className="highlight-bullet">
                  <Icon n="wallet-money" size={18} />
                  <span>Fixed weekly returns into your MoMo account</span>
                </div>
                <div className="highlight-bullet">
                  <Icon n="shield-check" size={18} />
                  <span>Zero operational headaches: MOTARI manages maintenance</span>
                </div>
                <div className="highlight-bullet">
                  <Icon n="chart-2" size={18} />
                  <span>Real-time transparent repayment tracking</span>
                </div>
              </div>
            </div>

            <div className="solution-image-container">
              <img
                src="/images/SPIRO EKON M3 1.png"
                alt="SPIRO EKON electric motorcycle"
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
            <h2>Real African Electric Motorcycles Powering Clean Mobility</h2>
            <p className="section-sub">
              Engineered for Rwandan terrain and heavy daily commercial taxi use.
            </p>
          </div>

          <div className="fleet-gallery-grid">
            <div className="fleet-item-card">
              <div className="fleet-img-box">
                <img src="/images/spiro-ekon-450m2-1400x933.webp" alt="Spiro Ekon in Kigali" />
                <span className="fleet-badge">SPIRO Commando</span>
              </div>
              <div className="fleet-desc">
                <h4>SPIRO Ekon Commando</h4>
                <p className="muted small-text">High-torque dual-battery pack, proven on Kigali hills with rapid swap network.</p>
              </div>
            </div>

            <div className="fleet-item-card">
              <div className="fleet-img-box">
                <img src="/images/download.w-Ampersand2.webp" alt="Ampersand Model 1" />
                <span className="fleet-badge">Ampersand Pro</span>
              </div>
              <div className="fleet-desc">
                <h4>Ampersand Model 1 Pro</h4>
                <p className="muted small-text">Pioneered in Rwanda with rugged frame, smart dashboard and 100 km real-world range.</p>
              </div>
            </div>

            <div className="fleet-item-card">
              <div className="fleet-img-box">
                <img src="/images/OIP (5).webp-Ampersand.webp" alt="Ampersand e-moto Kigali" />
                <span className="fleet-badge">Ampersand Commercial</span>
              </div>
              <div className="fleet-desc">
                <h4>Ampersand Fleet Series</h4>
                <p className="muted small-text">Optimized for cooperative moto-taxi operators with smart battery telemetry.</p>
              </div>
            </div>

            <div className="fleet-item-card">
              <div className="fleet-img-box">
                <img src="/images/motari 2.webp" alt="MOTARI electric fleet" />
                <span className="fleet-badge">Fleet Operations</span>
              </div>
              <div className="fleet-desc">
                <h4>Kigali Urban Fleet</h4>
                <p className="muted small-text">Deployed across Nyarugenge, Gasabo and Kicukiro sectors with full insurance.</p>
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
            <h2>Simple. Scalable. Inclusive.</h2>
            <p className="section-sub">
              A transparent four-step flywheel powering investors and drivers simultaneously.
            </p>
          </div>

          <div className="steps-cards-grid">
            <div className="step-card">
              <div className="step-number-tag">01</div>
              <div className="step-icon-wrap">
                <Icon n="wallet-2" size={28} />
              </div>
              <h4>Investor Buys</h4>
              <p className="muted small-text">
                You purchase or pledge a fractional share in an electric motorbike through our secure platform starting from 10,000 RWF.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number-tag">02</div>
              <div className="step-icon-wrap">
                <Icon n="document-text" size={28} />
              </div>
              <h4>Management Agreement</h4>
              <p className="muted small-text">
                We sign a management and lease-to-own contract pairing the motorcycle with a vetted, cooperative-endorsed taxi rider.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number-tag">03</div>
              <div className="step-icon-wrap">
                <Icon n="bolt" size={28} />
              </div>
              <h4>Deploy & Operate</h4>
              <p className="muted small-text">
                MOTARI deploys, operates, and maintains the e-moto with daily GPS tracking, scheduled maintenance and battery swapping.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number-tag">04</div>
              <div className="step-icon-wrap">
                <Icon n="money-bag" size={28} />
              </div>
              <h4>Earn Returns</h4>
              <p className="muted small-text">
                You receive regular weekly returns directly to your MTN or Airtel Mobile Money account throughout the 24-month lease term.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CURRENT TRACTION */}
      <section className="landing-section bg-primary-dark">
        <div className="wrap">
          <div className="section-header-center text-white">
            <span className="eyebrow text-accent-light">Current Traction</span>
            <h2 className="text-white">Real Results from Our Proven Model</h2>
            <p className="section-sub text-white-muted">
              Leading the green transition in Kigali with measurable economic and environmental impact.
            </p>
          </div>

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
          <div className="section-header-center">
            <span className="eyebrow">Active Micro-Investments</span>
            <h2>Available E-Motos for Funding</h2>
            <p className="section-sub">
              Choose an electric motorcycle below to pledge your share and start earning weekly returns.
            </p>
          </div>

          <Campaigns profile={profile} notify={notify} onSignIn={onSignIn} />
        </div>
      </section>

      {/* 8. BUILDING IMPACT */}
      <section id="impact" className="landing-section bg-alt">
        <div className="wrap">
          <div className="section-header-center">
            <span className="eyebrow">Building Impact</span>
            <h2>Creating a Cleaner, Fairer Future for African Cities</h2>
            <p className="section-sub">
              Every franc invested accelerates Kigali's carbon neutrality while empowering local drivers.
            </p>
          </div>

          <div className="impact-grid-4">
            <div className="impact-card">
              <div className="impact-icon-wrap" style={{ background: 'var(--ok-bg)', color: 'var(--ok)' }}>
                <Icon n="leaf" size={26} />
              </div>
              <h4>Reduced Emissions</h4>
              <p className="muted small-text">
                Eliminating up to 4.2 tonnes of CO₂ emissions annually per motorcycle compared to traditional petrol 150cc engines.
              </p>
            </div>

            <div className="impact-card">
              <div className="impact-icon-wrap" style={{ background: 'var(--mist)', color: 'var(--primary)' }}>
                <Icon n="users-group-two-rounded" size={26} />
              </div>
              <h4>Democratized Investment</h4>
              <p className="muted small-text">
                Enabling everyday citizens, students, and professionals to earn dividends from city infrastructure growth from 10,000 RWF.
              </p>
            </div>

            <div className="impact-card">
              <div className="impact-icon-wrap" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
                <Icon n="case" size={26} />
              </div>
              <h4>Dignified Job Creation</h4>
              <p className="muted small-text">
                Helping commercial moto drivers graduate from exploitative daily rentals into proud owners of clean, modern vehicles.
              </p>
            </div>

            <div className="impact-card">
              <div className="impact-icon-wrap" style={{ background: 'var(--warn-bg)', color: 'var(--warn)' }}>
                <Icon n="city" size={26} />
              </div>
              <h4>Livable Cities</h4>
              <p className="muted small-text">
                Drastically decreasing urban noise and street-level air particulate pollution across Kigali's thriving commercial corridors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. MEET THE TEAM */}
      <section id="team" className="landing-section">
        <div className="wrap">
          <div className="section-header-center">
            <span className="eyebrow">Meet the Team</span>
            <h2>Experienced Leadership Driving Clean Mobility Innovation</h2>
            <p className="section-sub">
              Passionate founders committed to Rwanda's vision of becoming Africa's green technology hub.
            </p>
          </div>

          <div className="team-container">
            <div className="team-card-profile">
              <div className="team-avatar-box">
                <img
                  src="/images/JD.jpeg"
                  alt="Jean de Dieu Tuyishime - MOTARI Founder & CEO"
                  className="team-avatar-img"
                />
              </div>
              <div className="team-profile-info">
                <h3>Jean de Dieu Tuyishime</h3>
                <span className="team-role-tag">Founder & CEO</span>
                <p className="muted small-text team-bio">
                  Entrepreneur and technologist dedicated to democratizing clean transport infrastructure in Rwanda. Spearheading automated fleet management and community micro-finance for electric moto-taxis in Kigali.
                </p>
                <div className="team-social-links">
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-pill" aria-label="LinkedIn">
                    <Icon n="link-circle" size={18} />
                    <span>LinkedIn</span>
                  </a>
                  <a href="https://github.com/Jtuyishime6" target="_blank" rel="noopener noreferrer" className="social-pill" aria-label="GitHub">
                    <Icon n="code-circle" size={18} />
                    <span>GitHub</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. READY TO GET STARTED CTA BANNER */}
      <section className="cta-banner gradient-cta">
        <div className="wrap">
          <div className="cta-box-center">
            <h2>Ready to Power Clean Transport in Kigali?</h2>
            <p>
              Join hundreds of micro-investors backing verified electric moto-taxi riders today. Start with as little as 10,000 RWF.
            </p>
            <div className="cta-btn-row">
              <button className="btn btn-primary btn-lg" onClick={onSignIn}>
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>
              <button className="btn ghost btn-lg" onClick={() => scrollTo('campaigns')}>
                <span>Browse Available E-Motos</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
