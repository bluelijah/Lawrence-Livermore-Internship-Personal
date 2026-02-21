import { el, icons } from "../ui/components.js";
import { navigate } from "../router.js";

export function render(container) {
  const screen = el("div", { className: "screen" });

  // Header
  screen.appendChild(
    el(
      "div",
      { className: "flex items-center gap-8 mb-16" },
      el("button", {
        className: "btn btn-icon btn-secondary",
        onclick: () => navigate(""),
        innerHTML: icons.back,
      }),
      el("h1", {}, "How Sound Works")
    )
  );

  // Section 1: What is Sound?
  screen.appendChild(
    el(
      "div",
      { className: "card mb-16" },
      el("h2", { className: "mb-8" }, "What is Sound?"),
      el("p", {},
        "Sound is a vibration that travels through a medium (like air). When an object vibrates, it pushes air molecules back and forth, creating pressure waves that your ear detects."
      ),
      el("p", { className: "mt-8" },
        "The speed of these vibrations is called frequency, measured in Hertz (Hz). One Hz means one vibration per second."
      ),
      el("p", { className: "mt-8" },
        "Higher frequency = higher pitch. A bass guitar string vibrates around 80 Hz, while a piccolo can reach 4,000 Hz."
      )
    )
  );

  // Section 2: What Determines Frequency?
  screen.appendChild(
    el(
      "div",
      { className: "card mb-16" },
      el("h2", { className: "mb-8" }, "What Determines an Object's Frequency?"),
      el("p", {},
        "When you tap a metal bar, it vibrates at a specific frequency determined by three things:"
      ),
      el(
        "div",
        { className: "mt-8" },
        el("h3", {}, "1. Stiffness (Young's Modulus, E)"),
        el("p", {},
          "How resistant the material is to bending. Steel is very stiff (E = 200 GPa), while rubber is soft (E = 0.01 GPa). Stiffer materials vibrate faster \u2192 higher pitch."
        )
      ),
      el(
        "div",
        { className: "mt-8" },
        el("h3", {}, "2. Density (\u03C1)"),
        el("p", {},
          "How heavy the material is per unit volume. Lead is very dense (11,340 kg/m\u00B3), aluminum is light (2,700 kg/m\u00B3). Denser materials vibrate slower \u2192 lower pitch."
        )
      ),
      el(
        "div",
        { className: "mt-8" },
        el("h3", {}, "3. Geometry (Length & Thickness)"),
        el("p", {},
          "A longer bar vibrates slower (lower pitch). A thicker bar vibrates faster (higher pitch). The frequency depends on length squared \u2014 double the length and the frequency drops to one quarter!"
        )
      )
    )
  );

  // Section 3: The Formula
  screen.appendChild(
    el(
      "div",
      { className: "card mb-16" },
      el("h2", { className: "mb-8" }, "The Formula"),
      el("div", { className: "formula-block" },
        el("div", { style: { fontSize: "1rem" } },
          "f = (\u03B2L)\u00B2 \u00D7 h / (4\u03C0\u221A3 \u00D7 L\u00B2) \u00D7 \u221A(E / \u03C1)"
        )
      ),
      el("p", { className: "mt-8" },
        "This is the Euler-Bernoulli beam equation. It tells us the natural frequency (f) of a vibrating bar based on:"
      ),
      el(
        "div",
        { className: "mt-8" },
        el("p", {}, "\u2022 \u03B2L \u2014 a constant that depends on how the bar is held (clamped, free, etc.)"),
        el("p", {}, "\u2022 h \u2014 thickness of the bar"),
        el("p", {}, "\u2022 L \u2014 length of the bar"),
        el("p", {}, "\u2022 E \u2014 stiffness of the material"),
        el("p", {}, "\u2022 \u03C1 \u2014 density of the material")
      ),
      el("p", { className: "mt-8" },
        "Every object in this game has a frequency computed from this formula with real material data."
      )
    )
  );

  // Section 4: How to Play
  screen.appendChild(
    el(
      "div",
      { className: "card mb-16" },
      el("h2", { className: "mb-8" }, "How to Play"),
      el("p", {},
        "1. Each challenge gives you an object with a target frequency."
      ),
      el("p", { className: "mt-8" },
        "2. Tap \"Listen\" to hear what that frequency sounds like (a pure sine wave)."
      ),
      el("p", { className: "mt-8" },
        "3. Tap \"Match\" and try to produce that frequency. Hum, whistle, sing, or tap something nearby."
      ),
      el("p", { className: "mt-8" },
        "4. The tuner shows how close you are. Hold the frequency within 5% of the target for 1.5 seconds to match!"
      ),
      el("p", { className: "mt-8" },
        "5. Check the Sound Catalog to learn about each object and explore how changing its properties affects its frequency."
      )
    )
  );

  // CTA
  screen.appendChild(
    el("button", {
      className: "btn btn-primary btn-large mt-8",
      onclick: () => {
        navigate("");
      },
    }, "Got it \u2014 Let's Play!")
  );

  container.appendChild(screen);
}
