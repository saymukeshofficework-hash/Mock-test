-- Replace the ₹29 Teaching Plan copy with a ₹49 combo PDF: 7 NIOS B.Ed Bridge Course
-- assignment covers (Course 1–7) + the 12-page blank Teaching Plan, in one 19-page PDF.
-- The old row is kept (inactive) so any past order still resolves; nothing was sold.

insert into public.products
  (slug, name, description, amount_paise, currency, file_bucket, file_path, active, max_downloads, download_name)
values (
  'assignment-combo',
  'Assignment Combo — 7 Covers + Teaching Plan (शिक्षण योजना)',
  'One printable PDF (19 pages, A4): assignment covers for Course 1–7 and a 12-page blank Teaching Plan.',
  4900, 'INR', 'bridge-course-private', 'products/assignment-combo.pdf', true, 2,
  'Assignment Combo - Covers + Teaching Plan.pdf'
)
on conflict (slug) do nothing;

update public.products set active = false where slug = 'teaching-plan-copy';
