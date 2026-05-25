# Digital Bullet Journal — v1 Progress

> A step is ✅ Done only when its code has been generated **and** tested with passing results.

| Step | Area | Status |
|------|------|--------|
| 1 | Data Model | ✅ Done |
| 2 | Project Setup | ✅ Done |
| 3 | DB Connection | 🔲 Not started |
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
