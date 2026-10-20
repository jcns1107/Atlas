"""Agents (Phase 5).

An "agent" = a model + instructions/persona + an allowed set of tools (with
permissions) + memory + a context policy. Define agents as data so users can
create them from the UI without writing code:

    data/agents/<name>/agent.json  : model, enabled tools + permissions,
                                     memory on/off, sampling (temperature...).
    data/agents/<name>/AGENTS.md   : the instructions, in plain markdown — the
                                     same idea as an AGENTS.md / CLAUDE.md file
                                     that coding agents read every session.

Planned modules:
  - schema.py   : the Agent definition.
  - runner.py   : the agent loop — assemble context (core/context/), call the
                  model, run tool calls (core/tools/), feed results back,
                  compact when the window gets full.
  - registry.py : load/save agent definitions from data/agents/.

Only offer tools to models that support them — Ollama's /api/show lists each
model's `capabilities` (tools, thinking, vision, ...). And keep each agent's
tool list short: small local models get confused by dozens of tool schemas.
"""
