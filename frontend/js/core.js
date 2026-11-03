// core.js — Atlas's presence: the living Earth (globe.js) inside rotating
// rings, all reacting to the model and to you.
//
//   - waiting for the first token → a bright scan arc sweeps the inner ring and
//     signal arcs fire across the Earth
//   - streaming → every chunk makes the Earth "talk" (ripples + voice bars),
//     and the rings spin faster the more chunks per second the model produces
//   - typing → each keystroke flickers the Earth (it's listening)
//   - the pointer → the whole instrument leans toward it a few degrees, on a
//     spring, so it feels physical rather than glued to the mouse
//   - backend unreachable → the rings stop and the core greys out
//
// Each ring is a separate <svg> element rotated with the Web Animations API.
// Rotating a whole element is done by the GPU; animating shapes *inside* one
// SVG would make the browser repaint the drawing every frame.

import { createGlobe } from "./globe.js";

const SVG = "http://www.w3.org/2000/svg";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

// How fast each ring turns at "speed 1" (one full turn every N ms) and which way.
// `coupled` rings change speed with the state and the stream rate. The scan arc
// keeps one steady speed (about one turn a second): it only appears while the
// model is thinking, and a fast spinner beside text you're reading is tiring.
const RINGS = [
  { id: "ring-ticks", period: 140_000, dir: 1, coupled: true },
  { id: "ring-segments", period: 90_000, dir: -1, coupled: true },
  { id: "ring-scan", period: 1_100, dir: 1, coupled: false },
];

// Ring speed per state. Streaming adds the measured chunk rate on top.
const SPEED = { booting: 2.5, standby: 1, listening: 1.6, thinking: 3, streaming: 2, error: 0.4, offline: 0 };

const LABELS = {
  booting: "Atlas",
  standby: "Standby",
  listening: "Listening",
  thinking: "Thinking",
  streaming: "Speaking",
  error: "Fault",
  offline: "Offline",
};

const MAX_LEAN = 7; // degrees the instrument leans toward the pointer

function line(parent, r1, r2, angleDeg, className) {
  const a = (angleDeg * Math.PI) / 180;
  const el = document.createElementNS(SVG, "line");
  el.setAttribute("x1", (Math.cos(a) * r1).toFixed(2));
  el.setAttribute("y1", (Math.sin(a) * r1).toFixed(2));
  el.setAttribute("x2", (Math.cos(a) * r2).toFixed(2));
  el.setAttribute("y2", (Math.sin(a) * r2).toFixed(2));
  if (className) el.setAttribute("class", className);
  parent.append(el);
}

/**
 * leanArea: the element whose pointer movement makes the core lean toward it
 * (the presence panel). Optional.
 */
export function createCore({ leanArea } = {}) {
  const root = document.getElementById("core");
  const layers = document.getElementById("core-layers");
  const stateEl = document.getElementById("core-state");
  const detailEl = document.getElementById("core-detail");
  const globe = createGlobe(document.getElementById("globe"), root);
  const bloom = document.getElementById("core-bloom");
  const ctxArc = document.getElementById("core-ctx");

  // Draw the tick ring: 120 ticks, every 10th one long.
  const ticks = document.getElementById("ring-ticks");
  for (let i = 0; i < 120; i++) {
    const major = i % 10 === 0;
    line(ticks, 246, major ? 266 : 256, i * 3, major ? "major" : "");
  }

  // One looping rotation per ring; afterwards we only ever change its speed.
  const anims = RINGS.map(({ id, period, dir }) =>
    document
      .getElementById(id)
      .animate([{ transform: "rotate(0deg)" }, { transform: `rotate(${360 * dir}deg)` }], {
        duration: period,
        iterations: Infinity,
        easing: "linear",
      }),
  );
  const coupled = anims.filter((_, i) => RINGS[i].coupled);
  let appliedRate = 1;

  // updatePlaybackRate() hands the new speed to the compositor smoothly.
  // Only call it when the speed really changed, not on every frame.
  function applyRate(rate) {
    if (Math.abs(rate - appliedRate) < 0.01) return;
    appliedRate = rate;
    for (const a of coupled) a.updatePlaybackRate(Math.max(rate, 0.0001));
  }

  let state = "standby";
  let speed = 1; // current ring speed (eased toward `target`)
  let target = 1;
  let energy = 0; // 0..1, pumped by each chunk, decays every frame
  let frame = 0;

  // The lean: target angles from the pointer, current angles on a spring.
  const lean = { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0 };

  function applyMotionPreference() {
    // Reduced motion: no rotation at all. State still shows through colour.
    for (const a of anims) reduceMotion.matches ? a.pause() : a.play();
  }
  applyMotionPreference();
  reduceMotion.addEventListener("change", applyMotionPreference);

  // One small animation loop that runs only while something is changing:
  // ease the ring speed toward its target, let the bloom's energy decay, and
  // move the lean along its spring.
  function tick() {
    speed += (target - speed) * 0.06;
    energy *= 0.9;
    if (!reduceMotion.matches) {
      applyRate(speed);
      bloom.style.transform = `scale(${0.95 + energy * 0.15})`;
    }
    // Brightness carries the pulse even with reduced motion (no movement).
    bloom.style.opacity = String(0.25 + energy * 0.6);

    // Spring toward the pointer: stiffness 120, damping ratio ~0.7 (a soft,
    // physical follow, not a 1:1 glue to the mouse).
    const dt = 1 / 60;
    for (const axis of ["x", "y"]) {
      const v = `v${axis}`;
      const tgt = lean[`t${axis}`];
      lean[v] += ((tgt - lean[axis]) * 120 - lean[v] * 15) * dt;
      lean[axis] += lean[v] * dt;
    }
    layers.style.transform = `rotateX(${lean.y.toFixed(2)}deg) rotateY(${lean.x.toFixed(2)}deg)`;

    const leanSettled =
      Math.abs(lean.tx - lean.x) < 0.02 && Math.abs(lean.ty - lean.y) < 0.02 && Math.abs(lean.vx) + Math.abs(lean.vy) < 0.02;
    const settled = Math.abs(target - speed) < 0.01 && energy < 0.01 && leanSettled;
    if (settled) {
      speed = target;
      frame = 0;
    } else {
      frame = requestAnimationFrame(tick);
    }
  }
  const kick = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };

  if (leanArea) {
    leanArea.addEventListener("pointermove", (e) => {
      if (!finePointer.matches || reduceMotion.matches || root.classList.contains("is-dragging")) return;
      const rect = root.getBoundingClientRect();
      if (!rect.width) return;
      // -1..1 from the core's centre, measured in core widths, then clamped.
      const nx = Math.max(-1, Math.min(1, (e.clientX - (rect.left + rect.width / 2)) / rect.width));
      const ny = Math.max(-1, Math.min(1, (e.clientY - (rect.top + rect.height / 2)) / rect.height));
      lean.tx = nx * MAX_LEAN;
      lean.ty = -ny * MAX_LEAN;
      kick();
    });
    leanArea.addEventListener("pointerleave", () => {
      lean.tx = 0;
      lean.ty = 0;
      kick();
    });
  }

  return {
    el: root,

    get state() {
      return state;
    },

    /** Switch state: standby | listening | thinking | streaming | error | offline | booting */
    setState(next, detail) {
      state = next;
      root.dataset.state = next;
      document.documentElement.dataset.atlas = next; // lets CSS elsewhere (mini orb, captions) follow
      stateEl.textContent = LABELS[next] ?? next;
      if (detail !== undefined) detailEl.textContent = detail;
      target = SPEED[next] ?? 1;
      globe.setMode(next, 1 + (target - 1) * 0.35);
      if (next === "offline") {
        // Stop dead (no easing): a dead link should look dead.
        speed = 0;
        applyRate(0);
      }
      kick();
    },

    setDetail(text) {
      detailEl.textContent = text;
    },

    /** Called for every streamed chunk: a small surge of light. */
    pulse() {
      energy = Math.min(1, energy + 0.14);
      globe.pulse();
      kick();
    },

    /** A keystroke in the composer. */
    nudge() {
      energy = Math.min(1, energy + 0.05);
      globe.nudge();
      kick();
    },

    /** While streaming: spin faster with the model's real output rate. */
    setRate(chunksPerSecond) {
      if (state !== "streaming") return;
      target = SPEED.streaming + Math.min(chunksPerSecond / 8, 6);
      globe.setSpeed(1 + (target - 1) * 0.35); // the Earth turns faster, but stays calm
      kick();
    },

    /** Fill the context arc: how much of the context window is used. */
    setContext(fraction) {
      const pct = Math.max(0, Math.min(1, fraction)) * 100;
      ctxArc.style.strokeDasharray = `${pct.toFixed(2)} 100`;
    },
  };
}
