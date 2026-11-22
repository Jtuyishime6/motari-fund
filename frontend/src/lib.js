import { createClient } from '@supabase/supabase-js';

export const sb = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

const API = import.meta.env.VITE_API_URL || '/api';

export async function api(path, opts = {}) {
  const { data } = await sb.auth.getSession();
  const headers = { 'Content-Type': 'application/json' };
  if (data.session) headers.Authorization = 'Bearer ' + data.session.access_token;
  let res;
  try {
    res = await fetch(API + path, { ...opts, headers, body: opts.body ? JSON.stringify(opts.body) : undefined });
  } catch {
    throw new Error('No connection. Check your internet and try again.');
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Request failed. Try again.');
  return json;
}

const num = new Intl.NumberFormat('en-US');
export const fmt = (n) => num.format(Math.round(n || 0));
export const rwf = (n) => `${fmt(n)} RWF`;

/** 2,450,000 becomes 2.45M, 85,000 becomes 85K. For tiles and chart axes only. */
export const compact = (n) => {
  const v = Math.abs(n || 0);
  if (v >= 1e6) return `${+(n / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `${+(n / 1e3).toFixed(v >= 1e5 ? 0 : 1)}K`;
  return fmt(n);
};

export const shortDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
export const longDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export function ago(d) {
  const s = Math.max(0, (Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  const days = Math.floor(s / 86400);
  return days === 1 ? 'yesterday' : days < 30 ? `${days} days ago` : longDate(d);
}

export const pct = (part, whole) => (whole > 0 ? Math.min(100, Math.round((part / whole) * 100)) : 0);
