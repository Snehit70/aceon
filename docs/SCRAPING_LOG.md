# Scraping & Data Extraction Log

**Date:** January 24, 2026
**Target:** IITM BS Student Dashboard (ds.study.iitm.ac.in)

## 1. Authentication Strategy

We successfully identified that the Student Dashboard uses **Firebase Authentication**.
The token is stored in the browser's IndexedDB (`firebaseLocalStorageDb`).

**Tool**: `extract_token.html` (JavaScript snippet)
**Status**: ✅ Token successfully extracted.
**Type**: JWT (Firebase ID Token)
**Audience**: `online-degree-app`

## 2. API Discovery & Probing

We attempted to use the extracted token to fetch course data from suspected API endpoints.

| Method | Endpoint | Result | Notes |
|---|---|---|---|
| **GET** | `ds.study.iitm.ac.in/student_dashboard/student_courses` | ❌ **Failed** | Unsupported Protocol / Redirect. Likely a frontend route, not API. |
| **GET** | `ds.study.iitm.ac.in/api/student_dashboard/student_courses` | ❌ **404** | Endpoint guess incorrect. |
| **GET** | `seek-ode-prod.el.r.appspot.com/backendapi/student/courses` | ❌ **404** | Legacy backend endpoint not found. |
| **POST** | `open-nptel-nk7eaoz6ha-el.a.run.app/graphql` | ❌ **401** | Unauthorized. The Firebase token was rejected. Endpoint might require `x-access-token` or different audience. |

## 3. Scripts & Tools

We created temporary scripts to assist with probing:

*   `scripts/analyze-data.ts`: successfully parsed local `data/` JSONs to generate the integrity report.
*   `scripts/probe-courses.ts`: Automated fetching of multiple guessed URLs.
*   `scripts/probe-graphql.ts`: Attempted Schema Introspection on the discovered GraphQL endpoint.
*   `scripts/probe-rest.ts`: Attempted to fetch a known course (`cs1001`) from the `seek-ode` backend.

## 4. Findings & Next Steps

*   **Frontend Routing**: The URL structure in the browser (`/student_dashboard`) does not map 1:1 to API endpoints.
*   **Backend Split**:
    *   `ds.study.iitm.ac.in` handles Auth & Dashboard UI.
    *   `seek-ode-prod...` handles Video Assets (VTT).
    *   `open-nptel...` (Cloud Run) likely handles the core Data API (GraphQL), but auth is the barrier.
*   **Recommendation**: Use Browser DevTools (Network Tab) to capture the *exact* XHR/Fetch request made when loading the "My Courses" page. Look for the `Authorization` header to see if it matches the Firebase token or if there's an exchange for a session cookie/token.
