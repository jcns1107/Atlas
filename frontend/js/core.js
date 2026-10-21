// core.js — the HUD's centre: rotating rings that react to the model.
//
// The signature idea: the core is driven by REAL stream data.
//   - waiting for the first token → a bright scan arc sweeps the inner ring
//   - streaming → every chunk that arrives pumps the disc's brightness, and
//     the rings spin faster the more chunks per second the model produces
//   - backend unreachable → the rings stop and the core greys out
//
// Each ring is a separate <svg> element rotated with the Web Animations API.
// Rotating a whole element is done by the GPU; animating shapes *inside* one
// SVG would make the browser repaint the drawing every frame.

const SVG = "http://www.w3.org/2000/svg";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// How fast each ring turns at "speed 1" (one full turn every N ms) and which way.
// `coupled` rings change speed with the state and the stream rate. The scan arc
// keeps one steady speed (about one turn a second): it only appears while the
// model is thinking, and a fast spinner beside text you're reading is tiring.
const RINGS = [
  { id: "ring-ticks", period: 140_000, dir: 1, coupled: true },
  { id: "ring-segments", period: 90_000, dir: -1, coupled: true },
  { id: "ring-data", period: 46_000, dir: 1, coupled: true },
  { id: "ring-scan", period: 1_100, dir: 1, coupled: false },
];

// Ring speed per state. Streaming adds the measured chunk rate on top.
const SPEED = { booting: 2.5, standby: 1, listening: 1.6, thinking: 3, streaming: 2, error: 0.4, offline: 0 };

const LABELS = {
  booting: "Atlas",
  standby: "Standby",
  listening: "Listening",
  thinking: "Thinking",
  streaming: "Streaming",
  error: "Fault",
  offline: "Offline",
};

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

export function createCore() {
  const root = document.getElementById("core");
  const stateEl = document.getElementById("core-state");
  const detailEl = document.getElementById("core-detail");
  const disc = document.getElementById("core-disc");
  const bloom = document.getElementById("core-bloom");
  const ctxArc = document.getElementById("core-ctx");

  // Draw the tick ring (120 ticks, every 10th one long) and the iris blades.
  const ticks = document.getElementById("ring-ticks");
  for (let i = 0; i < 120; i++) {
    const major = i % 10 === 0;
    line(ticks, 246, major ? 266 : 256, i * 3, major ? "major" : "");
  }
  const iris = document.getElementById("ring-iris");
  for (let i = 0; i < 60; i++) line(iris, 152, 166, i * 6);

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

  function applyMotionPreference() {
    // Reduced motion: no rotation at all. State still shows through colour.
    for (const a of anims) reduceMotion.matches ? a.pause() : a.play();
  }
  applyMotionPreference();
  reduceMotion.addEventListener("change", applyMotionPreference);

  // One small animation loop that runs only while something is changing:
  // ease the ring speed toward its target and let the disc's energy decay.
  function tick() {
    speed += (target - speed) * 0.06;
    energy *= 0.9;
    if (!reduceMotion.matches) {
      applyRate(speed);
      disc.style.transform = `scale(${1 + energy * 0.05})`;
      bloom.style.transform = `scale(${0.92 + energy * 0.3})`;
    }
    // Brightness carries the pulse even with reduced motion (no movement).
    disc.style.opacity = String(0.82 + energy * 0.18);
    bloom.style.opacity = String(0.18 + energy * 0.7);

    const settled = Math.abs(target - speed) < 0.01 && energy < 0.01;
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

  return {
    get state() {
      return state;
    },

    /** Switch state: standby | listening | thinking | streaming | error | offline */
    setState(next, detail) {
      state = next;
      root.dataset.state = next;
      stateEl.textContent = LABELS[next] ?? next;
      if (detail !== undefined) detailEl.textContent = detail;
      target = SPEED[next] ?? 1;
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
      kick();
    },

    /** While streaming: spin faster with the model's real output rate. */
    setRate(chunksPerSecond) {
      if (state !== "streaming") return;
      target = SPEED.streaming + Math.min(chunksPerSecond / 8, 6);
      kick();
    },

    /** Fill the inner arc: how much of the context window is (roughly) used. */
    setContext(fraction) {
      const pct = Math.max(0, Math.min(1, fraction)) * 100;
      ctxArc.style.strokeDasharray = `${pct.toFixed(2)} 100`;
    },
  };
}
