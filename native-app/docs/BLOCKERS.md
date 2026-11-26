# Blockers and follow-ups

| # | Item | Needs |
|---|---|---|
| 1 | Push notifications (FCM) | A Firebase project and `google-services.json` (never committed; add as a secret). Until then all reminders are local notifications scheduled on the phone. |
| 2 | Rank / leaderboard | A server table of attempts. The app shows "rank unavailable" rather than a fake rank. |
| 3 | Attempt history across devices | Same `test_attempts` table (proposed in API.md, staging first). History is device-local today. |
| 4 | Production AAB versionCode | Check the latest versionCode in Play Console and pass a higher one to the workflow. |
| 5 | EAS cloud builds (optional) | `EXPO_TOKEN` as a GitHub Actions secret if you prefer EAS over the Gradle workflow. |
| 6 | Crash reporting | Optional Sentry DSN (`EXPO_PUBLIC_SENTRY_DSN`); not wired yet. |
| 7 | CPCT typing test and MPGRB | Deferred; they need a different engine. |
| 8 | Question report | Opens WhatsApp with the question reference, because there is no reports table. |
| 9 | Device QA | Real-phone pass before any release (see TESTING.md). |
