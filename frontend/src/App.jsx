import { useCallback, useEffect, useRef, useState } from 'react';
import { sb, api, fmt } from './lib.js';
import { MIN_PLEDGE } from '../../shared/rules.js';
import { Icon, GoogleIcon, Toast, PageHead } from './ui.jsx';
import Onboarding from './Onboarding.jsx';
import LandingPage, { scrollToId } from './LandingPage.jsx';
import Campaigns from './Campaigns.jsx';
import Investor from './Investor.jsx';
import RiderApply from './Rider.jsx';
import { Overview, Review, CampaignTable, NewCampaign, AdminLogin, useAdminData } from './Admin.jsx';

const isAdminPath = () => window.location.pathname.replace(/\/+$/, '') === '/admin';

const signIn = () => sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });

const LANDING_LINKS = [['how', 'How it works'], ['returns', 'Returns'], ['emotos', 'E-motos'], ['faq', 'FAQ']];

const NAV = {
  investor: [['portfolio', 'Portfolio', 'grid'], ['emotos', 'E-motos', 'scooter']],
  admin: [['overview', 'Overview', 'grid'], ['review', 'Review', 'inbox'], ['emotos', 'E-motos', 'scooter'], ['new', 'New campaign', 'plus']]
};

const viewFromHash = () => window.location.hash.replace(/^#\/?/, '').split('/');

function useNotify() {
  const [message, setMessage] = useState('');
  const timer = useRef();
  const notify = useCallback((m) => {
    setMessage(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(''), 3800);
  }, []);
  return [message, notify];
}

function CenterCard({ title, text, children }) {
  return (
    <div className="center-card">
      <div className="panel">
        <h2>{title}</h2>
        <p className="muted">{text}</p>
        {children}
      </div>
    </div>
  );
}

function PublicHeader({ adminPath, onApply }) {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const jump = (id) => { setMenu(false); setTimeout(() => scrollToId(id), 30); };

  return (
    <header className={'header' + (scrolled || menu ? ' solid' : '')}>
      <div className="wrap header-inner">
        <a className="brand" href="/" aria-label="MOTARI home" onClick={(e) => { if (!adminPath) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}>
          <img src="/images/motari-wordmark.png" alt="MOTARI" />
        </a>
        {!adminPath && (
          <>
            <nav className="header-nav only-desktop" aria-label="Main">
              {LANDING_LINKS.map(([id, l]) => <button key={id} className="nav-link" onClick={() => jump(id)}>{l}</button>)}
            </nav>
            <div className="header-actions">
              <button className="nav-link only-desktop" onClick={onApply}>For riders</button>
              <button className="btn sm header-cta only-desktop" onClick={signIn}><GoogleIcon /> Sign in</button>
              <button className="btn ghost icon-btn only-mobile menu-btn" onClick={() => setMenu(!menu)} aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu}>
                <Icon n={menu ? 'x' : 'menu'} size={22} />
              </button>
            </div>
          </>
        )}
      </div>
      {menu && (
        <div className="drawer">
          {LANDING_LINKS.map(([id, l]) => <button key={id} className="drawer-link" onClick={() => jump(id)}>{l}</button>)}
          <button className="btn lg block" onClick={() => { setMenu(false); signIn(); }}><GoogleIcon /> Sign in to invest</button>
          <button className="btn secondary lg block" onClick={() => { setMenu(false); onApply(); }}>Apply as a rider</button>
        </div>
      )}
    </header>
  );
}

function Shell({ profile, role, onSignOut, notify }) {
  const nav = NAV[role];
  const [[hashView, hashSub], setHash] = useState(viewFromHash);
  const view = nav.some(([k]) => k === hashView) ? hashView : nav[0][0];

  useEffect(() => {
    const on = () => setHash(viewFromHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const go = useCallback((k, sub) => {
    const next = '#/' + k + (sub ? '/' + sub : '');
    if (window.location.hash !== next) window.location.hash = next;
    setHash([k, sub]);
    window.scrollTo(0, 0);
  }, []);

  const first = profile.full_name?.split(' ')[0] || 'there';
  const data = useAdminData(role === 'admin');
  const badge = data.queue;

  return (
    <div className="shell">
      <aside className="side" aria-label="Sidebar">
        <a href="/" className="side-brand"><img src="/images/motari-wordmark.png" alt="MOTARI" /></a>
        {role === 'admin' && <span className="side-env">Operations</span>}
        <nav className="side-nav" aria-label="Sections">
          {nav.map(([k, l, i]) => (
            <button key={k} className={'side-link' + (view === k ? ' on' : '')} aria-current={view === k ? 'page' : undefined} onClick={() => go(k)}>
              <Icon n={i} size={18} /> <span>{l}</span>
              {k === 'review' && badge > 0 && <span className="badge">{badge}</span>}
            </button>
          ))}
        </nav>
        <div className="side-foot">
          <div className="side-user">
            <span className="avatar">{first[0]?.toUpperCase()}</span>
            <div><strong>{profile.full_name || first}</strong><span>{role === 'admin' ? 'Admin' : 'Investor'}</span></div>
          </div>
          <button className="side-link" onClick={onSignOut}><Icon n="logout" size={18} /> <span>Sign out</span></button>
        </div>
      </aside>

      <div className="shell-main">
        <header className="topbar only-mobile">
          <img src="/images/motari-wordmark.png" alt="MOTARI" />
          <button className="btn ghost sm" onClick={onSignOut}><Icon n="logout" size={16} /> Sign out</button>
        </header>
        <main className="content" id="main">
          {role === 'admin' ? (
            <>
              {view === 'overview' && <Overview data={data} go={go} />}
              {view === 'review' && <Review data={data} notify={notify} initialTab={hashSub} />}
              {view === 'emotos' && <CampaignTable data={data} go={go} />}
              {view === 'new' && <NewCampaign notify={notify} onCreated={() => { data.reload(); go('emotos'); }} />}
            </>
          ) : (
            <>
              {view === 'portfolio' && <Investor goCampaigns={() => go('emotos')} name={first} />}
              {view === 'emotos' && (
                <>
                  <PageHead title="E-motos" sub={`Back any open bike from ${fmt(MIN_PLEDGE)} RWF.`} />
                  <Campaigns profile={profile} notify={notify} onSignIn={signIn} onPledged={() => go('portfolio')} />
                </>
              )}
            </>
          )}
        </main>
        <nav className="tabbar only-mobile" aria-label="Sections">
          {nav.map(([k, l, i]) => (
            <button key={k} className={view === k ? 'on' : ''} aria-current={view === k ? 'page' : undefined} onClick={() => go(k)}>
              <Icon n={i} size={20} /><span>{l.replace('New campaign', 'New')}</span>
              {k === 'review' && badge > 0 && <span className="badge dot" aria-label={`${badge} waiting`} />}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default function App() {
  const [adminPath] = useState(isAdminPath);
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [applying, setApplying] = useState(false);
  const [toast, notify] = useNotify();

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setProfile(null); return; }
    setProfile(null);
    api('/me').then(setProfile).catch(() => setProfile({ error: true }));
  }, [session?.user?.id]);

  const signOut = async () => {
    await sb.auth.signOut();
    setSession(null);
    history.replaceState(null, '', window.location.pathname);
    window.scrollTo(0, 0);
    notify('Signed out.');
  };

  const role = profile?.role;
  let page;

  if (session === undefined || (session && !profile)) {
    page = <div className="boot" aria-busy="true"><img src="/images/motari-wordmark.png" alt="Loading MOTARI" /><div className="boot-bar"><i /></div></div>;
  } else if (!session && adminPath) {
    page = <AdminLogin />;
  } else if (!session) {
    page = (
      <>
        <PublicHeader adminPath={false} onApply={() => setApplying(true)} />
        <main id="main"><LandingPage notify={notify} onSignIn={signIn} onApply={() => setApplying(true)} /></main>
      </>
    );
  } else if (profile.error) {
    page = <CenterCard title="We could not load your account" text="Check your connection, then try again."><button className="btn" onClick={() => window.location.reload()}>Try again</button></CenterCard>;
  } else if (adminPath && role !== 'admin') {
    page = <CenterCard title="This is not an admin account" text="Sign out, then sign in with your admin email and password."><button className="btn block" onClick={signOut}>Sign out</button></CenterCard>;
  } else if (role === 'rider') {
    page = <CenterCard title="Riders do not need to sign in" text="Our team will call you about your application on the number you gave us."><button className="btn block" onClick={signOut}>Sign out</button></CenterCard>;
  } else if (!role) {
    page = (
      <div className="onboard">
        <Onboarding profile={profile} onDone={(p) => { setProfile(p); window.location.hash = '#/emotos'; notify('Welcome to MOTARI.'); }} />
      </div>
    );
  } else {
    page = <Shell profile={profile} role={role} onSignOut={signOut} notify={notify} />;
  }

  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      {page}
      {applying && <RiderApply onClose={() => setApplying(false)} />}
      <Toast message={toast} />
    </>
  );
}
