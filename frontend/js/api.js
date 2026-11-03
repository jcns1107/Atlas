// api.js — every call from the UI to the Atlas backend goes through here.
//
// The UI never talks to Ollama directly: it only knows the backend's /api
// routes. That keeps the architecture rule from CLAUDE.md ("all model calls go
// through a provider") true on the frontend side too.

import { readSSE } from "./sse.js";

/** An error that carries the HTTP status, so the UI can explain it. */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/** FastAPI puts the reason in {"detail": ...}; for 422 it's a list of problems. */
async function errorFrom(res) {
  let detail = res.statusText;
  try {
    const data = await res.json();
    detail = Array.isArray(data.detail)
      ? data.detail.map((d) => `${(d.loc ?? []).join(".")}: ${d.msg}`).join("; ")
      : data.detail ?? detail;
  } catch {
    /* body wasn't JSON — keep statusText */
  }
  return new ApiError(detail, res.status);
}

/** fetch + JSON, throwing ApiError on a non-2xx answer. 204 resolves to null. */
async function json(path, { method = "GET", body } = {}) {
  const res = await fetch(path, {
    method,
    cache: "no-store",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw await errorFrom(res);
  return res.status === 204 ? null : res.json();
}

/** GET /api/health and time the round-trip. Never throws. */
export async function checkHealth() {
  const t0 = performance.now();
  try {
    const res = await fetch("/api/health", { cache: "no-store" });
    return { ok: res.ok, ms: performance.now() - t0 };
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
 * Accepts a bare list, {models: [...]} or {installed: [...]} — of strings or of
 * Ollama-style objects ({name: "..."}).
 */
export async function fetchModels() {
  try {
    const res = await fetch("/api/models", { cache: "no-store" });
    if (res.status === 501) return { status: "stub" };
    if (!res.ok) return { status: "offline", code: res.status };
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.installed ?? data.models ?? [];
    const models = list.map((m) => (typeof m === "string" ? m : m?.name ?? m?.model)).filter(Boolean);
    return { status: "ok", models };
  } catch {
    return { status: "offline" };
  }
}

/**
 * What can this backend do right now? FastAPI publishes every route and schema
 * at /openapi.json, so the UI reads it instead of guessing (and instead of
 * firing requests that 404).
 *
 *   conversations : the conversations router answers at /api/conversations
 *   chatSaves     : POST /api/chat accepts a conversation_id, so the backend
 *                   stores the messages and applies the chat's instructions
 */
export async function fetchCapabilities() {
  try {
    const res = await fetch("/openapi.json", { cache: "no-store" });
    if (!res.ok) return null;
    const spec = await res.json();
    const paths = spec.paths ?? {};
    const chatRequest = spec.components?.schemas?.ChatRequest?.properties ?? {};
    return {
      version: spec.info?.version ?? "",
      conversations: Boolean(paths["/api/conversations"]?.get && paths["/api/conversations"]?.post),
      chatSaves: "conversation_id" in chatRequest,
    };
  } catch {
    return null;
  }
}

// --- Conversations (backend/api/routes/conversations.py) ----------------------
//   GET    /api/conversations        → [{ id, title, model, updated_at }]  newest first
//   POST   /api/conversations        → Conversation (201)
//   GET    /api/conversations/{id}   → Conversation, messages included
//   PATCH  /api/conversations/{id}   → Conversation (only the fields sent change)
//   DELETE /api/conversations/{id}   → 204

export const listConversations = () => json("/api/conversations");
export const createConversation = (fields) => json("/api/conversations", { method: "POST", body: fields });
export const getConversation = (id) => json(`/api/conversations/${encodeURIComponent(id)}`);
export const updateConversation = (id, changes) =>
  json(`/api/conversations/${encodeURIComponent(id)}`, { method: "PATCH", body: changes });
export const deleteConversation = (id) =>
  json(`/api/conversations/${encodeURIComponent(id)}`, { method: "DELETE" });

/**
 * POST /api/chat and stream the reply.
 * `onEvent` receives events like {kind: "text", text}, {kind: "thinking", text},
 * {kind: "error", message} and {kind: "done", prompt_tokens, output_tokens}
 * as they arrive (see sse.js for the frame format).
 *
 * `think` is true, false or null. null means "let the model decide": it's sent
 * as JSON null (not left out), which pydantic turns into None on the backend.
 *
 * `conversation_id` is sent whenever the chat is saved. A backend that doesn't
 * know the field yet ignores it (pydantic's default), so this is safe today and
 * starts working the moment ChatRequest gains the field.
 */
export async function streamChat({ messages, model, think = null, conversationId = null, signal, onEvent }) {
  const payload = { messages, model: model || null, think };
  if (conversationId) payload.conversation_id = conversationId;

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) throw await errorFrom(res);
  await readSSE(res, onEvent);
}
