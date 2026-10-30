// modules.js — Atlas's modules, listed in the Systems drawer.
//
// Each module lights up by itself as you build the backend:
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

/**
 * The module list inside the Systems drawer. Each row expands to say what the
 * module is, its phase and where in the repo it gets built.
 */
export function createModuleList() {
  const list = document.getElementById("modules-list");
  const statuses = Object.fromEntries(MODULES.map((m) => [m.id, "offline"]));

  function detailText(mod, status) {
    if (status === "online") return `${mod.blurb} Built and answering at ${mod.route}.`;
    if (status === "stub") return `${mod.blurb} The route is registered; finish the TODO and it comes online.`;
    return mod.blurb;
  }

  function render() {
    list.innerHTML = "";
    for (const mod of MODULES) {
      const status = statuses[mod.id];
      const li = document.createElement("li");
      li.className = "mod";
      li.dataset.status = status;
      li.innerHTML = `
        <button class="mod__row" type="button" aria-expanded="false">
          <span class="mod__dot" aria-hidden="true"></span>
          <span class="mod__name"></span>
          <span class="mod__status"></span>
          <svg class="chev" viewBox="0 0 10 10" aria-hidden="true"><path d="M3 1.5 6.5 5 3 8.5"/></svg>
        </button>
        <div class="mod__detail" hidden>
          <p></p>
          <code></code>
        </div>`;
      li.querySelector(".mod__name").textContent = mod.name;
      li.querySelector(".mod__status").textContent =
        status === "offline" ? mod.phase : STATUS_TEXT[status].split(" ·")[0];
      li.querySelector(".mod__detail p").textContent = detailText(mod, status);
      li.querySelector(".mod__detail code").textContent = mod.build;
      const btn = li.querySelector(".mod__row");
      btn.addEventListener("click", () => {
        const open = btn.getAttribute("aria-expanded") !== "true";
        btn.setAttribute("aria-expanded", String(open));
        li.querySelector(".mod__detail").hidden = !open;
      });
      list.append(li);
    }
  }
  render();

  return {
    /** statusList: array in MODULES order, e.g. ["online", "stub", "offline", ...] */
    setStatuses(statusList) {
      MODULES.forEach((m, i) => {
        statuses[m.id] = statusList[i];
      });
      render();
    },
    get onlineCount() {
      return Object.values(statuses).filter((s) => s === "online").length;
    },
  };
}
