import { el } from "../ui/components.js";
import { navigate } from "../router.js";
import { WaveAnimation } from "../ui/wave-animation.js";
import { t, isRTL } from "../utils/i18n.js";
import {
  createSoundVisual,
  createFrequencyExplorer,
  createFormulaVisual,
  createTunerVisual,
} from "../ui/section-animations.js";

export function render(container) {
  const screen = el("div", { className: "landing-screen" });
  if (isRTL()) screen.setAttribute("dir", "rtl");

  // Track all animations for cleanup
  const animations = [];

  // ── Hero section (full viewport) ──

  const hero = el("div", { className: "landing-hero" });

  const canvas = document.createElement("canvas");
  canvas.className = "landing-canvas";
  hero.appendChild(canvas);

  hero.appendChild(el("h1", { className: "landing-title" }, t("landing.title")));
  hero.appendChild(el("p", { className: "landing-subtitle" }, t("landing.subtitle")));

  const buttons = el("div", { className: "landing-buttons" });

  buttons.appendChild(
    el("button", {
      className: "btn btn-secondary btn-large",
      onclick: () => {
        document.getElementById("education").scrollIntoView({ behavior: "smooth" });
      },
    }, t("landing.learnBtn"))
  );

  buttons.appendChild(
    el("button", {
      className: "btn btn-primary btn-large",
      onclick: () => navigate("play"),
    }, t("landing.playBtn"))
  );

  hero.appendChild(buttons);
  screen.appendChild(hero);

  // ── Education section (below fold) ──

  const edu = el("div", { className: "landing-education", id: "education" });

  // Section heading
  edu.appendChild(el("h2", { className: "landing-edu-heading" }, t("landing.edu.heading")));

  // ── 1. What is Sound? ──
  const soundVisual = createSoundVisual();
  animations.push(soundVisual);

  const soundCard = el("div", { className: "card mb-16" },
    el("h2", { className: "mb-8" }, t("landing.edu.whatIsSound")),
    el("p", {}, t("landing.edu.whatIsSoundP1")),
    el("p", { className: "mt-8" }, t("landing.edu.whatIsSoundP2")),
    el("p", { className: "mt-8" }, t("landing.edu.whatIsSoundP3")),
    el("div", { className: "section-anim-wrap" }, soundVisual.element)
  );
  edu.appendChild(soundCard);

  // ── 2. What Determines Frequency? ──
  const freqExplorer = createFrequencyExplorer();
  animations.push(freqExplorer);

  const freqCard = el("div", { className: "card mb-16" },
    el("h2", { className: "mb-8" }, t("landing.edu.whatDetermines")),
    el("p", {}, t("landing.edu.whatDeterminesIntro")),
    el("div", { className: "mt-8" },
      el("h3", {}, t("landing.edu.stiffnessTitle")),
      el("p", {}, t("landing.edu.stiffnessBody"))
    ),
    el("div", { className: "mt-8" },
      el("h3", {}, t("landing.edu.densityTitle")),
      el("p", {}, t("landing.edu.densityBody"))
    ),
    el("div", { className: "mt-8" },
      el("h3", {}, t("landing.edu.geometryTitle")),
      el("p", {}, t("landing.edu.geometryBody"))
    ),
    freqExplorer.element
  );
  edu.appendChild(freqCard);

  // ── 3. The Formula ──
  const formulaVisual = createFormulaVisual();
  animations.push(formulaVisual);

  const formulaCard = el("div", { className: "card mb-16" },
    el("h2", { className: "mb-8" }, t("landing.edu.formulaTitle")),
    el("div", { className: "formula-block" },
      el("div", { className: "formula-text-fit" },
        "f = (\u03B2L)\u00B2 \u00D7 h / (4\u03C0\u221A3 \u00D7 L\u00B2) \u00D7 \u221A(E / \u03C1)"
      )
    ),
    el("p", { className: "mt-8" }, t("landing.edu.formulaIntro")),
    el("div", { className: "mt-8" },
      el("p", {}, t("landing.edu.formulaBetaL")),
      el("p", {}, t("landing.edu.formulaH")),
      el("p", {}, t("landing.edu.formulaL")),
      el("p", {}, t("landing.edu.formulaE")),
      el("p", {}, t("landing.edu.formulaRho"))
    ),
    el("div", { className: "formula-scope-note mt-16" }, t("landing.edu.formulaScope")),
    el("p", { className: "mt-8" }, t("landing.edu.formulaNote")),
    el("div", { className: "section-anim-wrap" }, formulaVisual.element)
  );
  edu.appendChild(formulaCard);

  // ── 4. How to Play ──
  const tunerVisual = createTunerVisual();
  animations.push(tunerVisual);

  const tunerCard = el("div", { className: "card mb-16" },
    el("h2", { className: "mb-8" }, t("landing.edu.howToPlay")),
    el("p", {}, t("landing.edu.step1")),
    el("p", { className: "mt-8" }, t("landing.edu.step2")),
    el("p", { className: "mt-8" }, t("landing.edu.step3")),
    el("p", { className: "mt-8" }, t("landing.edu.step4")),
    el("p", { className: "mt-8" }, t("landing.edu.step5")),
    el("div", { className: "section-anim-wrap" }, tunerVisual.element)
  );
  edu.appendChild(tunerCard);

  // Bottom CTA
  edu.appendChild(
    el("button", {
      className: "btn btn-primary btn-large",
      style: { width: "100%" },
      onclick: () => navigate("play"),
    }, t("landing.edu.readyBtn"))
  );

  screen.appendChild(edu);
  container.appendChild(screen);

  // Remove #app constraints for full-bleed landing
  container.classList.add("landing-active");

  // Start hero wave immediately (always visible)
  const wave = new WaveAnimation(canvas);
  wave.start();

  // Start section animations only when scrolled into view
  const pairs = [
    { anim: soundVisual,   elem: soundCard   },
    { anim: freqExplorer,  elem: freqCard    },
    { anim: formulaVisual, elem: formulaCard },
    { anim: tunerVisual,   elem: tunerCard   },
  ];

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const pair = pairs.find(p => p.elem === entry.target);
      if (!pair) continue;
      if (entry.isIntersecting) {
        pair.anim.start();
      } else {
        pair.anim.destroy();
      }
    }
  }, { threshold: 0.1 });

  for (const pair of pairs) observer.observe(pair.elem);

  // Cleanup
  return () => {
    observer.disconnect();
    wave.destroy();
    for (const anim of animations) anim.destroy();
    container.classList.remove("landing-active");
  };
}
