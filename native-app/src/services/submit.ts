import { parseTestKey } from "@/data/catalog";
import type { NTest, ScoreResult } from "@/engine/types";
import { finishAttempt, getAttempt, listAttempts, markQueued, type Attempt } from "./attempts";
import { loadTest, saveTest } from "./offline";
import { scoreAttempt } from "./tests";

export type SubmitOutcome = { kind: "done"; result: ScoreResult & { timeSec: number } } | { kind: "queued" };

/**
 * Submits once. Hub series score on the device; main series need the server, so with no
 * network the attempt is queued and scored later (idempotent: a submitted attempt stays as it is).
 */
export async function submitAttempt(att: Attempt, test: NTest, remainingSec: number): Promise<SubmitOutcome> {
  const fresh = await getAttempt(att.id);
  if (fresh?.status === "submitted" && fresh.result) return { kind: "done", result: fresh.result };
  const parsed = parseTestKey(att.test_key);
  if (!parsed) throw new Error("bad_test_key");
  const timeSec = Math.max(0, att.total_sec - Math.round(remainingSec));
  await markQueued(att.id, Math.round(remainingSec));
  try {
    const r = await scoreAttempt(test, parsed.series, parsed.n, att.answers);
    const { solutions, ...rest } = r;
    // Answer keys/solutions stay only in the encrypted test copy, never in plain attempt rows.
    if (solutions && !test.key_) await saveTest(att.user_id, { ...test, key_: solutions }, "session");
    const result = { ...rest, timeSec };
    await finishAttempt(att.id, result);
    return { kind: "done", result };
  } catch {
    return { kind: "queued" };
  }
}

/** Scores queued attempts once the network is back. Returns how many were completed. */
export async function retryQueued(userId: string): Promise<number> {
  const queued = await listAttempts(userId, "queued");
  let n = 0;
  for (const a of queued) {
    const parsed = parseTestKey(a.test_key);
    const test = await loadTest(userId, a.test_key);
    if (!parsed || !test) continue;
    try {
      const r = await scoreAttempt(test, parsed.series, parsed.n, a.answers);
      const { solutions, ...rest } = r;
      if (solutions && !test.key_) await saveTest(userId, { ...test, key_: solutions }, "session");
      await finishAttempt(a.id, { ...rest, timeSec: Math.max(0, a.total_sec - a.remaining_sec) });
      n++;
    } catch {
      // still offline or server error: try again later
    }
  }
  return n;
}
