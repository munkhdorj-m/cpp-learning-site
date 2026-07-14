# CPP Judge

C++ programming practice site for 7th–8th grade students.
Inspired by Codeforces, gamified for kids, fully bilingual (Mongolian + English).

**Phase 1 (MVP) — what works today:**

- Student signup with class invite codes, login
- Browse problems, see solved status, filter by difficulty
- Solve a problem in an in-browser Monaco editor and submit
- Judge0 grades the submission against hidden test cases
- XP / level / streak / "problems solved" tracked automatically
- Leaderboard (top 50 by XP)
- Standalone online C++ IDE (write + run with stdin, no grading)
- Mongolian / English language toggle (per-user)
- Teacher accounts via a secret bootstrap code

**Coming in later phases:**

- Teacher dashboard (create problems, classes, assignments through the UI)
- Assignments with deadlines
- Timed contests
- Badge system wired up to events
- Token-similarity plagiarism detection surfaced in teacher dashboard

---

## Tech stack

- **Next.js 15** (App Router) + **TypeScript**
- **Supabase** (Postgres + Auth) — free tier
- **Tailwind v4** + **shadcn/ui** (`base-nova` style)
- **Monaco Editor** for the code editor
- **Framer Motion** for UI animations
- **next-intl** for i18n
- **Judge0** (via RapidAPI) for compiling and running C++

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
   - This creates all tables, indexes, RLS policies, triggers, and seeds the badges.

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

Pick `TEACHER_INVITE_CODE` carefully — anyone who knows it can sign up as a teacher. Pick something hard to guess (e.g. `teacher-orkhon-2026-9f3aXq`).

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

### Create classes

For phase 1 (no teacher UI yet), create classes from the Supabase SQL editor:

```sql
insert into classes (name, grade, invite_code, teacher_id) values
  ('7A', 7, '7A-AUTUMN26', (select id from profiles where role = 'teacher' limit 1)),
  ('7B', 7, '7B-AUTUMN26', (select id from profiles where role = 'teacher' limit 1)),
  ('8A', 8, '8A-AUTUMN26', (select id from profiles where role = 'teacher' limit 1));
```

Give each invite code to the students in the matching class. They use it on `/signup`.

### Create your first problem

```sql
-- 1. Create the problem
insert into problems (
  slug, title_mn, title_en,
  statement_mn, statement_en,
  difficulty, xp_reward, time_limit_ms, memory_limit_kb
) values (
  'add-two-numbers',
  'Хоёр тоо нэмэх',
  'Add Two Numbers',
  'Хоёр бүхэл тоо өгөгдсөн. Тэдгээрийн нийлбэрийг хэвлэ.',
  'Two integers are given. Print their sum.',
  'easy', 10, 1000, 65536
);

-- 2. Add a sample test (visible to students)
insert into test_cases (problem_id, stdin, expected_stdout, is_sample, order_idx)
select id, '3 4', '7', true, 0 from problems where slug = 'add-two-numbers';

-- 3. Add hidden tests (used for grading)
insert into test_cases (problem_id, stdin, expected_stdout, is_sample, order_idx)
select id, stdin, expected_stdout, false, idx
from problems, (values
  ('10 20', '30', 1),
  ('-5 5', '0', 2),
  ('1000000 1000000', '2000000', 3)
) as t(stdin, expected_stdout, idx)
where slug = 'add-two-numbers';
```

Students can now find this problem on `/problems`, write a solution, and submit.

---

## Judge0 limits

| Plan      | Quota                  | Roughly works for                    |
| --------- | ---------------------- | ------------------------------------ |
| Free      | 50 submissions / day   | Demos and personal testing only      |
| Basic     | 1000 submissions / day | 1–2 class periods per day            |
| Pro       | 5000 submissions / day | Full school timetable, lots of slack |
| Self-host | unlimited              | Best long-term; needs a small VPS    |

With 32 students/class and ~5 submissions each, one class period burns ~160 submissions. **The free tier will not survive a real lesson.** Plan to upgrade before going live.

---

## Project structure

```
app/
  (auth)/login/, (auth)/signup/    – auth pages, no auth guard
  (app)/                           – auth-guarded routes
    problems/                      – list and detail (with Monaco IDE)
    ide/                           – standalone C++ playground
    profile/                       – own profile, XP, streak, history
    leaderboard/                   – top 50 students by XP
    assignments/, teacher/         – phase-2 stubs
  api/
    auth/{signup,validate-invite}/ – signup endpoints
    submit/                        – submit + grade a problem
    run/                           – run code with stdin (IDE)
  actions/locale.ts                – server action to switch language
  layout.tsx, page.tsx             – root layout + landing

components/
  ui/                              – shadcn primitives
  nav.tsx, site-logo.tsx, ...      – app chrome
  code-editor.tsx                  – Monaco wrapper (dynamic import, ssr: false)
  verdict-badge.tsx                – colored badge for each Judge0 verdict
  xp-bar.tsx                       – nav-bar progress widget

lib/
  supabase/                        – server, client, middleware factories
  judge0.ts                        – Judge0 wrapper (grade + runOnce)
  i18n-helpers.ts, utils.ts        – misc helpers

i18n/                              – next-intl config + request handler
messages/mn.json, messages/en.json – translations

types/database.ts                  – hand-authored Database type for Supabase
supabase/schema.sql                – run this in Supabase SQL editor
middleware.ts                      – session refresh on every request
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

**Signup says "Database error"** — make sure you ran the full `supabase/schema.sql`. Check the Supabase logs (Project → Logs → Postgres) for the actual error.

**Code submission hangs forever** — Judge0 quota likely exhausted. Open the Network tab in DevTools, look for a 429 response. Upgrade the Judge0 plan, or wait until tomorrow on the free tier.

**Monaco editor shows blank** — Monaco needs `ssr: false`, which is already configured. If it still doesn't load, check the browser console — usually a CSP issue if you added one.

**Mongolian characters look wrong** — make sure your file encoding is UTF-8 (no BOM) when editing problem statements.
