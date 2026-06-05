"""API routers, one module per feature area.

Currently wired up in backend/main.py:
    - chat    : send messages to a model and stream the reply
    - models  : list locally available Ollama models + hardware recommendation

As you build features, add a router here and include it in main.py:
    agents, tools, mcp, memory, skills, email, research, characters
"""
