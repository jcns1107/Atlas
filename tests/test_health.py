"""Smoke test: the app boots and the health endpoint responds.

Run with:  pytest   (after `pip install pytest`)
"""

from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_models_endpoint_survives_without_ollama():
    # Should return an empty list rather than crashing if Ollama isn't running.
    res = client.get("/api/models")
    assert res.status_code == 200
    assert "installed" in res.json()
