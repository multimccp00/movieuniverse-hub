from fastapi.testclient import TestClient

from app.main import app


def test_health():
    # TestClient calls the app directly, no real server or database needed
    response = TestClient(app).get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
