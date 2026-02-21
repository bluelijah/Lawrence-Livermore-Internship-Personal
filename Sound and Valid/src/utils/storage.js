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
