"""Model Context Protocol client (Phase 7).

MCP is an open standard for connecting AI apps to external tool servers. Instead
of hand-writing every integration, you connect an MCP server and its tools
appear alongside the built-ins.

Planned modules:
  - client.py   : connect to an MCP server and list its tools.
  - adapter.py  : expose MCP tools through the same interface as built-in tools.
  - registry.py : track connected servers + per-tool enable/disable toggles.

Transports:
  - stdio           : Atlas launches the server as a local subprocess.
  - Streamable HTTP : the server runs somewhere else; you connect by URL. (The
                      older "HTTP + SSE" transport is superseded — skip it.)

The Python SDK v2 (`uv sync --extra mcp`) implements the 2026-07-28 spec and
gives you one entry point for both: `from mcp import Client`, then
`async with Client(...) as client:` + `await client.list_tools()` /
`await client.call_tool(name, args)`. Check the SDK docs for the exact shapes —
this API changed between v1 and v2, so older tutorials won't match.

Stretch: run Atlas AS an MCP server too (`mcp.server.MCPServer`), so Claude
Code or Claude Desktop can use your agents and memory.

Docs: https://modelcontextprotocol.io  ·  https://py.sdk.modelcontextprotocol.io
"""
