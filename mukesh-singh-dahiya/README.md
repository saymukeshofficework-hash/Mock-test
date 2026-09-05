# Mukesh Dahiya — Educational Platform

A premium educational website for teacher **Mukesh Dahiya** (M.Sc. Botany,
M.A. English, 12 years teaching experience) — notes, solutions, questions,
previous papers, premium courses, paid notes, online classes, NEET Biology
resources and educational calculators for Classes 5–12, CBSE & MP Board,
English Medium.

Built with React, TypeScript, Tailwind CSS and Vite, on a fully data-driven
architecture: one reusable page/component per content type, backed by data
files, instead of hand-built pages per class/subject/resource.

## Development

```bash
npm install
npm run dev       # local dev server
npm run build     # type-check + production build
npm run lint       # eslint
npm run preview    # preview the production build
```

## Adding content

All content lives under `src/data/` as plain TypeScript arrays — add an
entry and it appears on the site automatically, no page code changes
needed:

| Content | File |
|---|---|
| Notes / Solutions / Questions / Worksheets / Previous-paper-adjacent resources | `src/data/resources.ts` |
| Quiz / MCQ questions | `src/data/questions.ts` |
| Previous examination papers | `src/data/previousPapers.ts` |
| Courses | `src/data/courses.ts` |
| Paid notes | `src/data/paidNotes.ts` |
| Online classes | `src/data/onlineClasses.ts` |
| Calculators | `src/data/calculators.ts` |
| Classes / Subjects / NEET categories | `src/data/classes.ts`, `subjects.ts`, `neet.ts` |
| Teacher profile, contact details | `src/data/site.ts` |

Upload actual files (PDFs, images) under `public/resources/<type>/` or
`public/images/`, then reference the path in the matching data entry's
`file` / `previewFile` / `thumbnail` field.

## Architecture notes

- Dynamic routes (`/classes/:classSlug`, `/classes/:classSlug/:subjectSlug`,
  `/resources/:slug`, `/courses/:slug`, `/calculators/:slug`, etc.) render
  from data — there is no per-class or per-resource page file.
- No backend, authentication or payment gateway is wired up yet.
  Purchases go through WhatsApp: `EnrollmentCTA`/`WhatsAppButton` open
  `wa.me` with a pre-filled, product-specific message built from
  `src/lib/whatsapp.ts`; the teacher confirms payment and grants access
  manually. The UI (access badges, locked lesson states) is still shaped
  so a real checkout/auth flow can replace this later without
  restructuring pages.
- All pricing lives behind the shared `Pricing` fields (`price`,
  `discountPrice`, `offerLabel`, `currency`) on `Course`, `PaidNote`,
  `Bundle` and `OnlineClass` in `src/data/types.ts`, rendered only via
  `PriceTag` — never hardcode a price in a component.
- Deployed as a sibling app under `/mukesh-singh-dahiya/` on the combined
  GitHub Pages site (see the repo root `404.html` and
  `.github/workflows/deploy.yml`); `src/lib/publicBase.ts` resolves the
  mount path at runtime for the router basename and asset URLs.

## Still needed before launch

- **Real WhatsApp number** in `src/config/contact.ts` (`whatsapp:
  'YOUR_WHATSAPP_NUMBER'`) — every purchase button is broken until this
  is set to real digits with country code (e.g. `"919876543210"`)
- Real email/phone/address (`src/config/contact.ts`, `src/data/site.ts`)
- Real course/paid-note/bundle/online-class pricing and schedules
  (the current prices are illustrative starting suggestions, not final)
- Real previous examination papers and NEET previous-year questions
- Payment gateway integration (Razorpay/Cashfree/Stripe) and student
  accounts, if/when manual WhatsApp fulfillment is outgrown
