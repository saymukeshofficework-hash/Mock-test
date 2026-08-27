# TET Test Hub — Admin Instructions

This is the manual workflow for running TET Test Hub: manual Razorpay Payment Links,
manual payment verification, manual student account creation. There is no automated
payment processing anywhere in this system.

## One-time setup

### 1. Create a Supabase project
Go to [supabase.com](https://supabase.com), create a free account and a new project.
This is the "backend" that stores student accounts and test questions — you can't do
this from GitHub Pages alone, so this step is required.

### 2. Run the database schema
In your Supabase project: **SQL Editor -> New query**, paste the entire contents of
[`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates the `profiles`
and `test_content` tables and their access-control rules.

### 3. Load the test questions
`supabase/seed_tests.sql` is **not** committed to this repository on purpose — it would
contain all 3000 questions in plain text, in a public repo, undoing the whole point of
gating them behind Supabase. Generate it yourself instead:
```
node scripts/export-supabase-seed.js
```
This writes `supabase/seed_tests.sql` on your machine only. Open it, copy the whole
file, paste it into a new Supabase SQL Editor query, and run it — this loads all 20
tests' questions into the `test_content` table. Re-run the script and re-paste any time
`scripts/question-bank.js` changes. Do not `git add` this file.

### 4. Turn off email confirmation
Student accounts use fake email addresses (see below) that can never receive mail. In
**Authentication -> Providers -> Email**, turn **off** "Confirm email" — otherwise
accounts you create will be stuck unconfirmed and unable to log in.

### 5. Connect the website to Supabase
In **Project Settings -> API**, copy the **Project URL** and the **anon / public** key.
Paste them into [`js/site-config.js`](./js/site-config.js):
```js
supabaseUrl: "https://xxxxx.supabase.co",
supabaseAnonKey: "eyJ...",
```
The anon key is *meant* to be public — it's safe to commit. It cannot read or write
anything beyond what `supabase/schema.sql`'s policies allow.

### 6. Create your Razorpay Payment Links
In the [Razorpay Dashboard](https://dashboard.razorpay.com), go to **Payment Links ->
Create Payment Link**, and make one for each test (₹29 suggested) and one for the
All-20 package (₹199 suggested). Paste each link's URL into `PAYMENT_LINKS` in
`js/site-config.js`.

### 7. Fill in your contact details
Edit `contact` in `js/site-config.js` (WhatsApp number, phone, email) — these appear on
the Contact page and in the "buy" flow.

### 8. Deploy
Commit and push (or merge the PR) to `main`. The existing GitHub Actions workflow
(`.github/workflows/deploy.yml`) builds and publishes the site automatically — nothing
extra to run.

---

## Per-student workflow (repeat for every purchase)

1. Student browses **All Tests**, clicks **Buy Test** / **Buy All 20 Tests**.
2. The Razorpay Payment Link opens in a new tab; the site shows a note asking the
   student to send payment proof afterward.
3. Student pays via the Razorpay Payment Link.
4. Student sends you their payment screenshot / order details (WhatsApp, phone, or
   email, per what you filled in above).
5. **You check the [Razorpay Dashboard](https://dashboard.razorpay.com)** (Payments)
   to confirm the payment actually went through. This is the only "verification" step —
   there is no automated check.
6. **Create the student's login**, in Supabase:
   - **Authentication -> Users -> Add user**
     - Email: `<studentid>@students.tettesthub.app` (lowercase; must match
       `studentEmailDomain` in `js/site-config.js`) — e.g. a student ID of `TET26001`
       becomes `tet26001@students.tettesthub.app`.
     - Password: set one (share it with the student separately from their Student ID).
     - Check **"Auto Confirm User"**.
   - Copy the new user's **UID** (shown in the users list after creation).
   - **Table Editor -> profiles -> Insert row**:
     - `id`: paste the UID you just copied.
     - `student_id`: `TET26001` (whatever you used above, without the email part).
     - `full_name`: the student's name.
     - `package`: a label for the dashboard, e.g. `"Test 01"` or `"All 20 Tests"`.
     - `purchased_tests`: the test IDs they bought, e.g. `{test01}` for one test, or
       `{test01,test02,...,test20}` for all 20 (test IDs come from `TEST_CATALOG` in
       `js/site-config.js`).
     - `status`: `active`.
7. Send the student their **Student ID** and **Password**.
8. Student logs in at `login.html` and sees their purchased test(s) unlocked on
   `dashboard.html` / `tests.html`.

### Changing what a student can access later
Edit their row in **Table Editor -> profiles**:
- Add more test IDs to `purchased_tests` (e.g. after they buy a second test).
- Set `status` to `disabled` to block their access entirely (their login will stop
  working) without deleting their account or history.

### Changing prices or payment links
Edit `PRICES` and `PAYMENT_LINKS` in `js/site-config.js`, commit, push. No other file
needs to change.

## Never do this
- Never put your Supabase **service_role** key anywhere in this repository or website —
  only the **anon** key belongs in `js/site-config.js`.
- Never commit real student passwords anywhere.
- Never grant `purchased_tests` access before you've actually confirmed the payment.

See [`SECURITY.md`](./SECURITY.md) for what this system does and doesn't actually protect.
