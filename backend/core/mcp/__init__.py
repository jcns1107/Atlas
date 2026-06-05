"""Model Context Protocol client (Phase 7).

MCP is an open standard for connecting AI apps to external tool servers. Instead
of hand-writing every integration, you connect an MCP server and its tools
appear alongside the built-ins.

Planned modules:
  - client.py   : connect to an MCP server (stdio or HTTP), list its tools.
  - adapter.py  : expose MCP tools through the same interface as built-in tools.
  - registry.py : track connected servers + per-tool enable/disable toggles.

Docs: https://modelcontextprotocol.io  (Python SDK: `pip install mcp`)
"""
