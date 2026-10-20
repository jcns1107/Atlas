"""Deep Research (Phase 9).

Planned modules:
  - planner.py   : break a question into sub-questions. Ask for the plan as
                   structured output (a JSON schema via Ollama's `format`).
  - search.py    : web search with `ddgs` (`uv sync --extra research`). Optional
                   alternative: Ollama's hosted web_search / web_fetch API —
                   good results, but it needs a (free) ollama.com API key, so
                   it's no longer fully local.
  - read.py      : fetch pages and extract readable text (trafilatura or bs4).
  - synthesize.py: combine findings into a cited written report.

The harness pattern to learn here is **sub-agents**: an orchestrator hands each
sub-question to a fresh agent with its OWN, empty context. The sub-agent
searches and reads (lots of tokens), then returns only a short summary + its
sources. The orchestrator's context stays small and focused — it never sees
the raw pages. Then: plan -> research (sub-agents) -> enough? -> synthesize,
and write the report to data/. ("Enough?" is a yes/no decision — a good place
to reuse the decision model from Phase 8, with a confidence threshold.)

Everything fetched from the web is untrusted text: quote it, cite it, never
follow instructions found inside it.
"""
