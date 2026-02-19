import { MATERIALS } from "./materials.js";
import { calcBarFrequency } from "./formulas.js";

/**
 * Object catalog: 20 objects spanning all material categories.
 *
 * Each object has a specific material, geometry, and boundary condition.
 * Dimensions are chosen so that fundamental frequencies land mostly
 * in the range 80–1000 Hz (achievable by humming, singing, or whistling).
 *
 * Difficulty ratings:
 *   1 = easy (200–500 Hz range, comfortable singing range)
 *   2 = medium (100–200 Hz or 500–800 Hz)
 *   3 = hard (below 100 Hz or above 800 Hz)
 */

const OBJECT_DEFINITIONS = [
  // ── Metals ──
  {
    id: "al_bar",
    name: "Aluminum Bar",
    description: "A rectangular aluminum bar, common in machine shops. Try different lengths to hear how size affects pitch.",
    materialKey: "aluminum",
    shape: "bar",
    boundary: "free-free",
    dimensions: { length: 0.25, width: 0.025, thickness: 0.005 },
    difficulty: 1,
    presets: [
      { label: "Short", length: 0.15 },
      { label: "Medium", length: 0.25 },
      { label: "Long", length: 0.40 },
    ],
  },
  {
    id: "steel_bar",
    name: "Steel Bar",
    description: "A solid mild steel bar, denser and stiffer than aluminum.",
    materialKey: "steel",
    shape: "bar",
    boundary: "free-free",
    dimensions: { length: 0.25, width: 0.020, thickness: 0.006 },
    difficulty: 1,
  },
  {
    id: "steel_ruler",
    name: "Steel Ruler (Clamped)",
    description:
      "A thin steel ruler clamped to a table edge, the classic classroom demo.",
    materialKey: "steel",
    shape: "bar",
    boundary: "cantilever",
    dimensions: { length: 0.08, width: 0.030, thickness: 0.001 },
    difficulty: 2,
  },
  {
    id: "copper_strip",
    name: "Copper Strip",
    description: "A copper strip, heavier than aluminum but with a warm tone.",
    materialKey: "copper",
    shape: "bar",
    boundary: "free-free",
    dimensions: { length: 0.25, width: 0.020, thickness: 0.004 },
    difficulty: 2,
  },
  {
    id: "brass_rod",
    name: "Brass Rod",
    description: "A short brass rod, the material used in bells and cymbals.",
    materialKey: "brass",
    shape: "bar",
    boundary: "free-free",
    dimensions: { length: 0.20, width: 0.015, thickness: 0.008 },
    difficulty: 1,
  },

  // ── Woods ──
  {
    id: "oak_plank",
    name: "Oak Plank",
    description:
      "A thick white oak plank. Wood is less stiff than metal, so it vibrates at lower frequencies.",
    materialKey: "oak",
    shape: "bar",
    boundary: "free-free",
    dimensions: { length: 0.35, width: 0.050, thickness: 0.018 },
    difficulty: 1,
  },
  {
    id: "maple_bar",
    name: "Maple Marimba Bar",
    description:
      "A sugar maple bar shaped like a marimba key. Maple is prized for its bright, clear tone.",
    materialKey: "maple",
    shape: "bar",
    boundary: "free-free",
    dimensions: { length: 0.38, width: 0.045, thickness: 0.020 },
    difficulty: 1,
  },
  {
    id: "pine_board",
    name: "Pine Board",
    description:
      "A soft pine board, less dense and less stiff than hardwoods.",
    materialKey: "pine",
    shape: "bar",
    boundary: "free-free",
    dimensions: { length: 0.40, width: 0.080, thickness: 0.015 },
    difficulty: 2,
  },
  {
    id: "pencil",
    name: "Wooden Pencil",
    description:
      "A standard No. 2 pencil, modeled as solid incense cedar. The graphite core is less than 2% of the cross-section and has negligible effect on bending stiffness.",
    materialKey: "cedar",
    shape: "bar",
    boundary: "free-free",
    dimensions: { length: 0.19, width: 0.007, thickness: 0.007 },
    difficulty: 3,
  },

  // ── Glass & Ceramics ──
  {
    id: "glass_rod",
    name: "Glass Rod",
    description:
      "A soda-lime glass rod, the kind used in chemistry labs. Glass is very stiff for its weight.",
    materialKey: "soda_glass",
    shape: "bar",
    boundary: "free-free",
    dimensions: { length: 0.25, width: 0.010, thickness: 0.010 },
    difficulty: 1,
  },
  {
    id: "porcelain_tile",
    name: "Porcelain Tile",
    description:
      "A porcelain floor tile. Ceramics are stiff and produce clear tones when tapped.",
    materialKey: "porcelain",
    shape: "bar",
    boundary: "free-free",
    dimensions: { length: 0.30, width: 0.100, thickness: 0.008 },
    difficulty: 1,
  },
  {
    id: "alumina_bar",
    name: "Alumina Ceramic Bar",
    description:
      "An extremely stiff alumina (Al₂O₃) bar, used in cutting tools and armor.",
    materialKey: "alumina",
    shape: "bar",
    boundary: "free-free",
    dimensions: { length: 0.30, width: 0.010, thickness: 0.005 },
    difficulty: 2,
  },

  // ── Plastics ──
  {
    id: "abs_strip",
    name: "ABS Plastic Strip",
    description:
      "An ABS strip, the plastic used in LEGO bricks. Much less stiff than metals.",
    materialKey: "abs",
    shape: "bar",
    boundary: "free-free",
    dimensions: { length: 0.20, width: 0.030, thickness: 0.005 },
    difficulty: 2,
  },
  {
    id: "polycarb_sheet",
    name: "Polycarbonate Sheet",
    description:
      "A polycarbonate sheet, used in safety glasses and bulletproof windows.",
    materialKey: "polycarbonate",
    shape: "bar",
    boundary: "free-free",
    dimensions: { length: 0.25, width: 0.050, thickness: 0.006 },
    difficulty: 2,
  },
  {
    id: "acrylic_bar",
    name: "Acrylic Bar",
    description:
      "An acrylic (plexiglass) bar, transparent and moderately stiff for a plastic.",
    materialKey: "acrylic",
    shape: "bar",
    boundary: "free-free",
    dimensions: { length: 0.20, width: 0.020, thickness: 0.008 },
    difficulty: 1,
  },
  {
    id: "eraser",
    name: "Vinyl Eraser",
    description:
      "A standard rectangular vinyl eraser. Soft vinyl is one of the least stiff materials in the catalog, giving it a deep, low resonance for its small size.",
    materialKey: "vinyl",
    shape: "bar",
    boundary: "free-free",
    dimensions: { length: 0.065, width: 0.023, thickness: 0.011 },
    difficulty: 2,
  },

  // ── Special / Educational ──
  {
    id: "tuning_fork",
    name: "Steel Tuning Fork Prong",
    description:
      "One prong of a standard A4 tuning fork, the reference pitch for musical tuning.",
    materialKey: "steel",
    shape: "bar",
    boundary: "cantilever",
    dimensions: { length: 0.084, width: 0.006, thickness: 0.0038 },
    difficulty: 1,
  },
  {
    id: "oak_xylophone",
    name: "Oak Xylophone Key",
    description:
      "A xylophone key carved from white oak, shorter and thicker for a higher pitch.",
    materialKey: "oak",
    shape: "bar",
    boundary: "free-free",
    dimensions: { length: 0.30, width: 0.038, thickness: 0.015 },
    difficulty: 1,
  },
  {
    id: "glass_chime",
    name: "Glass Wind Chime",
    description:
      "A soda-lime glass tube used as a wind chime, long and thin for a gentle ring.",
    materialKey: "soda_glass",
    shape: "bar",
    boundary: "free-free",
    dimensions: { length: 0.30, width: 0.012, thickness: 0.012 },
    difficulty: 1,
  },
];

/**
 * Fully computed objects catalog.
 * Each entry includes the original definition plus computed frequency
 * and a reference to the full material properties.
 */
export const OBJECTS = OBJECT_DEFINITIONS.map((obj) => {
  const material = MATERIALS[obj.materialKey];
  const frequency = calcBarFrequency(
    material,
    obj.dimensions,
    obj.boundary,
    0
  );

  return {
    ...obj,
    material,
    category: material.category,
    frequency: Math.round(frequency * 10) / 10, // Round to 1 decimal
  };
});

/**
 * Get objects filtered by category.
 */
export function getObjectsByCategory(category) {
  if (!category || category === "all") return OBJECTS;
  return OBJECTS.filter((obj) => obj.category === category);
}

/**
 * Get a single object by ID.
 */
export function getObjectById(id) {
  return OBJECTS.find((obj) => obj.id === id);
}
