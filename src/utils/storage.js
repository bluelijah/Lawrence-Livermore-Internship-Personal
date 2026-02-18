const KEYS = {
  DAILY: "fm_daily",
  RACE: "fm_race",
  SETTINGS: "fm_settings",
  TUTORIAL_SEEN: "fm_tutorial_seen",
  LANDING_SEEN: "fm_landing_seen",
};

function getJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
}

function setJSON(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Daily Match ──

export function getDailyState(dateStr) {
  const data = getJSON(KEYS.DAILY);
  return data[dateStr] || null;
}

export function saveDailyState(dateStr, state) {
  const data = getJSON(KEYS.DAILY);
  data[dateStr] = state;

  // Keep only last 30 days
  const keys = Object.keys(data).sort().slice(-30);
  const trimmed = {};
  keys.forEach((k) => (trimmed[k] = data[k]));
  setJSON(KEYS.DAILY, trimmed);
}

export function getDailyStreak() {
  const data = getJSON(KEYS.DAILY);
  const dates = Object.keys(data)
    .filter((d) => data[d].matched)
    .sort()
    .reverse();

  if (dates.length === 0) return 0;

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = `${expected.getFullYear()}-${String(expected.getMonth() + 1).padStart(2, "0")}-${String(expected.getDate()).padStart(2, "0")}`;

    if (dates[i] === expectedStr) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// ── Race / Bingo ──

export function getRaceBest(gridSize) {
  const data = getJSON(KEYS.RACE);
  return data[`${gridSize}_best`] || null;
}

export function saveRaceResult(gridSize, time) {
  const data = getJSON(KEYS.RACE);
  const key = `${gridSize}_best`;
  const current = data[key];

  if (!current || time < current) {
    data[key] = time;
  }

  // Save to history (last 10)
  if (!data.history) data.history = [];
  data.history.push({
    date: new Date().toISOString(),
    grid: gridSize,
    time,
  });
  data.history = data.history.slice(-10);

  setJSON(KEYS.RACE, data);
  return !current || time < current; // returns true if new personal best
}

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
