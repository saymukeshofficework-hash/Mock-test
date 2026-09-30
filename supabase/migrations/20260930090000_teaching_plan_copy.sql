-- Second product: a printable blank Teaching Plan (शिक्षण योजना) assignment copy, ₹29.
-- Additive only. The price the server charges is this row's amount_paise, cross-checked
-- against the allow-list in supabase/functions/_shared/config.ts (productPrices).

alter table public.products add column if not exists download_name text;

update public.products
   set download_name = 'Bridge Course Notes by Rakesh Pandey.pdf'
 where slug = 'bridge-course-notes' and download_name is null;

insert into public.products
  (slug, name, description, amount_paise, currency, file_bucket, file_path, active, max_downloads, download_name)
values (
  'teaching-plan-copy',
  'Assignment Copy — Teaching Plan (शिक्षण योजना)',
  'Printable blank Teaching Plan assignment copy (12 pages, A4 PDF) for the Bridge Course.',
  2900, 'INR', 'bridge-course-private', 'products/teaching-plan-copy.pdf', true, 2,
  'Assignment Copy - Shikshan Yojana (Teaching Plan).pdf'
)
on conflict (slug) do nothing;
