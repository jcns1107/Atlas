// api.js — every call from the UI to the Atlas backend goes through here.
//
// The UI never talks to Ollama directly: it only knows the backend's /api
// routes. That keeps the architecture rule from CLAUDE.md ("all model calls go
// through a provider") true on the frontend side too.

import { readSSE } from "./sse.js";

// Bytes moved by chat requests this session (shown in the bottom strip).
export const traffic = { in: 0, out: 0 };

const encoder = new TextEncoder();

/** GET /api/health and time the round-trip. Never throws. */
export async function checkHealth() {
  const t0 = performance.now();
  try {
    const res = await fetch("/api/health", { cache: "no-store" });
    const ms = performance.now() - t0;
    return { ok: res.ok, ms };
  } catch {
    return { ok: false, ms: null };
  }
}

/**
 * GET /api/models. Returns one of:
 *   { status: "ok",      models: ["qwen3:4b", ...] }
 *   { status: "stub" }     the route exists but still returns 501
 *   { status: "offline" }  backend down or route missing
 *
 * Accepts the shapes the backend is likely to return while you build it:
 * {installed: [...]}, {models: [...]}, or a bare list — of strings or of
 * Ollama-style objects ({name: "..."}).
 */
export async function fetchModels() {
  try {
    const res = await fetch("/api/models", { cache: "no-store" });
    if (res.status === 501) return { status: "stub" };
    if (!res.ok) return { status: "offline", code: res.status };
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.installed ?? data.models ?? [];
    const models = list
      .map((m) => (typeof m === "string" ? m : m?.name ?? m?.model))
      .filter(Boolean);
    return { status: "ok", models };
  } catch {
    return { status: "offline" };
  }
}

/**
 * FastAPI publishes every route it has at /openapi.json. We read it to learn
 * which Atlas modules exist yet — no guessing, no 404 noise in the console.
 */
export async function fetchOpenApi() {
  try {
    const res = await fetch("/openapi.json", { cache: "no-store" });
    if (!res.ok) return null;
    const spec = await res.json();
    return { version: spec.info?.version ?? "", paths: spec.paths ?? {} };
  } catch {
    return null;
  }
}

/** Status code of a GET, or 0 if the request failed. */
export async function probe(path) {
  try {
    const res = await fetch(path, { cache: "no-store" });
    return res.status;
  } catch {
    return 0;
  }
}

/** An error that carries the HTTP status, so the UI can explain it. */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/**
 * POST /api/chat and stream the reply.
 * `onEvent` receives events like {kind: "text", text}, {kind: "error", message}
 * and {kind: "done"} as they arrive (see sse.js for the frame format).
 */
export async function streamChat({ messages, model, signal, onEvent }) {
  const body = JSON.stringify({ messages, model: model || null });
  traffic.out += encoder.encode(body).length;

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    signal,
  });

  if (!res.ok) {
    // FastAPI puts the reason in {"detail": ...}; for 422 it's a list of problems.
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = Array.isArray(data.detail)
        ? data.detail.map((d) => `${(d.loc ?? []).join(".")}: ${d.msg}`).join("; ")
        : data.detail ?? detail;
    } catch {
      /* body wasn't JSON — keep statusText */
    }
    throw new ApiError(detail, res.status);
  }

  await readSSE(res, onEvent, (bytes) => {
    traffic.in += bytes;
  });
}
