## API Documentation

**Version:** 1.1
**Status:** Final
**Last Updated:** July 2026
**Author:** Subrat Kumar Jena

## 1. Overview

This document describes the API endpoints exposed by the platform's two backend services: the **Forecast & Simulation Service** (`backend/main.py`) and the **AI Briefing Service** (`backend/app.py`), verified directly against source code.

## 2. Scope

**In Scope:** All verified routes across both backend services — method, request/response shape, and validation, as implemented.

**Out of Scope:** System-level architecture (see `01_System_Architecture.md`), setup instructions (see `03_Implementation_Guide.md`), end-user dashboard usage (see `04_User_Guide.md`).

## 3. API Architecture

The Next.js frontend communicates with two independent FastAPI services over HTTP. The Forecast & Simulation Service is reached through a Next.js rewrite proxy configuration; the AI Briefing Service is called directly at its Render-hosted URL. Both services are stateless per request, with the AI Briefing Service using an in-memory job store to support asynchronous polling.

## 4. Authentication

Neither backend service performs server-side authentication on incoming requests — no token or session check is present on any route in either application. User identity is managed at the frontend layer via Supabase Auth. CORS on both services is configured to accept requests from any origin.

## 5. API Endpoints

### 5.1 Forecast & Simulation Service (`main.py`)

#### `GET /`

| Field | Value |
|---|---|
| **Purpose** | Health check |
| **Method** | GET |
| **Request** | None |
| **Response** | `{"status": "online", "project": "Cashflow Forecasting & Risk Simulation for Freelancers"}` |
| **Validation** | None |
| **Status** | ✅ Implemented |

---

#### `POST /simulate`

| Field | Value |
|---|---|
| **Purpose** | Run a "what-if" scenario simulation against a user's Prophet forecast baseline |
| **Method** | POST |
| **Request** | JSON body — `{"user_id": str, "risk_level": str, "window": int}`. `risk_level` accepts `"Safe"`, `"Stable"`, `"Critical"`; other values apply a neutral multiplier. |
| **Response** | `{"status": "success", "data": [...forecast points with yhat, yhat_upper, yhat_lower...], "score": int}` |
| **Validation** | Pydantic model validation on the request body |
| **Status** | ✅ Implemented |

**Error responses:**

| Status Code | Trigger | Response Body |
|---|---|---|
| 404 | No transaction history for the given `user_id` | `{"detail": "Data Void: No transaction history found for ID {user_id}."}` |
| 500 | Unhandled processing error | `{"detail": "Engine Failure: {error message}"}` |

---

#### `GET /forecast/{user_id}`

| Field | Value |
|---|---|
| **Purpose** | Return the raw 30-day Prophet forecast and current balance for a user |
| **Method** | GET |
| **Request** | Path parameter — `user_id: str` |
| **Response** | `{"status": "success", "data": {"forecast": [...], "current_balance": float}}` |
| **Validation** | FastAPI automatic path-parameter type coercion |
| **Status** | ✅ Implemented |

**Error responses:**

| Status Code | Trigger | Response Body |
|---|---|---|
| 404 | No transaction data for `user_id` | `{"detail": "User data not found."}` |
| 500 | Unhandled processing error | `{"detail": "{error message}"}` |

---

### 5.2 AI Briefing Service (`app.py`)

#### `GET /`

| Field | Value |
|---|---|
| **Purpose** | Health check |
| **Method** | GET |
| **Request** | None |
| **Response** | `{"status": "online", "engine": "Prophet AI V1.1", "location": "Singapore"}` |
| **Validation** | None |
| **Status** | ✅ Implemented |

---

#### `POST /briefing`

| Field | Value |
|---|---|
| **Purpose** | Submit financial data for AI strategy analysis and voice briefing generation |
| **Method** | POST |
| **Request** | JSON body — `{"balance": float, "burn_rate": float, "active_scenario": str, "language": str = "en", "transactions": [{"amount": float, "date": str, "category": str, "user_id": str, "integrity_hash": str, "client"?: str, "status"?: str, "risk"?: str}]}` |
| **Response** | `{"job_id": str}` — processing runs as a background task |
| **Validation** | Pydantic model validation on the request body |
| **Status** | ✅ Implemented |

---

#### `GET /briefing-status/{job_id}`

| Field | Value |
|---|---|
| **Purpose** | Poll for the result of a submitted briefing job |
| **Method** | GET |
| **Request** | Path parameter — `job_id: str` |
| **Response** | `{"status": "processing" \| "complete" \| "failed" \| "not_found", "data"?: {"analysis": {"risk_level": str, "strategic_actions": [str]}, "audio_url": str}, "error"?: str}` |
| **Validation** | None beyond path-parameter typing |
| **Status** | ✅ Implemented |

## 6. Error Handling

Both services follow a similar pattern: known failure conditions (missing data, job not found) return descriptive messages; unhandled exceptions are caught and surfaced as generic error responses. The AI Briefing Service reports job failures through the polling endpoint's `status: "failed"` state rather than an HTTP error code, since the originating request (`POST /briefing`) returns immediately before processing completes.

## 7. Security

- Neither service enforces authentication on its endpoints; both rely on the frontend's Supabase Auth session for user identity
- Both services accept cross-origin requests from any origin
- Error responses on the Forecast & Simulation Service include underlying exception text, which should be scoped down in a hardened production deployment

## 8. Constraints

- The AI Briefing Service's job store is in-memory; job status will not survive a service restart
- `POST /simulate` is registered twice in source with identical behavior
- `risk_level` in `POST /simulate` has no strict enum validation; unrecognized values fall back to a neutral multiplier rather than returning a validation error
- The `window` field accepted by `POST /simulate` is not reflected in the current response logic

## 9. Assumptions

This document reflects only the routes verified directly in `backend/main.py` and `backend/app.py`. No endpoint, field, or status code has been inferred from frontend code or the README.
