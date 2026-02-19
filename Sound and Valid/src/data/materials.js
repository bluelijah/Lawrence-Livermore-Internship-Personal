/**
 * Material properties database.
 * Each material has:
 *   - name: Display name
 *   - E: Young's modulus in Pascals (Pa)
 *   - rho: Density in kg/m^3
 *   - category: Grouping for catalog display
 *   - color: Representative hex color for UI
 *
 * Values sourced from standard engineering references
 * (Engineering ToolBox, MatWeb, ASM International).
 */

export const MATERIALS = {
  aluminum: {
    name: "Aluminum (6061-T6)",
    E: 68.9e9,
    rho: 2700,
    category: "metals",
    color: "#A8B8C8",
  },
  steel: {
    name: "Mild Steel (1018)",
    E: 205e9,
    rho: 7870,
    category: "metals",
    color: "#71797E",
  },
  copper: {
    name: "Copper (C11000)",
    E: 117e9,
    rho: 8960,
    category: "metals",
    color: "#B87333",
  },
  brass: {
    name: "Brass (C26000)",
    E: 110e9,
    rho: 8530,
    category: "metals",
    color: "#D4A843",
  },
  oak: {
    name: "White Oak",
    E: 12.3e9,
    rho: 770,
    category: "woods",
    color: "#806517",
  },
  pine: {
    name: "Ponderosa Pine",
    E: 8.9e9,
    rho: 449,
    category: "woods",
    color: "#DEB887",
  },
  cedar: {
    name: "Incense Cedar",
    E: 7.6e9,
    rho: 370,
    category: "woods",
    color: "#C49A6C",
  },
  soda_glass: {
    name: "Soda-Lime Glass",
    E: 72e9,
    rho: 2500,
    category: "glass-ceramics",
    color: "#ADD8E6",
  },
  porcelain: {
    name: "Porcelain",
    E: 70e9,
    rho: 2400,
    category: "glass-ceramics",
    color: "#F0EAD6",
  },
  alumina: {
    name: "Alumina Ceramic (Al2O3)",
    E: 370e9,
    rho: 3950,
    category: "glass-ceramics",
    color: "#FAFAFA",
  },
  abs: {
    name: "ABS Plastic",
    E: 2.3e9,
    rho: 1050,
    category: "plastics",
    color: "#F5F5DC",
  },
  polycarbonate: {
    name: "Polycarbonate",
    E: 2.4e9,
    rho: 1200,
    category: "plastics",
    color: "#E8E8E8",
  },
  acrylic: {
    name: "Acrylic (PMMA)",
    E: 3.2e9,
    rho: 1180,
    category: "plastics",
    color: "#E0F0FF",
  },
  vinyl: {
    name: "Soft Vinyl (PVC Eraser)",
    E: 1e7,
    rho: 1300,
    category: "plastics",
    color: "#F0EDE6",
  },
};

export const CATEGORIES = {
  metals: { name: "Metals", icon: "⚙" },
  woods: { name: "Woods", icon: "🪵" },
  "glass-ceramics": { name: "Glass & Ceramics", icon: "🏺" },
  plastics: { name: "Plastics", icon: "🧪" },
};
