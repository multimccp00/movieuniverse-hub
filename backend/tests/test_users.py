from datetime import datetime, timedelta

from app.blocks.users.models import LoginSession, User
from tests.conftest import login


def register(client, username="ana", password="password123"):
    return client.post("/users/register", json={"username": username, "password": password})


def test_register_logs_in_with_a_safe_cookie(client):
    response = register(client, "  Ana ")
    assert response.status_code == 201
    assert response.json()["username"] == "ana"  # trimmed + lowercased
    cookie = response.headers["set-cookie"]
    assert "HttpOnly" in cookie and "SameSite=lax" in cookie


def test_password_is_stored_hashed(client, db):
    register(client, password="password123")
    stored = db.query(User).one().password_hash
    assert "password123" not in stored
    assert stored.startswith("$argon2")


def test_session_token_is_stored_hashed(client, db):
    token = register(client).cookies["session"]
    assert db.query(LoginSession).one().token_hash != token


def test_username_taken(client):
    register(client, "ana")
    assert register(client, "ANA").status_code == 409


def test_login(client):
    register(client, "ana", "password123")
    ok = client.post("/users/login", json={"username": "ana", "password": "password123"})
    assert ok.status_code == 200 and "session" in ok.cookies


def test_wrong_password_and_unknown_user_look_the_same(client):
    register(client, "ana", "password123")
    wrong = client.post("/users/login", json={"username": "ana", "password": "wrong-pass"})
    ghost = client.post("/users/login", json={"username": "ghost", "password": "wrong-pass"})
    assert wrong.status_code == ghost.status_code == 401
    assert wrong.json() == ghost.json() == {"detail": "Wrong username or password"}


def test_invalid_input_is_rejected(client):
    for username, password in [("a", "password123"), ("ana smith", "password123"), ("ana", "short")]:
        assert register(client, username, password).status_code == 422, (username, password)


def test_me_needs_a_valid_session(client):
    headers = login(client, "bruno")
    assert client.get("/users/me", headers=headers).json()["username"] == "bruno"
    assert client.get("/users/me").status_code == 401
    assert client.get("/users/me", headers={"Cookie": "session=made-up"}).status_code == 401


def test_logout_ends_the_session(client):
    headers = login(client, "ana")
    assert client.post("/users/logout", headers=headers).status_code == 204
    assert client.get("/users/me", headers=headers).status_code == 401  # same token, now useless


def test_expired_session_is_refused(client, db):
    headers = login(client, "ana")
    db.query(LoginSession).one().expires_at = datetime.now() - timedelta(minutes=1)
    db.commit()
    assert client.get("/users/me", headers=headers).status_code == 401


def test_changes_require_login(client):
    # The brief: only authenticated users can manage their playlists and ratings
    assert client.post("/playlists", json={"name": "x"}).status_code == 401
    assert client.put("/ratings/603", json={"stars": 5}).status_code == 401
