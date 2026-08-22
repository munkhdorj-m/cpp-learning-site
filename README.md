# ХаСү Computer Science

Programming practice site for Orkhon School, built around an online judge.
Lessons and problems in C++ and Python, gamified for school students,
bilingual (Mongolian + English).

Live at <https://cs.ub.mn>.

---

## What's here

### For students

- **Learn** — a 19-lesson beginner course in 6 units, one idea per page:
  printing, variables, types, input, arithmetic, conditions, loops, strings,
  arrays, nested loops, functions and vectors. Each lesson has a worked
  example explained line by line, common mistakes, a self-check question and
  a "try this code" button that opens it in the playground.
- **Problems** — browse and filter, solve in an in-browser Monaco editor,
  graded against hidden tests by Judge0.
- **Playground** — write and run C++ with your own input, no grading.
- **Games** — *Find the Egg* (Blockly block-coding drives a robot through a
  Phaser maze, with bombs, stars, keys, portals and patrolling hazards) and
  *Debug* (an arcade bug-squashing game).
- **Daily quests**, XP, levels, streaks, badges, leaderboard and a
  class-vs-class weekly cup.
- **Contests** and **assignments** with deadlines.

### For teachers

`/teacher` covers classes, problems, assignments, contests, robot levels,
plagiarism review and analytics. Notably:

- **Bulk student accounts** — paste a list of names, get logins created with
  printable slips. Usernames are prefixed with the graduation year
  (`31.bat`), so they stay correct as students move up a grade.
- **End-of-year promotion** — move a whole class up, or graduate them.
- Students with no class are listed separately so they can be reassigned or
  deleted rather than silently lost.

---

## Tech stack

- **Next.js 15** (App Router) + **TypeScript**
- **MySQL 8** via `mysql2`, with a small query builder in `lib/mysql/`
- **Custom auth** — bcrypt + signed JWT session cookie (`lib/auth.ts`)
- **Judge0** for compiling and running C++
- **Tailwind v4** + **shadcn/ui**, **Monaco** editor
- **Blockly** + **Phaser 4** for the robot game, **three.js** for Debug
- **next-intl** for i18n, **Zod** for input validation

---

## Running locally

Requires Node 20+ and a MySQL 8 database.

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.local.example` and fill in:

| Variable | What it is |
| --- | --- |
| `DB_HOST` `DB_PORT` `DB_NAME` `DB_USER` `DB_PASSWORD` | MySQL connection |
| `AUTH_SECRET` | Long random string used to sign session cookies |
| `SESSION_IDLE_MINUTES` | How long a session survives with no requests. Default 120. |
| `JUDGE0_API_URL` `JUDGE0_API_KEY` `JUDGE0_API_HOST` | Judge0 |
| `TEACHER_INVITE_CODE` | Signup code that creates a teacher account |
| `NEXT_PUBLIC_SITE_URL` | Public URL, shown on printed login slips |

To point local development at a *copy* of the server database instead of
production, put its credentials in `.env.development.local` — that file is
only read by `npm run dev`.

### Sessions on shared computers

The classroom machines are shared, so a session cookie has no `Expires`: it
dies when the browser closes. `SESSION_IDLE_MINUTES` is the backstop for
browsers set to restore their tabs, which hand session cookies back after a
restart. The window slides while a student is working — reading, submitting,
anything that reaches the server — so it only runs out on a machine that has
been left alone. Lower it if you want stricter behaviour; below about 45
minutes a student could be logged out inside a single lesson.

`scripts/check-auth.mts` covers all of this, plus the authorisation rules the
teacher pages rely on. Run it against a production build pointed at the dev
database:

```
set -a; . ./.env.development.local; set +a
npx next start -p 3100
npx tsx scripts/check-auth.mts
```

### Database setup

Run these in phpMyAdmin (or any MySQL client) against an empty database:

1. `migration/mysql-schema.sql` — all tables
2. `migration/allow-all-grades.sql` — widens classes to grades 1–12
3. Optionally `migration/mysql-data.sql` if you have an export to load

Then create the first teacher: sign up at `/signup` using the
`TEACHER_INVITE_CODE`.

---

## Deploying

The site runs on cPanel shared hosting (datacom.mn) under Passenger. Shared
hosting can't build Next.js, so the build happens locally:

```bash
node scripts/package-deploy.mjs
```

That produces `~/Desktop/cppjudge-deploy.tar.gz` and prints the remaining
steps: upload it to the home directory, extract into the app folder, and
restart the app in **Setup Node.js App**. `server.js` is the Passenger entry
point.

Only run `npm install` on the server when dependencies actually changed.

---

## Judge0 capacity

| Plan | Quota | Roughly good for |
| --- | --- | --- |
| Free | 50 submissions/day | demos only |
| Basic | 1000/day | 1–2 class periods |
| Self-hosted | unlimited | best long term, needs a VPS or spare PC |

One class of 30 students doing five submissions each is ~150 requests, so
the free tier will not survive a lesson. Self-hosting notes are in
[`docs/JUDGE0_SELF_HOST.md`](docs/JUDGE0_SELF_HOST.md) — note it needs
Docker, so it cannot run on the cPanel host itself.

---

## Layout

```
app/
  (auth)/login, (auth)/signup      – no auth guard
  (app)/                           – auth-guarded; layout redirects to /login
    learn/, learn/[slug]           – lesson index and lesson pages
    problems/, problems/[slug]     – list and solve
    ide/                           – playground
    game/robot/, game/bug-smash/   – Find the Egg, Debug
    quests/, contests/, assignments/, leaderboard/, profile/
    teacher/                       – full teacher area
  api/
    auth/{login,logout,signup}     – custom auth
    submit/                        – grade a submission (+ plagiarism scan)
    run/                           – run code in the playground
    teacher/students/*             – bulk create, assign, move, delete, reset
    robot/, quests/, game/, notifications/

lib/
  mysql/                           – pool + supabase-shaped query builder
  auth.ts, session.ts              – bcrypt hashing, JWT cookie
  gamification.ts                  – XP, levels, streaks, badges
  lessons.ts, school.ts            – course content, school structure
  student-accounts.ts              – username/password generation
  judge0.ts, plagiarism.ts, robot-*.ts, phaser-maze-scene.ts

migration/                         – MySQL schema and one-off migrations
scripts/                           – deploy packaging, SPOJ import, admin tools
```

---

## Troubleshooting

**Login fails for everyone** — check `DB_*` credentials and that the app can
reach MySQL. `node scripts/set-password.mjs <email-or-username> <password>`
both resets a password and proves the connection works.

**A page errors about a missing column** — a migration in `migration/`
hasn't been applied to that database.

**Submissions hang** — Judge0 quota. Look for a 429 in the network tab.

**Monaco is blank** — it needs `ssr: false`, which is already configured;
check the browser console for a CSP error if you've added one.
