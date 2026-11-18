# MOTARI Fund Project Handover Document

**Project**: MOTARI Fund (Kigali E-Moto Micro-Financing Platform)  
**Repository**: `https://github.com/Jtuyishime6/motari-fund.git`  
**Branch**: `main`  
**Local Workspace**: `c:\Users\user\Desktop\motari-fund`  
**Founder & Lead**: Jean de Dieu Tuyishime  

---

## 1. Executive Summary

MOTARI Fund is a decentralized micro-investment platform powering Kigali's transition to electric motorcycle taxis. Everyday investors pool capital starting from 10,000 RWF to fund commercial-grade electric motorcycles (e-motos) from verified manufacturers such as Spiro, Ampersand, and Roam. Verified taxi-moto riders lease these vehicles on a 24-month path to ownership, generating stable yields for investors while cutting carbon emissions and operational fuel costs in Kigali.

The system is architected as a lightweight monorepo ready for immediate local development and zero-configuration serverless deployment on Vercel.

---

## 2. System Architecture

```
motari-fund/
├── api/
│   └── index.js             # Vercel serverless entry point wrapping the Express API
├── backend/
│   └── src/
│       ├── app.js           # Express app, CORS, routes (/me, /campaigns, /pledges, /applications)
│       ├── db.js            # Supabase service role client initialization
│       └── server.js        # Local standalone HTTP server (port 4000)
├── frontend/
│   ├── public/
│   │   └── images/          # Local static assets (MOTARI Logo, Spiro, Ampersand, JD)
│   ├── src/
│   │   ├── Admin.jsx        # Admin review dashboard (pledge verification, rider approvals)
│   │   ├── App.jsx          # Main shell, role switcher, navigation, session listener
│   │   ├── Campaigns.jsx    # 3-column e-moto grid and pledge modal
│   │   ├── Investor.jsx     # Investor portfolio, yield stats, pledge history
│   │   ├── LandingPage.jsx  # Public landing page matching live brand standards
│   │   ├── lib.js           # Supabase client and API fetch wrapper
│   │   ├── main.jsx         # React DOM mount point
│   │   ├── Onboarding.jsx   # Clean profile creation for new users
│   │   ├── Rider.jsx        # 4-stage rider lease tracker and application form
│   │   ├── styles.css       # Unified design system, responsive layout, animations
│   │   └── ui.jsx           # SVG icon set, badges, modals, skeletons
│   ├── index.html           # HTML template
│   ├── package.json         # Frontend dependencies and Vite scripts
│   └── vite.config.js       # Vite configuration with /api proxy to port 4000
├── supabase/
│   └── schema.sql           # Database schema, foreign keys, RLS security policies
├── .env.example             # Template for required environment variables
├── package.json             # Root monorepo scripts (build, dev:api, dev:web, start)
├── vercel.json              # Vercel routing rules (/api/* to api/index.js, others to frontend/dist)
└── HANDOVER.md              # Project handover and maintenance guide
```

---

## 3. Database Specification (Supabase)

### 3.1 Connected Instance
* **Project Reference**: `ylterissixuxgmzbpmiq`
* **API URL**: `https://ylterissixuxgmzbpmiq.supabase.co`

### 3.2 Tables and Relationships
1. **`profiles`**: Linked directly to `auth.users(id)` via trigger. Stores `role` (`investor`, `rider`, `admin`), `full_name`, `phone`, and `district`.
2. **`campaigns`**: Stores e-moto vehicle campaigns. Includes `model`, `target` amount (RWF), `raised` amount (RWF), `lease_months`, `status` (`active`, `funded`, `closed`), and `photo_url`.
3. **`pledges`**: Capital commitments made by investors. Includes `campaign_id`, `investor_id`, `amount`, `momo_ref`, and `status` (`pending`, `confirmed`, `rejected`).
4. **`rider_applications`**: Lease requests submitted by moto operators. Includes `rider_id`, `permit_number`, `years_experience`, `cooperative`, `daily_income`, `status` (`pending`, `approved`, `rejected`), and optional `reason`.
5. **`leases`**: Active contract records matching funded campaigns to approved riders.
6. **`repayments`**: Repayment schedules and Momo ledger entries per lease.

### 3.3 Active Seed Campaigns
The production database is seeded with 3 active e-moto campaigns:
* **Ampersand Model 1 Pro**: Target 2,200,000 RWF (75% funded)
* **Spiro Commando E-Bike**: Target 1,950,000 RWF (100% funded)
* **Roam Air Gen-2 Urban**: Target 2,400,000 RWF (41% funded)

### 3.4 Setting an Admin Account
To grant administrative access to an account, execute this query in the Supabase SQL Editor:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

---

## 4. Environment Variables

Create a `.env` file in the project root based on `.env.example`:

| Variable | Description | Exposed To Client |
| :--- | :--- | :--- |
| `SUPABASE_URL` | Supabase project URL (`https://ylterissixuxgmzbpmiq.supabase.co`) | No (Backend only) |
| `SUPABASE_ANON_KEY` | Public anonymous key | No (Backend fallback) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin table updates and bypass RLS | No (Backend only) |
| `VITE_SUPABASE_URL` | Supabase project URL for frontend client | Yes (Bundled in Vite) |
| `VITE_SUPABASE_ANON_KEY` | Public anon key for frontend auth and client queries | Yes (Bundled in Vite) |
| `PORT` | Local API port (Default: `4000`) | No |

> [!IMPORTANT]
> The `.env` file must never be committed to git. It is strictly excluded in `.gitignore`.

---

## 5. Local Development Setup

### 5.1 Prerequisites
* Node.js version 18.0.0 or higher
* npm version 9.0.0 or higher

### 5.2 Initial Setup
```bash
# Clone the repository
git clone https://github.com/Jtuyishime6/motari-fund.git
cd motari-fund

# Install root and backend dependencies
npm install

# Install frontend dependencies
npm --prefix frontend install

# Set up local environment file
cp .env.example .env
# Open .env and insert the live keys
```

### 5.3 Running the Development Servers
Open two terminal windows:

**Terminal 1 (Backend API on http://localhost:4000):**
```bash
npm run dev:api
```

**Terminal 2 (Frontend Web on http://localhost:5173):**
```bash
npm run dev:web
```

Open `http://localhost:5173` in any modern web browser. Vite proxies all `/api` requests to `http://localhost:4000`.

---

## 6. Vercel Deployment Guide

MOTARI Fund is configured to deploy as a unified single project on Vercel without requiring separate projects for frontend and backend.

### 6.1 Deployment Steps
1. Push the repository to GitHub: `https://github.com/Jtuyishime6/motari-fund.git`.
2. Log into the Vercel Dashboard and click **Add New...** > **Project**.
3. Import the `motari-fund` repository.
4. Keep the default settings:
   * **Framework Preset**: `Other`
   * **Root Directory**: `./` (leave blank or select root)
   * **Build Command**: `npm run build`
   * **Output Directory**: `frontend/dist`
5. Under **Environment Variables**, add the 4 required production variables:
   * `SUPABASE_URL`
   * `SUPABASE_ANON_KEY`
   * `SUPABASE_SERVICE_ROLE_KEY`
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy**.

### 6.2 Supabase Auth URL Configuration
Once your Vercel deployment URL is generated (e.g., `https://motari-fund.vercel.app`):
1. Navigate to the **Supabase Dashboard** > **Authentication** > **URL Configuration**.
2. Set **Site URL** to: `https://motari-fund.vercel.app`
3. Under **Redirect URLs**, add:
   * `https://motari-fund.vercel.app`
   * `https://motari-fund.vercel.app/**`
   * `http://localhost:5173` (for local development)
4. Under **Authentication** > **Providers** > **Google**, ensure Google OAuth is enabled and that your Google Cloud Console OAuth redirect points to `https://ylterissixuxgmzbpmiq.supabase.co/auth/v1/callback`.

---

## 7. Frontend User Flows and Screens

1. **Visitor Landing Page (`LandingPage.jsx`)**:
   * Hero banner with live metrics (50,000+ motorcycles, 1.5M+ daily trips, up to 65% return).
   * Problem statement and solution sections.
   * Real fleet showcase featuring Spiro and Ampersand e-motos.
   * "How It Works" 3-step guide for investors and riders.
   * "Available E-Motos for Funding" displaying exactly 3 active campaigns.
   * Environmental and social impact statistics.
   * Leadership profile for Founder & CEO Jean de Dieu Tuyishime.
   * Global footer with quick section navigation and contact information.

2. **Sign-In & Onboarding (`Onboarding.jsx`)**:
   * Single-click Google OAuth authentication.
   * New users enter full name, mobile money phone number, and district.
   * Select primary role (Investor or Rider).
   * Clean view with marketing footers excluded during profile completion.

3. **Investor Portal (`Investor.jsx`)**:
   * Summary metric cards: Total capital pledged, count of funded e-motos, clean kilometers driven.
   * Detailed pledge history list with Mobile Money transaction references and status badges.
   * Direct shortcut to browse active campaigns.

4. **Rider Portal (`Rider.jsx`)**:
   * 4-step progressive timeline tracker: Submitted > Verification > Allocation > Active Lease.
   * Lease application form: Driving permit number, years of riding experience, taxi-moto cooperative name, daily revenue.
   * Transparent rejection feedback with admin-provided reasons.

5. **Admin Portal (`Admin.jsx`)**:
   * Pledge verification: Approve or reject incoming Mobile Money transactions.
   * Rider review: Check driving permits and cooperative affiliations, then approve or reject with feedback.
   * Campaign management: Launch new campaigns with presets for Ampersand, Spiro, and Roam models.

6. **Interactive Demo Role Switcher**:
   * The top navigation bar includes an instant role toggle (Investor / Rider / Admin) to allow seamless end-to-end demonstrations without logging in and out.

---

## 8. Verification and Quality Audit

* **Typography & Content**: Wordy explanations eliminated. Zero em dashes used in any source files or documentation.
* **Layout Stability**: Horizontal overflow prevented with `overflow-x: hidden`. Scrollbar jitter eliminated using `scrollbar-gutter: stable`.
* **Asset Integrity**: High-resolution brand assets placed in `frontend/public/images/`.
* **Build Verification**: `npm run build` succeeds with zero errors in standard environments.
