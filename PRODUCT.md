# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Plain HTML/CSS/JS in `frontend/` (no build step, no framework), served by the FastAPI app at `/` with assets under `/static/`. Fonts are self-hosted so the app works offline.

## Users

One primary user: the owner, running Atlas on his own Windows machine against a local Ollama server. He is building the backend himself, phase by phase (GUIDE.md), to learn local AI; he wants nothing to do with frontend work. He uses the UI daily to chat with local models, and wants it to feel like a finished product, not a build checklist.

## Product Purpose

Atlas is a self-hosted "Swiss-army knife" of local AI: agents and characters with tools (built-in and MCP) for chat, email, research, memory and self-evolving skills. Local-first via Ollama; API models are optional later providers. Success for the UI: chatting with a local model works end to end, and the screen honestly reflects what the backend can do today.

## Positioning

A personal AI workspace, presented as a product: your chats on the left, the conversation in the middle (the familiar Claude-style column), and Atlas itself on the right — a living, interactive holographic Earth that shows what the model is doing. What is still to be built lives in the roadmap, never on screen.

## Operating Context

- Desktop browser on the owner's PC, `http://127.0.0.1:8000`, long sessions, usually in a dim room. Works down to a phone.
- Backend contract today: `GET /api/health`; `GET /api/models`; `/api/conversations` (create, list, get, rename via PATCH, delete); `POST /api/chat` streams Server-Sent Events, one JSON frame per event (`{"kind": "text" | "thinking" | "error" | "done", ...}`, token counts on `done`).
- The UI reads `/openapi.json` to learn what the backend can do (for example whether `POST /api/chat` accepts `conversation_id` yet) instead of guessing.
- Later phases add tool calls to the same stream, and a voice route (Phase 15).

## Capabilities and Constraints

- Real data only. A value is measured, labelled as an estimate, or a dash.
- Chats are saved through `/api/conversations`. Their messages are stored once `POST /api/chat` accepts `conversation_id` (GUIDE Phase 2, step 8); until then the UI keeps them in memory for the tab and says so in one quiet line.
- `core/` must not import FastAPI; the frontend is the one area Claude builds and maintains.

## Brand Commitments

- Name: Atlas.
- Binding visual reference from the owner: the JARVIS holographic HUD from the Iron Man films (cyan-on-black, circular core, dense telemetry panels, cinematic boot). Built as Atlas's own HUD, not a copy of film props or studio branding.

## Evidence on Hand

No screenshots, logos or brand assets exist. The roadmap (`docs/ROADMAP.md`) and the API routes are the factual content.

## Product Principles

1. The screen tells the truth about the backend: nothing pretends to be saved, measured or working when it isn't.
2. Chat is the job; the spectacle never gets in the way of reading a reply.
3. A product, not a progress report: features that aren't built don't appear on screen. The roadmap tracks them.
4. Atlas is present: the Earth reacts to every state and to the operator (typing, hovering, dragging), and can take the whole screen (presence view, later voice mode).
5. Local-first: works with no internet.

## Accessibility & Inclusion

Keyboard operable; visible focus; `prefers-reduced-motion` respected (no rotation or boot travel); body text at 4.5:1 or better.
