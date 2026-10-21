// app.js — Atlas HUD entry point. Wires the pieces together:
//
//   api.js        every backend call (health, models, openapi, chat stream)
//   sse.js        reads the Server-Sent Events stream from /api/chat
//   markdown.js   safe rendering of model replies
//   core.js       the rotating core that reacts to the stream
//   modules.js    the module ring (lights up as you build each phase)
//   telemetry.js  left rail, chips, clock, traffic — real numbers only
//   chat.js       session log + composer
//   boot.js       the start-up sequence (once per session)
//
// The frontend is maintained by Claude (see CLAUDE.md); the backend is yours.

import { checkHealth, fetchModels, fetchOpenApi, probe } from "./api.js";
import { hasBooted, runBoot } from "./boot.js";
import { createChat } from "./chat.js";
import { createCore } from "./core.js";
import { createModuleRing, detectStatuses, MODULES } from "./modules.js";
import { createTelemetry } from "./telemetry.js";

// Who's at the controls. Change it here (or store your own: see setOperator).
const DEFAULT_OPERATOR = "Sigmar";
const HEALTH_EVERY_MS = 5000;

const $ = (id) => document.getElementById(id);

// --- Operator name (kept in localStorage so you can change it once) ---------
function operatorName() {
  try {
    return localStorage.getItem("atlas.operator") || DEFAULT_OPERATOR;
  } catch {
    return DEFAULT_OPERATOR;
  }
}
// From the browser console: atlas.setOperator("João")
function setOperator(name) {
  try {
    localStorage.setItem("atlas.operator", name);
  } catch {
    /* storage blocked */
  }
  $("operator-name").textContent = name;
}
$("operator-name").textContent = operatorName();

// --- Build the pieces --------------------------------------------------------
const core = createCore();
const telemetry = createTelemetry();
const ring = createModuleRing();
let linkOk = null;

// The model picker. Remembers your last choice.
const select = $("model");
function savedModel() {
  try {
    return localStorage.getItem("atlas.model") ?? "";
  } catch {
    return "";
  }
}
let modelListStatus = "offline";
select.addEventListener("change", () => {
  try {
    localStorage.setItem("atlas.model", select.value);
  } catch {
    /* storage blocked */
  }
  telemetry.setModel(select.value, modelListStatus);
});

// Light pulses along the beams between the core and the session log:
// "out" = your message travels from the log into the core,
// "in"  = the reply flows from the core to the log (at most every 700 ms).
const beams = [...document.querySelectorAll(".beam__pulse")];
const coreEl = $("core");
const comms = document.querySelector(".comms");
let lastBeam = 0;
function beamPulse(direction) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!beams[0].offsetParent) return; // beams hidden (phone layout)
  const now = performance.now();
  if (direction === "in" && now - lastBeam < 700) return;
  lastBeam = now;

  const beamWidth = beams[0].parentElement.clientWidth;
  // The core is centred in the stage; its outer ring is ~44% of its width out.
  const coreEdge = $("stage").clientWidth / 2 + coreEl.offsetWidth * 0.44;
  // The pulse is 140px wide and centred on its x, so stop 70px short of the
  // log's frame: it must land on the frame, not run into the transcript.
  const logEdge = beamWidth - 70;
  const [from, to] = direction === "out" ? [logEdge, coreEdge] : [coreEdge, logEdge];
  const duration = 620;
  for (const [i, pulse] of beams.entries()) {
    pulse.animate(
      [
        { transform: `translateX(${from}px)`, opacity: 0 },
        { opacity: 1, offset: 0.25 },
        { opacity: 1, offset: 0.8 },
        { transform: `translateX(${to}px)`, opacity: 0 },
      ],
      { duration, delay: i * 70, easing: "cubic-bezier(0.77, 0, 0.175, 1)" },
    );
  }
  // When a reply pulse lands, the log's frame catches the light.
  if (direction === "in") {
    setTimeout(() => {
      comms.classList.add("is-receiving");
      setTimeout(() => comms.classList.remove("is-receiving"), 160);
    }, duration * 0.85);
  } else {
    setTimeout(() => core.pulse(), duration * 0.85);
  }
}

const chat = createChat({
  core,
  telemetry,
  getModel: () => select.value,
  onStreamActivity: beamPulse,
});

// --- Checks (used by the boot sequence and on every normal load) -------------
async function checkLink() {
  const { ok, ms } = await checkHealth();
  telemetry.pushLatency(ok ? ms : null);
  const was = linkOk;
  linkOk = ok;
  const booting = document.documentElement.classList.contains("booting");
  if (!chat.busy && !booting) {
    if (!ok) core.setState("offline", "Backend unreachable");
    else if (was === false || core.state === "offline") core.setState("standby", "Awaiting command");
  }
  return { ok, ms };
}

// Remember answers we already have, so module detection doesn't ask twice.
const known = new Map();
const probeOnce = async (path) => known.get(path) ?? probe(path);

async function loadModels() {
  const result = await fetchModels();
  modelListStatus = result.status;
  if (result.status !== "offline") known.set("/api/models", result.status === "stub" ? 501 : 200);
  if (result.status === "ok") {
    const keep = savedModel();
    select.innerHTML = '<option value="">Server default</option>';
    for (const name of result.models) select.add(new Option(name, name));
    if (keep && result.models.includes(keep)) select.value = keep;
  }
  telemetry.setModel(select.value, result.status);
  return result;
}

async function loadModules() {
  const spec = await fetchOpenApi();
  telemetry.setVersion(spec?.version);
  const statuses = await detectStatuses(spec, probeOnce);
  ring.setStatuses(statuses);
  telemetry.setModules(ring.onlineCount, MODULES.length);
  return { spec, statuses };
}

const BOOT_STEPS = [
  {
    label: "Backend link · /api/health",
    run: async () => {
      const { ok, ms } = await checkLink();
      return ok ? { text: `OK · ${Math.round(ms)} ms` } : { text: "No answer", tone: "warn" };
    },
  },
  {
    label: "Model list · /api/models",
    run: async () => {
      const r = await loadModels();
      if (r.status === "ok") return { text: `${r.models.length} installed` };
      return { text: r.status === "stub" ? "Stub (501)" : "Unavailable", tone: "warn" };
    },
  },
  {
    label: "Modules · /openapi.json",
    run: async () => {
      const { spec } = await loadModules();
      if (!spec) return { text: "Unavailable", tone: "warn" };
      return { text: `${ring.onlineCount} / ${MODULES.length} online` };
    },
  },
  {
    label: "Operator",
    run: async () => ({ text: operatorName() }),
  },
];

// After a boot, put the core in the state the checks found.
function settleCore() {
  if (linkOk === false) core.setState("offline", "Backend unreachable");
  else core.setState("standby", "Awaiting command");
}
async function boot() {
  await runBoot(BOOT_STEPS, { core });
  settleCore();
}

async function start() {
  if (hasBooted()) {
    document.documentElement.classList.remove("will-boot");
    await Promise.all(BOOT_STEPS.slice(0, 3).map((s) => s.run()));
  } else {
    await boot();
  }
  setInterval(checkLink, HEALTH_EVERY_MS);
}

// --- Keyboard ----------------------------------------------------------------
document.addEventListener("keydown", (e) => {
  // Alt+Shift+B: replay the boot sequence.
  if (e.altKey && e.shiftKey && e.code === "KeyB") {
    e.preventDefault();
    boot();
  }
  if (e.key === "Escape" && document.body.classList.contains("systems-open")) toggleSystems(false);
  // "/" jumps to the composer from anywhere that isn't a text field.
  if (e.key === "/" && !e.target.closest("input, textarea, select, [contenteditable]")) {
    e.preventDefault();
    chat.focus();
  }
});
$("reboot").addEventListener("click", boot);

// Narrow screens: the "Systems" button opens the telemetry + modules sheet.
const systemsBtn = $("systems-toggle");
function toggleSystems(force) {
  const open = document.body.classList.toggle("systems-open", force);
  systemsBtn.setAttribute("aria-expanded", String(open));
  systemsBtn.textContent = open ? "Close" : "Systems";
}
systemsBtn.addEventListener("click", () => toggleSystems());

// A small console API for tinkering.
window.atlas = { setOperator, reboot: boot };

start();
