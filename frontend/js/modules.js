// modules.js — the ring of Atlas modules around the core.
//
// Each node lights up by itself as you build the backend:
//   offline → the route doesn't exist yet (not in /openapi.json)
//   stub    → the route exists but answers 501 "Not implemented"
//   online  → the route exists and works
//
// To add or rename a module, edit MODULES below. `route` is the URL prefix its
// router will live under (main.py includes routers under /api).

export const MODULES = [
  {
    id: "chat",
    name: "Chat",
    phase: "Phase 1",
    route: "/api/chat",
    build: "backend/api/routes/chat.py",
    blurb: "Talk to a local model and watch the reply stream in.",
  },
  {
    id: "models",
    name: "Models",
    phase: "Phase 1 · 3",
    route: "/api/models",
    build: "backend/api/routes/models.py",
    blurb: "List installed models (Phase 1), then recommend, pull and delete them (Phase 3).",
  },
  {
    id: "tools",
    name: "Tools",
    phase: "Phase 4",
    route: "/api/tools",
    build: "backend/core/tools/",
    blurb: "Files, docs, web, memory and bash tools, each with an allow / ask / deny permission.",
  },
  {
    id: "agents",
    name: "Agents",
    phase: "Phase 5",
    route: "/api/agents",
    build: "backend/core/agents/",
    blurb: "Agents with their own instructions, model and tool set, stored as data.",
  },
  {
    id: "memory",
    name: "Memory",
    phase: "Phase 6",
    route: "/api/memory",
    build: "backend/core/memory/",
    blurb: "A SQLite memory store, plus stuff, search and RAG strategies for documents.",
  },
  {
    id: "mcp",
    name: "MCP",
    phase: "Phase 7",
    route: "/api/mcp",
    build: "backend/core/mcp/",
    blurb: "Connect MCP servers; their tools join the registry with the same permissions.",
  },
  {
    id: "email",
    name: "Email",
    phase: "Phase 8",
    route: "/api/email",
    build: "backend/services/email/",
    blurb: "Summaries, drafts in your style, and triage. Read-only until you trust it.",
  },
  {
    id: "research",
    name: "Research",
    phase: "Phase 9",
    route: "/api/research",
    build: "backend/services/research/",
    blurb: "Plan, search, read and write a cited report with sub-agents.",
  },
  {
    id: "skills",
    name: "Skills",
    phase: "Phase 10",
    route: "/api/skills",
    build: "backend/core/skills/",
    blurb: "SKILL.md folders the agent loads on demand, and learns from use.",
  },
  {
    id: "characters",
    name: "Characters",
    phase: "Phase 11",
    route: "/api/characters",
    build: "backend/core/characters/",
    blurb: "Personas with a voice, backstory and avatar.",
  },
];

const STATUS_TEXT = {
  online: "Online",
  stub: "Stub · route answers 501",
  offline: "Not built yet",
};

/**
 * Work out each module's status from the OpenAPI spec (+ one GET probe for
 * routes that support GET, to tell a 501 stub from a working route).
 */
export async function detectStatuses(spec, probe) {
  const paths = spec ? Object.keys(spec.paths) : [];
  return Promise.all(
    MODULES.map(async (mod) => {
      const exists = paths.some((p) => p === mod.route || p.startsWith(`${mod.route}/`));
      if (!exists) return "offline";
      const hasGet = Boolean(spec.paths[mod.route]?.get);
      if (!hasGet) return "online"; // e.g. POST-only /api/chat
      const code = await probe(mod.route);
      return code === 501 ? "stub" : "online";
    }),
  );
}

export function createModuleRing({ onSelect } = {}) {
  const list = document.getElementById("nodes");
  const stage = document.getElementById("stage");
  const pop = document.getElementById("popover");
  const statuses = Object.fromEntries(MODULES.map((m) => [m.id, "offline"]));
  let openId = null;

  // Place the nodes evenly around the ring, starting at the top, clockwise,
  // each with a short leader tick from the outer ring (drawn in the SVG).
  const RADIUS = 46.5; // % of the core's width: just outside the tick ring
  const staticSvg = document.querySelector(".layer--static");
  MODULES.forEach((mod, i) => {
    const angle = ((-90 + (360 / MODULES.length) * i) * Math.PI) / 180;
    const leader = document.createElementNS("http://www.w3.org/2000/svg", "line");
    leader.setAttribute("x1", (Math.cos(angle) * 268).toFixed(1));
    leader.setAttribute("y1", (Math.sin(angle) * 268).toFixed(1));
    leader.setAttribute("x2", (Math.cos(angle) * 280).toFixed(1));
    leader.setAttribute("y2", (Math.sin(angle) * 280).toFixed(1));
    leader.setAttribute("class", "s-leader");
    leader.dataset.id = mod.id;
    staticSvg.append(leader);
    const li = document.createElement("li");
    li.className = "node";
    li.dataset.id = mod.id;
    li.dataset.status = "offline";
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    li.style.left = `${50 + cos * RADIUS}%`;
    li.style.top = `${50 + sin * RADIUS}%`;
    // Shift each label outward so its inner edge touches the orbit instead of
    // its centre: labels on the sides then never sit on the tick ring.
    li.style.transform = `translate(${-50 + 50 * cos}%, ${-50 + 50 * sin}%)`;
    li.dataset.side = Math.abs(cos) < 0.35 ? "centre" : cos > 0 ? "right" : "left";
    li.innerHTML = `
      <button class="node__btn" type="button" aria-expanded="false" aria-controls="popover">
        <span class="node__name"><span class="node__dot" aria-hidden="true"></span>${mod.name}</span>
        <span class="node__phase">${mod.phase}</span>
      </button>`;
    li.querySelector("button").addEventListener("click", (e) => {
      e.stopPropagation();
      openId === mod.id ? close() : open(mod.id);
      onSelect?.(mod.id);
    });
    list.append(li);
  });

  // Mobile: the same modules as a plain list inside the Systems sheet.
  const mobilePanel = document.createElement("section");
  mobilePanel.className = "panel panel--modules";
  mobilePanel.innerHTML = `<h2 class="panel__head">Modules</h2><ul class="modules-list"></ul>`;
  document.getElementById("rail").append(mobilePanel);
  const mobileList = mobilePanel.querySelector("ul");

  function renderMobileList() {
    mobileList.innerHTML = MODULES.map(
      (m) =>
        `<li data-status="${statuses[m.id]}"><span>${m.name}</span><span>${
          statuses[m.id] === "offline" ? m.phase : STATUS_TEXT[statuses[m.id]]
        }</span></li>`,
    ).join("");
  }

  function open(id) {
    const mod = MODULES.find((m) => m.id === id);
    const status = statuses[id];
    const node = list.querySelector(`[data-id="${id}"]`);
    list.querySelectorAll(".node__btn").forEach((b) => b.setAttribute("aria-expanded", "false"));
    node.querySelector("button").setAttribute("aria-expanded", "true");

    document.getElementById("pop-title").textContent = mod.name;
    const statusEl = document.getElementById("pop-status");
    statusEl.dataset.status = status;
    statusEl.textContent = status === "offline" ? `${STATUS_TEXT.offline} · ${mod.phase}` : STATUS_TEXT[status];
    document.getElementById("pop-text").textContent =
      status === "online"
        ? `${mod.blurb} Built and answering at ${mod.route}.`
        : status === "stub"
          ? `${mod.blurb} The route is registered; finish the TODO and it comes online.`
          : mod.blurb;
    document.getElementById("pop-path").textContent = mod.build;

    // Position next to the node, growing from it. Nodes on the sides open
    // outward (away from the core's readout); top and bottom nodes open
    // toward the centre, which leaves the readout clear.
    pop.hidden = false;
    const s = stage.getBoundingClientRect();
    const n = node.getBoundingClientRect();
    const nx = n.left + n.width / 2 - s.left;
    const ny = n.top + n.height / 2 - s.top;
    const side = Math.abs(nx - s.width / 2) > s.width * 0.2;
    const above = ny < s.height / 2;
    const below = side ? !above : above;
    let left = side ? (nx < s.width / 2 ? n.right - s.left - 280 : n.left - s.left) : nx - 140;
    left = Math.min(Math.max(left, 8), s.width - 288);
    const top = below ? n.bottom - s.top + 8 : n.top - s.top - pop.offsetHeight - 8;
    pop.style.left = `${left}px`;
    pop.style.top = `${Math.max(8, top)}px`;
    pop.style.setProperty("--origin", `${nx - left}px ${below ? "0" : "100%"}`);
    pop.dataset.starting = "";
    requestAnimationFrame(() => delete pop.dataset.starting);
    openId = id;
  }

  function close({ restoreFocus = false } = {}) {
    if (restoreFocus && openId) list.querySelector(`[data-id="${openId}"] button`)?.focus();
    pop.hidden = true;
    list.querySelectorAll(".node__btn").forEach((b) => b.setAttribute("aria-expanded", "false"));
    openId = null;
  }

  document.addEventListener("click", (e) => {
    if (openId && !pop.contains(e.target)) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && openId) close({ restoreFocus: true });
  });

  renderMobileList();

  return {
    close,
    /** statusList: array in MODULES order, e.g. ["online", "stub", "offline", ...] */
    setStatuses(statusList) {
      MODULES.forEach((m, i) => {
        statuses[m.id] = statusList[i];
        list.querySelector(`[data-id="${m.id}"]`).dataset.status = statusList[i];
        staticSvg.querySelector(`.s-leader[data-id="${m.id}"]`).dataset.status = statusList[i];
      });
      renderMobileList();
      if (openId) open(openId);
    },
    set(id, status) {
      statuses[id] = status;
      list.querySelector(`[data-id="${id}"]`).dataset.status = status;
      staticSvg.querySelector(`.s-leader[data-id="${id}"]`).dataset.status = status;
      renderMobileList();
    },
    get onlineCount() {
      return Object.values(statuses).filter((s) => s === "online").length;
    },
  };
}
