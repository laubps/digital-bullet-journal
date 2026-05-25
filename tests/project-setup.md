# Step 2 — Project Setup: Test Results

**Date:** 2026-05-24  
**Status:** ✅ Passed

---

## Automated TestsOkay

Run with `npm test`:

```
PASS tests/unit/api/health.test.ts
  GET /api/health
    ✓ returns HTTP 200 (21 ms)
    ✓ returns status "ok" (3 ms)
    ✓ returns an ISO timestamp (1 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Time:        1.302 s
```

---

## Manual Browser Tests

Run with `npm run dev` → open `http://localhost:3000`.

| URL | Expected behaviour | Result |
|-----|--------------------|--------|
| `http://localhost:3000` | Redirects to `/login` | ✅ |
| `http://localhost:3000/login` | Shows login placeholder page | ✅ |
| `http://localhost:3000/signup` | Shows signup placeholder page | ✅ |
| `http://localhost:3000/dashboard` | Redirects to `/login` (middleware blocks unauthenticated access) | ✅ |
| `http://localhost:3000/api/health` | Returns `{"status":"ok","timestamp":"..."}` | ✅ |

<!-- To attach screenshots, save them to tests/assets/ and reference them here:     -->
<!-- ![Health API response](assets/health-api.png)                                  -->
