// Business rules shared by the API and the web app.
// Change a rule here and both sides follow, so the form and the server never disagree.

export const MIN_PLEDGE = 10000;
export const PROJECTED_RETURN = 0.65; // up to 65% over the lease, a projection and not a guarantee
export const DEFAULT_LEASE_MONTHS = 24;
export const LEASE_MONTHS = { min: 6, max: 48 };
export const MIN_CAMPAIGN_TARGET = 100000;
export const DISTRICTS = ['Gasabo', 'Kicukiro', 'Nyarugenge', 'Other'];

export const PLEDGE_STATUS = ['pending', 'confirmed', 'rejected'];
export const APPLICATION_STATUS = ['pending', 'approved', 'rejected'];

// Rwandan mobile numbers on MTN (078, 079) and Airtel (072, 073), with or without +250.
export function normPhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '').replace(/^250/, '0');
  return /^07[2389]\d{7}$/.test(digits) ? digits : null;
}

export const toInt = (value) => {
  if (value === '' || value === null || value === undefined) return NaN;
  const n = Number(value);
  return Number.isInteger(n) ? n : NaN;
};

export const cleanText = (value, max = 80) => String(value ?? '').trim().slice(0, max);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value) => UUID.test(String(value ?? ''));

// Photos are either files we host (/images/...) or https URLs.
export const isPhotoUrl = (value) => /^\/[\w\-./ ()%]+$/.test(value) || /^https:\/\/[^\s"'<>]+$/.test(value);

export function projectReturn(amount, months = DEFAULT_LEASE_MONTHS) {
  const total = Math.round(amount * (1 + PROJECTED_RETURN));
  return { total, profit: total - amount, monthly: Math.round(total / months) };
}
