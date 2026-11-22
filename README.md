# MOTARI

Community financing for electric moto-taxis in Kigali. Investors pool from 10,000 RWF to fund electric motorcycles, which are leased to verified moto-taxi riders who repay daily and own the bike after 24 months.

## What works today

- Google sign-in for investors, email and password for admins at `/admin`
- Funding campaigns with live progress, pledges paid by MTN MoMo or Airtel Money and confirmed by the team
- Public rider application, with no account needed
- Investor portfolio: confirmed total, projected return, share of each bike, pledge history
- Admin console: overview with a capital chart and review queue, pledge and rider review, campaign table, new campaign with live preview

Leases, repayments and payouts have tables in the schema but no screens yet. See [docs/ENGINEERING.md](docs/ENGINEERING.md) for the roadmap.

## Structure

```
frontend/        React and Vite web app
  src/landing/   Hero demo and portfolio preview used on the landing page
  src/motion.jsx Motion primitives built on framer-motion
  src/icons.jsx  Inline SVG icon set
backend/src/     Express API, served by api/index.js as one Vercel function
backend/test/    node:test unit tests
shared/rules.js  Business rules used by both the API and the web app
supabase/        Database schema and Row Level Security
scripts/         Admin creation and demo data
```

## Run locally

1. In Supabase, run `supabase/schema.sql` in the SQL Editor and enable Google under Authentication, Providers.
2. Copy `.env.example` to `.env` and fill it in.
3. Run `npm install`, then `npm --prefix frontend install`.
4. In two terminals run `npm run dev:api` and `npm run dev:web`, then open http://localhost:5173.
5. Create an admin with `npm run admin:create`, then sign in at http://localhost:5173/admin.
6. Optional: `npm run seed:demo` adds demo campaigns, investors and riders. `npm run seed:demo -- --reset` removes them.

## Checks

```
npm test                          # API and business rule tests
npm --prefix frontend run build   # production build
```

Both run in GitHub Actions on every pull request.

## Deploy on Vercel

Import the repository as one project and add the variables from `.env.example`. Vercel builds the frontend and serves the API from the same address. In Supabase, Authentication, URL Configuration, set the Site URL to your Vercel address. Set `ALLOWED_ORIGINS` only if the web app is hosted on a different domain from the API.

## Demo walkthrough

1. Open the landing page and watch the hero: three pledges fund a bike, which is then leased to a rider.
2. Sign in as an investor, finish the one-step setup, and pledge to an open e-moto.
3. Sign in at `/admin`. The overview shows the pledge waiting. Confirm it in Review and watch the campaign progress and capital chart move.
4. From the landing page, apply as a rider. Approve or reject the application in Review.
