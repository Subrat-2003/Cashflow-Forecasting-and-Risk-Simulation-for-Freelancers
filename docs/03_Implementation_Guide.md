# Cashflow Forecasting & Risk Simulation Platform
## Implementation Guide

**Version:** 1.1
**Status:** Final
**Last Updated:** July 2026
**Author:** Subrat Kumar Jena

---

## 1. Overview

This guide explains how to set up, run, and deploy the Cashflow Forecasting & Risk Simulation Platform. The platform consists of a Next.js frontend and **two independent FastAPI backend applications** — the Forecast & Simulation Service and the AI Briefing Service — backed by Supabase (PostgreSQL) and a scheduled Offline Training Pipeline. This guide assumes familiarity with the architecture described in `01_System_Architecture.md` and the endpoint contracts in `02_API_Documentation.md`.

## 2. Repository Structure

```
Cashflow-Forecasting-and-Risk-Simulation-for-Freelancers/
├── frontend/                  # Next.js 14 application
│   ├── app/                   # Pages and components
│   ├── hooks/                 # Data-fetching hooks
│   ├── lib/                   # Supabase client
│   └── next.config.mjs        # API rewrite configuration
├── backend/
│   ├── main.py                 # Forecast & Simulation Service
│   ├── prophet_engine.py       # Live Prophet forecasting logic
│   ├── app.py                  # AI Briefing Service
│   ├── advisor.py               # Supporting module (not on live request path)
│   ├── generator.py             # Supporting module (not on live request path)
│   ├── stochastic_engine.py     # Offline Training Pipeline: trains Stacking Ensemble
│   ├── forecaster.py            # Offline Training Pipeline: blends and deploys predictions
│   └── requirements.txt
├── .github/workflows/
│   └── daily_forecast.yml       # Nightly Offline Training Pipeline
├── assets/                      # Architecture diagrams, screenshots
└── README.md
```

## 3. Prerequisites

| Requirement | Notes |
|---|---|
| Node.js | Required to run the Next.js frontend (`frontend/package.json` targets Next.js 14) |
| Python 3.13 | Required for both backend services and the Offline Training Pipeline |
| Supabase account | Provides the PostgreSQL database and authentication |
| Groq API key | Required for the AI Briefing Service |
| Git | To clone the repository |

## 4. Technology Requirements

| Layer | Stack |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Recharts, @supabase/supabase-js, axios |
| Forecast & Simulation Service | Python 3.13, FastAPI, Prophet |
| AI Briefing Service | Python 3.13, FastAPI, Groq SDK, edge-tts |
| Offline Training Pipeline | XGBoost, Random Forest (scikit-learn), joblib, pandas |
| Database | Supabase (PostgreSQL, Row-Level Security, Auth) |
| CI/CD | GitHub Actions |

## 5. Environment Variables

Only variables confirmed directly in source code are listed. Any variable not listed here is not disclosed in the repository.

### Frontend

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL, used by the frontend Supabase client |
| `NEXT_PUBLIC_SUPABASE_KEY` | Supabase anon/public key |
| `NEXT_PUBLIC_API_URL` | Base URL used by the Next.js rewrite proxy to reach the Forecast & Simulation Service |

### Forecast & Simulation Service

No environment variables are explicitly confirmed in this service's source code beyond its Supabase connectivity, which is not enumerated in the repository.

### AI Briefing Service

| Variable | Purpose |
|---|---|
| `PROPHET_AI_V1_Groq_key` | Authenticates requests to the Groq API for financial strategy analysis |

### GitHub Actions (Offline Training Pipeline)

| Secret | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL, used by the nightly workflow |
| `SUPABASE_KEY` | Supabase key, used by the nightly workflow |

### Database

Supabase project configuration (URL and keys) is shared across the frontend and the GitHub Actions workflow, as listed above. No separate database-only variables are disclosed.

## 6. Installing Dependencies

### Frontend

```bash
cd frontend
npm install
```

### Forecast & Simulation Service

```bash
cd backend
pip install -r requirements.txt
```

### AI Briefing Service

The AI Briefing Service (`app.py`) shares the same `backend/requirements.txt`, which includes its dependencies (FastAPI, Groq SDK, edge-tts). No separate requirements file is present.

```bash
cd backend
pip install -r requirements.txt
```

## 7. Running Both FastAPI Applications

The platform runs **two independent FastAPI applications** from the same `backend/` directory. Each must be started separately.

| Service | File | Frontend Feature It Serves |
|---|---|---|
| Forecast & Simulation Service | `backend/main.py` | Dashboard cashflow forecast, scenario simulation |
| AI Briefing Service | `backend/app.py` | AI-generated financial strategy briefing with voice narration |

**Running the Forecast & Simulation Service:**

```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Running the AI Briefing Service:**

```bash
cd backend
uvicorn app:app --reload --port 8001
```

Both services run independently and must be running simultaneously for the full dashboard experience (forecasting and AI briefing) to function locally.

## 8. Running the Frontend

```bash
cd frontend
npm run dev
```

The frontend's rewrite configuration (`next.config.mjs`) proxies requests made to `/api/:path*` to the Forecast & Simulation Service, using `NEXT_PUBLIC_API_URL` (defaulting to `http://127.0.0.1:8000` if unset). The AI Briefing Service is called directly at its own hosted URL from within the frontend code, rather than through this proxy.

## 9. GitHub Actions — Nightly Forecast Pipeline

| Attribute | Detail |
|---|---|
| **Workflow file** | `.github/workflows/daily_forecast.yml` (also duplicated at `backend/.github/workflows/daily_forecast.yml`) |
| **Cron schedule** | `0 0 * * *` — runs daily at 00:00 UTC |
| **Manual trigger** | Supported via `workflow_dispatch` |
| **Steps** | Checkout code → set up Python 3.13 → install dependencies (`supabase`, `pandas`, `xgboost`, `prophet`, `joblib`, `scikit-learn`, `python-dotenv`) → run `python backend/forecaster.py` |
| **Required secrets** | `SUPABASE_URL`, `SUPABASE_KEY` |
| **Purpose** | Trains the Stacking Ensemble (`stochastic_engine.py` output consumed by `forecaster.py`) and writes updated predictions to Supabase on a nightly schedule, independent of the live Forecast & Simulation Service |

## 10. Production Deployment

| Component | Deployment | Notes |
|---|---|---|
| Frontend | Vercel — live at `cashflow-forecasting-and-risk-simul.vercel.app` | Confirmed live deployment |
| AI Briefing Service | Render (Singapore region) | Confirmed via the service's own health-check response and the URL the frontend calls directly |
| Forecast & Simulation Service | Reached through the frontend's rewrite proxy | Underlying hosting platform is not documented in the repository |
| Supabase | Managed Supabase cloud project | Provides PostgreSQL, Auth, and Row-Level Security |
| GitHub Actions | GitHub-hosted runners (`ubuntu-latest`) | Executes the nightly Offline Training Pipeline |

No hosting details beyond what is listed above are documented in the repository; this guide does not assume or invent additional infrastructure.

## 11. Troubleshooting

| Issue | Likely Cause | Resolution |
|---|---|---|
| Frontend fails to start with a Supabase error | `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_KEY` missing from `.env.local` | Set both variables; the Supabase client throws a hard error if either is missing |
| Forecast requests fail locally | Forecast & Simulation Service not running, or `NEXT_PUBLIC_API_URL` not pointing to it | Confirm the service is running on the expected port and the rewrite proxy target is correct |
| AI Briefing requests fail | AI Briefing Service not running, or `PROPHET_AI_V1_Groq_key` is unset | Start the AI Briefing Service with `uvicorn app:app --reload --port 8001` and confirm `PROPHET_AI_V1_Groq_key` is set |
| GitHub Actions workflow fails | `SUPABASE_URL` or `SUPABASE_KEY` repository secrets not configured | Add both secrets under the repository's Actions settings |
| Duplicate workflow runs | Workflow file exists in two locations in the repository | Be aware both `.github/workflows/daily_forecast.yml` and `backend/.github/workflows/daily_forecast.yml` exist; only the root-level `.github/workflows/` path is recognized by GitHub Actions |
| AI Briefing appears to hang | Job store is in-memory on the AI Briefing Service; a service restart during polling will lose job state | Resubmit the briefing request |

## 12. Known Limitations

- The Forecast & Simulation Service's production hosting platform is not documented in the repository
- The AI Briefing Service stores job state in memory only; it does not persist across restarts
- The Offline Training Pipeline updates a fixed evaluation record on a nightly schedule, separate from the live per-user forecast
- The `/simulate` route is registered twice in source with identical behavior — harmless, but present
- The GitHub Actions workflow file is duplicated in two locations in the repository
- Neither backend service performs its own server-side authentication check; identity is managed at the frontend layer via Supabase Auth
