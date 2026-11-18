import { createClient } from '@supabase/supabase-js';
export const sb = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
const API = import.meta.env.VITE_API_URL || '/api';
export async function api(path, opts = {}) {
  const { data } = await sb.auth.getSession();
  const headers = { 'Content-Type': 'application/json' };
  if (data.session) headers.Authorization = 'Bearer ' + data.session.access_token;
  const res = await fetch(API + path, { ...opts, headers, body: opts.body ? JSON.stringify(opts.body) : undefined });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Request failed. Try again.');
  return json;
}
export const rwf = (n) => new Intl.NumberFormat('en-RW').format(n || 0) + ' RWF';
