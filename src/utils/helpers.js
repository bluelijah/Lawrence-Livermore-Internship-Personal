/**
 * Format seconds as m:ss or m:ss.d
 */
export function formatTime(seconds, showDecimal = false) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (showDecimal) {
    return `${mins}:${secs.toFixed(1).padStart(4, "0")}`;
  }
  return `${mins}:${String(Math.floor(secs)).padStart(2, "0")}`;
}

/**
 * Format a frequency value for display.
 */
export function formatFreq(hz) {
  if (hz < 0) return "---";
  if (hz >= 1000) return `${(hz / 1000).toFixed(2)} kHz`;
  return `${hz.toFixed(1)} Hz`;
}

/**
 * Format a dimension in meters to a human-readable string.
 */
export function formatDimension(meters) {
  if (meters >= 1) return `${meters.toFixed(2)} m`;
  if (meters >= 0.01) return `${(meters * 100).toFixed(1)} cm`;
  return `${(meters * 1000).toFixed(1)} mm`;
}

/**
 * Format large numbers with SI prefixes for material properties.
 */
export function formatSI(value, unit) {
  if (value >= 1e12) return `${(value / 1e12).toFixed(1)} T${unit}`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)} G${unit}`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)} M${unit}`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)} k${unit}`;
  return `${value.toFixed(1)} ${unit}`;
}

/**
 * Shuffle an array (Fisher-Yates).
 */
export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Get the difficulty label for a difficulty level.
 */
export function difficultyLabel(level) {
  return ["Easy", "Medium", "Hard"][level - 1] || "Unknown";
}

/**
 * Clamp a value between min and max.
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
