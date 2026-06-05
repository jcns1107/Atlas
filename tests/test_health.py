"""A first test, and a template for writing your own (test as you build).

Run with:  pytest

The health endpoint is implemented in backend/main.py, so this passes today.
As you build each feature, add a test next to it: call the endpoint or the core
function and assert on the result. Tests are how you catch a change that quietly
breaks something you already finished.
"""

from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


# Copy this template once you implement POST /api/chat:
#
# def test_chat_streams():
#     res = client.post(
#         "/api/chat",
#         json={"messages": [{"role": "user", "content": "hi"}]},
#     )
#     assert res.status_code == 200
