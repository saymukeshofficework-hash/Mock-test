import * as Crypto from "expo-crypto";
import type { ScoreResult } from "@/engine/types";
import { db } from "./db";

export type AttemptStatus = "in_progress" | "queued" | "submitted";
export type Attempt = {
  id: string;
  user_id: string;
  test_key: string;
  series_id: string;
  n: number;
  status: AttemptStatus;
  started_at: number;
  updated_at: number;
  submitted_at: number | null;
  remaining_sec: number;
  total_sec: number;
  current: number;
  q_count: number;
  answers: (number | null)[];
  marked: boolean[];
  visited: boolean[];
  result: (ScoreResult & { timeSec: number }) | null;
  idem: string;
  title: string;
};
type Row = Omit<Attempt, "answers" | "marked" | "visited" | "result"> & { answers: string; marked: string; visited: string; result: string | null };

const parse = (r: Row): Attempt => ({
  ...r,
  answers: JSON.parse(r.answers),
  marked: JSON.parse(r.marked),
  visited: JSON.parse(r.visited),
  result: r.result ? JSON.parse(r.result) : null,
});

export async function createAttempt(a: Pick<Attempt, "user_id" | "test_key" | "series_id" | "n" | "total_sec" | "q_count" | "title">): Promise<Attempt> {
  const now = Date.now();
  const att: Attempt = {
    ...a,
    id: Crypto.randomUUID(),
    status: "in_progress",
    started_at: now,
    updated_at: now,
    submitted_at: null,
    remaining_sec: a.total_sec,
    current: 0,
    answers: Array(a.q_count).fill(null),
    marked: Array(a.q_count).fill(false),
    visited: Array(a.q_count).fill(false),
    result: null,
    idem: Crypto.randomUUID(),
  };
  const d = await db();
  await d.runAsync(
    `INSERT INTO attempts (id, user_id, test_key, series_id, n, status, started_at, updated_at, submitted_at, remaining_sec, total_sec, current, q_count, answers, marked, visited, result, idem, title)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, 0, ?, ?, ?, ?, NULL, ?, ?)`,
    att.id, att.user_id, att.test_key, att.series_id, att.n, att.status, now, now, att.remaining_sec, att.total_sec, att.q_count,
    JSON.stringify(att.answers), JSON.stringify(att.marked), JSON.stringify(att.visited), att.idem, att.title,
  );
  return att;
}

/** Autosave of the running attempt (called on every answer and every few seconds of the timer). */
export async function saveProgress(a: Pick<Attempt, "id" | "remaining_sec" | "current" | "answers" | "marked" | "visited">) {
  const d = await db();
  await d.runAsync(
    "UPDATE attempts SET remaining_sec = ?, current = ?, answers = ?, marked = ?, visited = ?, updated_at = ? WHERE id = ? AND status = 'in_progress'",
    Math.max(0, Math.round(a.remaining_sec)), a.current, JSON.stringify(a.answers), JSON.stringify(a.marked), JSON.stringify(a.visited), Date.now(), a.id,
  );
}

export async function markQueued(id: string, remaining: number) {
  const d = await db();
  await d.runAsync("UPDATE attempts SET status = 'queued', remaining_sec = ?, submitted_at = ?, updated_at = ? WHERE id = ? AND status = 'in_progress'", remaining, Date.now(), Date.now(), id);
}

/** Idempotent: a submitted attempt is never scored or stored twice. */
export async function finishAttempt(id: string, result: ScoreResult & { timeSec: number }) {
  const d = await db();
  await d.runAsync(
    "UPDATE attempts SET status = 'submitted', result = ?, submitted_at = COALESCE(submitted_at, ?), updated_at = ? WHERE id = ? AND status != 'submitted'",
    JSON.stringify(result), Date.now(), Date.now(), id,
  );
}

export async function getAttempt(id: string): Promise<Attempt | null> {
  const d = await db();
  const r = await d.getFirstAsync<Row>("SELECT * FROM attempts WHERE id = ?", id);
  return r ? parse(r) : null;
}

export async function inProgressFor(userId: string, testKey: string): Promise<Attempt | null> {
  const d = await db();
  const r = await d.getFirstAsync<Row>("SELECT * FROM attempts WHERE user_id = ? AND test_key = ? AND status = 'in_progress' ORDER BY updated_at DESC LIMIT 1", userId, testKey);
  return r ? parse(r) : null;
}

export async function listAttempts(userId: string, status?: AttemptStatus): Promise<Attempt[]> {
  const d = await db();
  const rows = status
    ? await d.getAllAsync<Row>("SELECT * FROM attempts WHERE user_id = ? AND status = ? ORDER BY updated_at DESC LIMIT 200", userId, status)
    : await d.getAllAsync<Row>("SELECT * FROM attempts WHERE user_id = ? ORDER BY updated_at DESC LIMIT 200", userId);
  return rows.map(parse);
}

export async function discardAttempt(id: string) {
  const d = await db();
  await d.runAsync("DELETE FROM attempts WHERE id = ? AND status = 'in_progress'", id);
}

/** Last submitted attempt of the same test before this one (for "vs last time"). */
export async function previousResult(userId: string, testKey: string, beforeId: string): Promise<Attempt | null> {
  const d = await db();
  const cur = await d.getFirstAsync<{ submitted_at: number }>("SELECT submitted_at FROM attempts WHERE id = ?", beforeId);
  if (!cur) return null;
  const r = await d.getFirstAsync<Row>(
    "SELECT * FROM attempts WHERE user_id = ? AND test_key = ? AND status = 'submitted' AND id != ? AND submitted_at < ? ORDER BY submitted_at DESC LIMIT 1",
    userId, testKey, beforeId, cur.submitted_at,
  );
  return r ? parse(r) : null;
}

/** Days (YYYY-MM-DD, local) on which the account submitted at least one test or quiz. */
export async function activeDays(userId: string, sinceMs: number): Promise<Set<string>> {
  const d = await db();
  const rows = await d.getAllAsync<{ at: number }>(
    "SELECT submitted_at AS at FROM attempts WHERE user_id = ? AND status = 'submitted' AND submitted_at >= ? UNION ALL SELECT at FROM ca_quiz WHERE user_id = ? AND at >= ?",
    userId, sinceMs, userId, sinceMs,
  );
  return new Set(rows.map((r) => localDay(new Date(r.at))));
}
export async function countToday(userId: string): Promise<number> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const d = await db();
  const r = await d.getFirstAsync<{ c: number }>(
    "SELECT (SELECT COUNT(*) FROM attempts WHERE user_id = ? AND status = 'submitted' AND submitted_at >= ?) + (SELECT COUNT(*) FROM ca_quiz WHERE user_id = ? AND at >= ?) AS c",
    userId, start.getTime(), userId, start.getTime(),
  );
  return r?.c ?? 0;
}
export const localDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
