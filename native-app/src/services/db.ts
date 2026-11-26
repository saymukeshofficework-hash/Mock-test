import * as SQLite from "expo-sqlite";

let dbp: Promise<SQLite.SQLiteDatabase> | null = null;

/** Device-local store: attempts, resume state, bookmarks and encrypted offline copies. */
export function db(): Promise<SQLite.SQLiteDatabase> {
  if (!dbp) {
    dbp = (async () => {
      const d = await SQLite.openDatabaseAsync("tettesthub.db");
      await d.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS attempts (
          id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, test_key TEXT NOT NULL, series_id TEXT NOT NULL, n INTEGER NOT NULL,
          status TEXT NOT NULL, started_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, submitted_at INTEGER,
          remaining_sec INTEGER NOT NULL, total_sec INTEGER NOT NULL, current INTEGER NOT NULL DEFAULT 0, q_count INTEGER NOT NULL,
          answers TEXT NOT NULL, marked TEXT NOT NULL, visited TEXT NOT NULL, result TEXT, idem TEXT NOT NULL, title TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS attempts_user ON attempts(user_id, status, updated_at);
        CREATE TABLE IF NOT EXISTS bookmarks (
          user_id TEXT NOT NULL, test_key TEXT NOT NULL, q_index INTEGER NOT NULL, payload TEXT NOT NULL, created_at INTEGER NOT NULL,
          PRIMARY KEY (user_id, test_key, q_index)
        );
        CREATE TABLE IF NOT EXISTS offline_tests (
          user_id TEXT NOT NULL, test_key TEXT NOT NULL, kind TEXT NOT NULL, payload TEXT NOT NULL, saved_at INTEGER NOT NULL,
          PRIMARY KEY (user_id, test_key, kind)
        );
        CREATE TABLE IF NOT EXISTS ca_bookmarks (
          user_id TEXT NOT NULL, day TEXT NOT NULL, item_id TEXT NOT NULL, payload TEXT NOT NULL, created_at INTEGER NOT NULL,
          PRIMARY KEY (user_id, day, item_id)
        );
        CREATE TABLE IF NOT EXISTS ca_quiz (
          user_id TEXT NOT NULL, day TEXT NOT NULL, score INTEGER NOT NULL, total INTEGER NOT NULL, at INTEGER NOT NULL,
          PRIMARY KEY (user_id, day)
        );
      `);
      return d;
    })();
  }
  return dbp;
}

/** Removes everything stored for one account (logout / account switch). */
export async function wipeUser(userId: string) {
  const d = await db();
  for (const t of ["attempts", "bookmarks", "offline_tests", "ca_bookmarks", "ca_quiz"]) {
    await d.runAsync(`DELETE FROM ${t} WHERE user_id = ?`, userId);
  }
}
