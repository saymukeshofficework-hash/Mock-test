# Security review (native-app v1)

- **No secrets in the app or repo.** Only the public Supabase URL and anon key are used. Those are already public in the website. No service-role key, Razorpay key or keystore.
- **No bundled questions or answer keys.** `src/data` holds only series metadata and the public exam calendar. Questions are fetched after login. RLS (main) and series tokens (hub) decide access on the server.
- **Session** is stored AES-256-GCM encrypted in AsyncStorage. The key lives in Android Keystore-backed SecureStore.
- **Offline tests and the solutions saved for review** are encrypted per account (key `tth_off_<uid>` in SecureStore). Attempt rows keep only the user's own answers and score. Logout wipes the SQLite rows, the offline key and the series tokens.
- **Scoring**: main tests are scored on the server, as on the website. Hub tests are scored on the device, exactly as the website's engine does, because the website does the same.
- **Locked tests**: if the server says a test is no longer accessible, its local copies are removed.
- **Payments**: none. The app has no buy links or prices.
- **Permissions**: notifications only. RECORD_AUDIO and SYSTEM_ALERT_WINDOW are blocked.
- **RLS / database**: no schema, policy or data changes were made. Testing used read-only queries.
- **Known gaps**: no certificate pinning; device-local attempt history (see BLOCKERS); a rooted device can read decrypted data from memory while a test is open, which is the same exposure as the website.
