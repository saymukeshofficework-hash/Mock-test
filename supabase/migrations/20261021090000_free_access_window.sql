-- 14-day free offer (owner, 2026-10-21): until 2026-11-04 23:59:59 IST every test in test_content
-- is readable by any logged-in, active student. After that time the policy behaves exactly as
-- before (free tests + purchased_tests), with no further change needed.
-- Keep the date in sync with FREE_ACCESS_UNTIL in js/site-config.js.
-- Optional clean-up after the offer: re-run the old policy from supabase/schema.sql.
drop policy if exists "test_content_select_purchased" on test_content;
create policy "test_content_select_purchased"
  on test_content for select
  using (
    test_content.is_free
    or exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.status = 'active'
        and (
          test_content.test_id = any (p.purchased_tests)
          or now() < timestamptz '2026-11-04 23:59:59+05:30'
        )
    )
  );
