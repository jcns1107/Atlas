// app.js — Atlas HUD entry point. Wires the pieces together:
//
//   api.js        every backend call (health, models, openapi, chat stream)
//   sse.js        reads the Server-Sent Events stream from /api/chat
//   markdown.js   safe rendering of model replies
//   core.js       the rotating rings around the Earth, reacting to the stream
//   globe.js      the holographic Earth that "talks" while Atlas replies
//   modules.js    the module list (lights up as you build each phase)
//   telemetry.js  Systems drawer panels, link chip, clock — real numbers only
//   chat.js       session log + composer
//   boot.js       the start-up sequence (once per session)
//
// The frontend is maintained by Claude (see CLAUDE.md); the backend is yours.

import { checkHealth, fetchModels, fetchOpenApi, probe } from "./api.js";
import { hasBooted, runBoot } from "./boot.js";
import { createChat } from "./chat.js";
import { createCore } from "./core.js";
import { createModuleList, detectStatuses, MODULES } from "./modules.js";
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
const modules = createModuleList();
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

const chat = createChat({
  core,
  telemetry,
  getModel: () => select.value,
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
  modules.setStatuses(statuses);
  telemetry.setModules(modules.onlineCount, MODULES.length);
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
      return { text: `${modules.onlineCount} / ${MODULES.length} online` };
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
  if (document.body.classList.contains("drawer-open")) toggleDrawer(false);
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
  if (e.key === "Escape" && document.body.classList.contains("drawer-open")) toggleDrawer(false);
  // "/" jumps to the composer from anywhere that isn't a text field.
  if (e.key === "/" && !e.target.closest("input, textarea, select, [contenteditable]")) {
    e.preventDefault();
    chat.focus();
  }
});
$("reboot").addEventListener("click", boot);

// --- Systems drawer (telemetry + modules) -------------------------------------
const drawer = $("drawer");
const scrim = $("scrim");
const menuBtn = $("menu-btn");
function toggleDrawer(force) {
  const open = document.body.classList.toggle("drawer-open", force);
  menuBtn.setAttribute("aria-expanded", String(open));
  drawer.setAttribute("aria-hidden", String(!open));
  drawer.inert = !open; // closed drawer: not focusable, not read out
  if (open) {
    scrim.hidden = false;
    $("drawer-close").focus();
  } else {
    setTimeout(() => !document.body.classList.contains("drawer-open") && (scrim.hidden = true), 250);
    menuBtn.focus();
  }
}
menuBtn.addEventListener("click", () => toggleDrawer());
$("drawer-close").addEventListener("click", () => toggleDrawer(false));
scrim.addEventListener("click", () => toggleDrawer(false));

// Tabs inside the drawer: Telemetry | Modules.
const tabs = [...document.querySelectorAll(".tab")];
for (const tab of tabs) {
  tab.addEventListener("click", () => {
    for (const t of tabs) {
      const selected = t === tab;
      t.setAttribute("aria-selected", String(selected));
      $(t.getAttribute("aria-controls")).hidden = !selected;
    }
  });
}

// A small console API for tinkering.
window.atlas = { setOperator, reboot: boot };

start();
