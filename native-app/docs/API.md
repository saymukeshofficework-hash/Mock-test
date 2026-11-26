# APIs the app uses (all existing; nothing new was deployed)

## Main Supabase project (ovaubhekxjtkodkhsybg), public anon key + user JWT
| Call | Use |
|---|---|
| `auth.signInWithPassword` | Login. Identifier mapping: has `@` → email; 10 digits → `91<d>@students.tettesthub.app`; `91`+10 digits → `<d>@…`; else `<id>@students.tettesthub.app`. Same as the website. |
| `auth.signUp`, `resetPasswordForEmail`, `updateUser` | Register, forgot password (redirect to the website reset page), change password. |
| `profiles` select (own row, RLS) | Name, student id, purchased tests. |
| `functions/v1/tet-unlock` | Syncs website purchases into the profile after login (same call the website makes). |
| `rpc get_test_questions(p_test_id)` | Questions without answers. Returns null when RLS hides the test → shown as locked. |
| `rpc score_test_attempt(p_test_id, p_answers)` | Server scoring for main tests. RRB NTPC applies −1/3 per wrong on top, as the website does. |

## Exam hub (znulepzdihzhjmuvyroi) `functions/v1/notes-checkout`
| Action | Use |
|---|---|
| `claim {product, access_token}` → `{token}` | Series token for a series the user owns (404 = not owned → locked). Token is kept in SecureStore per user. |
| `test {token, n, series?}` | One test's JSON (questions, answers, solutions). Kept only in memory and in the encrypted offline copy. |
| `ca_index`, `ca_day {day?}` | Current affairs list and one day (content already published by the website pipeline). |
| Public storage `…/<folder>/01.json` | Test 1 of each hub series is free on the website; the app reads the same public file. |

## Proposed for staging (not deployed)
- `test_attempts` table (user_id, test_key, answers, score, created_at) with owner-only RLS, so history syncs across devices and a real rank can be computed.
- `my-access` edge function returning the user's unlocked series in one call (today the app calls `claim` per series).
