import * as Network from "expo-network";
import { supabase } from "@/lib/supabase";
import { isFreeTest, testKey, type Series } from "@/data/catalog";
import { normalizeHub, normalizeMain } from "@/engine/normalize";
import { fromRpc, mainPayload, scoreClient, type Answers, type RpcScore } from "@/engine/scoring";
import type { NTest, ScoreResult } from "@/engine/types";
import { getSeriesToken, hubCall, publicHubTestUrl } from "./hub";
import { loadTest, removeTest } from "./offline";

export type Ctx = { userId: string; accessToken: string; purchased: string[] };
export type FetchResult =
  | { status: "ok"; test: NTest; offline?: boolean }
  | { status: "locked" }
  | { status: "login" }
  | { status: "offline" }
  | { status: "error"; message: string };

async function online(): Promise<boolean> {
  try {
    const s = await Network.getNetworkStateAsync();
    return s.isConnected !== false && s.isInternetReachable !== false;
  } catch {
    return true;
  }
}

/** Whether the account can open a test, from the data the server sends (RLS / purchase tokens decide for real). */
export function looksUnlocked(series: Series, n: number, ctx: Ctx | null, hubOwned: Set<string>): boolean {
  if (isFreeTest(n)) return true;
  if (!ctx) return false;
  if (series.source === "main") return ctx.purchased.includes(series.mainId!(n));
  return !!series.product && hubOwned.has(series.product);
}

async function fetchRemote(series: Series, n: number, ctx: Ctx | null): Promise<FetchResult> {
  const key = testKey(series.id, n);
  if (series.source === "main") {
    if (!ctx) return { status: "login" };
    const id = series.mainId!(n);
    const { data, error } = await supabase.rpc("get_test_questions", { p_test_id: id });
    if (error) return { status: "error", message: error.message };
    // RLS hides tests this account hasn't unlocked: the RPC then returns null.
    if (!Array.isArray(data) || data.length === 0) return { status: "locked" };
    return { status: "ok", test: normalizeMain(key, series, n, data) };
  }
  const folder = series.folder!;
  if (isFreeTest(n)) {
    const r = await fetch(publicHubTestUrl(folder, n));
    if (!r.ok) return { status: "error", message: `http_${r.status}` };
    return { status: "ok", test: normalizeHub(key, series, n, await r.json()) };
  }
  if (!ctx) return { status: "login" };
  for (const refresh of [false, true]) {
    const token = await getSeriesToken(ctx.userId, ctx.accessToken, series.product!, refresh);
    if (!token) return { status: "locked" };
    const res = await hubCall<Record<string, unknown>>({ action: "test", token, n, series: series.seriesParam ? folder : undefined });
    if (res.ok && res.data && Array.isArray((res.data as { questions?: unknown }).questions)) {
      return { status: "ok", test: normalizeHub(key, series, n, res.data as never) };
    }
    if (res.status !== 404 && res.status !== 403) return { status: "error", message: `http_${res.status}` };
  }
  return { status: "locked" };
}

/**
 * Loads a test for an authorised account. Online, the server re-checks access every time
 * (and a downloaded copy is dropped if access was withdrawn). Offline, the encrypted copy is used.
 */
export async function fetchTest(series: Series, n: number, ctx: Ctx | null): Promise<FetchResult> {
  const key = testKey(series.id, n);
  if (!(await online())) {
    const cached = ctx ? await loadTest(ctx.userId, key) : null;
    return cached ? { status: "ok", test: cached, offline: true } : { status: "offline" };
  }
  try {
    const res = await fetchRemote(series, n, ctx);
    if (res.status === "locked" && ctx) await removeTest(ctx.userId, key);
    return res;
  } catch (e) {
    const cached = ctx ? await loadTest(ctx.userId, key) : null;
    if (cached) return { status: "ok", test: cached, offline: true };
    return { status: "error", message: e instanceof Error ? e.message : String(e) };
  }
}

/** Scores an attempt the same way the website does. Main tests need the server; hub tests score on device. */
export async function scoreAttempt(test: NTest, series: Series, n: number, answers: Answers): Promise<ScoreResult> {
  if (test.scoring.kind === "marks") return scoreClient(test, answers);
  const { data, error } = await supabase.rpc("score_test_attempt", { p_test_id: series.mainId!(n), p_answers: mainPayload(test, answers) });
  if (error || !data) throw new Error(error?.message ?? "score_failed");
  return fromRpc(test, data as RpcScore);
}

/** Series this account has bought on the website (exam-hub products), checked with the server. */
export async function ownedHubProducts(ctx: Ctx, products: string[]): Promise<Set<string>> {
  const out = new Set<string>();
  await Promise.all(
    products.map(async (p) => {
      try {
        if (await getSeriesToken(ctx.userId, ctx.accessToken, p)) out.add(p);
      } catch {
        // offline: unknown
      }
    }),
  );
  return out;
}
