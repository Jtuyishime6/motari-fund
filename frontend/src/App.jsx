import { useEffect, useState } from 'react';
import { sb, api } from './lib.js';
import { Icon, Skeletons, GoogleIcon, Pill } from './ui.jsx';
import Onboarding from './Onboarding.jsx';
import Campaigns from './Campaigns.jsx';
import Investor from './Investor.jsx';
import Rider from './Rider.jsx';
import { Review, NewCampaign } from './Admin.jsx';

const signIn = () => sb.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: window.location.origin }
});

export default function App() {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('campaigns');
  const [toast, setToast] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'auto');
  const [demoRole, setDemoRole] = useState(null);

  useEffect(() => {
    const dark = theme === 'dark' || (theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      api('/me')
        .then((p) => {
          setProfile(p);
          if (!demoRole) setDemoRole(p.role);
        })
        .catch(() => setProfile(null));
    } else {
      setProfile(null);
      setDemoRole(null);
    }
  }, [session]);

  const notify = (m) => {
    setToast(m);
    setTimeout(() => setToast(''), 3500);
  };

  const activeRole = demoRole || profile?.role;

  const tabs = [['campaigns', 'E-motos', 'bolt']];
  if (activeRole === 'investor' || activeRole === 'admin') {
    tabs.push(['pledges', 'My portfolio', 'wallet-2']);
  }
  if (activeRole === 'rider' || activeRole === 'admin') {
    tabs.push(['rider', 'Rider lease', 'document-text']);
  }
  if (activeRole === 'admin') {
    tabs.push(['review', 'Admin review', 'shield-check'], ['new', 'New campaign', 'add-circle']);
  }

  let body;
  if (session === undefined || (session && !profile)) {
    body = <Skeletons />;
  } else if (session && !profile.role) {
    body = <Onboarding profile={profile} onDone={setProfile} />;
  } else if (view === 'pledges') {
    body = <Investor goCampaigns={() => setView('campaigns')} />;
  } else if (view === 'rider') {
    body = <Rider notify={notify} />;
  } else if (view === 'review') {
    body = <Review notify={notify} />;
  } else if (view === 'new') {
    body = <NewCampaign notify={notify} />;
  } else {
    body = (
      <>
        {!session && (
          <section className="hero-section">
            <div className="hero-content">
              <div className="hero-badge">
                <span className="dot" />
                <span>Kigali Clean Urban Mobility · Micro-Financing</span>
              </div>
              <h1 className="hero-title">Own a share of Kigali's electric moto-taxis.</h1>
              <p className="hero-desc">
                Invest from 10,000 RWF into high-performance electric motorcycles leased to verified Kigali moto-taxi riders.
                Earn steady weekly returns while accelerating Rwanda's green transit revolution.
              </p>
              <div className="hero-actions">
                <button className="btn btn-primary btn-lg" onClick={signIn}>
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </button>
                <a href="#campaigns-section" className="btn ghost btn-lg">
                  <span>Explore E-Motos</span>
                  <Icon n="arrow-right" size={18} />
                </a>
              </div>

              <div className="hero-metrics">
                <div className="metric-box">
                  <span className="metric-val">10,000 RWF</span>
                  <span className="metric-lbl">Min. Investment</span>
                </div>
                <div className="metric-box">
                  <span className="metric-val">100% Electric</span>
                  <span className="metric-lbl">Zero Emissions</span>
                </div>
                <div className="metric-box">
                  <span className="metric-val">24 Months</span>
                  <span className="metric-lbl">Lease-to-Own</span>
                </div>
                <div className="metric-box">
                  <span className="metric-val">Verified</span>
                  <span className="metric-lbl">Cooperative Riders</span>
                </div>
              </div>
            </div>

            <div className="hero-card-col">
              <div className="hero-preview-card">
                <div className="preview-media">
                  <img
                    src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80"
                    alt="Ampersand Electric Motorcycle in Kigali"
                    className="preview-img"
                  />
                  <div className="preview-tag">
                    <Pill s="open" />
                    <span className="pill dark-glass">Featured E-Moto</span>
                  </div>
                </div>
                <div className="preview-info">
                  <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4>Ampersand Model 1 Pro</h4>
                    <span className="location-tag"><Icon n="map-point" size={14} /> Gasabo, Kigali</span>
                  </div>
                  <div className="bar" style={{ marginTop: 12 }}>
                    <i style={{ width: '75%' }} />
                  </div>
                  <div className="stats" style={{ marginTop: 6 }}>
                    <strong>1,650,000 RWF (75%)</strong>
                    <span className="muted">Target 2,200,000 RWF</span>
                  </div>
                  <div className="preview-footer">
                    <span className="rider-verified">
                      <Icon n="check-circle" size={16} /> Verified Rider Allocated
                    </span>
                    <button className="btn sm" onClick={signIn}>
                      Back this Moto
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        <Campaigns profile={profile} notify={notify} onSignIn={signIn} />
      </>
    );
  }

  const next = { auto: 'light', light: 'dark', dark: 'auto' }[theme];

  return (
    <>
      <header className="top">
        <div className="wrap top-wrap">
          <button className="brand" onClick={() => setView('campaigns')} aria-label="Motari Fund Home">
            <span className="brand-logo"><Icon n="bolt" size={20} /></span>
            <span className="brand-name">Motari Fund</span>
            <span className="badge-kigali">Kigali</span>
          </button>

          {session && profile && (
            <nav className="main-nav" aria-label="Main">
              {tabs.map(([k, l, i]) => (
                <button
                  key={k}
                  className={'nav' + (view === k ? ' on' : '')}
                  aria-current={view === k ? 'page' : undefined}
                  onClick={() => setView(k)}
                >
                  <Icon n={i} size={18} />
                  <span>{l}</span>
                </button>
              ))}
            </nav>
          )}

          <div className="top-actions">
            {session && profile && (
              <div className="role-switcher-pill" title="Demo mode role switch">
                <span className="role-lbl">Role:</span>
                <select
                  value={activeRole}
                  onChange={(e) => {
                    setDemoRole(e.target.value);
                    notify(`Switched view to ${e.target.value.toUpperCase()}`);
                  }}
                  className="role-select"
                >
                  <option value="investor">Investor</option>
                  <option value="rider">Rider</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            <button
              className="btn ghost icon-btn"
              onClick={() => setTheme(next)}
              aria-label={`Theme: ${theme}. Switch to ${next}`}
              title={`Switch to ${next} theme`}
            >
              <Icon n={theme === 'dark' ? 'moon' : 'sun'} size={18} />
            </button>

            {session ? (
              <div className="user-dropdown">
                <span className="user-name" title={profile?.full_name}>
                  {profile?.full_name?.split(' ')[0] || 'Account'}
                </span>
                <button className="btn ghost sm" onClick={() => sb.auth.signOut()} title="Sign out">
                  <Icon n="logout-2" size={16} />
                  <span>Log out</span>
                </button>
              </div>
            ) : (
              <button className="btn btn-google" onClick={signIn}>
                <GoogleIcon />
                <span>Sign in</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main>
        <div className="wrap">{body}</div>
      </main>

      <footer className="footer">
        <div className="wrap footer-wrap">
          <div className="footer-left">
            <span className="brand-logo sm"><Icon n="bolt" size={16} /></span>
            <strong>Motari Fund</strong>
            <span className="muted">· Kigali, Rwanda</span>
          </div>
          <p className="muted small-text">
            Clean urban micro-financing for electric motorcycle taxis. Built for Rwandan mobility.
          </p>
        </div>
      </footer>

      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
