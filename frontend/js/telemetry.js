// telemetry.js — the left rail, the top-bar chips, the clock and the strip.
//
// Rule for every number on screen: it is measured, or it says it's waiting.
// Nothing here is simulated.

import { traffic } from "./api.js";

// Ollama's context window as configured in backend/config.py (ollama_num_ctx).
// The backend doesn't expose it yet, so it's mirrored here. Change both together.
export const NUM_CTX = 8192;

const HISTORY = 40; // latency bars kept
const $ = (id) => document.getElementById(id);

const fmtBytes = (n) =>
  n < 1024 ? `${n} B` : n < 1024 ** 2 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 ** 2).toFixed(2)} MB`;
const fmtMs = (ms) => (ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(2)} s`);
const pad = (n) => String(n).padStart(2, "0");
const fmtDuration = (ms) => {
  const s = Math.floor(ms / 1000);
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};

/** Briefly brighten a value that just changed (state indication, not decoration). */
function setFlash(el, text) {
  if (el.textContent === text) return;
  el.textContent = text;
  el.classList.remove("flash");
  void el.offsetWidth; // restart the animation
  el.classList.add("flash");
}

function setChip(id, state, value) {
  const chip = $(id);
  if (state) chip.dataset.state = state;
  if (value !== undefined) $(`${id}-value`).textContent = value;
}

export function createTelemetry() {
  const startedAt = Date.now();
  const latencies = [];
  const bars = $("link-bars");
  for (let i = 0; i < HISTORY; i++) bars.append(document.createElement("span"));
  const streamBars = $("st-bars");
  const BINS = 32;
  for (let i = 0; i < BINS; i++) streamBars.append(document.createElement("span"));

  // Hardware: the only honest number the browser can give us today.
  const cores = navigator.hardwareConcurrency;
  $("hw-cores").textContent = cores ? `${cores} (browser)` : "—";

  // Clock + date, in the operator's own time zone.
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  const city = tz.split("/").pop()?.replace(/_/g, " ") ?? "";
  const timeFmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

  function everySecond() {
    const now = new Date();
    $("clock-time").textContent = timeFmt.format(now);
    $("clock-time").dateTime = now.toISOString();
    $("clock-date").textContent = `${dateFmt.format(now)}${city ? ` · ${city}` : ""}`;
    $("ss-uptime").textContent = fmtDuration(Date.now() - startedAt);
    $("traffic-in").textContent = `In ${fmtBytes(traffic.in)}`;
    $("traffic-out").textContent = `Out ${fmtBytes(traffic.out)}`;
  }
  everySecond();
  setInterval(everySecond, 1000);

  return {
    /** One health-check result: latency in ms, or null when it failed. */
    pushLatency(ms) {
      latencies.push(ms);
      if (latencies.length > HISTORY) latencies.shift();
      const ok = latencies.filter((v) => v !== null);
      const max = Math.max(50, ...ok);
      const spans = bars.children;
      const offset = HISTORY - latencies.length;
      for (let i = 0; i < HISTORY; i++) {
        const v = latencies[i - offset];
        const span = spans[i];
        span.classList.toggle("is-fail", v === null);
        span.style.height = v === undefined || v === null ? "" : `${Math.max(6, (v / max) * 100)}%`;
        span.style.visibility = v === undefined ? "hidden" : "";
      }

      const readout = $("link-latency").parentElement;
      if (ms === null) {
        readout.dataset.state = "warn";
        $("link-latency").textContent = "—";
        $("link-note").textContent = "No answer from the backend. Is it running? uv run python run.py";
        setChip("chip-link", "bad", "offline");
      } else {
        delete readout.dataset.state;
        $("link-latency").textContent = ms < 10 ? ms.toFixed(1) : String(Math.round(ms));
        $("link-note").textContent = "Backend round-trip, every 5 s";
        setChip("chip-link", "ok", `${Math.round(ms)} ms`);
      }
    },

    setVersion(version) {
      $("version").textContent = version ? `OS ${version}` : "OS";
    },

    /** Model chip. `listStatus` comes from fetchModels(). */
    setModel(name, listStatus) {
      setChip("chip-model", listStatus === "ok" ? "ok" : "warn", name || "server default");
      $("chip-model").title =
        listStatus === "stub"
          ? "GET /api/models is still a stub (501), so the picker only offers the server default."
          : listStatus === "offline"
            ? "Couldn't load the model list."
            : "";
    },

    setModules(online, total) {
      setChip("chip-modules", online > 0 ? "ok" : "warn", `${online} / ${total}`);
    },

    /** Stats for the reply that just finished (all measured in the browser). */
    setStream({ ttft, rate, duration, chunks, note }) {
      setFlash($("st-ttft"), ttft == null ? "—" : fmtMs(ttft));
      setFlash($("st-rate"), rate == null ? "—" : `${rate.toFixed(1)} chunks/s`);
      setFlash($("st-dur"), duration == null ? "—" : fmtMs(duration));
      setFlash($("st-chunks"), chunks == null ? "—" : String(chunks));
      $("st-note").textContent =
        note ?? "Measured in the browser. Ollama sends about one token per chunk.";
    },

    /**
     * Chunk arrival for the current/last reply: `times` are ms since the first
     * chunk. Drawn as a histogram, so you can see the model stall or speed up.
     */
    setArrivals(times) {
      const spans = streamBars.children;
      if (!times.length) {
        for (const span of spans) span.style.height = "0";
        return;
      }
      const total = Math.max(times[times.length - 1], 1);
      const counts = new Array(BINS).fill(0);
      for (const t of times) counts[Math.min(BINS - 1, Math.floor((t / total) * BINS))]++;
      const max = Math.max(...counts, 1);
      counts.forEach((c, i) => {
        spans[i].style.height = `${(c / max) * 100}%`;
      });
    },

    /** Session size. Tokens are estimated at ~4 characters each. */
    setSession(history) {
      $("ss-msgs").textContent = String(history.length);
      const chars = history.reduce((sum, m) => sum + m.content.length, 0);
      const tokens = Math.round(chars / 4);
      const fraction = Math.min(1, tokens / NUM_CTX);
      $("ss-ctx").textContent = `≈ ${tokens.toLocaleString("en-GB")} / ${NUM_CTX.toLocaleString("en-GB")}`;
      $("ss-ctx-fill").style.transform = `scaleX(${fraction})`;
      return fraction;
    },
  };
}
