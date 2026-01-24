# Scraping Intelligence 🕵️‍♂️

**Last Updated:** Jan 24, 2026
**Source:** Requestly HAR Logs (`requestly_logs_part_2.har`)

## 🎯 Target Endpoint

- **URL**: `https://open-nptel-nk7eaoz6ha-el.a.run.app/graphql`
- **Method**: `POST`

## 🔑 Authentication & Headers

To bypass the `401 Unauthorized` error, the following headers are required. These were extracted from a valid browser session.

| Header | Value | Description |
| :--- | :--- | :--- |
| `seek_id_token` | `[Content of secret_token.txt]` | Firebase/Google Auth Token (Expires ~1 hour) |
| `seek_namespace` | `ns_25t3_cs2006` | Namespace identifier |
| `exam_session` | `6f504f68-80a7-4fba-9b39-86c51b19a230` | Session UUID |

## 🔄 Workflow Diagram

```ascii
+-----------------+       +-------------------+       +----------------------+
|  User (Browser) |       |  Requestly (HAR)  |       |   Aceon Scraper      |
+--------+--------+       +---------+---------+       +-----------+----------+
         |                          |                             |
         | 1. Login to Seek         |                             |
         +------------------------->|                             |
         | 2. Intercept GraphQL     |                             |
         |    Request               |                             |
         +------------------------->|                             |
                                    | 3. Export HAR / Copy cURL   |
                                    +---------------------------->|
                                                                  |
                                             4. Parse Headers     |
                                          (seek_id_token, etc.)   |
                                                                  |
+-----------------+                                               |
|   Open NPTEL    |                                               |
|   (GraphQL)     |<----------------------------------------------+
+--------+--------+       5. POST /graphql (Authenticated)
         |
         |
         | 6. Return JSON Data (Courses/Videos)
         +---------------------------------------------->+------------------+
                                                         |  ./data/*.json   |
                                                         +------------------+
```

## 📋 Missing Courses Data

We need to scrape the following courses which were missing from the previous run:

1.  **BSSE2002**
2.  **BSMS2002**
3.  **BSDA2001**
4.  **BSCS3001**
5.  **BSGN3001**

## 🛠️ Action Plan

1.  Read `seek_id_token` from `secret_token.txt`.
2.  Construct GraphQL request with the headers above.
3.  Query for the missing courses.
4.  Save results to `data/` directory.

## 📝 Token Extraction Note

The `seek_id_token` is a JWT. If it expires, capture a new `graphql` request from the [Seek Portal](https://seek.onlinedegree.iitm.ac.in/) using Requestly/Network tab and extract the `seek_id_token` header.
