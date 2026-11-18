# Motari Fund

A community micro-investment platform. Small investors pool money from 10,000 RWF to fund electric motorcycles, which are leased to verified moto-taxi riders in Kigali.

## Structure

- `frontend/` React and Vite web app
- `backend/` Express API code, served by `api/index.js` as a Vercel function
- `supabase/schema.sql` database tables and Row Level Security

## What works

Google sign-in, roles (investor, rider, admin), profiles, funding campaigns with progress bars, investor pledges, rider lease applications, and admin review of pledges and applications. Repayments, leases and earnings dashboards (Sprint 4) are not built yet, but their tables exist in the schema.

## Run locally

1. In Supabase, run `supabase/schema.sql` in the SQL Editor and enable Google under Authentication, Providers.
2. Copy `.env.example` to `.env` and fill it in.
3. Run `npm install`, then `npm --prefix frontend install`.
4. In two terminals run `npm run dev:api` and `npm run dev:web`, then open http://localhost:5173.
5. Make yourself admin with the update statement at the bottom of `schema.sql`.

## Deploy on Vercel

Import the repository as one project and add the four variables from `.env.example`. Vercel builds the frontend and serves the API from the same address, so nothing else is needed. In Supabase, Authentication, URL Configuration, set Site URL to your Vercel address.

## Demo walkthrough

1. Sign in as admin, create a campaign.
2. Sign in as an investor, pledge to it.
3. As admin, confirm the pledge and watch the progress bar move.
4. Sign in as a rider, send an application. As admin, approve it.
