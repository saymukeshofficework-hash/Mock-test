# Security Notes — read this before relying on this system

This system is genuinely more secure than plain hidden buttons, but it has real limits.
Here's exactly what is and isn't protected, and why.

## What actually protects test content

Question data lives only in Supabase's `test_content` table, gated by Row Level Security
(RLS) defined in `supabase/schema.sql`. A test's questions can only be read by a request
that is (a) authenticated as a real logged-in user, and (b) whose `profiles` row lists
that exact test in `purchased_tests` with `status = 'active'`. This check runs inside
Postgres itself — it is enforced no matter what the browser's JavaScript does. Hiding or
showing "Start Test" / "Buy Test" buttons in `tests.html` / `dashboard.html` is only a
UI convenience; the real gate is this database policy, checked again every time a test
page loads.

This means:
- A visitor who isn't logged in cannot fetch any test's questions.
- A logged-in student can only fetch tests they've actually been granted.
- Editing the page's HTML/JS in browser dev tools cannot bypass this — the server (Supabase)
  refuses the request regardless of what the client asks for.

## Important limitation: this repository is public

**This GitHub repository is public.** That has two consequences worth knowing:

1. **`js/site-config.js` (including the Supabase anon key and Razorpay Payment Links) is
   visible to anyone.** This is fine by design — the anon key is meant to be public and
   grants no access on its own (RLS is what matters), and Payment Links are meant to be
   shared publicly anyway.

2. **Historical exposure of question data.** Before this change, all 20 tests' questions
   were committed to this repository as plain public files (`assets/data/test-*.js`).
   Removing them from the current code does **not** remove them from git history — a
   public repository's full commit history remains fetchable by anyone (via the GitHub
   web UI, `git log`, or raw file URLs for old commits), indefinitely. Practically, that
   means the questions that were public before this change should be treated as
   permanently public, regardless of what we do going forward.
   - Going forward, question content added only through `scripts/export-supabase-seed.js`
     + a manual paste into the Supabase SQL Editor (never committed to git) is genuinely
     protected — this is how all 20 tests' content now reaches Supabase.
   - If you want the old exposure gone too, the only real fix is rewriting git history
     (e.g. `git filter-repo`) and force-pushing, which is destructive to shared history
     and not something to do without deliberately deciding to — ask if you want this done.
   - An alternative for the future: making the repository **private** (requires GitHub
     Pro or an organization plan for Pages to still work) would stop *new* commits from
     being public, though it doesn't undo history already pushed while it was public.

## What is and isn't verified automatically

- **Payment**: nothing is automatic. Razorpay Payment Links collect payment; you verify
  it yourself in the Razorpay Dashboard before creating any account. There is no webhook,
  no API call, no code anywhere that checks whether a payment happened. If you don't
  check the dashboard, an unpaid student could still be granted access if you (accidentally)
  create their profile with `purchased_tests` set.
- **Accounts**: created entirely by you, by hand, in the Supabase dashboard. There is no
  self-signup page.

## Passwords and sessions

- Passwords are stored and hashed by Supabase Auth (industry-standard, bcrypt-based) — this
  code never sees or stores a plaintext password.
- Logging in creates a standard Supabase session token stored in the browser. Logging out
  (`js/auth.js`'s `logout()`) actually calls Supabase's sign-out, clearing that session —
  it doesn't just redirect while leaving the session valid.
- A shared or unlocked device that stays logged in could let someone else use that
  session until the student logs out. This is normal for browser-based logins generally,
  not specific to this system.

## Scoring happens in the database, not the browser

Early versions of this site fetched a test's full `questions` payload — including the
correct-answer index for every question — the moment the test page loaded, then scored
the attempt in JavaScript. That meant the entire answer key sat in the page's memory
(and in the network response, visible in dev tools) before the student had answered a
single question — trivially defeating the test.

This is fixed: the browser calls two Postgres functions (`get_test_questions` and
`score_test_attempt`, defined in `supabase/schema.sql`) instead of querying
`test_content` directly.
- `get_test_questions` returns the questions with the `answer` field stripped out of
  every question — the browser never receives it.
- `score_test_attempt` takes the student's selected options, looks up the real answer
  key itself (inside Postgres, never sent over the wire), and returns only the computed
  score and section breakdown.

Both functions run with the caller's own privileges (no `security definer`), so the same
`test_content_select_purchased` RLS policy above still applies inside them — a student
who isn't allowed to read a test can't score it either.

## What this system does not attempt to prevent

- A **legitimate, paying** student can still copy the *question text* out of the browser
  (view-source, dev tools, screenshots) once it's on their screen — this is true of
  essentially any browser-based exam without heavy client-side DRM, and is out of scope
  here. RLS stops *unauthorized* access, not what an authorized viewer does with content
  once delivered to their screen. The *answer key* specifically is not part of what's
  delivered (see above) — only the score, after the student has already answered.
- Rate limiting / abuse prevention beyond what Supabase's free tier provides by default.

## Bottom line

Going forward, a student can only see a test's questions if they're logged in as an
account you created **after actually verifying their payment**, and only for the tests
you explicitly granted them. That protection is real and server-enforced. What it cannot
undo is the exposure of question content that was already public in this repository's
history before this change.
