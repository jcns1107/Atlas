// telemetry.js — Atlas's vitals under the Earth, the link in the sidebar, and
// the clock.
//
// Rule for every number on screen: it is measured, labelled as an estimate,
// or a dash. Nothing here is simulated.

// Ollama's context window as configured in backend/config.py (ollama_num_ctx).
// Only a fallback: if the backend's "done" event carries `context_window`, that
// number wins. Until it does, keep this in step with the backend setting.
export const NUM_CTX = 8192;

const $ = (id) => document.getElementById(id);
export const fmtInt = (n) => n.toLocaleString("en-GB");
const fmtSeconds = (ms) => `${(ms / 1000).toFixed(1)} s`;

/** Briefly brighten a value that just changed (state indication, not decoration). */
function setFlash(el, text) {
  if (el.textContent === text) return;
  el.textContent = text;
  el.classList.remove("flash");
  void el.offsetWidth; // restart the animation
  el.classList.add("flash");
}

export function createTelemetry() {
  // Clock + date, in the operator's own time zone.
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  const city = tz.split("/").pop()?.replace(/_/g, " ") ?? "";
  const timeFmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
  const dateFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "2-digit", month: "short" });
  function everySecond() {
    const now = new Date();
    $("clock-time").textContent = timeFmt.format(now);
    $("clock-time").dateTime = now.toISOString();
    $("clock-date").textContent = `${dateFmt.format(now)}${city ? ` · ${city}` : ""}`;
  }
  everySecond();
  setInterval(everySecond, 1000);

  return {
    /** One health-check result: latency in ms, or null when it failed. */
    setLink(ms) {
      const link = $("link");
      if (ms === null) {
        link.dataset.state = "bad";
        $("link-value").textContent = "Offline";
        setFlash($("v-link"), "Offline");
        $("v-link").dataset.state = "warn";
        $("v-link-sub").textContent = "Start it: uv run python run.py";
      } else {
        link.dataset.state = "ok";
        $("link-value").textContent = `${Math.round(ms)} ms`;
        $("v-link").textContent = `${ms < 10 ? ms.toFixed(1) : Math.round(ms)} ms`;
        delete $("v-link").dataset.state;
        $("v-link-sub").textContent = "Round-trip, every 5 s";
      }
    },

    /** The model this chat uses. `listStatus` comes from fetchModels(). */
    setModel(name, listStatus) {
      $("v-model").textContent = name || "Server default";
      $("v-model-sub").textContent =
        listStatus === "ok"
          ? "This chat"
          : listStatus === "stub"
            ? "Model list not built yet (501)"
            : "Couldn't load the model list";
    },

    /**
     * Context fill for the open chat. `usage` is Ollama's real count from the
     * last reply ({ prompt, output, window }) or null; without it we estimate
     * from the text at ~4 characters per token. Returns the fraction (0–1) for
     * the core's context arc.
     */
    setContext(usage, messages) {
      let used;
      let window = NUM_CTX;
      let label;
      if (usage) {
        used = usage.prompt + usage.output;
        window = usage.window ?? NUM_CTX;
        label = `${fmtInt(used)} / ${fmtInt(window)}`;
      } else {
        const chars = messages.reduce((sum, m) => sum + m.content.length, 0);
        used = Math.round(chars / 4);
        label = `≈ ${fmtInt(used)} / ${fmtInt(window)}`;
      }
      const fraction = Math.min(1, used / window);
      setFlash($("v-ctx"), label);
      $("v-ctx").title = usage ? "Tokens Ollama counted for the last reply" : "Estimated from the text (≈ 4 characters per token)";
      $("v-ctx-fill").style.transform = `scaleX(${fraction})`;
      // Past ~75% is where compaction should kick in (Phase 5): amber.
      $("v-ctx").closest(".vital").dataset.state = fraction >= 0.75 ? "warn" : "";
      return fraction;
    },

    /**
     * The reply that just finished. Timings are measured in the browser;
     * `tokens` ({ prompt, output }) are Ollama's own counts, or null.
     */
    setLastReply({ duration, streamSeconds, chunks, tokens, stopped }) {
      if (duration == null) {
        $("v-rate").textContent = "—";
        $("v-rate-sub").textContent = "No reply yet";
        return;
      }
      // Tokens per second when Ollama reported them; chunks per second if not
      // (Ollama sends about one token per chunk, but we don't claim it).
      const rate =
        streamSeconds > 0
          ? tokens
            ? `${(tokens.output / streamSeconds).toFixed(0)} tok/s`
            : `${(chunks / streamSeconds).toFixed(0)} chunks/s`
          : "—";
      setFlash($("v-rate"), rate);
      const parts = [fmtSeconds(duration)];
      if (tokens) parts.push(`${fmtInt(tokens.output)} tokens`);
      if (stopped) parts.push("stopped");
      $("v-rate-sub").textContent = parts.join(" · ");
    },
  };
}
