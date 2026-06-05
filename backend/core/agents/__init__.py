"""Agents (Phase 5).

An "agent" = a model + a system prompt/persona + an allowed set of tools +
memory. Define agents as data (JSON in data/agents/) so users can create them
from the UI without writing code.

Planned modules:
  - schema.py : the Agent definition (name, model, system prompt, tools[]).
  - runner.py : the agent loop — call model, run tool calls, feed results back.
  - registry.py : load/save agent definitions from data/agents/.
"""
