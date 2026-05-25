# Digital Bullet Journal

This file is the high-level specification and architectural guide for the project. It defines what to build, the tech decisions, and the build order. You will receive detailed instructions for each step separately — do not start a step unless I explicitly ask you to. Use this file as context and constraints, not as a task list to execute on your own.

## Tech Stack

- **Frontend**: React + Next.js (App Router)
- **Database**: Oracle Database 23ai (Autonomous Database)
- **AI**: Claude API (claude-sonnet-4-20250514) for emotion analysis
- **Auth**: Custom auth (email/password). No OAuth for v1.
- **Server**: Local development server
- **Secrets**: OCI Vault for credentials. Use environment variables locally; never hardcode secrets.

## Architecture Rules

- Use Next.js App Router (`/app` directory), not Pages Router.
- API routes go in `/app/api/`. No direct DB calls from client components.
- Use server components by default. Add `"use client"` only when the component needs interactivity.
- Use `oracledb` npm package for database connection. Use a connection pool, not individual connections.
- All dates stored in the database as UTC. Convert to user's local timezone only on the client.

## Modules

### 1. Authentication

- Email/password signup and login.
- Use bcrypt for password hashing. Use JWT for session tokens stored in httpOnly cookies.
- Protected routes redirect unauthenticated users to the login page.
- The login/signup page is the landing page for unauthenticated users.

### 2. Mood Tracker

- User selects one mood per entry from a fixed set: [Happy, Sad, Anxious, Calm, Angry, Excited, Tired, Neutral].
- User can create one or more entries per day.
- Entry date defaults to today but user can pick any past date.
- Available in Dashboard and dedicated Mood Tracker page.

### 3. Habit Tracker

- User creates a habit with a name and a target duration in days (minimum 22 days).
- Each day the user marks the habit as done or not done.
- Track streak and completion percentage.
- Available in Dashboard and dedicated Habit Tracker page.

### 4. Journal Entry

- Free-form text entry with rich text editing (use Tiptap editor).
- Entry date defaults to today but user can change it.
- Available in Dashboard and dedicated Journal page.

### 5. Emotions Analyzer

- Uses Claude API to analyze Journal + Mood Tracker entries.
- User selects a time range: past day, week, month, or year.
- Token limits per analysis: day=1000, week=2000, month=4000, year=6000 max_tokens on the API call.
- Present results as a psychological-perspective summary of emotional patterns, trends, and observations.
- Available in Dashboard and dedicated Emotions Analyzer page.
- **This is the last module to develop.** Before starting it, set up and verify Claude API credentials.

## Data Model Constraints

- Every table has `created_at` and `updated_at` timestamp columns.
- All user-facing tables have a `user_id` foreign key to the users table.
- Use UUIDs for primary keys.
- Journal entries store rich text as HTML in a CLOB column.

## Development Workflow

Build in the order listed below. Each step is gated: **do not start the next step until I confirm the current one is approved.** The process for every step is:

1. I give you detailed instructions for the step.
2. You implement it.
3. You write tests and run them.
4. You present the results (what was built, test output, any issues).
5. I review and either approve or request changes.
6. Only after my explicit approval, we move to the next step.

**IMPORTANT: Never skip ahead. Never start the next step on your own. Wait for my go-ahead.**

### Build Order

1. **Data model** → Design and create all tables.
2. **Project setup** → Initialize Next.js app with TypeScript.
3. **DB connection** → Set up `oracledb` connection pool.
4. **Authentication** → Signup, login, logout, protected routes.
5. **Mood Tracker** → CRUD for mood entries.
6. **Habit Tracker** → CRUD for habits + daily check-ins.
7. **Journal Entry** → CRUD with rich text editor.
8. **Claude API setup** → Load credentials from env, verify connectivity.
9. **Emotions Analyzer** → Build analysis feature.

## Testing

- Use Jest for unit tests and React Testing Library for component tests.
- Tests are part of every step, not a separate phase. Write and run them before presenting results for approval.
- Test API routes independently from UI components.
- After implementing a step, run `npm test` and include the output in your summary so I can review it.

## Code Style

- Use TypeScript strict mode.
- Use ES modules (import/export), not CommonJS.
- Name files in kebab-case (e.g., `mood-tracker.tsx`). Name components in PascalCase.
- Use async/await, not .then() chains.
- Handle all database and API errors explicitly; never swallow errors silently.

## Compaction Instructions

When compacting, always preserve: which step we are currently on, its approval status (in progress / awaiting review / approved), the list of completed steps, any failing tests, and the database schema.
