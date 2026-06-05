"""Built-in tools (Phase 4).

Each tool is a function the model can call, described by a JSON schema so the
model knows its name, purpose, and arguments. Toggle per agent.

Planned built-ins:
  - bash.py   : run a shell command (sandbox carefully!).
  - files.py  : read/write/list files in a workspace dir.
  - web.py    : fetch a URL / search the web.
  - memory.py : store and recall facts (wraps core/memory).

A `registry` maps tool name -> callable + schema so the agent runner can
dispatch a model's tool call to the right function.
"""
