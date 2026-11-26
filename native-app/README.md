# TETTESTHUB native Android app

React Native + Expo (SDK 54) + TypeScript (strict) + Expo Router. It is a real native app, not a WebView or TWA.
Students sign in with the same account as https://tettesthub.in and take the tests they already have access to.

The app is for consumption only. It has no payments, prices, buy links or Free/Paid labels.

## Run locally
```
cd native-app
npm ci
npx expo start          # Expo Go / dev client
npm run typecheck && npm run lint && npm test
```

## Build
- **Preview APK** (`in.tettesthub.app.preview`, installs next to the Play app): pushing to `feature/native-app-v1` runs
  `.github/workflows/native-app-apk.yml`, and the APK is uploaded as the workflow artifact `tettesthub-preview-apk`.
  You can also run `eas build -p android --profile preview` with your own Expo login.
- **Production AAB** (`in.tettesthub.app`): run the same workflow by hand with `build_aab=true` and a `version_code`.
  It is signed with the existing upload key from repo secrets and kept as a workflow artifact only.
  See docs/PLAY_RELEASE.md.

## Layout
- `app/`: screens (Expo Router). `(auth)` login/register/forgot; `(tabs)` Home, Exams, My Tests, Current Affairs, Profile;
  `test/[key]` test engine; `result`, `solutions`, `series`, `exam-info`, `ca`, `ca-quiz`, `bookmarks`, `change-password`.
- `src/engine/`: normalising questions and scoring (unit tested).
- `src/services/`: Supabase auth, test fetch, attempts (SQLite), offline encryption, current affairs, notifications.
- `src/data/catalog.ts`: test series list (no questions). `src/data/exams.json`: exam calendar synced from the website.

Docs: [API](docs/API.md) · [Security](docs/SECURITY.md) · [Testing](docs/TESTING.md) · [Blockers](docs/BLOCKERS.md) ·
[Play release](docs/PLAY_RELEASE.md) · [Progress](docs/PROGRESS.md)
