"""Built-in tools + the harness loop that runs them (Phase 4).

Each tool is a function the model can call, described by a JSON schema so the
model knows its name, purpose, and arguments. Toggle per agent.

Planned built-ins:
  - files.py  : read/write/list files in a sandboxed workspace dir.
  - docs.py   : list_docs / grep_docs / read_doc over a folder of documents —
                "agentic search", strategy #2 in core/context/.
  - web.py    : fetch a URL and extract the readable text (trafilatura or bs4).
  - memory.py : store and recall facts (wraps core/memory).
  - bash.py   : run a shell command (sandbox carefully! build this one last).

A `registry` maps tool name -> callable + schema + permission so the agent
runner can dispatch a model's tool call to the right function.
Tip: you can generate the JSON schema from the function's type hints with
pydantic instead of writing it by hand — one source of truth.

The harness loop (the part that turns a chatbot into an agent):
  1. Send messages + tool schemas to the model.
  2. If it replies with tool_calls (maybe several at once), run each one and
     append a {"role": "tool", ...} result message per call.
  3. Repeat until it answers in words — or until a max-iterations limit, so a
     confused model can't loop forever.

Guardrails that matter as much as the loop itself:
  - Permissions per tool: "allow" (just run), "ask" (pause and let the user
    approve in the UI — bash, file writes, sending email), or "deny".
  - (Stretch, after Phase 8) a decision-model "guard": ask a yes/no question
    like "is this command destructive?" before running a tool. It may only
    move a call UP from "allow" to "ask" — never down. The allowlist and your
    approval click stay in charge; a model is a second opinion, not a lock.
  - Errors become tool results ("error: file not found"), not crashes — the
    model can often fix its own mistake on the next step.
  - Cap the size of a tool result (a web page can be 50k tokens!). Keep a
    preview, store the rest, and tell the model where it is.
  - Stream every step to the UI (thinking / tool call / tool result / text) so
    you can watch the agent work — and debug it.
"""
