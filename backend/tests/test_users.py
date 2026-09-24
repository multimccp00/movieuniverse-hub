def test_login_creates_user_once(client):
    first = client.post("/users/login", json={"username": "ana"}).json()
    again = client.post("/users/login", json={"username": "ana"}).json()
    assert first == again  # same id: logging in twice does not duplicate


def test_username_is_trimmed_and_lowercased(client):
    a = client.post("/users/login", json={"username": "ana"}).json()
    b = client.post("/users/login", json={"username": "  ANA "}).json()
    assert a["id"] == b["id"]
    assert b["username"] == "ana"


def test_invalid_usernames_are_rejected(client):
    for bad in ["", "a", "x" * 31, "ana smith", "ana!"]:
        response = client.post("/users/login", json={"username": bad})
        assert response.status_code == 422, bad  # 422 = invalid input


def test_me_returns_logged_in_user(client):
    client.post("/users/login", json={"username": "bruno"})
    response = client.get("/users/me", headers={"X-User": "bruno"})
    assert response.status_code == 200
    assert response.json()["username"] == "bruno"


def test_me_without_or_with_unknown_user_is_401(client):
    assert client.get("/users/me").status_code == 401
    assert client.get("/users/me", headers={"X-User": "ghost"}).status_code == 401
