# Testing report

Run on 2026-11-26 in the build container (Node 22):

| Check | Command | Result |
|---|---|---|
| TypeScript strict | `npm run typecheck` | Pass (0 errors) |
| ESLint (expo config) | `npm run lint` | Pass (0 problems) |
| Unit tests | `npm test` | 15 of 15 pass (scoring rules for every series type, LaTeX text, catalog integrity) |
| Android build | GitHub Actions `Native app build` | See the workflow run on `feature/native-app-v1` (the container cannot reach Google's Maven, so no local Gradle build) |

Scoring rules were checked against the website engines: main RPC score, RRB NTPC c − w/3, SSC GD +2/−0.25,
RRB SM +1/−1/3, count-only series, JSON `marks` series.

## Not yet tested (needs a device)
- Install and sign in on a real phone, full test attempt, offline download and resume, notification delivery at 05:00 IST.
- Owner account TET26DAHIYA was **not** used; no credentials were provided.
