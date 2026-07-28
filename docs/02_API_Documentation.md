**API Documentation**

**Version:** 1.0  
**Last Updated:** July 2026  
**Author:** Subrat Kumar Jena  

**1\. Overview**

This document describes the API endpoints exposed by the platform's FastAPI backend (backend/main.py), verified directly against source code. Backend source code is the highest-authority source used in this document; the README's marketing description of the forecasting engine is not used where it conflicts with verified route behavior (see 01_System_Architecture.md for the full correction).

**2\. Scope**

**In Scope:** The three verified routes in backend/main.py - their methods, request/response shape, and validation, exactly as implemented.

**Out of Scope:** System-level architecture (see 01_System_Architecture.md), setup instructions (see 03_Implementation_Guide.md), end-user dashboard usage (see 04_User_Guide.md).

**3\. API Architecture**

The Next.js frontend is documented to communicate with a FastAPI backend over HTTP, using axios (verified in frontend/hooks/useForecast.ts). **Repository inconsistency disclosed rather than hidden:** the specific URL called by the frontend does not match any backend deployment documented elsewhere in this repository, and no environment-variable-based API base URL was found to reconcile this. This document describes the backend routes as implemented in backend/main.py, independent of which URL the frontend is currently pointed at.

**4\. Authentication**

**No authentication mechanism is present on any FastAPI route.** No Depends(), header check, or token validation exists in main.py. CORS is configured with allow_origins=\["\*"\], accepting requests from any origin. User identity (user_id) is passed as a plain request field/path parameter with no server-side verification that the caller owns that user_id. Supabase Auth is used on the frontend for user session management, but this is not enforced by the backend API itself.

**5\. API Endpoints**

**GET /**

| **Field**      | **Value**                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------- |
| **Purpose**    | Health check                                                                              |
| **Method**     | GET                                                                                       |
| **Request**    | None                                                                                      |
| **Response**   | {"status": "online", "project": "Cashflow Forecasting & Risk Simulation for Freelancers"} |
| **Validation** | None                                                                                      |
| **Status**     | Implemented                                                                               |

**POST /simulate**

| **Field**      | **Value**                                                                                                                                                                                                                                                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**    | Run a "what-if" scenario simulation against a user's live Prophet forecast baseline                                                                                                                                                                                                                                                            |
| **Method**     | POST                                                                                                                                                                                                                                                                                                                                           |
| **Request**    | JSON body - SimRequest: {"user_id": str, "risk_level": str, "window": int}. risk_level accepted values verified in code: "Safe", "Stable", "Critical" (any other value defaults to a 1.0 multiplier). window is accepted as an integer but is **not used anywhere in the verified route logic** - it has no observable effect on the response. |
| **Response**   | {"status": "success", "data": \[{...forecast points with yhat, yhat_upper, yhat_lower...}\], "score": int}. score is computed as max(min(int(72 \* factor), 100), 10) - a fixed formula based on the scenario multiplier, not a model output.                                                                                                  |
| **Validation** | Pydantic model validation on request body only (user_id: str, risk_level: str, window: int). No range/enum validation on risk_level - invalid values silently fall back to a neutral multiplier rather than raising an error.                                                                                                                  |
| **Status**     | Implemented (with disclosed dead parameter and silent fallback behavior)                                                                                                                                                                                                                                                                       |

**Verified error responses:**

| **Status Code** | **Trigger**                                        | **Response Body**                                                       |
| --------------- | -------------------------------------------------- | ----------------------------------------------------------------------- |
| 404             | No transaction history found for the given user_id | {"detail": "Data Void: No transaction history found for ID {user_id}."} |
| 500             | Any other exception during processing              | {"detail": "Engine Failure: {error message}"}                           |

**GET /forecast/{user_id}**

| **Field**      | **Value**                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| **Purpose**    | Return the raw 30-day Prophet forecast and current balance for a user, with no scenario simulation applied |
| **Method**     | GET                                                                                                        |
| **Request**    | Path parameter - user_id: str                                                                              |
| **Response**   | {"status": "success", "data": {"forecast": \[...\], "current_balance": float}}                             |
| **Validation** | No explicit validation beyond FastAPI's automatic path-parameter type coercion (string)                    |
| **Status**     | Implemented                                                                                                |

**Verified error responses:**

| **Status Code** | **Trigger**                                       | **Response Body**                  |
| --------------- | ------------------------------------------------- | ---------------------------------- |
| 404             | user_id has no transaction data (empty DataFrame) | {"detail": "User data not found."} |
| 500             | Any other exception                               | {"detail": "{error message}"}      |


**6\. Error Handling**

Both /simulate and /forecast/{user_id} follow the same pattern: a try/except block catches HTTPException explicitly (re-raised as-is) and falls back to a generic 500 with the raw exception message for anything else. There is no structured error code system beyond standard HTTP status codes (404, 500) and no distinct error types - all unhandled failures surface as a raw Python exception string in the response body.

**7\. Security**

- No server-side authentication on any route (see Section 4)
- CORS fully permissive (allow_origins=\["\*"\])
- 500 error responses include raw exception text (e.g., f"Engine Failure: {str(e)}"), which may leak internal implementation details in a production environment
- advisor.py and generator.py contain functionality (Gemini-based advisory logic, synthetic data generation) that is not exposed via any route in this API - not a security concern per se, but noted as dead code with no current attack surface

**8\. Constraints**

- window field in POST /simulate's request body is accepted but has no verified effect on the response
- risk_level has no server-side enum validation; unrecognized values silently default rather than returning a 422
- The /simulate route is registered twice in main.py with identical logic - a real code duplication, functionally harmless since both definitions are identical
- No pagination, rate limiting, or request throttling was found on any route
- The frontend does not verifiably call these exact routes at their documented paths - it calls a different, unconfirmed external URL (see 01_System_Architecture.md, Section 9)

**9\. Assumptions**

This document reflects only the three routes verified directly in backend/main.py at the time of writing. No endpoint, field, or status code has been inferred from frontend code, filenames, or the README. Where frontend behavior (useForecast.ts) could not be reconciled with backend routes, the discrepancy is disclosed rather than resolved by assumption.
