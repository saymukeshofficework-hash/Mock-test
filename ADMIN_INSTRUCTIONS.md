# TET Test Hub — Admin Instructions

This is a semi-manual workflow for running TET Test Hub: students pay through a Razorpay
Payment Link (a hosted checkout page — no backend or API integration on this site), you
verify the payment yourself in the Razorpay dashboard, and you create their account by
hand. There is no automated account creation anywhere in this system.

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

### 6. Fill in your contact details
Edit `contact` in `js/site-config.js` — email plus the WhatsApp/call numbers you want
shown on the Contact page. `phones` is a list of `{ display, wa }` objects: `display` is
what's shown on the page, `wa` is the same number with the country code and no `+` or
spaces (required for `wa.me` links), e.g. `{ display: "9179056016", wa: "919179056016" }`.

### 7. Create your Razorpay Payment Link
This is the one thing that has to be done through Razorpay's own dashboard — there's no
API key or backend involved, just a link you paste into the site.

1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com) and sign up (or log
   in). You'll need to complete KYC/account activation before you can accept **live**
   payments — until then, Razorpay lets you test the flow in Test Mode.
2. In the left sidebar: **Payment Links -> + Create Payment Link**.
3. Fill in:
   - **Amount**: `199` (INR).
   - **Description**: something like "TET Test Hub — Unlock 18 Mock Tests".
   - Under **Customer Details**, turn on collecting **Name**, **Email**, and **Contact
     Number** — this is how you'll know who paid, since there's no automated link back
     to a student account.
   - You can leave **Partial Payment** off and skip any redirect/webhook URL — this site
     doesn't need one; you just check the dashboard for new payments.
4. Click **Create Link**. Razorpay gives you a URL like `https://rzp.io/l/abcd1234`.
5. Paste that URL into `js/site-config.js`:
   ```js
   const PAYMENT_LINKS = {
     all18: "https://rzp.io/l/abcd1234",
   };
   ```
   Until you do this, the "Buy Now" buttons on `tests.html` fall back to the Contact
   page automatically (the code checks for the `PASTE_` placeholder).
6. Switch Razorpay from Test Mode to Live Mode (once KYC is approved) so real payments
   go through, and double check the Payment Link still works after switching.

### 8. Deploy
Commit and push (or merge the PR) to `main`. The existing GitHub Actions workflow
(`.github/workflows/deploy.yml`) builds and publishes the site automatically — nothing
extra to run.

---

## Per-student workflow (repeat for every purchase)

1. Student browses **All Tests** and clicks **🔓 Buy Now — ₹199**, which opens your
   Razorpay Payment Link in a new tab and pays there.
2. **You confirm the payment yourself** in the Razorpay dashboard (**Payment Links** or
   **Payments**) — check the customer name/email/contact you collected on the link. This
   is the only "verification" step; there is no automated check or webhook.
3. **Create the student's login**, in Supabase:
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
4. Send the student their **Student ID** and **Password**.
5. Student logs in at `login.html` and sees their purchased test(s) unlocked on
   `dashboard.html` / `tests.html`.

### Changing what a student can access later
Edit their row in **Table Editor -> profiles**:
- Add more test IDs to `purchased_tests` (e.g. after they buy a second test).
- Set `status` to `disabled` to block their access entirely (their login will stop
  working) without deleting their account or history.

### Changing prices
Edit `PRICES` in `js/site-config.js` **and** the ₹199 amount on the Razorpay Payment
Link itself (Payment Links can't be edited after creation — create a new one and update
`PAYMENT_LINKS.all18` in `js/site-config.js` to match). Commit and push the code change.

## Never do this
- Never put your Supabase **service_role** key anywhere in this repository or website —
  only the **anon** key belongs in `js/site-config.js`.
- Never commit real student passwords anywhere.
- Never grant `purchased_tests` access before you've actually confirmed the payment.

See [`SECURITY.md`](./SECURITY.md) for what this system does and doesn't actually protect.
