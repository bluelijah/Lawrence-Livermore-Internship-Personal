const routes = {};
let appRoot = null;
let currentCleanup = null;

export function registerRoute(path, loader) {
  routes[path] = loader;
}

export function navigate(path) {
  location.hash = path ? `#${path}` : "";
}

export function getCurrentPath() {
  const hash = location.hash.slice(1) || "";
  const [path, ...params] = hash.split("/");
  return { path: path || "", params };
}

async function render() {
  if (!appRoot) return;

  // Clean up previous screen
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  const { path, params } = getCurrentPath();
  const loader = routes[path] || routes[""];

  if (!loader) {
    appRoot.innerHTML = '<div class="screen"><p>Page not found</p></div>';
    return;
  }

  const module = await loader();
  appRoot.innerHTML = "";
  currentCleanup = module.render(appRoot, ...params) || null;

  // Update nav active state
  document.querySelectorAll(".nav-item").forEach((item) => {
    const navPath = item.dataset.path || "";
    item.classList.toggle("active", navPath === path);
  });
}

export function initRouter(root) {
  appRoot = root;
  window.addEventListener("hashchange", render);
  render();
}
