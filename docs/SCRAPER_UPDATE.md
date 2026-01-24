# Scraper Update - Foundation Courses Fix

## Issue
Only 4 out of 8 foundation courses were scraped due to incorrect course codes.

## Root Cause
The scraper used wrong course code mappings:
- ❌ `st1001`, `st1002` → These don't exist
- ❌ `gn1001`, `gn1002` → These don't exist

## Correct Course Codes (from IITM official website)

### Foundation Level - 8 Courses (32 credits)

| Course Code | Backend ID | Course Name |
|-------------|------------|-------------|
| ✅ ma1001 | ns_24t3_ma1001 | Mathematics for Data Science I |
| ✅ ma1002 | ns_24t3_ma1002 | Statistics for Data Science I |
| ✅ cs1001 | ns_24t3_cs1001 | Computational Thinking |
| ✅ cs1002 | ns_24t3_cs1002 | Programming in Python |
| ❌ ma1003 | ns_24t3_ma1003 | Mathematics for Data Science II |
| ❌ ma1004 | ns_24t3_ma1004 | Statistics for Data Science II |
| ❌ hs1001 | ns_24t3_hs1001 | English I |
| ❌ hs1002 | ns_24t3_hs1002 | English II |

✅ = Already scraped
❌ = Missing (needs to be scraped)

## Fix Applied
Updated `scripts/scrape-backend.ts` line 104-113 with correct course codes.

## Next Steps
1. Get fresh authentication token from `extract_token.html`
2. Run `bun run scripts/scrape-backend.ts` to fetch missing courses
3. Run `bun run scripts/seed-database.ts` to sync to Convex database

## Files Modified
- `scripts/scrape-backend.ts` - Updated foundation course codes

## Reference
- Source: https://study.iitm.ac.in/ds/academics.html
- Scribd doc: https://www.scribd.com/document/941077329/IITM-Bs-Degree-Course-List
