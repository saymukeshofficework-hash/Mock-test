# AGENTS.md

Instructions for any AI coding agent (Codex, ChatGPT, Claude) working on this repo.

The full rules are in [CLAUDE.md](CLAUDE.md). Read it first and follow it. Summary:

- Make the smallest change that does the job. Touch only the files the task names.
- Do not push, merge or deploy without the owner's explicit approval.
- Never put secrets in the repo: no passwords, API keys, Supabase service keys or Razorpay secrets. Keep them in GitHub Secrets or the Supabase dashboard.
- Never publish paid content (notes, test answers, current affairs) in public files. It stays in Supabase.
- Block sales if a Razorpay key starts with `rzp_test_`.
- All user-facing text is bilingual (Hindi + English).

## Checks

- Full site check (free, prints failures only): `node scripts/check-site.js`
- Examhelp build (Next.js static export, base path `/examhelp`):
  `cd examhelp && npm ci && NEXT_PUBLIC_BASE_PATH=/examhelp npm run build`
- Syntax check for a single file: `node --check <file>`

## Deploy

- Push to `main` triggers `.github/workflows/deploy.yml` on GitHub Pages (about 2–4 min).
- Add `[skip ci]` to the commit message for docs-only changes.
- Host: custom domain `tettesthub.in` (see `CNAME`).
