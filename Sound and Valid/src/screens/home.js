import { el, icons } from "../ui/components.js";
import { navigate } from "../router.js";
import { getDailyStreak, hasTutorialBeenSeen } from "../utils/storage.js";

export function render(container) {
  const streak = getDailyStreak();
  const showTutorialPrompt = !hasTutorialBeenSeen();

  const screen = el(
    "div",
    { className: "screen" },

    // Header
    el(
      "div",
      { className: "screen-header home-header text-center" },
      el("h1", { style: { fontSize: "0.5rem" } }, "Sound and Valid"),
      el("p", {}, "Learn how materials shape sound")
    ),

    // Tutorial prompt
    showTutorialPrompt
      ? el(
          "div",
          {
            className: "card mt-16",
            style: {
              borderColor: "var(--color-primary)",
              background: "var(--color-primary-light)",
            },
          },
          el("h3", {}, "New here?"),
          el(
            "p",
            { style: { color: "var(--color-text)", marginTop: "4px" } },
            "Learn how sound works and what determines an object's frequency."
          ),
          el(
            "button",
            {
              className: "btn btn-primary mt-8",
              onclick: () => navigate("tutorial"),
            },
            "Start Tutorial"
          )
        )
      : null,

    // Mode cards
    el(
      "div",
      { className: "flex flex-col", style: { gap: "20px", marginTop: "48px" } },

      // Daily Match
      el(
        "div",
        {
          className: "card card-interactive",
          onclick: () => navigate("daily"),
        },
        el(
          "div",
          { className: "flex items-center gap-12" },
          el("div", {
            className: "btn-icon btn-primary",
            innerHTML: icons.daily,
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          }),
          el(
            "div",
            { style: { flex: "1" } },
            el("h3", {}, "Daily Match"),
            el("p", { className: "text-sm" }, "One object per day. Can you match its frequency?")
          )
        ),
        streak > 0
          ? el(
              "div",
              { className: "mt-8" },
              el("span", { className: "badge badge-success" }, `${streak} day streak`)
            )
          : null
      ),

      // Race
      el(
        "div",
        {
          className: "card card-interactive",
          onclick: () => navigate("race"),
        },
        el(
          "div",
          { className: "flex items-center gap-12" },
          el("div", {
            className: "btn-icon btn-secondary",
            innerHTML: icons.race,
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          }),
          el(
            "div",
            { style: { flex: "1" } },
            el("h3", {}, "Race"),
            el("p", { className: "text-sm" }, "Match a bingo card of frequencies as fast as you can.")
          )
        )
      ),

      // Catalog
      el(
        "div",
        {
          className: "card card-interactive",
          onclick: () => navigate("catalog"),
        },
        el(
          "div",
          { className: "flex items-center gap-12" },
          el("div", {
            className: "btn-icon btn-primary",
            innerHTML: icons.catalog,
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          }),
          el(
            "div",
            { style: { flex: "1" } },
            el("h3", {}, "Sound Catalog"),
            el("p", { className: "text-sm" }, "Browse all objects, learn the physics, practice matching.")
          )
        )
      )
    )
  );

  container.appendChild(screen);
}
