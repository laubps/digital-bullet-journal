# Step 3 — DB Connection: Test Results

**Date:** 2026-05-25  
**Status:** ✅ Passed

---

## Automated Tests

Run with `npm test`:

```
PASS tests/unit/lib/db/pool.test.ts
PASS tests/unit/lib/db/vault.test.ts
PASS tests/unit/api/health.test.ts

Test Suites: 3 passed, 3 total
Tests:       20 passed, 20 total
Time:        6.159 s
```

### pool.test.ts — Connection pool singleton

| # | Test | Result |
|---|------|--------|
| 1 | creates a pool with the correct mTLS configuration | ✅ |
| 2 | returns the same pool instance on subsequent calls (singleton) | ✅ |
| 3 | throws when `DB_WALLET_LOCATION` env var is missing | ✅ |
| 4 | closes the pool with drain timeout 0 and resets the singleton | ✅ |
| 5 | does nothing when called before the pool is initialised | ✅ |

### vault.test.ts — OCI Vault credential fetching

| # | Test | Result |
|---|------|--------|
| 6 | fetches, base64-decodes, and returns credentials | ✅ |
| 7 | caches credentials — Vault is called only once across multiple calls | ✅ |
| 8 | throws when `OCI_CONFIG_FILE` env var is missing | ✅ |
| 9 | throws when `VAULT_SECRET_OCID` env var is missing | ✅ |
| 10 | throws when secret content is empty | ✅ |
| 11 | throws when required key `db_user` is missing from the secret JSON | ✅ |
| 12 | throws when required key `db_password` is missing from the secret JSON | ✅ |
| 13 | throws when required key `wallet_password` is missing from the secret JSON | ✅ |
| 14 | throws when required key `connection_string` is missing from the secret JSON | ✅ |

### health.test.ts — `/api/health` route

| # | Test | Result |
|---|------|--------|
| 15 | returns HTTP 200 (DB healthy) | ✅ |
| 16 | returns status `"ok"` and db `"connected"` | ✅ |
| 17 | returns a valid ISO timestamp within the test window | ✅ |
| 18 | closes the DB connection after the check | ✅ |
| 19 | returns HTTP 503 (DB unreachable) | ✅ |
| 20 | returns status `"degraded"` and db `"error"` | ✅ |

> The two `console.error` outputs in the health test are expected — they are produced intentionally by the "DB unreachable" test cases to verify the route logs failures correctly.

---

## Manual Tests

Run with `npm run dev` → open `http://localhost:3000`.

| URL | Expected behaviour | Result |
|-----|--------------------|--------|
| `http://localhost:3000` | Redirects to `/login` | ✅ |
| `http://localhost:3000/login` | Shows login placeholder page | ✅ |
| `http://localhost:3000/api/health` | Returns `{"status":"ok","db":"connected","timestamp":"..."}` | ✅ |

<!-- To attach screenshots, save them to tests/assets/ and reference them here:  -->
<!-- ![Health API response](assets/health-api.png)                               -->
