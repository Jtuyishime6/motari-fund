import { useCallback, useEffect, useState } from 'react';
import { sb, api } from './lib.js';
import { Icon, GoogleIcon, PageHead } from './ui.jsx';
import Onboarding from './Onboarding.jsx';
import LandingPage, { scrollToId } from './LandingPage.jsx';
import Campaigns from './Campaigns.jsx';
import Investor from './Investor.jsx';
import RiderApply from './Rider.jsx';
import { Review, NewCampaign, AdminLogin } from './Admin.jsx';

const isAdminPath = () => window.location.pathname.replace(/\/+$/, '') === '/admin';

const signIn = () => sb.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: window.location.origin }
});

const LANDING_LINKS = [['how', 'How it works'], ['emotos', 'E-motos'], ['faq', 'FAQ']];

const TABS = {
  investor: [['portfolio', 'Portfolio', 'wallet-2'], ['emotos', 'E-motos', 'bolt']],
  admin: [['review', 'Review', 'shield-check'], ['emotos', 'E-motos', 'bolt'], ['new', 'New campaign', 'add-circle']]
};

export default function App() {
  const [adminPath] = useState(isAdminPath);
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState(null);
  const [toast, setToast] = useState('');
  const [menu, setMenu] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    document.documentElement.removeAttribute('data-theme');
    try { localStorage.removeItem('theme'); } catch { /* ignore */ }
    if (window.location.hash === '#' || window.location.hash === '') history.replaceState(null, '', window.location.pathname + window.location.search);
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setProfile(null); setView(null); return; }
    setProfile(null);
    api('/me').then(setProfile).catch(() => setProfile({ error: true }));
  }, [session?.user?.id]);

  const role = profile?.role;
  const tabs = TABS[role] || [];
  const current = tabs.some(([k]) => k === view) ? view : tabs[0]?.[0];

  const notify = useCallback((m) => {
    setToast(m);
    clearTimeout(notify.t);
    notify.t = setTimeout(() => setToast(''), 3500);
  }, []);

  const go = (k) => { setView(k); setMenu(false); window.scrollTo(0, 0); };
  const jump = (id) => { setMenu(false); setTimeout(() => scrollToId(id), 50); };
  const home = () => { setMenu(false); session ? go(tabs[0]?.[0]) : window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const apply = () => { setMenu(false); setApplying(true); };

  const signOut = async () => {
    setMenu(false);
    await sb.auth.signOut();
    setSession(null);
    window.scrollTo(0, 0);
    notify('Signed out.');
  };

  const signedIn = session && profile && !profile.error && tabs.length > 0;
  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  let body;
  if (session === undefined || (session && !profile)) {
    body = <div className="wrap dash"><div className="sk" style={{ height: 32, width: 220, marginBottom: 24 }} /><div className="sk" style={{ height: 200 }} /></div>;
  } else if (!session && adminPath) {
    body = <AdminLogin />;
  } else if (session && profile.error) {
    body = (
      <div className="wrap dash narrow">
        <div className="note red"><Icon n="danger-circle" /> We could not load your account.</div>
        <button className="btn" onClick={() => window.location.reload()}>Try again</button>
      </div>
    );
  } else if (session && adminPath && role !== 'admin') {
    body = (
      <div className="wrap dash narrow" style={{ maxWidth: 440 }}>
        <div className="card">
          <h3>Not an admin account</h3>
          <p className="muted small" style={{ margin: '8px 0 18px' }}>Sign out and use the admin login.</p>
          <button className="btn block" onClick={signOut}>Sign out</button>
        </div>
      </div>
    );
  } else if (session && role === 'rider') {
    body = (
      <div className="wrap dash narrow" style={{ maxWidth: 440 }}>
        <div className="card">
          <h3>Rider accounts don't need to sign in</h3>
          <p className="muted small" style={{ margin: '8px 0 18px' }}>Our team will call you about your application.</p>
          <button className="btn block" onClick={signOut}>Sign out</button>
        </div>
      </div>
    );
  } else if (session && !role) {
    body = <div className="wrap dash"><Onboarding profile={profile} onDone={(p) => { setProfile(p); setView(null); notify('Welcome to MOTARI.'); }} /></div>;
  } else if (session) {
    body = (
      <div className="wrap dash">
        {current === 'portfolio' && <Investor goCampaigns={() => go('emotos')} name={firstName} />}
        {current === 'emotos' && (
          <>
            <PageHead
              title="E-motos"
              action={role === 'admin' && <button className="btn sm" onClick={() => go('new')}><Icon n="add-circle" size={16} /> New campaign</button>}
            />
            <Campaigns profile={profile} notify={notify} onSignIn={signIn} onPledged={() => go('portfolio')} />
          </>
        )}
        {current === 'review' && <Review notify={notify} />}
        {current === 'new' && <NewCampaign notify={notify} onCreated={() => go('emotos')} />}
      </div>
    );
  } else {
    body = <LandingPage notify={notify} onSignIn={signIn} onApply={apply} />;
  }

  const navItems = signedIn
    ? tabs.length > 1 && tabs.map(([k, l, i]) => (
      <button key={k} className={'nav-link' + (current === k ? ' on' : '')} aria-current={current === k ? 'page' : undefined} onClick={() => go(k)}>
        <Icon n={i} size={18} /> {l}
      </button>
    ))
    : !session && !adminPath && LANDING_LINKS.map(([id, l]) => (
      <button key={id} className="nav-link" onClick={() => jump(id)}>{l}</button>
    ));

  return (
    <div className="app">
      <header className="header">
        <div className="wrap header-inner">
          <button className="brand" onClick={home} aria-label="MOTARI home">
            <img src="/images/motari-wordmark.png" alt="MOTARI" />
            {adminPath && <span className="role-tag" style={{ marginLeft: 10 }}>Admin</span>}
          </button>

          {navItems && <nav className="header-nav only-desktop" aria-label="Main">{navItems}</nav>}

          <div className="header-actions">
            {session ? (
              <>
                {signedIn && (
                  <div className="user-chip only-desktop">
                    <span className="avatar">{firstName[0]?.toUpperCase()}</span>
                    <span>{firstName}</span>
                  </div>
                )}
                <button className="btn secondary sm" onClick={signOut}>
                  <Icon n="logout-2" size={16} /> <span>Sign out</span>
                </button>
              </>
            ) : !adminPath && (
              <>
                <button className="btn secondary sm only-desktop" onClick={signIn}>
                  <GoogleIcon /> Sign in
                </button>
                <button className="btn ghost icon-btn only-mobile" onClick={() => setMenu(!menu)} aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu}>
                  <Icon n={menu ? 'close-circle' : 'hamburger-menu'} size={22} />
                </button>
              </>
            )}
          </div>
        </div>

        {menu && !session && (
          <div className="drawer">
            {navItems}
            <button className="btn lg" onClick={() => { setMenu(false); signIn(); }}>
              <GoogleIcon /> Sign in to invest
            </button>
            <button className="btn secondary lg" style={{ marginTop: 0 }} onClick={apply}>Apply as a rider</button>
          </div>
        )}
      </header>

      {signedIn && tabs.length > 1 && (
        <nav className="subnav" aria-label="Sections">
          <div className="wrap">{navItems}</div>
        </nav>
      )}

      <main>{body}</main>

      {applying && <RiderApply onClose={() => setApplying(false)} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
