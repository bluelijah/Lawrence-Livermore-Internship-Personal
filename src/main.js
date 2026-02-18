import "./style.css";
import { registerRoute, initRouter } from "./router.js";
import { icons } from "./ui/components.js";
import { getCurrentPath } from "./router.js";
import { initLocale } from "./utils/i18n.js";

// Initialize i18n before any rendering
initLocale();

// Register routes with lazy-loaded screen modules
registerRoute("", () => import("./screens/landing.js"));
registerRoute("play", () => import("./screens/play.js"));
registerRoute("daily", () => import("./screens/daily-match.js"));
registerRoute("race", () => import("./screens/race.js"));
registerRoute("catalog", () => import("./screens/catalog.js"));
registerRoute("object", () => import("./screens/object-detail.js"));
registerRoute("tutorial", () => import("./screens/tutorial.js"));

// Bottom navigation
function createBottomNav() {
  const nav = document.createElement("nav");
  nav.className = "bottom-nav";

  const inner = document.createElement("div");
  inner.className = "bottom-nav-inner";

  const items = [
    { path: "", label: "Home", icon: icons.home },
    { path: "play", label: "Play", icon: icons.play },
    { path: "catalog", label: "Catalog", icon: icons.catalog },
  ];

  for (const item of items) {
    const btn = document.createElement("button");
    btn.className = "nav-item";
    btn.dataset.path = item.path;
    btn.innerHTML = `${item.icon}<span>${item.label}</span>`;
    btn.addEventListener("click", () => {
      location.hash = item.path ? `#${item.path}` : "";
    });
    inner.appendChild(btn);
  }

  nav.appendChild(inner);
  document.body.appendChild(nav);

  // Update active state on hash change
  function updateActive() {
    const { path } = getCurrentPath();
    inner.querySelectorAll(".nav-item").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.path === path);
    });
  }

  window.addEventListener("hashchange", updateActive);
  updateActive();
}

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

// Initialize
const app = document.querySelector("#app");
createBottomNav();
initRouter(app);
