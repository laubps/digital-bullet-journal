# Step 4 — Authentication: Test Results

**Date:** 2026-05-27
**Status:** ✅ Passed

---

## Automated Tests

Run with `npm test`:

```
PASS tests/unit/lib/auth/validation.test.ts
PASS tests/unit/lib/auth/validation-signup.test.ts
PASS tests/unit/lib/auth/password.test.ts
PASS tests/unit/lib/auth/jwt.test.ts
PASS tests/unit/api/login.test.ts
PASS tests/unit/api/signup.test.ts

Test Suites: 9 passed, 9 total   (includes 3 from Step 3)
Tests:       72 passed, 72 total
Time:        5.167 s
```

---

### validation.test.ts — Login input validation

| # | Test | Result |
|---|------|--------|
| 1 | `EMAIL_REGEX` accepts valid email: `a@b.co` | ✅ |
| 2 | `EMAIL_REGEX` accepts valid email: `first.last@example.com` | ✅ |
| 3 | `EMAIL_REGEX` accepts valid email: `user+tag@example.io` | ✅ |
| 4 | `EMAIL_REGEX` rejects empty string | ✅ |
| 5 | `EMAIL_REGEX` rejects plain address (no @) | ✅ |
| 6 | `EMAIL_REGEX` rejects `@missing-local.com` | ✅ |
| 7 | `EMAIL_REGEX` rejects `missing-domain@` | ✅ |
| 8 | `EMAIL_REGEX` rejects `no-at-symbol.com` | ✅ |
| 9 | `EMAIL_REGEX` rejects `no.dot@nodot` | ✅ |
| 10 | `EMAIL_REGEX` rejects email with spaces | ✅ |
| 11 | `validateLoginInput` returns ok with trimmed email when valid | ✅ |
| 12 | `validateLoginInput` rejects missing email | ✅ |
| 13 | `validateLoginInput` rejects whitespace-only email | ✅ |
| 14 | `validateLoginInput` rejects non-string email | ✅ |
| 15 | `validateLoginInput` rejects malformed email | ✅ |
| 16 | `validateLoginInput` rejects missing password | ✅ |
| 17 | `validateLoginInput` rejects non-string password | ✅ |

---

### validation-signup.test.ts — Signup input validation

| # | Test | Result |
|---|------|--------|
| 18 | Returns ok with trimmed firstName and email | ✅ |
| 19 | Rejects empty firstName | ✅ |
| 20 | Rejects whitespace-only firstName | ✅ |
| 21 | Rejects empty lastName | ✅ |
| 22 | Rejects empty email | ✅ |
| 23 | Rejects malformed email | ✅ |
| 24 | Rejects empty password | ✅ |
| 25 | Rejects password shorter than 8 characters | ✅ |
| 26 | Rejects mismatched passwords | ✅ |

---

### password.test.ts — bcryptjs hashing

| # | Test | Result |
|---|------|--------|
| 27 | Hashes a password to a non-empty string that is not the plaintext | ✅ |
| 28 | Produces a different hash each call for the same password (salt) | ✅ |
| 29 | Verifies a correct password | ✅ |
| 30 | Rejects an incorrect password | ✅ |

---

### jwt.test.ts — JWT session tokens (jose / HS256)

| # | Test | Result |
|---|------|--------|
| 31 | Signs and verifies a session token round-trip | ✅ |
| 32 | Throws on a tampered token | ✅ |
| 33 | Throws when `JWT_SECRET` env var is missing at sign time | ✅ |

---

### login.test.ts — `POST /api/auth/login`

| # | Test | Result |
|---|------|--------|
| 34 | Returns 400 on invalid JSON body | ✅ |
| 35 | Returns 400 with `field: email` when email is missing | ✅ |
| 36 | Returns 400 with `field: email` on malformed email | ✅ |
| 37 | Returns 400 with `field: password` when password is missing | ✅ |
| 38 | Trims whitespace from email before DB lookup | ✅ |
| 39 | Returns 401 with generic message when user not found (no field leak) | ✅ |
| 40 | Returns 401 when password is wrong (no field leak) | ✅ |
| 41 | Returns 200 + sets `token` httpOnly cookie when credentials are valid | ✅ |
| 42 | Returns 500 when DB lookup throws | ✅ |

---

### signup.test.ts — `POST /api/auth/signup`

| # | Test | Result |
|---|------|--------|
| 43 | Returns 400 on invalid JSON body | ✅ |
| 44 | Returns 400 with `field: firstName` when firstName is missing | ✅ |
| 45 | Returns 400 with `field: lastName` when lastName is missing | ✅ |
| 46 | Returns 400 with `field: email` on malformed email | ✅ |
| 47 | Returns 400 with `field: password` when password is too short | ✅ |
| 48 | Returns 400 with `field: confirmPassword` when passwords do not match | ✅ |
| 49 | Returns 409 with `field: email` when email already exists | ✅ |
| 50 | Returns 201 + sets `token` httpOnly cookie on successful signup | ✅ |
| 51 | Calls `createUser` with hashed password, not plaintext | ✅ |
| 52 | Returns 500 when DB throws | ✅ |

> The `console.error` outputs in login and signup tests are expected — produced intentionally by the 500-error test cases to verify that the routes log failures correctly.

---

## Manual Tests

Run with `npm run dev` → open `http://localhost:3000`.

### Routing

Routing and redirect tests were performed across authenticated and unauthenticated sessions. All passed ✅.

### Signup flow (`/signup`)

| # | Scenario | Expected | Result |
|---|----------|----------|--------|
| 6 | Submit with all fields empty | All field errors shown simultaneously | ✅ |
| 7 | Submit with invalid email | Error shown under email field | ✅ |
| 8 | Submit with password < 8 chars | Error shown under password field | ✅ |
| 9 | Submit with mismatched passwords | Error shown under confirm password field | ✅ |
| 10 | Submit with already registered email | Error shown under email field (409) | ✅ |
| 11 | Submit with valid new credentials | Loading spinner → success state → redirect to `/dashboard` | ✅ |
| 12 | Typing in a field after an error | Error clears immediately as user types | ✅ |

<!-- Screenshots — save to tests/assets/ and uncomment -->
<!-- ![All signup field errors shown at once](assets/signup-validation-all-errors.png) -->
<!-- ![Signup email already exists error](assets/signup-email-exists.png) -->
<!-- ![Signup success state](assets/signup-success.png) -->

### Login flow (`/login`)

| # | Scenario | Expected | Result |
|---|----------|----------|--------|
| 13 | Submit with empty fields | Error shown | ✅ |
| 14 | Submit with invalid email format | Email error shown | ✅ |
| 15 | Submit with wrong password | Generic "email or password is incorrect" (no field leak) | ✅ |
| 16 | Submit with non-existent email | Generic "email or password is incorrect" (no field leak) | ✅ |
| 17 | Submit with valid credentials | Loading spinner → "welcome back" → redirect to `/dashboard` | ✅ |

<!-- Screenshots — save to tests/assets/ and uncomment -->
<!-- ![Login field validation error](assets/login-validation-error.png) -->
<!-- ![Login wrong credentials error](assets/login-wrong-credentials.png) -->
<!-- ![Login success state](assets/login-success.png) -->

### Session & cookie

| # | Scenario | Expected | Result |
|---|----------|----------|--------|
| 18 | After login, inspect DevTools → Application → Cookies | `token` cookie present, `HttpOnly`, `SameSite=Lax` | ✅ |
| 19 | After login, close browser tab and reopen `localhost:3000` | Cookie persists, redirects to `/dashboard` | ✅ |

---