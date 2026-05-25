# Digital Bullet Journal — v1 Progress

> A step is ✅ Done only when its code has been generated **and** tested with passing results.

| Step | Area | Status |
|------|------|--------|
| 1 | Data Model | ✅ Done |
| 2 | Project Setup | ✅ Done |
| 3 | DB Connection | ✅ Done |
| 4 | Authentication | 🔲 Not started |
| 5 | Mood Tracker | 🔲 Not started |
| 6 | Habit Tracker | 🔲 Not started |
| 7 | Journal Entry | 🔲 Not started |
| 8 | Claude API Setup | 🔲 Not started |
| 9 | Emotions Analyzer | 🔲 Not started |

## Steps

1. **Data Model** — All tables, constraints, triggers, and stored procedures. Diagram in draw.io.
2. **Project Setup** — Initialize Next.js app with TypeScript, install dependencies, configure env vars.
3. **DB Connection** — `oracledb` connection pool wired to env vars; verified with a health-check route.
4. **Authentication** — Email/password signup and login, bcrypt + JWT in httpOnly cookie, protected routes.
5. **Mood Tracker** — CRUD for mood entries; one emotion per entry from the fixed 8-emotion list.
6. **Habit Tracker** — CRUD for habits and daily check-ins; streak and completion % via stored procedures.
7. **Journal Entry** — CRUD with Tiptap rich text editor; content stored as HTML.
8. **Claude API Setup** — Load API key from env, initialize Anthropic SDK, verify connectivity.
9. **Emotions Analyzer** — Analyze journal entries with Claude API; save results per time range; re-run gated by new entry count.

---

## Problems Encountered

<details>
<summary><b>Step 3 — DB Connection</b></summary>

**Problem: `npm run dev` always got stuck on "starting…" and never opened the app.**

After setting up the database connection code, the dev server would print "starting…" and then freeze — no error message, no crash, just silence. The app was completely unreachable.

**What caused it:**

The Oracle database driver (`oracledb`) is not written in plain JavaScript — it ships as a precompiled binary file (native code, like a `.exe` or `.dll`). When Next.js starts its dev server, it scans all the project's code to prepare it for the browser/server. During that scan it found a reference to `oracledb` and tried to process that binary file as if it were regular code. It couldn't, so it silently froze.

The scan found `oracledb` even though the code was written carefully to load it only when actually needed (lazy loading). Next.js's scanner reads source files statically — it spots the name `'oracledb'` in the code and adds it to its list regardless of whether that line would actually run at startup.

The OCI SDK packages (`oci-common`, `oci-secrets`) used to talk to Oracle Cloud were excluded for the same reason — they have a similar structure that trips up the scanner.

**How it was fixed:**

One setting was added to `next.config.ts` telling Next.js to skip those three packages during its startup scan and load them natively at runtime instead:

```ts
serverExternalPackages: ['oracledb', 'oci-common', 'oci-secrets']
```

After that, the dev server started cleanly in under 10 seconds. The `.next` cache (temporary build files) was also cleared so the fix took effect from a clean slate, since the previous frozen runs may have left behind incomplete cached files.

</details>
