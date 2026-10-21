# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Plain HTML/CSS/JS in `frontend/` (no build step, no framework), served by the FastAPI app at `/` with assets under `/static/`. Fonts are self-hosted so the app works offline.

## Users

One primary user: the owner, running Atlas on his own Windows machine against a local Ollama server. He is building the backend himself, phase by phase (GUIDE.md), to learn local AI; he wants nothing to do with frontend work. He uses the UI daily to chat with local models and to see which parts of Atlas he has already built.

## Product Purpose

Atlas is a self-hosted "Swiss-army knife" of local AI: agents and characters with tools (built-in and MCP) for chat, email, research, memory and self-evolving skills. Local-first via Ollama; API models are optional later providers. Success for the UI: chatting with a local model works end to end, and the screen honestly reflects what the backend can do today.

## Positioning

A personal AI workspace that the owner builds himself, layer by layer. The UI doubles as a live map of that build: modules come online as their backend routes appear.

## Operating Context

- Desktop browser on the owner's PC, `http://127.0.0.1:8000`, long sessions, usually in a dim room.
- Backend contract today: `GET /api/health`; `POST /api/chat` streams Server-Sent Events, one JSON frame per event (`{"kind": "text" | "error" | "done", ...}`); `GET /api/models` is still a 501 stub.
- Later phases add thinking, tool calls and token counts to the same stream, plus routers for models, tools, agents, memory, MCP, email, research, skills and characters.

## Capabilities and Constraints

- Real data only. Panels with no backend source yet (CPU, RAM, GPU) say they are waiting for their route instead of showing invented numbers.
- `core/` must not import FastAPI; the frontend is the one area Claude builds and maintains.
- No conversation persistence until Phase 2.

## Brand Commitments

- Name: Atlas.
- Binding visual reference from the owner: the JARVIS holographic HUD from the Iron Man films (cyan-on-black, circular core, dense telemetry panels, cinematic boot). Built as Atlas's own HUD, not a copy of film props or studio branding.

## Evidence on Hand

No screenshots, logos or brand assets exist. The roadmap (`docs/ROADMAP.md`) and the API routes are the factual content.

## Product Principles

1. The screen tells the truth about the backend: online, stub, or not built.
2. Chat is the job; the spectacle never gets in the way of reading a reply.
3. Every module points at where it gets built, so the UI teaches the roadmap.
4. Local-first: works with no internet.

## Accessibility & Inclusion

Keyboard operable; visible focus; `prefers-reduced-motion` respected (no rotation or boot travel); body text at 4.5:1 or better.
