Vendored copy of `@supabase/supabase-js` (UMD build), used by the TET Test Hub login/
dashboard/test pages. Vendored locally (same pattern as `video-cutter/vendor/`) instead
of loaded from a CDN, so the site keeps working even when a CDN is blocked or offline,
and so it can be tested without an external network dependency.

- Package: @supabase/supabase-js
- Version: 2.112.4
- License: MIT (see LICENSE in this folder)
- Source: https://www.npmjs.com/package/@supabase/supabase-js

To update: `npm install @supabase/supabase-js@latest --no-save` somewhere, then copy
`node_modules/@supabase/supabase-js/dist/umd/supabase.js` over the file in this folder.
