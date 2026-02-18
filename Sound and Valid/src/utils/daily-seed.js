/**
 * Deterministic daily object selection.
 * Uses the current UTC date to select the same object for everyone on a given day.
 */

const EPOCH = new Date("2025-01-01T00:00:00Z");

export function getDailyObjectIndex(objectCount) {
  const now = new Date();
  const daysSinceEpoch = Math.floor(
    (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
      EPOCH.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // Knuth multiplicative hash for good distribution
  const hash = Math.imul(daysSinceEpoch, 2654435761) >>> 0;
  return hash % objectCount;
}

export function getTodayDateStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
