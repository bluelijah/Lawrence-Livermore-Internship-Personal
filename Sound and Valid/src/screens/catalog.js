import { el, createObjectCard } from "../ui/components.js";
import { navigate } from "../router.js";
import { OBJECTS, getObjectsByCategory } from "../data/objects.js";
import { CATEGORIES } from "../data/materials.js";
import { icons } from "../ui/components.js";

export function render(container) {
  let activeCategory = "all";

  const screen = el("div", { className: "screen" });

  // Header
  const header = el(
    "div",
    { className: "flex items-center gap-8 mb-16" },
    el("button", {
      className: "btn btn-icon btn-secondary",
      onclick: () => navigate(""),
      innerHTML: icons.back,
    }),
    el(
      "div",
      {},
      el("h1", {}, "Sound Catalog"),
      el("p", { className: "text-xs" }, `${OBJECTS.length} objects`)
    )
  );
  screen.appendChild(header);

  // Filter tabs
  const tabs = el("div", { className: "filter-tabs" });

  function createTab(key, label) {
    const tab = el(
      "button",
      {
        className: `filter-tab ${key === activeCategory ? "active" : ""}`,
        onclick: () => {
          activeCategory = key;
          updateTabs();
          updateList();
        },
      },
      label
    );
    return tab;
  }

  function updateTabs() {
    tabs.innerHTML = "";
    tabs.appendChild(createTab("all", "All"));
    for (const [key, cat] of Object.entries(CATEGORIES)) {
      tabs.appendChild(createTab(key, cat.name));
    }
  }

  updateTabs();
  screen.appendChild(tabs);

  // Object grid + axes wrapper
  const body = el("div", { className: "catalog-body" });
  const list = el("div", { className: "catalog-grid" });

  // Decorative axes (xy plotting plane)
  const yAxis = el("div", { className: "catalog-axis-y" });
  const xAxis = el("div", { className: "catalog-axis-x" });

  // Y axis ticks: large at top/bottom, small in between
  const yTickCount = 10;
  for (let i = 0; i <= yTickCount; i++) {
    const large = i === 0 || i === yTickCount;
    const tick = el("div", {
      className: `axis-tick axis-tick-h ${large ? "axis-tick-lg" : ""}`,
      style: { top: `${(i / yTickCount) * 100}%` },
    });
    yAxis.appendChild(tick);
  }

  // X axis ticks: large at left/right ends, small in between
  const xTickCount = 6;
  for (let i = 0; i <= xTickCount; i++) {
    const large = i === 0 || i === xTickCount;
    const tick = el("div", {
      className: `axis-tick axis-tick-v ${large ? "axis-tick-lg" : ""}`,
      style: { left: `${(i / xTickCount) * 100}%` },
    });
    xAxis.appendChild(tick);
  }

  body.appendChild(yAxis);
  body.appendChild(xAxis);
  body.appendChild(list);
  screen.appendChild(body);

  function updateList() {
    list.innerHTML = "";
    const objects = getObjectsByCategory(activeCategory);
    for (const obj of objects) {
      list.appendChild(
        createObjectCard(obj, () => navigate(`object/${obj.id}`))
      );
    }
  }

  updateList();
  container.appendChild(screen);

  // Widen #app for grid layout
  container.classList.add("catalog-active");

  return () => {
    container.classList.remove("catalog-active");
  };
}
