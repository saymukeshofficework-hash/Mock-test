# Progress — native app v1 (2026-11-26)

- [x] Project setup: Expo SDK 54, TS strict, Expo Router, EAS profiles (development / preview APK / production AAB)
- [x] Data layer: Supabase auth (same accounts), test fetch for main + hub series, scoring identical to website, encrypted offline storage, queued submissions
- [x] Auth screens: login (email / mobile / student id), register, forgot password, change password
- [x] Home, Exams, Series, Exam info
- [x] Test engine: instructions, server-checked access, timer, Hi/En, palette colours, autosave/resume, auto-submit, exit protection
- [x] Results, solutions, retry incorrect, compare with last attempt
- [x] Current affairs: date strip, 7 filters, search, bookmarks, daily quiz, archive
- [x] My Tests: incomplete, completed, downloaded, incorrect practice, bookmarks
- [x] Profile: stats, language, theme, daily goal, notification settings, help/privacy/terms, delete account, logout, version
- [x] Typecheck, lint, unit tests (15/15)
- [x] GitHub Actions APK workflow
- [x] Preview APK built on GitHub Actions (run 45769341200, artifact `tettesthub-preview-apk`, 22.9 MB zip)
- [ ] Device QA, FCM, server attempt history (see BLOCKERS.md)
