/**
 * Physics formulas for computing natural frequencies of vibrating structures.
 *
 * Based on Euler-Bernoulli beam theory.
 * Reference: S. Rao, "Mechanical Vibrations", 5th Ed.
 *
 * General formula for the nth bending mode of a rectangular beam:
 *
 *   f_n = (beta_n * L)^2 / (2 * pi * L^2) * sqrt(E * I / (rho * A))
 *
 * For a rectangular cross-section (width b, thickness h):
 *   I = b * h^3 / 12
 *   A = b * h
 *
 * Simplifies to:
 *   f_n = (beta_n * L)^2 * h / (4 * pi * sqrt(3) * L^2) * sqrt(E / rho)
 */

// Eigenvalue coefficients (beta_n * L) for the first 4 bending modes.
// These depend on the boundary condition of the beam.
const EIGENVALUES = {
  "free-free": [4.73004, 7.8532, 10.9956, 14.1372],
  cantilever: [1.8751, 4.6941, 7.8548, 10.9955],
  "simply-supported": [Math.PI, 2 * Math.PI, 3 * Math.PI, 4 * Math.PI],
};

/**
 * Calculate the bending natural frequency of a rectangular bar/beam.
 *
 * @param {object} material - { E: Young's modulus (Pa), rho: density (kg/m^3) }
 * @param {object} dimensions - { length (m), width (m), thickness (m) }
 * @param {string} boundary - "free-free" | "cantilever" | "simply-supported"
 * @param {number} mode - Mode number (0-indexed, default 0 = fundamental)
 * @returns {number} Frequency in Hz
 */
export function calcBarFrequency(material, dimensions, boundary, mode = 0) {
  const { E, rho } = material;
  const { length: L, thickness: h } = dimensions;
  const betaL = EIGENVALUES[boundary][mode];

  const f =
    (betaL ** 2 * h) /
    (4 * Math.PI * Math.sqrt(3) * L ** 2) *
    Math.sqrt(E / rho);

  return f;
}

/**
 * Get the eigenvalue name/label for display in the educational panel.
 */
export function getEigenvalueLabel(boundary, mode = 0) {
  const betaL = EIGENVALUES[boundary][mode];
  return {
    boundary,
    mode: mode + 1,
    betaL: betaL.toFixed(4),
  };
}

/**
 * Get all available boundary condition types.
 */
export function getBoundaryTypes() {
  return Object.keys(EIGENVALUES);
}

/**
 * Calculate frequency with a step-by-step breakdown for educational display.
 * Returns an object with intermediate values and the final frequency.
 */
export function calcBarFrequencyDetailed(material, dimensions, boundary, mode = 0) {
  const { E, rho } = material;
  const { length: L, width: b, thickness: h } = dimensions;
  const betaL = EIGENVALUES[boundary][mode];

  const I = (b * h ** 3) / 12;
  const A = b * h;
  const waveSpeed = Math.sqrt(E / rho);
  const geometryFactor = h / (4 * Math.PI * Math.sqrt(3) * L ** 2);
  const frequency = betaL ** 2 * geometryFactor * waveSpeed;

  return {
    material: { E, rho },
    dimensions: { L, b, h },
    boundary,
    mode: mode + 1,
    betaL,
    secondMoment: I,
    crossSection: A,
    waveSpeed,
    geometryFactor,
    frequency,
    steps: [
      {
        label: "Wave speed factor",
        formula: "√(E / ρ)",
        value: waveSpeed,
        unit: "m/s",
      },
      {
        label: "Geometry factor",
        formula: "h / (4π√3 × L²)",
        value: geometryFactor,
        unit: "1/s",
      },
      {
        label: "Eigenvalue (βL)²",
        formula: `(${betaL.toFixed(4)})²`,
        value: betaL ** 2,
        unit: "",
      },
      {
        label: "Natural frequency",
        formula: "(βL)² × geometry × wave speed",
        value: frequency,
        unit: "Hz",
      },
    ],
  };
}
