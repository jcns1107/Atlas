"""Deep Research (Phase 9).

Planned modules:
  - planner.py   : break a question into sub-queries.
  - search.py    : web search (duckduckgo-search) + fetch.
  - read.py      : extract readable text (beautifulsoup4).
  - synthesize.py: combine sources into a cited written report.

This is a multi-step agent loop: plan -> search -> read -> synthesize -> repeat
until the question is answered, then write the report to data/.
"""
