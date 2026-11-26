# Play release (do not run without the owner's approval)

The current Play listing `in.tettesthub.app` is a TWA. The native production build uses the same app id and the same
upload key, so it can replace the TWA as a normal update.

1. Finish device QA with the preview APK.
2. Check the latest versionCode in Play Console → choose a higher number.
3. GitHub → Actions → **Native app build** → Run workflow on `feature/native-app-v1`, `build_aab = true`, `version_code = <n>`.
4. Download the `tettesthub-production-aab` artifact.
5. Upload it to an **internal testing** track first. Update the Data safety form: account, app activity and notifications. No payments.
6. Do not upload while the current production review is in progress.
7. Merge `feature/native-app-v1` into `main` only after review. Pushing to main deploys the website, so keep the merge separate and expect a deploy.
