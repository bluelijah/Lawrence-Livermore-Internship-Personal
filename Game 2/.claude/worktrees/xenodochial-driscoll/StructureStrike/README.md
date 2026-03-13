# StructureStrike

**Build structures. Survive the forces.**

A browser-based structural engineering game for STEM students. Place nodes, connect them with beams, columns, trusses, and cables, then run a physics simulation to see if your design survives escalating real-world force events.

---

## Concept

Each level presents a scenario (warehouse collapse, coastal tower, seismic frame, harbor flood, bunker impact) with a fixed budget. You design a structure on a blueprint canvas, then watch it get rendered into a 2D world scene and subjected to physics-based loading. The simulation uses a real Finite Element Method solver — the same mathematical framework used by professional structural engineering software.

---

## Gameplay Loop

1. **Select Level** — choose from 5 unlockable scenarios on the home screen
2. **Build Phase** — tap empty grid to place nodes; tap two nodes to open the element picker and connect them; manage your budget
3. **Simulate** — the blueprint fades into a world scene; FEM runs; forces are applied; watch for progressive collapse
4. **Results** — pass: earn up to 3 stars and unlock the next level; fail: debrief modal explains what broke and why

---

## Levels

| # | Scenario | Threat | Challenge |
|---|----------|--------|-----------|
| 1 | Mountain Warehouse | Dead load (gravity) | Span a roof across two pinned supports |
| 2 | Coastal Tower | Wind (120 km/h) | Build a slender tower that resists lateral pressure |
| 3 | Urban Building | Seismic (0.4g) | Design a two-story frame for horizontal inertial loads |
| 4 | Harbor Dock | Flood (4 m head) | Resist hydrostatic pressure across submerged nodes |
| 5 | Blast Bunker | Ballistic (2500 kN) | Protect a floor node from a point impact load |

---

## Physics Engine

No external physics library. All simulation runs client-side using a custom **Direct Stiffness Method (DSM)** Finite Element solver:

- **2D Euler-Bernoulli beam-column elements** — 3 DOF per node (u, v, θ)
- **Cables** — truss-like (I ≈ 0) with tension-only iteration; slack cables are removed and the system is re-solved
- **Gaussian elimination** with partial pivoting; singular matrices → mechanism detection
- **Progressive collapse** — failed elements are removed iteratively; simulation continues until stable or total collapse
- **Units** — SI throughout (N, m, Pa); 1 grid cell = 5 metres

---

## Civil Engineering Equations

The following fundamental equations are explicitly implemented in the simulation:

### Implemented

| Equation | Formula | Where Used |
|----------|---------|-----------|
| **Hooke's Law** | σ = Eε | Axial stress in all elements (`elements.js`) |
| **Bending Stress** | σ = Mc/I | Extreme fibre stress in beams and columns (`elements.js`) |
| **Moment of Inertia** | I = ∫y²dA | Section property for each element type (`constants.js`) |
| **Shear and Bending Moment** | V = dM/dx | Internal force extraction from local stiffness (`elements.js`) |
| **Bernoulli Wind Pressure** | p = ½ρv²Cd | Tributary area wind load on exposed nodes (`loads.js`) |
| **Hydrostatic Pressure** | p = ρgh | Flood load on nodes below flood elevation (`loads.js`) |
| **Seismic Equivalent Static Force** | F = mSa·sin(2πft) | Time-varying inertial load on level masses (`loads.js`) |
| **Euler Column Buckling** | Pcr = π²EI/L² | Compression check on columns and trusses (K=1, pin-ended, `elements.js`) |

---

## Structural Patterns

The game detects 13 named structural patterns as you build and fires educational notifications:

- **Common** — Triangle, Portal Frame, Cantilever, Simply Supported Beam
- **Uncommon** — Pratt Truss, Warren Truss, X-Brace, King Post, Arch
- **Rare** — Cable-Stayed, Diagrid, Vierendeel Frame
- **Legendary** — Tensegrity, Suspended Cable Net

---

## Project Structure

```
StructureStrike/
├── index.html
├── package.json
├── public/
│   └── manifest.json
└── src/
    ├── main.js              — app entry point
    ├── router.js            — hash-based SPA router
    ├── state.js             — shared in-memory game state
    ├── style.css            — full stylesheet (design tokens, all screens)
    ├── data/
    │   └── levels.js        — 5 level definitions (anchors, loads, win conditions)
    ├── physics/
    │   ├── elements.js      — stiffness matrices, internal forces, stress utilisation
    │   ├── fem-solver.js    — global K assembly, Gaussian elimination, cable slack iteration
    │   ├── loads.js         — gravity, wind, seismic, flood, ballistic load builders
    │   └── failure.js       — progressive collapse, win condition check, star rating
    ├── canvas/
    │   ├── blueprint-canvas.js  — draw grid, elements, nodes, support symbols, load arrows
    │   ├── build-tools.js       — node/element placement, snap-to-grid, undo, BFS simulatability
    │   ├── world-canvas.js      — 5 scene backgrounds, structure rendering in world view
    │   └── sim-renderer.js      — per-frame force effects (wind streaks, seismic shake, flood, impact)
    ├── recognition/
    │   ├── patterns.js          — 13 pattern definitions with rarity and engineering context
    │   └── pattern-detector.js  — adjacency graph + geometry heuristics to detect patterns
    ├── ui/
    │   ├── components.js    — el() DOM factory, icons, formatBudget, rarityBadge
    │   ├── hud.js           — budget bar, toolbar, undo/delete/simulate buttons, cost tooltip
    │   ├── notifications.js — toast notification stack (pattern recognised, warnings)
    │   └── modals.js        — failure debrief, element picker, museum reference panel
    └── screens/
        ├── home.js          — level select grid with lock/star state
        ├── build.js         — build phase: canvas interaction, element placement, UX
        ├── simulate.js      — physics solve → world transition → animation loop
        └── results.js       — star rating, budget breakdown, next level CTA
```

---

## Cmd+F Search Tags

Every function begins with a `// [TAG]` comment for fast navigation:

| Tag | What it covers |
|-----|---------------|
| `[BUILD-PHASE]` | Build canvas interactions, node/element placement |
| `[BUILD-CANVAS]` | Canvas drawing functions |
| `[BUDGET-COUNTER]` | Cost calculation, deduction, display |
| `[PHYSICS]` | FEM solver, stiffness matrices, displacement solve |
| `[SIMULATION]` | Simulation run, animation, force effects |
| `[RECOGNITION]` | Pattern detection, notification firing |
| `[LEVEL-PROGRESS]` | Level unlock, star rating, progress persistence |
| `[UI]` | DOM components, modals, routing |

---

## Tech Stack

- **Vanilla JS + Vite** — no framework, ES modules
- **Canvas 2D API** — blueprint and world rendering
- **localStorage** — save/load structure and progress per level
- **No physics library** — all FEM runs in pure JavaScript, mobile-safe (~0.5 ms for 80 DOF)

---

## Running Locally

```bash
cd StructureStrike
npm install
npm run dev
```

Open `http://localhost:5173`.
