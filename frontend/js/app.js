// app.js — Atlas's entry point. Wires the pieces together:
//
//   api.js            every backend call (health, models, chats, chat stream)
//   sse.js            reads the Server-Sent Events stream from /api/chat
//   markdown.js       safe rendering of model replies
//   conversations.js  the sidebar: saved chats, rename, delete
//   chat.js           the conversation: transcript + composer
//   core.js           the rings around the Earth, reacting to the model and you
//   globe.js          the living Earth
//   telemetry.js      the vitals under the Earth, the link and the clock
//   boot.js           the start-up sequence (once per session)
//
// Three regions, left to right: your chats · the conversation · Atlas itself.
// The frontend is maintained by Claude (see CLAUDE.md); the backend is yours.

import { checkHealth, fetchCapabilities, fetchModels, getConversation, updateConversation } from "./api.js";
import { hasBooted, runBoot } from "./boot.js";
import { createChat } from "./chat.js";
import { createSidebar, hrefFor } from "./conversations.js";
import { createCore } from "./core.js";
import { createTelemetry } from "./telemetry.js";

const DEFAULT_OPERATOR = "Sigmar"; // change it here, or: atlas.setOperator("João")
const HEALTH_EVERY_MS = 5000;
const WIDE = window.matchMedia("(min-width: 1100px)"); // the presence panel has its own column
const PHONE = window.matchMedia("(max-width: 759px)"); // the sidebar becomes a sheet

const $ = (id) => document.getElementById(id);
const html = document.documentElement;
const appEl = $("app");

// --- Small helpers for remembered settings (localStorage can be blocked) -------
function remember(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* storage blocked: fine */
  }
}
function recall(key, fallback = null) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

// --- Operator ---------------------------------------------------------------------
const operator = () => recall("atlas.operator", DEFAULT_OPERATOR);
function showOperator() {
  $("operator-name").textContent = operator();
  $("operator-initial").textContent = operator().trim().charAt(0).toUpperCase() || "?";
}
showOperator();

// --- Think: the select's strings ↔ the backend's true / false / null --------------
const THINK_TO_API = { on: true, off: false };
const thinkFromApi = (v) => (v === true ? "on" : v === false ? "off" : "");

// --- Build the pieces ---------------------------------------------------------------
const core = createCore({ leanArea: $("presence") });
const telemetry = createTelemetry();
let caps = null; // what the backend can do (api.fetchCapabilities)
let linkOk = null;
let models = []; // installed model names, from GET /api/models

const sidebar = createSidebar({
  onRenamed(conv) {
    if (chat.current.id === conv.id) {
      chat.patchCurrent({ title: conv.title });
      showTitle();
    }
  },
  onDeleted(id) {
    if (chat.current.id === id) go("#/");
  },
});

const chat = createChat({
  core,
  telemetry,
  sidebar,
  caps: () => caps,
  operator,
  onSaved(conv) {
    sidebar.upsert(conv);
    sidebar.setActive(conv.id);
    // Put the chat's address in the URL without reopening it.
    history.replaceState(null, "", hrefFor(conv.id));
    showTitle();
  },
  onCaption: showCaption,
});

// --- Model + Thinking pickers (per chat; new chats start from your last choice) ----
const modelSelect = $("model");
const thinkSelect = $("think");

function fillModels(selected) {
  modelSelect.innerHTML = "";
  modelSelect.add(new Option("Server default", ""));
  for (const name of models) modelSelect.add(new Option(name, name));
  // A chat may name a model that isn't installed (any more): show it honestly.
  if (selected && !models.includes(selected)) modelSelect.add(new Option(`${selected} (not installed)`, selected));
  modelSelect.value = selected ?? "";
}

function showPickers() {
  fillModels(chat.current.model);
  thinkSelect.value = thinkFromApi(chat.current.think);
}

async function saveField(fields) {
  chat.patchCurrent(fields);
  const id = chat.current.id;
  if (!id) return;
  try {
    const updated = await updateConversation(id, fields);
    sidebar.upsert(updated);
  } catch {
    /* the field still applies to this tab; the next load shows the saved value */
  }
}

modelSelect.addEventListener("change", () => {
  remember("atlas.model", modelSelect.value);
  saveField({ model: modelSelect.value || null });
});
thinkSelect.addEventListener("change", () => {
  remember("atlas.think", thinkSelect.value);
  saveField({ think: THINK_TO_API[thinkSelect.value] ?? null });
});

async function loadModels() {
  const result = await fetchModels();
  if (result.status === "ok") models = result.models;
  chat.setModelListStatus(result.status);
  showPickers();
  return result;
}

// --- The header: title (rename in place) -------------------------------------------
const titleBtn = $("chat-title");
function showTitle() {
  const { id, title } = chat.current;
  titleBtn.textContent = title;
  titleBtn.disabled = !id;
  titleBtn.title = id ? "Rename" : "";
  document.title = id ? `${title} · Atlas` : "Atlas";
}
titleBtn.addEventListener("click", () => {
  const { id, title } = chat.current;
  if (!id) return;
  const input = document.createElement("input");
  input.className = "chat__title-input";
  input.value = title;
  input.maxLength = 120;
  input.setAttribute("aria-label", "Chat title");
  titleBtn.hidden = true;
  titleBtn.after(input);
  input.focus();
  input.select();
  let done = false;
  const finish = async (save) => {
    if (done) return;
    done = true;
    const next = input.value.trim();
    input.remove();
    titleBtn.hidden = false;
    if (save && next && next !== title) {
      chat.patchCurrent({ title: next });
      showTitle();
      try {
        sidebar.upsert(await updateConversation(id, { title: next }));
      } catch {
        chat.patchCurrent({ title });
        showTitle();
      }
    }
    titleBtn.focus();
  };
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") finish(true);
    if (e.key === "Escape") finish(false);
  });
  input.addEventListener("blur", () => finish(true));
});

// --- Instructions (the chat's system prompt) -----------------------------------------
const pop = $("instructions");
const popBtn = $("instructions-btn");
const popInput = $("instructions-input");
function showInstructionsDot() {
  $("instructions-dot").hidden = !chat.current.system_prompt.trim();
}
function togglePop(open = pop.hidden) {
  pop.hidden = !open;
  popBtn.setAttribute("aria-expanded", String(open));
  if (open) {
    popInput.value = chat.current.system_prompt;
    const note = $("instructions-note");
    // Say plainly when the backend can't apply them yet.
    note.hidden = Boolean(caps?.chatSaves);
    note.textContent = "Saved with the chat. Atlas starts using them once POST /api/chat reads conversation_id.";
    popInput.focus();
  } else {
    popBtn.focus();
  }
}
popBtn.addEventListener("click", () => togglePop());
$("instructions-cancel").addEventListener("click", () => togglePop(false));
$("instructions-save").addEventListener("click", async () => {
  await saveField({ system_prompt: popInput.value.trim() });
  showInstructionsDot();
  togglePop(false);
});
popInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) $("instructions-save").click();
});
document.addEventListener("pointerdown", (e) => {
  if (!pop.hidden && !pop.contains(e.target) && !popBtn.contains(e.target)) togglePop(false);
});

// --- Routing: "#/c/<id>" opens a saved chat, anything else is a new chat ------------
function newChatDefaults() {
  return {
    model: recall("atlas.model", ""),
    think: THINK_TO_API[recall("atlas.think", "")] ?? null,
  };
}
async function route() {
  const id = location.hash.match(/^#\/c\/([0-9a-f]{32})$/)?.[1];
  if (!id) {
    chat.newChat(newChatDefaults());
  } else if (id !== chat.current.id) {
    try {
      chat.open(await getConversation(id));
    } catch {
      // Deleted, or the chats route isn't answering: start fresh.
      history.replaceState(null, "", "#/");
      chat.newChat(newChatDefaults());
    }
  }
  sidebar.setActive(chat.current.id);
  showTitle();
  showPickers();
  showInstructionsDot();
  if (!pop.hidden) togglePop(false);
  if (PHONE.matches) toggleSheet(false);
}
function go(hash) {
  if (location.hash === hash || (hash === "#/" && !location.hash)) route();
  else location.hash = hash;
}
window.addEventListener("hashchange", route);
function newChat() {
  go("#/");
  chat.focus();
}
$("new-chat").addEventListener("click", newChat);
$("brand").addEventListener("click", (e) => {
  e.preventDefault();
  newChat();
});

// --- Sidebar: collapse on desktop, a sheet on phones -----------------------------------
const scrim = $("scrim");
function toggleSheet(open) {
  appEl.classList.toggle("sheet-open", open);
  scrim.hidden = !open;
}
function setSidebar(open) {
  if (PHONE.matches) {
    toggleSheet(open);
    if (open) $("sidebar-close").focus();
    return;
  }
  html.dataset.sidebar = open ? "open" : "closed";
  remember("atlas.sidebar", open ? null : "closed");
  (open ? $("sidebar-close") : $("sidebar-open")).focus();
}
$("sidebar-close").addEventListener("click", () => setSidebar(false));
$("sidebar-open").addEventListener("click", () => setSidebar(true));
scrim.addEventListener("click", () => toggleSheet(false));
PHONE.addEventListener("change", () => toggleSheet(false));

// --- Where the Earth lives: its own column when wide, a small orb in the header
//     when narrow, the whole screen in presence view -------------------------------------
const stage = $("stage");
const miniSlot = $("mini-slot");
function placeCore() {
  if (html.classList.contains("booting")) return; // boot.js owns it while booting
  const home = WIDE.matches || appEl.dataset.view === "presence" ? stage : miniSlot;
  if (core.el.parentElement !== home) home.append(core.el);
}
WIDE.addEventListener("change", placeCore);

function setView(view) {
  appEl.dataset.view = view;
  const presence = view === "presence";
  $("presence-toggle").setAttribute("aria-pressed", String(presence));
  $("presence-toggle").setAttribute("aria-label", presence ? "Back to the chat" : "Open Atlas full screen");
  placeCore();
  if (presence) $("presence-toggle").focus();
}
$("presence-toggle").addEventListener("click", () => setView(appEl.dataset.view === "presence" ? "chat" : "presence"));
miniSlot.addEventListener("click", () => setView("presence"));

// Captions under the Earth in presence view: the tail of the latest reply.
function showCaption(text) {
  const tail = text.length > 220 ? `…${text.slice(text.indexOf(" ", text.length - 220) + 1)}` : text;
  $("captions").textContent = tail;
}

// --- Checks (used by the boot sequence and on every normal load) ------------------------
async function loadCaps() {
  caps = await fetchCapabilities();
  return caps;
}
async function loadChats() {
  if (!caps) {
    sidebar.setUnavailable("Can't reach the backend, so your chats can't load.");
    return { ok: false, text: "Unavailable" };
  }
  if (!caps.conversations) {
    sidebar.setUnavailable("Chats aren't being saved: the backend has no /api/conversations route.");
    return { ok: false, text: "No route" };
  }
  const ok = await sidebar.refresh();
  return { ok, text: ok ? "Ready" : "Failed" };
}

async function checkLink() {
  const { ok, ms } = await checkHealth();
  telemetry.setLink(ok ? ms : null);
  const was = linkOk;
  linkOk = ok;
  if (html.classList.contains("booting")) return { ok, ms };
  if (!chat.busy) {
    if (!ok) core.setState("offline", "Backend unreachable");
    else if (was === false || core.state === "offline") core.setState("standby", "Awaiting command");
  }
  // Back online after an outage: pick everything up again.
  if (ok && was === false) {
    await loadCaps();
    await Promise.all([loadModels(), loadChats()]);
    chat.refreshNote();
  }
  return { ok, ms };
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
    label: "Models · /api/models",
    run: async () => {
      const r = await loadModels();
      if (r.status === "ok") return { text: `${r.models.length} installed` };
      return { text: r.status === "stub" ? "Stub (501)" : "Unavailable", tone: "warn" };
    },
  },
  {
    label: "Chats · /api/conversations",
    run: async () => {
      await loadCaps();
      const r = await loadChats();
      return r.ok ? { text: r.text } : { text: r.text, tone: "warn" };
    },
  },
  {
    label: "Operator",
    run: async () => ({ text: operator() }),
  },
];

function settleCore() {
  if (linkOk === false) core.setState("offline", "Backend unreachable");
  else core.setState("standby", "Awaiting command");
}
async function boot() {
  if (!pop.hidden) togglePop(false);
  setView("chat");
  await runBoot(BOOT_STEPS, { core });
  placeCore();
  settleCore();
}

async function start() {
  placeCore();
  if (hasBooted()) {
    html.classList.remove("will-boot");
    await loadCaps(); // first: opening a chat depends on what the backend stores
    await route();
    await Promise.all([checkLink(), loadModels(), loadChats()]);
    settleCore();
  } else {
    await boot(); // its steps load the link, the models, the capabilities and the chats
    await route();
  }
  chat.refreshNote();
  setInterval(checkLink, HEALTH_EVERY_MS);
}

// --- Keyboard ------------------------------------------------------------------------
document.addEventListener("keydown", (e) => {
  // Alt+Shift+B: replay the boot sequence.
  if (e.altKey && e.shiftKey && e.code === "KeyB") {
    e.preventDefault();
    boot();
    return;
  }
  // Alt+N: a new chat.
  if (e.altKey && !e.shiftKey && e.code === "KeyN") {
    e.preventDefault();
    newChat();
    return;
  }
  if (e.key === "Escape") {
    if (!pop.hidden) togglePop(false);
    else if (appEl.classList.contains("sheet-open")) toggleSheet(false);
    else if (appEl.dataset.view === "presence" && !chat.busy) setView("chat");
  }
  // "/" jumps to the composer from anywhere that isn't a text field.
  if (e.key === "/" && !e.target.closest("input, textarea, select, [contenteditable]")) {
    e.preventDefault();
    chat.focus();
  }
});

// A small console API for tinkering.
window.atlas = {
  setOperator(name) {
    remember("atlas.operator", name);
    showOperator();
  },
  reboot: boot,
  presence: () => setView("presence"),
};

start();
