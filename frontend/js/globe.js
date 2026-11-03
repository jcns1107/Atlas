// globe.js — the living Earth at the centre of the core.
//
// Drawn on a <canvas> every frame: ~2,200 land dots on a tilted, turning
// sphere, a graticule, a ring of "voice" bars, and signal arcs that hop between
// places on the surface. It is Atlas's face, so it reacts to everything:
//
//   standby    turns slowly and breathes; now and then a signal arc crosses it
//   listening  each keystroke you type sends a small pulse (nudge())
//   thinking   arcs fire quickly from place to place: Atlas is "searching"
//   streaming  every chunk makes it talk: ripples run across the land dots,
//              the voice bars jump, and some chunks launch an arc
//   error      it turns amber;  offline: amber, dim and still
//
// And it reacts to you:
//   - hover: the dots under the pointer light up, and a reticle shows the real
//     latitude/longitude under it (an inverse projection, see pick())
//   - drag (or arrow keys): spin it; let go and it coasts, then settles back
//
// Projection, in one line: a point at (longitude λ, latitude φ) on a unit
// sphere is (cosφ·sinλ, sinφ, cosφ·cosλ); we spin λ, tilt the result around the
// x-axis, and draw what faces us (z > 0) brightest.
//
// With reduced motion nothing turns or travels by itself: talking shows as
// brightness only, and only your own drag moves the globe.

import { LAND } from "./earth-data.js";

const DEG = Math.PI / 180;
const BASE_TILT = -20 * DEG; // lean the north pole toward the viewer
const BARS = 120; // voice bars around the rim
const AUTO_TURN = (2 * Math.PI) / 70; // radians per second at speed 1 (one turn / 70 s)
const MAX_ARCS = 14;

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/** A point on the unit sphere, in the Earth's own (unrotated) frame. */
function toXYZ(lon, lat) {
  return [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
}

// Pre-compute each dot's position on the unit sphere (before rotation).
const N = LAND.length / 2;
const lonR = new Float32Array(N);
const latR = new Float32Array(N);
// Each dot as (x, y, z) on the unit sphere, computed once: the per-frame work
// is then two small rotations, no trigonometry.
const DX = new Float32Array(N);
const DY = new Float32Array(N);
const DZ = new Float32Array(N);
for (let i = 0; i < N; i++) {
  lonR[i] = (LAND[i * 2] / 10) * DEG;
  latR[i] = (LAND[i * 2 + 1] / 10) * DEG;
  DX[i] = Math.cos(latR[i]) * Math.sin(lonR[i]);
  DY[i] = Math.sin(latR[i]);
  DZ[i] = Math.cos(latR[i]) * Math.cos(lonR[i]);
}

// Graticule: meridians and parallels every 30°, sampled as polylines of
// (x, y, z) points on the unit sphere.
const GRID = [];
for (let lon = -180; lon < 180; lon += 30) {
  const line = [];
  for (let lat = -90; lat <= 90; lat += 5) line.push(toXYZ(lon * DEG, lat * DEG));
  GRID.push(line);
}
for (let lat = -60; lat <= 60; lat += 30) {
  const line = [];
  for (let lon = -180; lon <= 180; lon += 5) line.push(toXYZ(lon * DEG, lat * DEG));
  GRID.push(line);
}

// Fixed pseudo-random phases so each voice bar moves differently but repeatably.
const PHASE = Float32Array.from({ length: BARS }, (_, i) => (Math.sin(i * 12.9898) * 43758.5453) % 1);

/** Spherical interpolation between two unit vectors (the great-circle path). */
function slerp(a, b, s, omega, sinO) {
  if (sinO < 1e-6) return a;
  const k1 = Math.sin((1 - s) * omega) / sinO;
  const k2 = Math.sin(s * omega) / sinO;
  return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
}

const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const fmtCoord = (deg, pos, neg) => `${Math.abs(deg).toFixed(1)}°${deg >= 0 ? pos : neg}`;

/**
 * canvas: where the Earth is drawn.
 * hitEl:  the element that receives pointer and keyboard input (the whole core,
 *         so you can grab the globe through its rings).
 */
export function createGlobe(canvas, hitEl = canvas) {
  const ctx = canvas.getContext("2d");
  let w = 0;
  let h = 0;
  let dpr = 1;

  // Motion state
  let rotation = -0.3; // radians of longitude (start with Europe / Africa in view)
  let speed = 1; // auto-turn speed, eased toward targetSpeed
  let targetSpeed = 1;
  let spin = 0; // extra angular velocity from a drag (rad/s), decays when let go
  let tilt = BASE_TILT;
  let tiltVel = 0;

  // Voice
  let energy = 0; // 0..1, pumped by chunks, decays
  let talk = 0; // smoothed energy that drives the visuals
  let mode = "standby";

  // Pointer
  const pointer = { x: 0, y: 0, inside: false }; // canvas pixels
  let attention = 0; // 0..1, eased: how strongly the dots under the pointer light up
  let dragging = null; // { id, lastX, lastY, lastT, vx }

  // Arcs and pings
  const arcs = [];
  const pings = [];
  let nextAmbient = 1.5;
  let nextThought = 0;

  let last = performance.now();
  let t = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    w = Math.max(1, Math.round(rect.width * dpr));
    h = Math.max(1, Math.round(rect.height * dpr));
    canvas.width = w;
    canvas.height = h;
  }
  new ResizeObserver(resize).observe(canvas);

  const geometry = () => ({ cx: w / 2, cy: h / 2, R: Math.min(w, h) * 0.46 });

  // Rotate by `rotation` around the pole, then tilt around the x-axis.
  // (x, y, z) is in the Earth's frame; the result is in view space.
  const cosR = { v: 1 };
  const sinR = { v: 0 };
  const cosT = { v: 1 };
  const sinT = { v: 0 };
  const p = { x: 0, y: 0, z: 0 };
  function view(x, y, z, out) {
    const x1 = x * cosR.v + z * sinR.v;
    const z1 = z * cosR.v - x * sinR.v;
    out.x = x1;
    out.y = y * cosT.v - z1 * sinT.v;
    out.z = y * sinT.v + z1 * cosT.v;
  }

  /**
   * The inverse: which place on Earth is under canvas pixel (sx, sy)?
   * Returns { lon, lat } in degrees, or null off the sphere.
   */
  function pick(sx, sy) {
    const { cx, cy, R } = geometry();
    const vx = (sx - cx) / R;
    const vy = -(sy - cy) / R;
    const d2 = vx * vx + vy * vy;
    if (d2 > 1) return null;
    const vz = Math.sqrt(1 - d2);
    // Undo the tilt (rotate around x by -tilt), then undo the spin.
    const y = vy * cosT.v + vz * sinT.v;
    const z1 = -vy * sinT.v + vz * cosT.v;
    const x = vx * cosR.v - z1 * sinR.v;
    const z = vx * sinR.v + z1 * cosR.v;
    let lon = Math.atan2(x, z) / DEG;
    lon = ((((lon + 180) % 360) + 360) % 360) - 180;
    return { lon, lat: Math.asin(Math.max(-1, Math.min(1, y))) / DEG };
  }

  // --- Arcs: a signal hopping between two places on the visible side -----------
  function spawnArc(strength = 1) {
    if (reduceMotion.matches || arcs.length >= MAX_ARCS || !w) return;
    // Pick a land dot that faces us, then a second one 15–75° away from it.
    let a = null;
    for (let tries = 0; tries < 24 && !a; tries++) {
      const i = (Math.random() * N) | 0;
      view(DX[i], DY[i], DZ[i], p);
      if (p.z > 0.3) a = [DX[i], DY[i], DZ[i]];
    }
    if (!a) return;
    let b = null;
    let omega = 0;
    for (let tries = 0; tries < 40 && !b; tries++) {
      const i = (Math.random() * N) | 0;
      const xyz = [DX[i], DY[i], DZ[i]];
      const dot = a[0] * xyz[0] + a[1] * xyz[1] + a[2] * xyz[2];
      const ang = Math.acos(Math.max(-1, Math.min(1, dot)));
      view(xyz[0], xyz[1], xyz[2], p);
      if (ang > 15 * DEG && ang < 75 * DEG && p.z > 0.05) {
        b = xyz;
        omega = ang;
      }
    }
    if (!b) return;
    arcs.push({
      a,
      b,
      omega,
      sinO: Math.sin(omega),
      height: 0.08 + omega * 0.22, // longer hops arc higher
      age: 0,
      dur: 0.9 + omega * 1.1 + Math.random() * 0.4,
      strength,
    });
  }

  function drawArcs(dt, cx, cy, R, rgb, hot, dim) {
    const TAIL = 0.38; // length of the lit segment, as a share of the path
    for (let k = arcs.length - 1; k >= 0; k--) {
      const arc = arcs[k];
      arc.age += dt;
      const travel = arc.age / arc.dur; // 0..1 head travel; >1 while the tail catches up
      if (travel > 1 + TAIL) {
        arcs.splice(k, 1);
        continue;
      }
      const head = easeOut(Math.min(1, travel));
      const tail = Math.max(0, head - TAIL - Math.max(0, travel - 1));
      if (travel >= 1 && !arc.landed) {
        arc.landed = true;
        pings.push({ at: arc.b, age: 0 });
      }
      // Sample the visible piece of the great circle, lifted above the surface.
      const STEPS = 22;
      let prev = null;
      for (let s = 0; s <= STEPS; s++) {
        const u = tail + ((head - tail) * s) / STEPS;
        const q = slerp(arc.a, arc.b, u, arc.omega, arc.sinO);
        const lift = 1 + arc.height * Math.sin(Math.PI * u);
        view(q[0] * lift, q[1] * lift, q[2] * lift, p);
        const visible = p.z > 0 || p.x * p.x + p.y * p.y > 1;
        const pt = { x: cx + p.x * R, y: cy - p.y * R, visible };
        if (prev && prev.visible && pt.visible) {
          // Brighter toward the head, so it reads as something travelling.
          const k2 = s / STEPS;
          ctx.strokeStyle = `rgba(${k2 > 0.7 ? hot : rgb}, ${(0.25 + 0.75 * k2) * dim * arc.strength})`;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(pt.x, pt.y);
          ctx.stroke();
        }
        prev = pt;
      }
      // The head itself: a small bright point while it is still travelling.
      if (travel < 1 && prev?.visible) {
        ctx.fillStyle = `rgba(${hot}, ${0.95 * dim})`;
        const s = Math.max(2, R / 70);
        ctx.fillRect(prev.x - s / 2, prev.y - s / 2, s, s);
      }
    }
  }

  function drawPings(dt, cx, cy, R, hot, dim) {
    for (let k = pings.length - 1; k >= 0; k--) {
      const ping = pings[k];
      ping.age += dt;
      if (ping.age > 0.9) {
        pings.splice(k, 1);
        continue;
      }
      view(ping.at[0], ping.at[1], ping.at[2], p);
      if (p.z <= 0) continue;
      const k2 = ping.age / 0.9;
      ctx.strokeStyle = `rgba(${hot}, ${(1 - k2) * 0.8 * dim})`;
      ctx.beginPath();
      ctx.arc(cx + p.x * R, cy - p.y * R, R * (0.01 + 0.07 * easeOut(k2)), 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // --- One frame ---------------------------------------------------------------
  function draw(dt) {
    if (!w) return;
    const { cx, cy, R } = geometry();
    const small = R < 60 * dpr; // the mini orb in the header: skip the fine detail
    const dim = mode === "offline" ? 0.35 : 1;
    const amber = mode === "error" || mode === "offline";
    const rgb = amber ? "255, 184, 77" : "58, 216, 255";
    const hot = amber ? "255, 214, 150" : "200, 245, 255";
    const breathe = reduceMotion.matches ? 0 : 0.5 + 0.5 * Math.sin(t * 0.9);

    cosR.v = Math.cos(rotation);
    sinR.v = Math.sin(rotation);
    cosT.v = Math.cos(tilt);
    sinT.v = Math.sin(tilt);

    ctx.clearRect(0, 0, w, h);

    // Atmosphere: a soft halo that breathes when idle and swells while talking.
    const halo = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * (1.16 + talk * 0.12 + breathe * 0.03));
    halo.addColorStop(0, `rgba(${rgb}, ${(0.14 + breathe * 0.04) * dim + talk * 0.18})`);
    halo.addColorStop(1, `rgba(${rgb}, 0)`);
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // The sphere itself: dark glass with a lit rim.
    const body = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
    body.addColorStop(0, `rgba(${rgb}, ${0.16 * dim})`);
    body.addColorStop(1, "rgba(2, 10, 16, 0.92)");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1.5 * dpr;
    ctx.strokeStyle = `rgba(${rgb}, ${0.55 * dim})`;
    ctx.stroke();

    // Graticule, front half only.
    if (!small) {
      ctx.lineWidth = 1 * dpr;
      ctx.strokeStyle = `rgba(${rgb}, ${0.15 * dim})`;
      ctx.beginPath();
      for (const line of GRID) {
        let pen = false;
        for (const [x, y, z] of line) {
          view(x, y, z, p);
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
    }

    // Land dots. Back-side dots are faint (a hologram: you see through it).
    // Talking sends ripples outward from the centre; the pointer's spotlight
    // lights up the dots under it.
    const ripple = reduceMotion.matches ? 0 : talk;
    const size = Math.max(1, R / 150) * 1.15;
    const spot = R * 0.3;
    const spot2 = spot * spot;
    const usePointer = attention > 0.01 && !small;
    for (let i = 0; i < N; i++) {
      view(DX[i], DY[i], DZ[i], p);
      const front = p.z > 0;
      const d = Math.hypot(p.x, p.y); // 0 at the centre, 1 at the rim
      const wave = Math.sin(d * 13 - t * 7.5);
      const crest = Math.max(0, wave) * talk;
      const push = 1 + ripple * 0.035 * wave * (front ? 1 : 0);
      const sx = cx + p.x * R * push;
      const sy = cy - p.y * R * push;
      if (front) {
        let light = 0;
        if (usePointer) {
          const dx = sx - pointer.x;
          const dy = sy - pointer.y;
          const q = dx * dx + dy * dy;
          if (q < spot2) light = (1 - Math.sqrt(q) / spot) ** 2 * attention;
        }
        const a = (0.45 + 0.55 * p.z) * dim;
        const lit = crest > 0.25 || light > 0.2;
        ctx.fillStyle = lit ? `rgba(${hot}, ${Math.min(1, a + crest * 0.6 + light * 0.5)})` : `rgba(${rgb}, ${a})`;
        const s = size * (0.7 + 0.5 * p.z) * (1 + crest * 0.8 + light * 0.9);
        ctx.fillRect(sx - s / 2, sy - s / 2, s, s);
      } else if (!small) {
        ctx.fillStyle = `rgba(${rgb}, ${0.08 * dim})`;
        ctx.fillRect(sx - size * 0.35, sy - size * 0.35, size * 0.7, size * 0.7);
      }
    }

    // Signal arcs and their landing pings.
    if (arcs.length || pings.length) {
      ctx.lineWidth = Math.max(1.25 * dpr, R / 150);
      ctx.lineCap = "round";
      drawArcs(dt, cx, cy, R, rgb, hot, dim);
      drawPings(dt, cx, cy, R, hot, dim);
    }

    // Voice bars around the rim: idle they're a faint dotted ring; talking,
    // they jump with the energy of the stream.
    ctx.lineWidth = Math.max(1.5, R / 110);
    ctx.lineCap = "round";
    ctx.strokeStyle = `rgba(${hot}, ${0.35 * dim + talk * 0.6})`;
    ctx.beginPath();
    const r0 = R * 1.07;
    for (let i = 0; i < BARS; i += small ? 3 : 1) {
      const ang = (i / BARS) * Math.PI * 2;
      const n = reduceMotion.matches
        ? 0
        : 0.5 + 0.3 * Math.sin(t * 9 + PHASE[i] * 20) + 0.2 * Math.sin(t * 15.3 + i * 0.45);
      const len = R * (0.012 + talk * 0.13 * n);
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);
      ctx.moveTo(cx + ca * r0, cy + sa * r0);
      ctx.lineTo(cx + ca * (r0 + len), cy + sa * (r0 + len));
    }
    ctx.stroke();

    // The reticle: where the pointer is, and the real coordinates under it.
    if (attention > 0.05 && pointer.inside && !small && !dragging) {
      const place = pick(pointer.x, pointer.y);
      if (place) {
        const r = R * 0.075;
        ctx.strokeStyle = `rgba(${hot}, ${0.75 * attention * dim})`;
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, r, 0, Math.PI * 2);
        for (let k = 0; k < 4; k++) {
          const ang = (k * Math.PI) / 2;
          ctx.moveTo(pointer.x + Math.cos(ang) * r * 1.35, pointer.y + Math.sin(ang) * r * 1.35);
          ctx.lineTo(pointer.x + Math.cos(ang) * r * 1.85, pointer.y + Math.sin(ang) * r * 1.85);
        }
        ctx.stroke();
        const label = `${fmtCoord(place.lat, "N", "S")}  ${fmtCoord(place.lon, "E", "W")}`;
        ctx.font = `500 ${Math.round(11 * dpr)}px Saira, system-ui, sans-serif`;
        ctx.fillStyle = `rgba(${hot}, ${0.9 * attention * dim})`;
        const right = pointer.x + r * 2.2 + ctx.measureText(label).width > w;
        ctx.textAlign = right ? "right" : "left";
        ctx.fillText(label, pointer.x + (right ? -r * 2.2 : r * 2.2), pointer.y - r * 1.2);
      }
    }
  }

  // --- The loop ------------------------------------------------------------------
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;

    speed += (targetSpeed - speed) * Math.min(1, dt * 3);
    energy *= Math.pow(0.18, dt); // fades over about half a second
    talk += (energy - talk) * Math.min(1, dt * 10);
    attention += ((pointer.inside ? 1 : 0) - attention) * Math.min(1, dt * 8);

    if (!dragging) {
      // A drag's spin coasts, then friction hands control back to the auto-turn.
      spin *= Math.exp(-dt * 1.6);
      // The tilt springs back to its resting angle (a damped spring).
      const k = 30;
      const c = 2 * Math.sqrt(k) * 0.8;
      tiltVel += (-(tilt - BASE_TILT) * k - tiltVel * c) * dt;
      tilt += tiltVel * dt;
    }
    const auto = reduceMotion.matches ? 0 : AUTO_TURN * speed;
    rotation += dt * (auto + spin);

    // Signal arcs by state. Thinking fires them fast; idle, now and then.
    if (mode === "thinking") {
      nextThought -= dt;
      if (nextThought <= 0) {
        spawnArc(1);
        nextThought = 0.16 + Math.random() * 0.2;
      }
    } else if (mode === "standby" || mode === "listening") {
      nextAmbient -= dt;
      if (nextAmbient <= 0) {
        spawnArc(0.7);
        nextAmbient = 2.4 + Math.random() * 3.2;
      }
    }

    draw(dt);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // --- Input: hover, drag, keys --------------------------------------------------
  function local(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * dpr, y: (e.clientY - rect.top) * dpr };
  }
  hitEl.addEventListener("pointermove", (e) => {
    const { x, y } = local(e);
    pointer.x = x;
    pointer.y = y;
    const { cx, cy, R } = geometry();
    pointer.inside = e.pointerType === "mouse" && Math.hypot(x - cx, y - cy) < R * 1.02;
    if (!dragging || e.pointerId !== dragging.id) return;
    const now = performance.now();
    const dx = (e.clientX - dragging.lastX) * dpr;
    const dy = (e.clientY - dragging.lastY) * dpr;
    const dts = Math.max(1, now - dragging.lastT) / 1000;
    const turn = dx / R; // radians: one radius of drag ≈ one radian of spin
    rotation += turn;
    dragging.vx = dragging.vx * 0.6 + (turn / dts) * 0.4; // smoothed velocity for the throw
    tilt = Math.max(BASE_TILT - 0.6, Math.min(BASE_TILT + 0.6, tilt - dy / R));
    dragging.lastX = e.clientX;
    dragging.lastY = e.clientY;
    dragging.lastT = now;
  });
  hitEl.addEventListener("pointerleave", () => {
    pointer.inside = false;
  });
  hitEl.addEventListener("pointerdown", (e) => {
    if (dragging || e.button !== 0) return; // one finger only; ignore extra touches
    const { x, y } = local(e);
    const { cx, cy, R } = geometry();
    if (Math.hypot(x - cx, y - cy) > R * 1.15) return; // only the globe itself is grabbable
    dragging = { id: e.pointerId, lastX: e.clientX, lastY: e.clientY, lastT: performance.now(), vx: 0 };
    spin = 0;
    tiltVel = 0;
    hitEl.setPointerCapture(e.pointerId);
    hitEl.classList.add("is-dragging");
  });
  const release = (e) => {
    if (!dragging || e.pointerId !== dragging.id) return;
    // A flick keeps going; a slow release just stops. Cap the throw.
    spin = Math.max(-6, Math.min(6, dragging.vx));
    dragging = null;
    hitEl.classList.remove("is-dragging");
  };
  hitEl.addEventListener("pointerup", release);
  hitEl.addEventListener("pointercancel", release);
  hitEl.addEventListener("keydown", (e) => {
    const step = { ArrowLeft: -1.6, ArrowRight: 1.6 }[e.key];
    const lean = { ArrowUp: -1, ArrowDown: 1 }[e.key];
    if (step) spin += step;
    else if (lean) tiltVel += lean * 2.2;
    else return;
    e.preventDefault();
  });

  return {
    /** standby | listening | thinking | streaming | error | offline | booting */
    setMode(next, speedFactor) {
      if (next === "thinking" && mode !== "thinking") nextThought = 0;
      mode = next;
      targetSpeed = speedFactor;
      if (next === "offline") {
        speed = targetSpeed = 0;
        spin = 0;
      }
    },
    setSpeed(speedFactor) {
      targetSpeed = speedFactor;
    },
    /** One streamed chunk: a burst of "voice", and now and then a signal arc. */
    pulse() {
      energy = Math.min(1, energy + 0.22);
      if (Math.random() < 0.18) spawnArc(0.9);
    },
    /** A keystroke while you type: a small flicker that says "I'm listening". */
    nudge() {
      energy = Math.min(0.35, energy + 0.07);
      if (Math.random() < 0.12) spawnArc(0.6);
    },
  };
}
