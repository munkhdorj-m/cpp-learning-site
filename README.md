# CPP Judge

C++ programming practice site for 7th–8th grade students.
Inspired by Codeforces, gamified for kids, fully bilingual (Mongolian + English).

---

## What works today

### For students

- Sign up with a class invite code, log in
- **Learn** — 6 built-in beginner lessons (Hello World → variables → input → if/else → for → while), each with runnable code and a bilingual tip
- **Problems** — browse, filter by difficulty, see solved status; solve in an in-browser Monaco editor with KaTeX-rendered statements; Judge0 grades against hidden test cases
- **Online IDE** — standalone C++ playground: write, run with stdin, no grading
- **Games**
  - **Robot Programmer** — a Blockly block-coding puzzle that drives a robot through a Phaser-rendered 2D maze (courses: basics, loops, conditionals, master); levels are teacher-authorable with progressive hints
  - **Bug Smash** — a fast daily arcade mini-game that awards XP
- **Daily Quests** — bite-sized challenges (predict-the-output, bug hunt, multiple choice) that award XP
- **Gamification** — XP, levels, daily streaks, "problems solved", and a badge system (first solve, streaks, milestones, first hard, first try, class champion) awarded automatically
- **Leaderboard** — top students by XP, plus a class-vs-class weekly cup
- **Contests** — timed contests with a live points leaderboard
- **Assignments** — per-class problem sets with deadlines and late penalties
- **Notifications** — in-app bell for badges, level-ups, assignment due dates, contest starts
- **Language toggle** — Mongolian / English, remembered per user

### For teachers

A full teacher dashboard (`/teacher`) — no SQL required for day-to-day use:

- **Classes** — create classes and hand out invite codes
- **Problems** — create/edit problems and test cases through the UI
- **Assignments** — build problem sets with due dates, late-submission rules
- **Contests** — schedule timed contests and pick their problems
- **Robot levels** — author custom maze levels for the Robot Programmer game
- **Plagiarism** — review flagged near-duplicate submissions (token-similarity, computed automatically on each accepted submission)
- **Analytics** — class/student progress overview

Teacher accounts are created with a secret bootstrap invite code (see below).

---

## Tech stack

- **Next.js 15** (App Router) + **TypeScript**
- **Supabase** (Postgres + Auth, RLS on every table) — free tier
- **Tailwind v4** + **shadcn/ui** (`base-nova` style)
- **Judge0** (via RapidAPI) for compiling and running C++ (GCC 9.2.0)
- **Monaco Editor** for the code editor
- **Blockly** (block coding) + **Phaser 4** (2D maze) + **three.js / react-three-fiber** for games
- **Framer Motion** for UI animations, **next-themes** for dark mode
- **react-markdown** + **KaTeX** for problem statements
- **next-intl** for i18n
- **Zod** for API input validation

---

## Setup

### Prerequisites

- Node.js 20+ and npm
- A free Supabase account: <https://supabase.com>
- A free RapidAPI account: <https://rapidapi.com/judge0-official/api/judge0-ce>

### 1. Create a Supabase project

1. Go to <https://supabase.com> → New project. Pick any region close to Mongolia (Singapore / Tokyo are fine).
2. Wait for the project to provision.
3. **Disable email confirmation** so kids don't need to verify email:
   - Project Settings → Authentication → Email Auth → toggle off **"Confirm email"**.
4. Open the SQL editor (left sidebar) → **New query** → paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
   - This creates the core tables, indexes, RLS policies, triggers, and seeds the badges.
5. Then apply each migration in [`supabase/migrations/`](supabase/migrations) **in filename order** (002, 003, 004, …). Each is idempotent and adds a later feature (badge auto-awarding, class cup, plagiarism, contests, quests, games, robot levels, notifications).
6. *(Optional)* Run [`supabase/seed-problems.sql`](supabase/seed-problems.sql) and [`supabase/seed-quests.sql`](supabase/seed-quests.sql) to load starter content.

### 2. Get your Supabase keys

Project Settings → API:

- `NEXT_PUBLIC_SUPABASE_URL` = the "Project URL"
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the `anon` public key
- `SUPABASE_SERVICE_ROLE_KEY` = the `service_role` secret key (treat like a password)

### 3. Get a Judge0 API key

1. Subscribe to the free tier of [Judge0 CE on RapidAPI](https://rapidapi.com/judge0-official/api/judge0-ce).
   - Free is 50 submissions/day. For real classroom use, upgrade to **Basic ($10/mo, 1000/day)** before the first lesson — see "Judge0 limits" below.
2. Copy your `X-RapidAPI-Key`. The host stays `judge0-ce.p.rapidapi.com`.

### 4. Configure environment

```bash
cp .env.local.example .env.local
# then edit .env.local and fill in every variable
```

Pick `TEACHER_INVITE_CODE` carefully — anyone who knows it can sign up as a teacher. Pick something hard to guess (e.g. `teacher-orkhon-2026-9f3aXq`) and rotate it after your teacher accounts exist.

### 5. Install and run

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

---

## First-time use

### Create the first teacher

1. Go to `/signup`.
2. Enter the `TEACHER_INVITE_CODE` you set in `.env.local` as the invite code.
3. Fill out the rest of the form. You'll be signed in as a teacher.

### Set up classes, problems, and content

Everything below is now done through the **teacher dashboard** (`/teacher`) — no SQL needed:

1. **Classes** → create your classes; each gets an invite code. Give each code to the students in that class; they use it on `/signup`.
2. **Problems** → create problems and their test cases (mark some tests as *samples* to show students).
3. **Assignments / Contests** → optionally group problems into deadline-bound assignments or timed contests.
4. **Robot levels** → optionally author custom maze puzzles.

Students can then find problems on `/problems`, write a solution, and submit.

---

## Importing problems from SPOJ

`scripts/` contains a three-stage pipeline to bulk-import problems. See [`scripts/README.md`](scripts/README.md) for full details.

```
1. scrape-spoj.mjs   → statements + samples        (data/spoj-rgb7/)
2. build-tests.mjs   → LLM reference + extra tests  (data/spoj-rgb7-built/)
3. import-problems.mjs → Supabase bulk insert
```

Stage 2 uses an LLM to generate a reference solution and validated extra test cases, so it needs a `DEEPSEEK_API_KEY` in `.env.local`. Stage 1 opens a visible Chromium (via Playwright) so you can solve a Cloudflare challenge once if prompted.

---

## Judge0 limits

| Plan      | Quota                  | Roughly works for                    |
| --------- | ---------------------- | ------------------------------------ |
| Free      | 50 submissions / day   | Demos and personal testing only      |
| Basic     | 1000 submissions / day | 1–2 class periods per day            |
| Pro       | 5000 submissions / day | Full school timetable, lots of slack |
| Self-host | unlimited              | Best long-term; needs a small VPS    |

With 32 students/class and ~5 submissions each, one class period burns ~160 submissions. **The free tier will not survive a real lesson.** Plan to upgrade before going live, or self-host — see [`docs/JUDGE0_SELF_HOST.md`](docs/JUDGE0_SELF_HOST.md).

---

## Project structure

```
app/
  (auth)/login/, (auth)/signup/    – auth pages, no auth guard
  (app)/                           – auth-guarded routes
    learn/                         – built-in beginner lessons
    problems/                      – list and detail (with Monaco IDE)
    ide/                           – standalone C++ playground
    game/robot/                    – Blockly + Phaser robot-maze game
    game/bug-smash/                – arcade mini-game
    quests/                        – daily quests
    leaderboard/                   – XP leaderboard + class cup
    contests/                      – timed contests
    assignments/                   – per-class assignments
    profile/                       – own profile, XP, streak, history
    teacher/                       – teacher dashboard (classes, problems,
                                     assignments, contests, robot-levels,
                                     plagiarism, analytics)
  api/
    auth/{signup,validate-invite}/ – signup endpoints
    submit/                        – submit + grade a problem (+ plagiarism scan)
    run/                           – run code with stdin (IDE)
    robot/, quests/, game/         – game progress + scoring
    notifications/, problems/      – misc data endpoints
  actions/                         – server actions (e.g. locale switch)
  layout.tsx, page.tsx             – root layout + landing

components/
  ui/                              – shadcn primitives
  nav.tsx, nav-links.tsx, ...      – app chrome
  code-editor.tsx                  – Monaco wrapper (dynamic import, ssr: false)
  blockly-workspace.tsx            – Blockly editor for the robot game
  verdict-badge.tsx                – colored badge for each Judge0 verdict
  xp-bar.tsx, notification-bell.tsx, teacher-subnav.tsx, ...

lib/
  supabase/                        – server, client, middleware factories
  judge0.ts                        – Judge0 wrapper (grade + runOnce)
  plagiarism.ts                    – token-similarity scoring
  robot-blocks.ts, robot-interpreter.ts, phaser-maze-scene.ts – robot game
  quest-selection.ts               – daily quest picker
  i18n-helpers.ts, utils.ts, ...   – misc helpers

i18n/                              – next-intl config + request handler
messages/mn.json, messages/en.json – translations

types/database.ts                  – hand-authored Database type for Supabase
supabase/schema.sql                – base schema (run first)
supabase/migrations/               – incremental feature migrations (run in order)
supabase/seed-*.sql                – optional starter content
scripts/                           – SPOJ scrape → build → import pipeline
middleware.ts                      – Supabase session refresh on page routes
```

---

## Deploying

Easiest target is **Vercel** (free tier, same company as Next.js):

1. Push to GitHub.
2. Import the repo on Vercel.
3. Set the same env vars from `.env.local` in the Vercel project settings.
4. Deploy. Vercel will give you a `your-project.vercel.app` URL.

Update `NEXT_PUBLIC_SITE_URL` to your Vercel URL once deployed.

---

## Troubleshooting

**Signup says "Database error"** — make sure you ran the full `supabase/schema.sql` *and* every migration in `supabase/migrations/`. Check the Supabase logs (Project → Logs → Postgres) for the actual error.

**A feature 404s or a query fails on a missing table/column** — you likely skipped a migration. Re-apply `supabase/migrations/` in filename order; they're idempotent.

**Code submission hangs forever** — Judge0 quota likely exhausted. Open the Network tab in DevTools, look for a 429 response. Upgrade the Judge0 plan, wait until tomorrow on the free tier, or self-host.

**Monaco editor shows blank** — Monaco needs `ssr: false`, which is already configured. If it still doesn't load, check the browser console — usually a CSP issue if you added one.

**Mongolian characters look wrong** — make sure your file encoding is UTF-8 (no BOM) when editing problem statements.
