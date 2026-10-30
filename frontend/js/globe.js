// globe.js — the holographic Earth at the centre of the core.
//
// Drawn on a <canvas> every frame: ~2,200 land dots on a tilted, rotating
// sphere, a graticule (lines of latitude/longitude), and a ring of "voice"
// bars around it. When Atlas replies, the Earth talks:
//   - every streamed chunk adds energy (pulse())
//   - energy sends ripples outward across the dots, like sound from a speaker
//   - the voice bars around the rim jump with the energy
// When idle it just turns slowly. With reduced motion it doesn't rotate and the
// talking shows as brightness only.
//
// Projection, in one line: a point at (longitude λ, latitude φ) on a unit
// sphere is (cosφ·sinλ, sinφ, cosφ·cosλ); we spin λ, tilt the result around
// the x-axis, and draw the points whose z > 0 (the side facing us) brightest.

import { LAND } from "./earth-data.js";

const TILT = (-20 * Math.PI) / 180; // lean the north pole toward the viewer
const DEG = Math.PI / 180;
const BARS = 120; // voice bars around the rim

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// Pre-compute each dot's position on the unit sphere (before rotation).
const N = LAND.length / 2;
const lonR = new Float32Array(N);
const cosLat = new Float32Array(N);
const sinLat = new Float32Array(N);
for (let i = 0; i < N; i++) {
  lonR[i] = (LAND[i * 2] / 10) * DEG;
  const lat = (LAND[i * 2 + 1] / 10) * DEG;
  cosLat[i] = Math.cos(lat);
  sinLat[i] = Math.sin(lat);
}

// Graticule: meridians every 30°, parallels every 30°, sampled as polylines.
const GRID = [];
for (let lon = -180; lon < 180; lon += 30) {
  const line = [];
  for (let lat = -90; lat <= 90; lat += 5) line.push([lon * DEG, lat * DEG]);
  GRID.push(line);
}
for (let lat = -60; lat <= 60; lat += 30) {
  const line = [];
  for (let lon = -180; lon <= 180; lon += 5) line.push([lon * DEG, lat * DEG]);
  GRID.push(line);
}

// Fixed random phases so each voice bar moves differently but repeatably.
const PHASE = Float32Array.from({ length: BARS }, (_, i) => (Math.sin(i * 12.9898) * 43758.5453) % 1);

export function createGlobe(canvas) {
  const ctx = canvas.getContext("2d");
  let w = 0;
  let h = 0;
  let dpr = 1;
  let rotation = -0.3; // radians of longitude (start with Europe / Africa in view)
  let speed = 1; // eased toward `targetSpeed`
  let targetSpeed = 1;
  let energy = 0; // 0..1, pumped by chunks, decays
  let talk = 0; // smoothed energy that drives the visuals
  let mode = "standby";
  let last = performance.now();
  let t = 0;
  let raf = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    w = Math.max(1, Math.round(rect.width * dpr));
    h = Math.max(1, Math.round(rect.height * dpr));
    canvas.width = w;
    canvas.height = h;
    draw();
  }
  new ResizeObserver(resize).observe(canvas);

  // Rotate by `rotation` around the pole, then tilt around the x-axis.
  function project(lon, cosL, sinL, out) {
    const l = lon + rotation;
    const x = cosL * Math.sin(l);
    const y0 = sinL;
    const z0 = cosL * Math.cos(l);
    out.x = x;
    out.y = y0 * Math.cos(TILT) - z0 * Math.sin(TILT);
    out.z = y0 * Math.sin(TILT) + z0 * Math.cos(TILT);
  }
  const p = { x: 0, y: 0, z: 0 };

  function draw() {
    if (!w) return;
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.46;
    const dim = mode === "offline" ? 0.35 : 1;
    const amber = mode === "error" || mode === "offline";
    const rgb = amber ? "255, 184, 77" : "58, 216, 255";
    const hot = amber ? "255, 214, 150" : "200, 245, 255";

    ctx.clearRect(0, 0, w, h);

    // Atmosphere: a soft halo that swells while talking.
    const halo = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * (1.18 + talk * 0.12));
    halo.addColorStop(0, `rgba(${rgb}, ${0.16 * dim + talk * 0.18})`);
    halo.addColorStop(1, `rgba(${rgb}, 0)`);
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // The sphere itself: dark glass with a lit rim.
    const body = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
    body.addColorStop(0, `rgba(${rgb}, ${0.16 * dim})`);
    body.addColorStop(1, `rgba(2, 10, 16, 0.92)`);
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1.5 * dpr;
    ctx.strokeStyle = `rgba(${rgb}, ${0.55 * dim})`;
    ctx.stroke();

    // Graticule, front half only.
    ctx.lineWidth = 1 * dpr;
    ctx.strokeStyle = `rgba(${rgb}, ${0.16 * dim})`;
    ctx.beginPath();
    for (const line of GRID) {
      let pen = false;
      for (const [lon, lat] of line) {
        project(lon, Math.cos(lat), Math.sin(lat), p);
        if (p.z < 0) {
          pen = false;
          continue;
        }
        const sx = cx + p.x * R;
        const sy = cy - p.y * R;
        pen ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy);
        pen = true;
      }
    }
    ctx.stroke();

    // Land dots. Back-side dots are faint (it's a hologram: you see through it).
    // While talking, ripples travel outward from the centre: each dot is pushed
    // out a little and brightened when a wave crest passes it.
    const ripple = reduceMotion.matches ? 0 : talk;
    const size = Math.max(1, R / 150) * 1.15;
    for (let i = 0; i < N; i++) {
      project(lonR[i], cosLat[i], sinLat[i], p);
      const front = p.z > 0;
      const d = Math.hypot(p.x, p.y); // 0 at the centre, 1 at the rim
      const wave = Math.sin(d * 13 - t * 7.5);
      const crest = Math.max(0, wave) * talk;
      const push = 1 + ripple * 0.035 * wave * (front ? 1 : 0);
      const sx = cx + p.x * R * push;
      const sy = cy - p.y * R * push;
      if (front) {
        const a = (0.45 + 0.55 * p.z) * dim;
        ctx.fillStyle = crest > 0.25 ? `rgba(${hot}, ${Math.min(1, a + crest * 0.6)})` : `rgba(${rgb}, ${a})`;
        const s = size * (0.7 + 0.5 * p.z) * (1 + crest * 0.8);
        ctx.fillRect(sx - s / 2, sy - s / 2, s, s);
      } else {
        ctx.fillStyle = `rgba(${rgb}, ${0.08 * dim})`;
        ctx.fillRect(sx - size * 0.35, sy - size * 0.35, size * 0.7, size * 0.7);
      }
    }

    // Voice bars around the rim: idle they're a faint dotted ring; talking,
    // they jump with the energy of the stream.
    ctx.lineWidth = Math.max(1.5, R / 110);
    ctx.lineCap = "round";
    ctx.strokeStyle = `rgba(${hot}, ${0.35 * dim + talk * 0.6})`;
    ctx.beginPath();
    const r0 = R * 1.07;
    for (let i = 0; i < BARS; i++) {
      const a = (i / BARS) * Math.PI * 2;
      // Reduced motion: the bars hold still and only brighten with the voice.
      const n = reduceMotion.matches
        ? 0
        : 0.5 + 0.3 * Math.sin(t * 9 + PHASE[i] * 20) + 0.2 * Math.sin(t * 15.3 + i * 0.45);
      const len = R * (0.012 + talk * 0.13 * n);
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      ctx.moveTo(cx + ca * r0, cy + sa * r0);
      ctx.lineTo(cx + ca * (r0 + len), cy + sa * (r0 + len));
    }
    ctx.stroke();
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;
    speed += (targetSpeed - speed) * 0.05;
    energy *= Math.pow(0.18, dt); // fades over about half a second
    talk += (energy - talk) * Math.min(1, dt * 10);
    if (!reduceMotion.matches) rotation += dt * speed * ((2 * Math.PI) / 70); // one turn / 70 s
    draw();
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  start();

  return {
    /** standby | listening | thinking | streaming | error | offline | booting */
    setMode(next, speedFactor) {
      mode = next;
      targetSpeed = speedFactor;
      if (next === "offline") speed = targetSpeed = 0;
    },
    setSpeed(speedFactor) {
      targetSpeed = speedFactor;
    },
    /** One streamed chunk: a burst of "voice". */
    pulse() {
      energy = Math.min(1, energy + 0.22);
    },
  };
}
