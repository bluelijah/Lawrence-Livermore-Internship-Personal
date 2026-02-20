/**
 * Persistence layer — thin re-exports from db.js for daily/race state.
 * Simple boolean flags (tutorial seen, landing seen) stay in localStorage.
 */

export {
  getDailyState,
  saveDailyState,
  getDailyStreak,
  getRaceBest,
  saveRaceResult,
  getRaceHistory,
} from "./db.js";

const KEYS = {
  TUTORIAL_SEEN: "fm_tutorial_seen",
  LANDING_SEEN:  "fm_landing_seen",
};

// ── Tutorial ──

export function hasTutorialBeenSeen() {
  return localStorage.getItem(KEYS.TUTORIAL_SEEN) === "true";
}

export function markTutorialSeen() {
  localStorage.setItem(KEYS.TUTORIAL_SEEN, "true");
}

// ── Landing ──

export function hasLandingBeenSeen() {
  return localStorage.getItem(KEYS.LANDING_SEEN) === "true";
}

export function markLandingAsSeen() {
  localStorage.setItem(KEYS.LANDING_SEEN, "true");
}
