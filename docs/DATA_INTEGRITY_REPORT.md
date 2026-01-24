# IITM BS Degree - Data Integrity & Architecture Report

**Date:** January 24, 2026
**Status:** Partial Coverage (Foundation + Diploma)

## 1. Curriculum Analysis

Based on official documentation (`academics.md`), the program consists of 4 levels. Our current dataset covers:

| Level | Total Courses | Available | Missing | Coverage |
|---|---|---|---|---|
| **Foundation** | 8 | 8 | 0 | 100% ✅ |
| **Diploma (Prog)** | 6 | 6 | 0 | 100% ✅ |
| **Diploma (DS)** | 6 | 3 | 3 | 50% ⚠️ |
| **Degree (Core)** | 5 | 3 | 2 | 60% ⚠️ |
| **Degree (Elective)**| 38+ | 1 | 37+ | ~2% ❌ |

### Missing Courses (High Priority)

These are core courses required for Diploma/Degree completion that are missing from `data/`:

1.  **BSSE2002**: Tools in Data Science
2.  **BSMS2002**: Business Analytics
3.  **BSDA2001**: Introduction to Deep Learning & Generative AI
4.  **BSCS3001**: Software Engineering
5.  **BSGN3001**: Strategies for Professional Growth

## 2. Data Anomalies

We detected structural anomalies in the existing data that may require manual review:

*   **BSCS2005 (Java)**: Total duration is **96 hours**. This is excessively high compared to the average ~30h. Likely contains unedited raw footage or duplicate entries.
*   **BSMA1001 (Math I)**: Structure shows only **5 Weeks** of content, whereas standard courses have 12 weeks. This might be due to a specific module structure (e.g., "Modules" mapped as "Weeks").

## 3. Technical Architecture (Inferred)

### Infrastructure
*   **Student Portal**: `https://ds.study.iitm.ac.in`
*   **Auth Provider**: Firebase Auth (Google Sign-In).
*   **Video Hosting**: YouTube (Unlisted videos embedded).
*   **Asset/Transcript Host**: `https://seek-ode-prod.el.r.appspot.com` (Google App Engine).
*   **API Layer**:
    *   Likely a REST API at `seek-ode-prod...` (Legacy/Asset access).
    *   GraphQL Endpoint detected at `https://open-nptel-nk7eaoz6ha-el.a.run.app/graphql` (Cloud Run).

### Authentication
*   **Token Type**: Firebase ID Token (JWT).
*   **Audience**: `online-degree-app`.
*   **Storage**: `firebaseLocalStorageDb` (IndexedDB) in browser.

## 4. Scraping Status

*   **Method**: Token extraction via browser console (`extract_token.html`).
*   **Current Blocker**: Direct API probing returned 404/401. The exact endpoints used by the dashboard to fetch course lists are currently unknown.
*   **Next Steps**: Inspect Network tab in browser to identify the exact `course_list` endpoint.

## 5. Course Mapping (Code vs ID)

| Internal Code | Official Code | Course Name | Status |
|---|---|---|---|
| `cs1001` | `BSCS1001` | Computational Thinking | ✅ |
| `cs1002` | `BSCS1002` | Python | ✅ |
| `ma1001` | `BSMA1001` | Math I | ✅ (5 wks) |
| `ma1002` | `BSMA1002` | Stats I | ✅ |
| `cs2001` | `BSCS2001` | DBMS | ✅ |
| `cs2002` | `BSCS2002` | PDSA | ✅ |
| `cs2003` | `BSCS2003` | MAD I | ✅ |
| `cs2004` | `BSCS2004` | ML Foundations | ✅ |
| `cs2005` | `BSCS2005` | Java | ✅ (Duration!) |
| `cs2006` | `BSCS2006` | MAD II | ✅ |
| `cs2007` | `BSCS2007` | ML Techniques | ✅ |
| `cs2008` | `BSCS2008` | ML Practice | ✅ |
| `ms2001` | `BSMS2001` | BDM | ✅ |
| `se2001` | `BSSE2001` | System Commands | ✅ |
