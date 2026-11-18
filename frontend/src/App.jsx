import { useEffect, useState } from 'react';
import { sb, api } from './lib.js';
import { Icon, Skeletons } from './ui.jsx';
import Onboarding from './Onboarding.jsx';
import Campaigns from './Campaigns.jsx';
import Investor from './Investor.jsx';
import Rider from './Rider.jsx';
import { Review, NewCampaign } from './Admin.jsx';

const signIn = () => sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });

export default function App() {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('campaigns');
  const [toast, setToast] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'auto');

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
    if (session) api('/me').then(setProfile).catch(() => setProfile(null)); else setProfile(null);
  }, [session]);
  const notify = (m) => { setToast(m); setTimeout(() => setToast(''), 3500); };

  const tabs = [['campaigns', 'E-motos', 'bolt']];
  if (profile?.role === 'investor') tabs.push(['pledges', 'My pledges', 'wallet-2']);
  if (profile?.role === 'rider') tabs.push(['rider', 'My application', 'document-text']);
  if (profile?.role === 'admin') tabs.push(['review', 'Review', 'shield-check'], ['new', 'New campaign', 'add-circle']);

  let body;
  if (session === undefined || (session && !profile)) body = <Skeletons />;
  else if (session && !profile.role) body = <Onboarding profile={profile} onDone={setProfile} />;
  else if (view === 'pledges') body = <Investor goCampaigns={() => setView('campaigns')} />;
  else if (view === 'rider') body = <Rider notify={notify} />;
  else if (view === 'review') body = <Review notify={notify} />;
  else if (view === 'new') body = <NewCampaign notify={notify} />;
  else body = (
    <>
      {!session && (
        <section className="hero">
          <h1>Own a share of Kigali's electric moto-taxis.</h1>
          <p>Invest from 10,000 RWF in an e-moto leased to a verified rider, and watch every repayment.</p>
          <div className="row"><button className="btn" onClick={signIn}>Continue with Google</button></div>
        </section>
      )}
      <Campaigns profile={profile} notify={notify} onSignIn={signIn} />
    </>
  );

  const next = { auto: 'light', light: 'dark', dark: 'auto' }[theme];
  return (
    <>
      <header className="top"><div className="wrap">
        <button className="brand" onClick={() => setView('campaigns')}><Icon n="bolt" /> Motari Fund</button>
        {session && profile?.role && <nav aria-label="Main">{tabs.map(([k, l, i]) => (
          <button key={k} className={'nav' + (view === k ? ' on' : '')} aria-current={view === k ? 'page' : undefined} onClick={() => setView(k)}><Icon n={i} size={20} />{l}</button>
        ))}</nav>}
        <button className="btn ghost" onClick={() => setTheme(next)} aria-label={`Theme: ${theme}. Switch to ${next}`}><Icon n={theme === 'dark' ? 'moon' : 'sun'} size={20} />{theme}</button>
        {session ? <button className="btn ghost" onClick={() => sb.auth.signOut()}><Icon n="logout-2" size={20} />Log out</button> : <button className="btn" onClick={signIn}>Sign in</button>}
      </div></header>
      <main><div className="wrap">{body}</div></main>
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
