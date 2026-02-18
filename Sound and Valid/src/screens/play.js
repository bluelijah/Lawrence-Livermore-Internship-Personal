import { el, icons } from "../ui/components.js";
import { navigate } from "../router.js";
import { getDailyStreak } from "../utils/storage.js";

export function render(container) {
  const streak = getDailyStreak();

  const screen = el(
    "div",
    { className: "screen" },

    // Header
    el(
      "div",
      { className: "screen-header text-center" },
      el("h1", {}, "Play"),
      el("p", {}, "Choose a game mode")
    ),

    // Mode cards
    el(
      "div",
      { className: "flex flex-col gap-12 mt-24" },

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
            className: "btn-icon btn-primary",
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
      )
    )
  );

  container.appendChild(screen);
}
