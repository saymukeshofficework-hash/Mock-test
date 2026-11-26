import { decrypt, deleteKey, encrypt, getKey } from "@/lib/crypto";
import type { NTest } from "@/engine/types";
import { db } from "./db";

const keyName = (userId: string) => `tth_off_${userId.replace(/[^a-zA-Z0-9]/g, "")}`;
export type OfflineKind = "download" | "session";

/** Saves a test encrypted (AES-GCM, per-account key in the Android Keystore). */
export async function saveTest(userId: string, test: NTest, kind: OfflineKind) {
  const payload = encrypt(await getKey(keyName(userId)), JSON.stringify(test));
  const d = await db();
  await d.runAsync(
    "INSERT OR REPLACE INTO offline_tests (user_id, test_key, kind, payload, saved_at) VALUES (?, ?, ?, ?, ?)",
    userId, test.key, kind, payload, Date.now(),
  );
}

export async function loadTest(userId: string, testKey: string): Promise<NTest | null> {
  const d = await db();
  const row = await d.getFirstAsync<{ payload: string }>(
    "SELECT payload FROM offline_tests WHERE user_id = ? AND test_key = ? ORDER BY kind = 'download' DESC LIMIT 1",
    userId, testKey,
  );
  if (!row) return null;
  try {
    return JSON.parse(decrypt(await getKey(keyName(userId)), row.payload)) as NTest;
  } catch {
    return null;
  }
}

export async function listDownloads(userId: string): Promise<{ test_key: string; saved_at: number }[]> {
  const d = await db();
  return d.getAllAsync("SELECT test_key, saved_at FROM offline_tests WHERE user_id = ? AND kind = 'download' ORDER BY saved_at DESC", userId);
}

export async function removeTest(userId: string, testKey: string, kind?: OfflineKind) {
  const d = await db();
  if (kind) await d.runAsync("DELETE FROM offline_tests WHERE user_id = ? AND test_key = ? AND kind = ?", userId, testKey, kind);
  else await d.runAsync("DELETE FROM offline_tests WHERE user_id = ? AND test_key = ?", userId, testKey);
}

export async function dropOfflineKey(userId: string) {
  await deleteKey(keyName(userId));
}

/** Bookmarked questions hold test content, so they are encrypted with the same key. */
export async function saveBookmark(userId: string, testKey: string, qIndex: number, data: unknown) {
  const d = await db();
  const payload = encrypt(await getKey(keyName(userId)), JSON.stringify(data));
  await d.runAsync("INSERT OR REPLACE INTO bookmarks (user_id, test_key, q_index, payload, created_at) VALUES (?, ?, ?, ?, ?)", userId, testKey, qIndex, payload, Date.now());
}
export async function removeBookmark(userId: string, testKey: string, qIndex: number) {
  const d = await db();
  await d.runAsync("DELETE FROM bookmarks WHERE user_id = ? AND test_key = ? AND q_index = ?", userId, testKey, qIndex);
}
export async function listBookmarks<T>(userId: string): Promise<{ test_key: string; q_index: number; data: T }[]> {
  const d = await db();
  const rows = await d.getAllAsync<{ test_key: string; q_index: number; payload: string }>(
    "SELECT test_key, q_index, payload FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC", userId,
  );
  const key = await getKey(keyName(userId));
  const out: { test_key: string; q_index: number; data: T }[] = [];
  for (const r of rows) {
    try {
      out.push({ test_key: r.test_key, q_index: r.q_index, data: JSON.parse(decrypt(key, r.payload)) as T });
    } catch {
      // unreadable after a key reset: skip
    }
  }
  return out;
}
export async function bookmarkedIndexes(userId: string, testKey: string): Promise<Set<number>> {
  const d = await db();
  const rows = await d.getAllAsync<{ q_index: number }>("SELECT q_index FROM bookmarks WHERE user_id = ? AND test_key = ?", userId, testKey);
  return new Set(rows.map((r) => r.q_index));
}
