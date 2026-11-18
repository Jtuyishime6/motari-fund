import { useEffect, useState } from 'react';
import { sb, api } from './lib.js';
import { Icon, Skeletons, GoogleIcon } from './ui.jsx';
import Onboarding from './Onboarding.jsx';
import LandingPage from './LandingPage.jsx';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setTimeout(() => setToast(''), 3000);
  };

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const activeRole = demoRole || profile?.role;

  const tabs = [
    ['campaigns', 'E-Motos', 'bolt'],
  ];
  if (activeRole === 'investor' || activeRole === 'admin') {
    tabs.push(['pledges', 'Portfolio', 'wallet-2']);
  }
  if (activeRole === 'rider' || activeRole === 'admin') {
    tabs.push(['rider', 'Rider Portal', 'document-text']);
  }
  if (activeRole === 'admin') {
    tabs.push(['review', 'Review', 'shield-check'], ['new', 'New Campaign', 'add-circle']);
  }

  let body;
  if (session === undefined || (session && !profile)) {
    body = (
      <div className="wrap" style={{ padding: '40px 24px' }}>
        <Skeletons n={3} />
      </div>
    );
  } else if (session && !profile.role) {
    body = (
      <div className="wrap" style={{ padding: '40px 24px' }}>
        <Onboarding profile={profile} onDone={setProfile} />
      </div>
    );
  } else if (session) {
    // Authenticated Dashboard - direct and concise
    body = (
      <div className="wrap dashboard-wrap">
        {view === 'campaigns' && <Campaigns profile={profile} notify={notify} onSignIn={signIn} />}
        {view === 'pledges' && <Investor goCampaigns={() => setView('campaigns')} />}
        {view === 'rider' && <Rider notify={notify} />}
        {view === 'review' && <Review notify={notify} />}
        {view === 'new' && <NewCampaign notify={notify} />}
      </div>
    );
  } else {
    // Visitor marketing landing page
    body = <LandingPage profile={profile} notify={notify} onSignIn={signIn} />;
  }

  const next = { auto: 'light', light: 'dark', dark: 'auto' }[theme];

  return (
    <div className="app-shell">
      {/* Top Navbar */}
      <header className="top">
        <div className="wrap top-wrap">
          <div className="top-brand-group">
            <button
              className="brand"
              onClick={() => {
                setView('campaigns');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-label="MOTARI Home"
            >
              <img src="/images/MOTARI Logo.png" alt="MOTARI" className="motari-brand-img" />
            </button>
          </div>

          {session && profile ? (
            <nav className="main-nav desktop-only" aria-label="Dashboard">
              {tabs.map(([k, l, i]) => (
                <button
                  key={k}
                  className={'nav' + (view === k ? ' on' : '')}
                  aria-current={view === k ? 'page' : undefined}
                  onClick={() => {
                    setView(k);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <Icon n={i} size={18} />
                  <span>{l}</span>
                </button>
              ))}
            </nav>
          ) : (
            <nav className="visitor-nav desktop-only" aria-label="Main Navigation">
              <button type="button" className="v-nav-link" onClick={() => scrollTo('problem')}>Challenge</button>
              <button type="button" className="v-nav-link" onClick={() => scrollTo('solution')}>Solution</button>
              <button type="button" className="v-nav-link" onClick={() => scrollTo('fleet')}>Fleet</button>
              <button type="button" className="v-nav-link" onClick={() => scrollTo('how-it-works')}>How It Works</button>
              <button type="button" className="v-nav-link" onClick={() => scrollTo('impact')}>Impact</button>
              <button type="button" className="v-nav-link highlight" onClick={() => scrollTo('campaigns')}>
                <Icon n="bolt" size={16} />
                <span>E-Motos</span>
              </button>
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
                    notify(`Role: ${e.target.value.toUpperCase()}`);
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
                  {profile?.full_name?.split(' ')[0] || 'User'}
                </span>
                <button className="btn ghost sm" onClick={() => sb.auth.signOut()} title="Sign out">
                  <Icon n="logout-2" size={16} />
                  <span className="desktop-only">Sign out</span>
                </button>
              </div>
            ) : (
              <button className="btn btn-google" onClick={signIn}>
                <GoogleIcon />
                <span>Sign in</span>
              </button>
            )}

            <button
              className="btn ghost icon-btn mobile-only"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              <Icon n={mobileMenuOpen ? 'close-circle' : 'hamburger-menu'} size={22} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-drawer mobile-only">
            {session && profile ? (
              <div className="mobile-nav-list">
                {tabs.map(([k, l, i]) => (
                  <button
                    key={k}
                    className={'m-nav-item' + (view === k ? ' on' : '')}
                    onClick={() => {
                      setView(k);
                      setMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <Icon n={i} size={20} />
                    <span>{l}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mobile-nav-list">
                <button type="button" className="m-nav-item" onClick={() => scrollTo('problem')}>Challenge</button>
                <button type="button" className="m-nav-item" onClick={() => scrollTo('solution')}>Solution</button>
                <button type="button" className="m-nav-item" onClick={() => scrollTo('fleet')}>Fleet</button>
                <button type="button" className="m-nav-item" onClick={() => scrollTo('how-it-works')}>How It Works</button>
                <button type="button" className="m-nav-item" onClick={() => scrollTo('impact')}>Impact</button>
                <button type="button" className="m-nav-item on" onClick={() => scrollTo('campaigns')}>
                  <Icon n="bolt" size={18} />
                  <span>Available E-Motos</span>
                </button>
                <button className="btn btn-google btn-lg" style={{ marginTop: 12 }} onClick={() => { setMobileMenuOpen(false); signIn(); }}>
                  <GoogleIcon />
                  <span>Sign in with Google</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="main-content">
        {body}
      </main>

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
