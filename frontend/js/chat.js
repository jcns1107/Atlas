// chat.js — the session log (transcript) and the composer.
//
// Flow of one message:
//   1. the user's text is added to `history` and drawn in the log
//   2. POST /api/chat with the whole history (the model has no memory of its own)
//   3. streamed events are drawn as they arrive; the core and telemetry react
//   4. the finished reply is pushed onto `history` for the next turn

import { ApiError, streamChat } from "./api.js";
import { escapeHtml, renderMarkdown } from "./markdown.js";

const $ = (id) => document.getElementById(id);
const timeFmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

/**
 * Thinking models (qwen3, …) may wrap their reasoning in <think>…</think> at the
 * start of the reply. Split it off so it can be shown in its own block.
 * Phase 2 moves this to Ollama's separate `message.thinking` field; the UI
 * handles both (see the "thinking" event below).
 */
function splitThinking(raw) {
  const head = raw.trimStart();
  if (head.length < 7 && "<think>".startsWith(head) && head.length > 0) {
    return { thinking: "", answer: "", open: true }; // "<thi" mid-stream
  }
  const m = raw.match(/^\s*<think>([\s\S]*?)(<\/think>|$)/);
  if (!m) return { thinking: "", answer: raw, open: false };
  const closed = m[2] === "</think>";
  return { thinking: m[1].trim(), answer: closed ? raw.slice(m[0].length).trimStart() : "", open: !closed };
}

/** Put the blinking cursor at the end of the last line of text, not below it. */
function placeCaret(body) {
  let target = body.lastElementChild;
  if (!target || target.classList.contains("reasoning")) target = body;
  else if (target.matches("ul, ol")) target = target.lastElementChild ?? target;
  else if (target.classList.contains("code")) target = target.querySelector("code");
  const caret = document.createElement("span");
  caret.className = "caret";
  caret.setAttribute("aria-hidden", "true");
  target.append(caret);
}

/** Turn backend / network failures into a sentence that says what to do. */
function explain(err) {
  if (err instanceof ApiError) {
    if (err.status === 501) return "The chat route is still a stub (501). Finish POST /api/chat.";
    if (err.status === 422) return `The backend rejected the request (422): ${err.message}`;
    return `The backend answered ${err.status}: ${err.message}`;
  }
  if (err instanceof TypeError) return "Can't reach the backend. Start it with: uv run python run.py";
  return String(err.message ?? err);
}
/**
 * Errors from the stream arrive as raw text, e.g.
 *   Ollama error 404: {"error":"model 'qwen3:4b' not found"}
 * Turn them into { text: one plain sentence, detail: the raw message }.
 */
function explainStreamError(message, model) {
  let inner = message;
  const json = message.match(/\{.*\}/s);
  if (json) {
    try {
      inner = JSON.parse(json[0]).error ?? inner;
    } catch {
      /* not JSON after all */
    }
  }
  if (/connect|refused|connection/i.test(message)) {
    return { text: "Couldn't reach Ollama. Is it running? Start it with: ollama serve", detail: message };
  }
  const missing = inner.match(/model ['"]?([^'"\s]+)['"]? not found/i);
  if (missing || (/not found/i.test(inner) && /model/i.test(inner))) {
    const name = missing?.[1] ?? model ?? "<model>";
    return { text: `Model '${name}' isn't installed. Pull it with: ollama pull ${name}`, detail: message };
  }
  return { text: inner, detail: inner === message ? "" : message };
}

export function createChat({ core, telemetry, getModel, onStreamActivity }) {
  const log = $("log");
  const empty = $("empty");
  const form = $("composer");
  const input = $("input");
  const sendBtn = $("send");
  const stopBtn = $("stop");
  const count = $("comms-count");

  const history = []; // [{ role: "user" | "assistant", content }]
  let controller = null; // AbortController for the running request

  const nearBottom = () => log.scrollHeight - log.scrollTop - log.clientHeight < 80;
  const scrollDown = () => {
    log.scrollTop = log.scrollHeight;
  };

  function updateCount() {
    count.textContent = history.length === 0 ? "No messages" : `${history.length} message${history.length === 1 ? "" : "s"}`;
    core.setContext(telemetry.setSession(history));
  }

  function addMessage(kind, who) {
    empty.hidden = true;
    const el = document.createElement("article");
    el.className = `msg msg--${kind}`;
    el.innerHTML = `
      <header class="msg__head">
        <span class="msg__who">${who}</span>
        <span class="msg__meta"></span>
        <time class="msg__time">${timeFmt.format(new Date())}</time>
      </header>
      <div class="msg__body"></div>`;
    log.append(el);
    return el;
  }

  function setBusy(busy) {
    sendBtn.hidden = busy;
    stopBtn.hidden = !busy;
    sendBtn.disabled = busy || !input.value.trim();
  }

  function autosize() {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 200)}px`;
    sendBtn.disabled = Boolean(controller) || !input.value.trim();
  }

  async function send(text) {
    text = text.trim();
    if (!text || controller) return;

    const userEl = addMessage("user", escapeHtml(document.getElementById("operator-name").textContent));
    userEl.querySelector(".msg__body").textContent = text;
    history.push({ role: "user", content: text });
    updateCount();
    input.value = "";
    autosize();
    scrollDown();

    const model = getModel();
    const atlasEl = addMessage("atlas", "Atlas");
    const meta = atlasEl.querySelector(".msg__meta");
    const body = atlasEl.querySelector(".msg__body");
    body.classList.add("md");
    body.innerHTML = '<span class="caret" aria-hidden="true"></span>';
    meta.textContent = model || "server default";

    controller = new AbortController();
    setBusy(true);
    core.setState("thinking", "Waiting for first token");
    onStreamActivity?.("out");

    const t0 = performance.now();
    let first = null;
    let chunks = 0;
    const arrivals = []; // ms since the first chunk, one entry per chunk
    let raw = ""; // everything the model said, as text
    let extraThinking = ""; // reasoning sent as separate "thinking" events (Phase 2+)
    let streamError = null;
    let aborted = false;
    let rendered = false;
    let rafId = 0;

    // Waiting for the first token can take seconds (model loading). Show it.
    const waitTimer = setInterval(() => {
      if (first === null) core.setDetail(`Waiting for first token · ${((performance.now() - t0) / 1000).toFixed(1)} s`);
    }, 100);

    const render = () => {
      rafId = 0;
      const stick = nearBottom();
      const { thinking, answer, open } = splitThinking(raw);
      const reasoning = [extraThinking.trim(), thinking].filter(Boolean).join("\n\n");
      let html = "";
      if (reasoning) {
        const wasOpen = body.querySelector(".reasoning")?.open ?? false;
        const label = open || (!answer && controller) ? "Reasoning…" : `Reasoning · ${reasoning.length.toLocaleString("en-GB")} characters`;
        html += `<details class="reasoning"${wasOpen ? " open" : ""}><summary><svg class="chev" viewBox="0 0 10 10" aria-hidden="true"><path d="M3 1.5 6.5 5 3 8.5"/></svg>${label}</summary><div class="reasoning__body">${escapeHtml(reasoning)}</div></details>`;
      }
      html += renderMarkdown(answer);
      body.innerHTML = html;
      if (controller) placeCaret(body);
      telemetry.setArrivals(arrivals);
      rendered = true;
      if (stick) scrollDown();
    };
    const scheduleRender = () => {
      if (!rafId) rafId = requestAnimationFrame(render);
    };

    try {
      await streamChat({
        messages: history,
        model,
        signal: controller.signal,
        onEvent(ev) {
          if (ev.kind === "text" || ev.kind === "thinking") {
            const now = performance.now();
            if (first === null) {
              first = now;
              core.setState("streaming", "Receiving");
            }
            chunks++;
            arrivals.push(now - first);
            if (ev.kind === "text") raw += ev.text ?? "";
            else extraThinking += ev.text ?? "";
            core.pulse();
            const seconds = (now - first) / 1000;
            if (seconds > 0.3) {
              const rate = chunks / seconds;
              core.setRate(rate);
              core.setDetail(`${rate.toFixed(0)} chunks/s`);
            }
            onStreamActivity?.("in");
            scheduleRender();
          } else if (ev.kind === "error") {
            streamError = ev.message ?? "Unknown error";
          }
          // "done" (and future kinds like "tool_call") need no drawing yet.
        },
      });
    } catch (err) {
      if (err.name === "AbortError") aborted = true;
      else streamError = explain(err);
    }

    clearInterval(waitTimer);
    if (rafId) cancelAnimationFrame(rafId);
    const end = performance.now();
    const stick = nearBottom();
    controller = null;
    setBusy(false);
    render();
    if (!rendered) body.textContent = "";

    const { answer } = splitThinking(raw);
    const duration = end - t0;
    const streamSeconds = first === null ? 0 : (end - first) / 1000;

    if (answer.trim()) {
      history.push({ role: "assistant", content: answer.trim() });
    }

    if (streamError && !answer.trim()) {
      // Nothing useful came back: turn the bubble into an error report.
      atlasEl.className = "msg msg--error";
      atlasEl.querySelector(".msg__who").textContent = "Fault";
      meta.textContent = "";
      body.classList.remove("md");
      const { text: sentence, detail } = explainStreamError(streamError, model || null);
      body.textContent = sentence;
      if (detail) {
        const raw = document.createElement("p");
        raw.className = "msg__raw";
        raw.textContent = detail;
        body.append(raw);
      }
      core.setState("error", "Request failed");
      telemetry.setStream({ ttft: null, rate: null, duration, chunks: 0, note: "The last request failed." });
      setTimeout(() => core.state === "error" && core.setState("standby", "Awaiting command"), 4000);
    } else {
      const rate = streamSeconds > 0 ? chunks / streamSeconds : null;
      const extra = aborted ? " · stopped" : streamError ? " · cut off" : "";
      meta.textContent = `${model || "server default"} · ${(duration / 1000).toFixed(1)} s${rate ? ` · ${rate.toFixed(0)} chunks/s` : ""}${extra}`;
      if (streamError) {
        const note = document.createElement("p");
        note.className = "msg__meta";
        note.textContent = `Stream ended with an error: ${streamError}`;
        body.append(note);
      }
      telemetry.setStream({
        ttft: first === null ? null : first - t0,
        rate,
        duration,
        chunks,
        note: aborted ? "Stopped by you." : undefined,
      });
      core.setState(document.activeElement === input ? "listening" : "standby", aborted ? "Stopped" : "Awaiting command");
    }
    updateCount();
    if (stick) scrollDown();
  }

  // --- Composer wiring --------------------------------------------------------
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    send(input.value);
  });
  input.addEventListener("keydown", (e) => {
    // Enter sends, Shift+Enter is a new line. isComposing: don't send while an
    // IME (e.g. accents on some keyboards) is still composing a character.
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      send(input.value);
    }
  });
  input.addEventListener("input", autosize);
  input.addEventListener("focus", () => {
    if (core.state === "standby") core.setState("listening", "Listening");
  });
  input.addEventListener("blur", () => {
    if (core.state === "listening") core.setState("standby", "Awaiting command");
  });
  stopBtn.addEventListener("click", () => controller?.abort());

  // Suggested prompts in the empty state fill the composer and send.
  empty.querySelectorAll(".prompt").forEach((btn) =>
    btn.addEventListener("click", () => send(btn.textContent)),
  );

  // Copy buttons on code blocks (event delegation: blocks are created later).
  log.addEventListener("click", async (e) => {
    const btn = e.target.closest(".code__copy");
    if (!btn) return;
    const code = btn.closest(".code").querySelector("pre").textContent;
    try {
      await navigator.clipboard.writeText(code);
      btn.textContent = "Copied";
    } catch {
      btn.textContent = "Copy failed";
    }
    setTimeout(() => (btn.textContent = "Copy"), 1400);
  });

  $("new-session").addEventListener("click", () => {
    controller?.abort();
    history.length = 0;
    log.querySelectorAll(".msg").forEach((m) => m.remove());
    empty.hidden = false;
    updateCount();
    telemetry.setStream({ note: "Send a message to measure the model." });
    telemetry.setArrivals([]);
    input.focus();
  });

  autosize();
  updateCount();

  return {
    focus: () => input.focus(),
    get busy() {
      return Boolean(controller);
    },
  };
}
