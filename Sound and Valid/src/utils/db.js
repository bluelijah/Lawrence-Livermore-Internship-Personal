/**
 * SQLite (via sql.js) data layer.
 *
 * The DB runs entirely in-memory and is serialized to IndexedDB after
 * every write so it survives page reloads. All query functions are
 * synchronous once initDB() has resolved.
 *
 * NOTE: sql.js in this build has a bug where sqlite3_bind_text is called
 * with SQLITE_STATIC (0), so bound string parameters get freed before
 * step() runs and arrive as NULL. We work around this by embedding all
 * values directly into SQL strings via the esc() helper instead of using
 * parameterized queries.
 */

import initSqlJs from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";

// ── IndexedDB helpers ──────────────────────────────────────────────────────

const IDB_NAME  = "sv-db";
const IDB_STORE = "sqlite";
const IDB_KEY   = "db";

function loadFromIDB() {
  return new Promise((resolve) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = (e) => e.target.result.createObjectStore(IDB_STORE);
    req.onsuccess = (e) => {
      const tx  = e.target.result.transaction(IDB_STORE, "readonly");
      const get = tx.objectStore(IDB_STORE).get(IDB_KEY);
      get.onsuccess = () => resolve(get.result ?? null);
      get.onerror   = () => resolve(null);
    };
    req.onerror = () => resolve(null);
  });
}

function saveToIDB(data) {
  return new Promise((resolve) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = (e) => e.target.result.createObjectStore(IDB_STORE);
    req.onsuccess = (e) => {
      const tx    = e.target.result.transaction(IDB_STORE, "readwrite");
      const store = tx.objectStore(IDB_STORE);
      store.put(data, IDB_KEY);
      tx.oncomplete = resolve;
      tx.onerror    = resolve;
    };
    req.onerror = resolve;
  });
}

// ── DB instance ────────────────────────────────────────────────────────────

let db = null;

function _save() {
  if (!db) return;
  saveToIDB(db.export());
}

// ── SQL value escaping ─────────────────────────────────────────────────────
// Embed values directly in SQL to avoid sql.js param-binding bug.

function esc(v) {
  if (v == null) return "NULL";
  return `'${String(v).replace(/'/g, "''")}'`;
}

// ── Schema ─────────────────────────────────────────────────────────────────

export async function initDB() {
  const SQL   = await initSqlJs({ locateFile: () => wasmUrl });
  const saved = await loadFromIDB();
  db = saved ? new SQL.Database(saved) : new SQL.Database();
  // Run each CREATE TABLE separately — multi-statement exec is unreliable in sql.js
  db.exec(`CREATE TABLE IF NOT EXISTS object_progress (
    object_id        TEXT PRIMARY KEY,
    stars            INTEGER NOT NULL DEFAULT 0,
    has_listened     INTEGER NOT NULL DEFAULT 0,
    matched          INTEGER NOT NULL DEFAULT 0,
    match_type       TEXT,
    first_matched_at TEXT
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS race_results (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    grid_size    TEXT NOT NULL,
    time_seconds REAL NOT NULL,
    completed_at TEXT NOT NULL
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS daily_progress (
    date_str      TEXT PRIMARY KEY,
    object_id     TEXT NOT NULL,
    attempts      INTEGER NOT NULL DEFAULT 0,
    matched       INTEGER NOT NULL DEFAULT 0,
    match_type    TEXT,
    best_accuracy REAL NOT NULL DEFAULT 0
  )`);
  _save();
}

// ── Star computation ───────────────────────────────────────────────────────

function computeStars(hasListened, matched, matchType) {
  if (matched && matchType === "exact")    return 3;
  if (matched && matchType === "harmonic") return 2;
  if (hasListened)                         return 1;
  return 0;
}

// ── Object progress ────────────────────────────────────────────────────────

function _getProgress(objectId) {
  const res = db.exec(
    `SELECT has_listened, matched, match_type FROM object_progress WHERE object_id = ${esc(objectId)}`
  );
  if (!res.length || !res[0].values.length) return null;
  const [has_listened, matched, match_type] = res[0].values[0];
  return { has_listened, matched, match_type };
}

export function recordListen(objectId) {
  if (!db) return;
  const existing = _getProgress(objectId);
  if (existing && existing.has_listened) return;

  if (existing) {
    db.exec(
      `UPDATE object_progress SET has_listened=1, stars=MAX(stars,1) WHERE object_id=${esc(objectId)}`
    );
  } else {
    db.exec(
      `INSERT INTO object_progress (object_id, has_listened, stars) VALUES (${esc(objectId)}, 1, 1)`
    );
  }
  _save();
}

export function recordMatch(objectId, matchType) {
  if (!db) return;
  const existing = _getProgress(objectId);

  const currentType = existing?.match_type ?? null;
  const newType =
    currentType === "exact" ? "exact"
    : matchType === "exact" ? "exact"
    : "harmonic";

  const stars = computeStars(1, 1, newType);
  const now   = new Date().toISOString();

  if (existing) {
    db.exec(
      `UPDATE object_progress SET has_listened=1, matched=1, match_type=${esc(newType)}, stars=${stars}, first_matched_at=COALESCE(first_matched_at,${esc(now)}) WHERE object_id=${esc(objectId)}`
    );
  } else {
    db.exec(
      `INSERT INTO object_progress (object_id, has_listened, matched, match_type, stars, first_matched_at) VALUES (${esc(objectId)}, 1, 1, ${esc(newType)}, ${stars}, ${esc(now)})`
    );
  }
  _save();
}

export function getObjectStars(objectId) {
  if (!db) return 0;
  const res = db.exec(
    `SELECT stars FROM object_progress WHERE object_id = ${esc(objectId)}`
  );
  return res.length && res[0].values.length ? res[0].values[0][0] : 0;
}

export function getAllObjectStars() {
  if (!db) return new Map();
  const res = db.exec("SELECT object_id, stars FROM object_progress");
  const map = new Map();
  if (res.length) {
    for (const [id, stars] of res[0].values) {
      map.set(id, stars);
    }
  }
  return map;
}

// ── Race results ───────────────────────────────────────────────────────────

export function saveRaceResult(gridSize, timeSeconds) {
  if (!db) return { isNewBest: false, best: timeSeconds };
  const now = new Date().toISOString();
  db.exec(
    `INSERT INTO race_results (grid_size, time_seconds, completed_at) VALUES (${esc(gridSize)}, ${timeSeconds}, ${esc(now)})`
  );
  const res  = db.exec(
    `SELECT MIN(time_seconds) FROM race_results WHERE grid_size = ${esc(gridSize)}`
  );
  const best      = res.length && res[0].values[0][0] != null ? res[0].values[0][0] : timeSeconds;
  const isNewBest = timeSeconds <= best;
  _save();
  return { isNewBest, best };
}

export function getRaceBest(gridSize) {
  if (!db) return null;
  const res = db.exec(
    `SELECT MIN(time_seconds) FROM race_results WHERE grid_size = ${esc(gridSize)}`
  );
  return res.length && res[0].values[0][0] != null ? res[0].values[0][0] : null;
}

export function getRaceHistory(gridSize, limit = 3) {
  if (!db) return [];
  const res = db.exec(
    `SELECT time_seconds, completed_at FROM race_results WHERE grid_size = ${esc(gridSize)} ORDER BY completed_at DESC LIMIT ${limit}`
  );
  if (!res.length) return [];
  return res[0].values.map(([time_seconds, completed_at]) => ({ time_seconds, completed_at }));
}

// ── Daily progress ─────────────────────────────────────────────────────────

export function getDailyState(dateStr) {
  if (!db) return null;
  const res = db.exec(
    `SELECT object_id, attempts, matched, match_type, best_accuracy FROM daily_progress WHERE date_str = ${esc(dateStr)}`
  );
  if (!res.length || !res[0].values.length) return null;
  const [objectId, attempts, matched, match_type, best_accuracy] = res[0].values[0];
  return {
    objectId,
    attempts,
    matched: !!matched,
    matchType: match_type,
    bestAccuracy: best_accuracy,
  };
}

export function saveDailyState(dateStr, state) {
  if (!db) return;
  const existing = getDailyState(dateStr);
  const attempts    = state.attempts ?? 0;
  const matched     = state.matched ? 1 : 0;
  const matchType   = esc(state.matchType ?? null);
  const bestAcc     = state.bestAccuracy ?? 0;
  if (existing) {
    db.exec(
      `UPDATE daily_progress SET attempts=${attempts}, matched=${matched}, match_type=${matchType}, best_accuracy=${bestAcc} WHERE date_str=${esc(dateStr)}`
    );
  } else {
    db.exec(
      `INSERT INTO daily_progress (date_str, object_id, attempts, matched, match_type, best_accuracy) VALUES (${esc(dateStr)}, ${esc(state.objectId)}, ${attempts}, ${matched}, ${matchType}, ${bestAcc})`
    );
  }
  _save();
}

export function getDailyStreak() {
  if (!db) return 0;
  const res = db.exec(
    "SELECT date_str FROM daily_progress WHERE matched = 1 ORDER BY date_str DESC"
  );
  if (!res.length) return 0;

  const dates = res[0].values.map((r) => r[0]);
  let streak  = 0;
  const today = new Date();

  for (let i = 0; i < dates.length; i++) {
    const expected    = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().slice(0, 10);
    if (dates[i] === expectedStr) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
