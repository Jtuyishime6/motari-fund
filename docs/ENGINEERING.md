# Engineering notes

How the codebase is organised, the decisions behind the current shape, and what to build next.

## Principles

- One source for each business rule. Minimum pledge, return projection, lease bounds, districts and phone validation live in `shared/rules.js`, imported by the API and the web app.
- The server decides. Client-side checks exist for fast feedback, and the API repeats every one of them.
- Money moves only after a person checks it. Pledges and rider applications stay pending until an admin reviews them, and each can be reviewed once.
- The interface only claims what the product does today. Marketing copy and mockups are checked against the code.

## Decision log

Problems found in a structural pass (hidden links, needless links, surplus code and special cases) and the change that resolved each.

| Problem | Fix |
| --- | --- |
| The 10,000 RWF minimum, 65% projection, districts and phone format were repeated in the API, landing page, portfolio, rider form and onboarding. | `shared/rules.js`, imported by both sides. Tests cover it. |
| Confirming a pledge marked the campaign funded before the pledge update, so a failed update left a funded campaign. Two admins could confirm the same pledge. | Update the pledge only where `status = 'pending'`, then mark the campaign funded. A second review gets a 409. |
| Rider applications could be reviewed again after a decision. | Same pending-only update. |
| Blank numeric fields were read as zero, so an empty years-of-experience field passed. | `toInt` treats blanks as missing. |
| Unexpected server errors were swallowed with a generic message and no log. | Logged with method and path, still generic to the client. |
| The rate limiter map grew forever. | Expired keys are pruned. |
| Icons were fetched from a third-party API on every page load. | Inline SVG icon set in `icons.jsx`. |
| Admin screens loaded their data separately, so counts could disagree. | One `useAdminData` loader feeds the sidebar badge, overview and review queue. |
| The toast timer was stored on the callback function. | `useNotify` hook with a ref. |
| `CountUp` set its target before subscribing, so the first change could be missed. | Subscribe first, then set. |
| Navigation state was lost on refresh. | The current section lives in the URL hash. |

## Frontend

- React 18, Vite 5, framer-motion 11. No CSS framework: `styles.css` holds the tokens and components.
- Motion is used for one orchestrated hero moment and for responses to the user (dialogs, tabs, toasts, accordion). Section entrances are kept light, and everything respects `prefers-reduced-motion`.
- The hero demo follows three rules: every change has a visible cause, only the words the story needs are real, and the loop ends in the state it started in.
- Accessibility: skip link, labelled dialogs with focus trap and focus return, `aria-current` in navigation, progress bars with values, a data table behind the chart, and visible focus rings.

## API

- Express on a single Vercel function. Supabase service role on the server; Row Level Security limits direct client access to a user's own rows.
- Security headers on API responses and on static files through `vercel.json`.

## Roadmap

In priority order for an investor-ready platform.

1. **Leases and repayments.** Create a lease when a campaign is funded and assigned, record daily repayments, and show investors their share of each repayment. The tables already exist.
2. **Mobile Money verification.** Replace manual transaction ID matching with the MTN MoMo and Airtel Money collection APIs, keeping manual review as a fallback.
3. **Database-level guarantees.** Move pledge confirmation into a Postgres function with a row lock so the funding check and the update are one transaction, and add a unique index on active `momo_ref`.
4. **Audit trail.** An append-only table of every admin action with who, what and when.
5. **Rate limiting at the edge.** The in-memory limiter is per instance. Use Vercel KV or Upstash for a shared limit.
6. **End-to-end tests.** Playwright runs of the investor and admin flows against a Supabase branch database.
7. **Observability.** Error reporting and uptime checks for the API.
8. **Kinyarwanda and French.** Most riders and many investors will prefer them.
