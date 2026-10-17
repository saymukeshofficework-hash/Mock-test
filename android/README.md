# TETTESTHUB Android app (Trusted Web Activity)

Wraps https://tettesthub.in/examhelp/ . Package: `in.tettesthub.app`.

Build (on a PC with Node 18+ and JDK 17; Bubblewrap downloads the Android SDK itself):
1. `npm i -g @bubblewrap/cli`
2. In this folder: `bubblewrap build` (use the existing `twa-manifest.json`; create `upload-keystore.jks` when asked; NEVER commit it).
3. Upload `app-release-bundle.aab` to Play Console > closed testing.
4. Play Console > App integrity > App signing: copy the SHA-256 certificate fingerprint into `/.well-known/assetlinks.json` and deploy. Without this the address bar shows.

Policy: app mode (`?source=android`) hides prices and Buy buttons (`data-sale` in examhelp). Do not add payment links inside the app.
