"""Core domain logic: LLM providers, agents, tools, MCP, memory, skills.

Keep this layer free of FastAPI imports — it should be usable from a script,
a test, or a future CLI, not just the web server.
"""
