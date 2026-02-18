/**
 * Reusable DOM creation helpers.
 */

/**
 * Create an element with optional class, attributes, and children.
 */
export function el(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (key === "className") {
      element.className = value;
    } else if (key === "innerHTML") {
      element.innerHTML = value;
    } else if (key === "onclick" || key === "oninput" || key === "onchange") {
      element.addEventListener(key.slice(2), value);
    } else if (key === "style" && typeof value === "object") {
      Object.assign(element.style, value);
    } else if (key === "dataset") {
      Object.assign(element.dataset, value);
    } else {
      element.setAttribute(key, value);
    }
  }

  for (const child of children) {
    if (child == null) continue;
    if (typeof child === "string") {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  }

  return element;
}

/**
 * Create an object card for the catalog/bingo.
 */
export function createObjectCard(obj, onClick) {
  const card = el(
    "div",
    { className: "card card-interactive catalog-grid-item", onclick: onClick },
    el("div", {
      className: "object-swatch",
      style: { backgroundColor: obj.material.color },
    }),
    el("div", { className: "object-name" }, obj.name),
    el("div", { className: "object-freq" }, `${obj.frequency.toFixed(1)} Hz`)
  );
  return card;
}

/**
 * Create the material properties table.
 */
export function createPropsTable(obj) {
  const { formatDimension, formatSI } = {
    formatDimension: (m) => {
      if (m >= 1) return `${m.toFixed(2)} m`;
      if (m >= 0.01) return `${(m * 100).toFixed(1)} cm`;
      return `${(m * 1000).toFixed(1)} mm`;
    },
    formatSI: (v, u) => {
      if (v >= 1e12) return `${(v / 1e12).toFixed(1)} T${u}`;
      if (v >= 1e9) return `${(v / 1e9).toFixed(1)} G${u}`;
      if (v >= 1e6) return `${(v / 1e6).toFixed(1)} M${u}`;
      if (v >= 1e3) return `${(v / 1e3).toFixed(1)} k${u}`;
      return `${v.toFixed(1)} ${u}`;
    },
  };

  const table = el("table", { className: "props-table" });
  const rows = [
    ["Material", obj.material.name],
    ["Young's Modulus (E)", formatSI(obj.material.E, "Pa")],
    ["Density (\u03C1)", `${obj.material.rho.toLocaleString()} kg/m\u00B3`],
    ["Length", formatDimension(obj.dimensions.length)],
    ["Width", formatDimension(obj.dimensions.width)],
    ["Thickness", formatDimension(obj.dimensions.thickness)],
    ["Boundary", obj.boundary.replace("-", " ")],
    ["Frequency", `${obj.frequency.toFixed(1)} Hz`],
  ];

  for (const [label, value] of rows) {
    const tr = el(
      "tr",
      {},
      el("td", {}, label),
      el("td", {}, value)
    );
    table.appendChild(tr);
  }

  return table;
}

/**
 * SVG icons (inline, no external files needed).
 */
export const icons = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  daily: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  race: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  catalog: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  stop: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>`,
  mic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
  back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
};
