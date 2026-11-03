// chat.js — the conversation in the middle: transcript + composer.
//
// Flow of one message:
//   1. a new chat is saved first (POST /api/conversations, titled from your
//      first message), so it shows up in the sidebar right away
//   2. your text is added to the chat's `messages` and drawn
//   3. POST /api/chat with the whole history (the model has no memory of its
//      own) plus the chat's id; streamed events are drawn as they arrive, and
//      the Earth and the vitals react
//   4. the finished reply is added to `messages` for the next turn
//
// Who stores the messages? The backend, once POST /api/chat reads
// `conversation_id` (GUIDE.md, Phase 2). Until then the UI keeps them in memory
// for this tab and says so under the composer, so nothing pretends to be saved.

import { ApiError, createConversation, streamChat } from "./api.js";
import { escapeHtml, renderMarkdown } from "./markdown.js";
import { fmtInt, NUM_CTX } from "./telemetry.js";

const $ = (id) => document.getElementById(id);

/**
 * Thinking models (qwen3, …) may wrap their reasoning in <think>…</think> at the
 * start of the reply. Split it off so it can be shown in its own block. Newer
 * backends send reasoning as separate "thinking" events instead; both work.
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
  if (/does not support thinking/i.test(inner)) {
    return { text: "This model can't think. Set Thinking to default or off.", detail: message };
  }
  const missing = inner.match(/model ['"]?([^'"\s]+)['"]? not found/i);
  if (missing || (/not found/i.test(inner) && /model/i.test(inner))) {
    const name = missing?.[1] ?? model ?? "<model>";
    return { text: `Model '${name}' isn't installed. Pull it with: ollama pull ${name}`, detail: message };
  }
  return { text: inner, detail: inner === message ? "" : message };
}

/** A chat title from the first message: its first line, cut at a word, ≤ 48 characters. */
export function titleFrom(text) {
  const first = text.trim().split("\n")[0].replace(/\s+/g, " ");
  if (first.length <= 48) return first || "New chat";
  const cut = first.slice(0, 48);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 24)).trim()}…`;
}

/** Markdown → plain text, roughly: for the captions under the Earth. */
const plain = (md) =>
  md
    .replace(/```[\s\S]*?(```|$)/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/[*_#>]+/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

function greeting(name) {
  const h = new Date().getHours();
  const part = h < 5 ? "Good evening" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return `${part}, ${name}`;
}

/**
 * core, telemetry:    the presence panel's controllers
 * sidebar:            the chat list (conversations.js)
 * caps():             what the backend can do (api.fetchCapabilities)
 * operator():         the operator's name
 * onSaved(conv):      a new chat was created on the backend
 * onCaption(text):    the latest reply text, for the presence view's captions
 */
export function createChat({ core, telemetry, sidebar, caps, operator, onSaved, onCaption }) {
  const main = $("chat");
  const log = $("log");
  const inner = $("log-inner");
  const welcome = $("welcome");
  const form = $("composer");
  const input = $("input");
  const sendBtn = $("send");
  const stopBtn = $("stop");
  const note = $("chat-note");

  // The open chat. `id` is null until the first message saves it.
  let current = blank();
  // Messages the backend doesn't store yet, kept for this tab: id → { messages, usage }.
  const memory = new Map();
  let controller = null; // AbortController for the running request
  let modelListStatus = "offline";

  function blank(defaults = {}) {
    return { id: null, title: "New chat", model: "", think: null, system_prompt: "", messages: [], usage: null, ...defaults };
  }

  const nearBottom = () => log.scrollHeight - log.scrollTop - log.clientHeight < 80;
  const scrollDown = () => {
    log.scrollTop = log.scrollHeight;
  };

  // --- Drawing ------------------------------------------------------------------
  function updateWelcome() {
    const empty = current.messages.length === 0 && !controller;
    main.dataset.empty = String(empty);
    welcome.hidden = !empty;
    if (empty) {
      $("welcome-title").textContent = greeting(operator());
      const model = current.model || "the server's default model";
      $("welcome-lede").textContent = current.unsaved
        ? `This chat's earlier messages weren't stored, so it starts fresh. Atlas will answer with ${model}.`
        : current.id
          ? `This chat is empty. Atlas will answer with ${model}.`
          : `Ask anything. Atlas answers with ${model}, running on this machine.`;
    }
  }

  function updateVitals() {
    core.setContext(telemetry.setContext(current.usage, current.messages));
  }

  function updateNote() {
    const c = caps();
    let text = "";
    if (current.id && !c?.chatSaves && current.messages.length) {
      text = "Messages stay until you reload: the backend doesn't save them yet.";
    } else if (!current.id && current.messages.length) {
      text = "This chat isn't saved. Your chats couldn't be reached.";
    }
    note.textContent = text;
    note.hidden = !text;
  }

  function addUser(text) {
    const el = document.createElement("article");
    el.className = "msg msg--user";
    el.innerHTML = '<div class="msg__body"></div>';
    el.firstChild.textContent = text;
    inner.append(el);
    return el;
  }

  function addAtlas() {
    const el = document.createElement("article");
    el.className = "msg msg--atlas";
    el.innerHTML = `
      <div class="msg__body md"></div>
      <footer class="msg__foot">
        <span class="msg__meta"></span>
        <button class="msg__copy" type="button">Copy</button>
      </footer>`;
    inner.append(el);
    return { el, body: el.querySelector(".msg__body"), meta: el.querySelector(".msg__meta") };
  }

  /** Draw a whole saved chat at once (no entrance animation for history). */
  function drawHistory() {
    inner.querySelectorAll(".msg").forEach((m) => m.remove());
    inner.classList.add("is-history"); // history appears at once, without entrances
    for (const m of current.messages) {
      if (m.role === "user") addUser(m.content);
      else if (m.role === "assistant") addAtlas().body.innerHTML = renderMarkdown(m.content);
    }
    requestAnimationFrame(() => inner.classList.remove("is-history"));
    updateWelcome();
    updateVitals();
    updateNote();
    scrollDown();
  }

  function setBusy(busy) {
    sendBtn.hidden = busy;
    stopBtn.hidden = !busy;
    autosize();
  }

  function autosize() {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 220)}px`;
    sendBtn.disabled = Boolean(controller) || !input.value.trim();
  }

  // --- Sending -------------------------------------------------------------------
  async function ensureSaved(firstText) {
    if (current.id || !sidebar.available) return;
    try {
      const conv = await createConversation({
        title: titleFrom(firstText),
        model: current.model || null,
        think: current.think,
        system_prompt: current.system_prompt,
      });
      current.id = conv.id;
      current.title = conv.title;
      onSaved?.(conv);
    } catch {
      // Carry on unsaved: the chat still works for this tab, and the note says so.
    }
  }

  async function send(text) {
    text = text.trim();
    if (!text || controller) return;

    input.value = "";
    controller = new AbortController(); // busy from here, even while saving
    setBusy(true);
    updateWelcome();
    await ensureSaved(text);
    const conv = current; // the chat this reply belongs to (you may switch away)

    addUser(text);
    conv.messages.push({ role: "user", content: text });
    updateVitals();
    updateNote();
    scrollDown();

    const model = conv.model;
    const think = conv.think;
    const { el: atlasEl, body, meta } = addAtlas();
    body.innerHTML = '<span class="caret" aria-hidden="true"></span>';
    meta.textContent = model || "server default";
    core.setState("thinking", "Waiting for the first token");
    onCaption?.("");

    const t0 = performance.now();
    let first = null;
    let chunks = 0;
    let raw = ""; // everything the model said, as text
    let extraThinking = ""; // reasoning sent as separate "thinking" events
    let streamError = null;
    let tokens = null; // Ollama's counts from the "done" event: { prompt, output, window }
    let aborted = false;
    let rendered = false;
    let rafId = 0;
    const own = controller;

    // Waiting for the first token can take seconds (model loading). Show it.
    const waitTimer = setInterval(() => {
      if (first === null && current === conv) {
        core.setDetail(`Waiting for the first token · ${((performance.now() - t0) / 1000).toFixed(1)} s`);
      }
    }, 100);

    const render = () => {
      rafId = 0;
      if (!atlasEl.isConnected) return; // you opened another chat meanwhile
      const stick = nearBottom();
      const { thinking, answer, open } = splitThinking(raw);
      const reasoning = [extraThinking.trim(), thinking].filter(Boolean).join("\n\n");
      let html = "";
      if (reasoning) {
        const wasOpen = body.querySelector(".reasoning")?.open ?? false;
        const label =
          open || (!answer && controller === own) ? "Thinking…" : `Thought · ${fmtInt(reasoning.length)} characters`;
        html += `<details class="reasoning"${wasOpen ? " open" : ""}><summary><svg class="chev" viewBox="0 0 10 10" aria-hidden="true"><path d="M3 1.5 6.5 5 3 8.5"/></svg>${label}</summary><div class="reasoning__body">${escapeHtml(reasoning)}</div></details>`;
      }
      html += renderMarkdown(answer);
      body.innerHTML = html;
      if (controller === own) placeCaret(body);
      rendered = true;
      onCaption?.(plain(answer));
      if (stick) scrollDown();
    };
    const scheduleRender = () => {
      if (!rafId) rafId = requestAnimationFrame(render);
    };

    try {
      await streamChat({
        messages: conv.messages,
        model,
        think,
        conversationId: conv.id,
        signal: own.signal,
        onEvent(ev) {
          if (ev.kind === "text" || ev.kind === "thinking") {
            const now = performance.now();
            if (first === null) {
              first = now;
              core.setState("streaming", ev.kind === "thinking" ? "Reasoning" : "Answering");
            } else if (ev.kind === "text" && core.state === "streaming" && !raw) {
              core.setDetail("Answering");
            }
            chunks++;
            if (ev.kind === "text") raw += ev.text ?? "";
            else extraThinking += ev.text ?? "";
            core.pulse();
            const seconds = (now - first) / 1000;
            if (seconds > 0.3) core.setRate(chunks / seconds);
            scheduleRender();
          } else if (ev.kind === "error") {
            streamError = ev.message ?? "Unknown error";
          } else if (ev.kind === "done" && typeof ev.prompt_tokens === "number") {
            // The provider's "done" carries the real counts. The route's own
            // "done" (sent after an error) has none, so it's skipped here.
            tokens = { prompt: ev.prompt_tokens, output: ev.output_tokens ?? 0, window: ev.context_window ?? null };
          }
          // Future kinds (e.g. "tool_call", Phase 4) need no drawing yet.
        },
      });
    } catch (err) {
      if (err.name === "AbortError") aborted = true;
      else streamError = explain(err);
    }

    clearInterval(waitTimer);
    if (rafId) cancelAnimationFrame(rafId);
    const end = performance.now();
    controller = null;
    setBusy(false);
    render();
    if (!rendered) body.textContent = "";

    const { answer } = splitThinking(raw);
    const duration = end - t0;
    const streamSeconds = first === null ? 0 : (end - first) / 1000;
    if (answer.trim()) conv.messages.push({ role: "assistant", content: answer.trim() });
    if (tokens) conv.usage = tokens;
    if (conv.id && !caps()?.chatSaves) memory.set(conv.id, { messages: conv.messages, usage: conv.usage });

    if (streamError && !answer.trim()) {
      // Nothing useful came back: turn the reply into an error report.
      atlasEl.className = "msg msg--error";
      atlasEl.querySelector(".msg__foot").remove();
      body.classList.remove("md");
      const { text: sentence, detail } = explainStreamError(streamError, model || null);
      body.textContent = sentence;
      if (detail) {
        const rawEl = document.createElement("p");
        rawEl.className = "msg__raw";
        rawEl.textContent = detail;
        body.append(rawEl);
      }
      onCaption?.(sentence);
      core.setState("error", "The request failed");
      setTimeout(() => core.state === "error" && core.setState("standby", "Awaiting command"), 4000);
    } else {
      const rate = streamSeconds > 0 ? (tokens ? tokens.output / streamSeconds : chunks / streamSeconds) : null;
      const parts = [model || "server default", `${(duration / 1000).toFixed(1)} s`];
      if (rate) parts.push(`${rate.toFixed(0)} ${tokens ? "tok/s" : "chunks/s"}`);
      if (tokens) parts.push(`${fmtInt(tokens.prompt + tokens.output)} / ${fmtInt(tokens.window ?? NUM_CTX)} context`);
      if (aborted) parts.push("stopped");
      else if (streamError) parts.push("cut off");
      meta.textContent = parts.join(" · ");
      if (streamError) {
        const cut = document.createElement("p");
        cut.className = "msg__cut";
        cut.textContent = `The stream ended with an error: ${streamError}`;
        body.append(cut);
      }
      telemetry.setLastReply({ duration, streamSeconds, chunks, tokens, stopped: aborted });
      core.setState(document.activeElement === input ? "listening" : "standby", aborted ? "Stopped" : "Awaiting command");
    }
    if (current === conv) {
      updateVitals();
      updateNote();
      updateWelcome();
    }
    // Let the sidebar re-sort: a reply makes this the most recent chat.
    if (conv.id && caps()?.chatSaves) sidebar.refresh();
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
    if (e.key === "Escape" && controller) controller.abort();
  });
  input.addEventListener("input", () => {
    autosize();
    if (core.state === "listening" || core.state === "standby") {
      if (core.state === "standby") core.setState("listening", "Listening");
      core.nudge();
    }
  });
  input.addEventListener("focus", () => {
    if (core.state === "standby") core.setState("listening", "Listening");
  });
  input.addEventListener("blur", () => {
    if (core.state === "listening") core.setState("standby", "Awaiting command");
  });
  stopBtn.addEventListener("click", () => controller?.abort());

  // Copy: whole replies, and code blocks (event delegation: both are created later).
  inner.addEventListener("click", async (e) => {
    const btn = e.target.closest(".code__copy, .msg__copy");
    if (!btn) return;
    const text = btn.classList.contains("code__copy")
      ? btn.closest(".code").querySelector("pre").textContent
      : btn.closest(".msg").querySelector(".msg__body").innerText;
    const label = btn.textContent;
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = "Copied";
    } catch {
      btn.textContent = "Copy failed";
    }
    setTimeout(() => (btn.textContent = label), 1400);
  });

  autosize();
  updateWelcome();
  updateVitals();

  return {
    focus: () => input.focus(),
    get busy() {
      return Boolean(controller);
    },
    get current() {
      return current;
    },
    setModelListStatus(status) {
      modelListStatus = status;
      telemetry.setModel(current.model, modelListStatus);
    },

    /** Start a fresh, unsaved chat (saved on its first message). */
    newChat(defaults) {
      controller?.abort();
      current = blank(defaults);
      inner.querySelectorAll(".msg").forEach((m) => m.remove());
      core.setState(linkDown() ? "offline" : "standby", linkDown() ? "Backend unreachable" : "Awaiting command");
      telemetry.setModel(current.model, modelListStatus);
      updateWelcome();
      updateVitals();
      updateNote();
    },

    /** Show a saved chat (as returned by GET /api/conversations/{id}). */
    open(conv) {
      controller?.abort();
      const kept = memory.get(conv.id);
      const saved = conv.messages ?? [];
      current = {
        id: conv.id,
        title: conv.title,
        model: conv.model ?? "",
        think: conv.think ?? null,
        system_prompt: conv.system_prompt ?? "",
        // The backend's copy wins once it stores messages; until then, this tab's.
        messages: saved.length ? saved.map((m) => ({ role: m.role, content: m.content })) : kept?.messages ?? [],
        usage: saved.length ? null : kept?.usage ?? null,
        unsaved: !saved.length && !kept && !caps()?.chatSaves,
      };
      telemetry.setModel(current.model, modelListStatus);
      drawHistory();
    },

    /** The open chat's settings changed in the UI (model, think, title, instructions). */
    patchCurrent(fields) {
      Object.assign(current, fields);
      if ("model" in fields) telemetry.setModel(current.model, modelListStatus);
      updateWelcome();
    },

    refreshNote: updateNote,
  };

  function linkDown() {
    return core.state === "offline";
  }
}
