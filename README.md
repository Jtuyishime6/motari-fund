# Motari Fund

A community micro-investment platform. Small investors pool money from 10,000 RWF to fund electric motorcycles, which are leased to verified moto-taxi riders in Kigali.

## Structure

- `frontend/` React and Vite web app
- `backend/` Node.js and Express API, deployable on Vercel
- `supabase/schema.sql` database tables and Row Level Security

## What works

Google sign-in, roles (investor, rider, admin), profiles, funding campaigns with progress bars, investor pledges, rider lease applications, and admin review of pledges and applications. Repayments, leases and earnings dashboards (Sprint 4) are not built yet, but their tables exist in the schema.

## Run locally

1. In Supabase, open the SQL Editor and run `supabase/schema.sql`.
2. In Supabase, enable Google under Authentication, Providers.
3. Backend: `cd backend`, copy `.env.example` to `.env`, fill it in, then `npm install` and `npm run dev`.
4. Frontend: `cd frontend`, copy `.env.example` to `.env.local`, fill it in, then `npm install` and `npm run dev`.
5. Open http://localhost:5173 and sign in.
6. Make yourself admin by running the update statement at the bottom of `schema.sql` with your email.

The service role key is secret. Use it only in the backend.

## Deploy on Vercel

Create two Vercel projects from this repository.

- Backend: root directory `backend`. Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `FRONTEND_URL` (your frontend URL).
- Frontend: root directory `frontend`. Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and `VITE_API_URL` (your backend URL plus `/api`).
- In Supabase, Authentication, URL Configuration: set Site URL to the frontend URL and add it to Redirect URLs.
- In Google Cloud, the redirect URI stays `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`.

## Demo walkthrough

1. Sign in as admin, create a campaign.
2. Sign in as an investor, pledge to it.
3. As admin, confirm the pledge and watch the progress bar move.
4. Sign in as a rider, send an application. As admin, approve it.
