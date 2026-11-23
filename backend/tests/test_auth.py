from tests.conftest import ADMIN_EMAIL, ADMIN_PASSWORD, announcement_payload


def test_login_success_returns_frontend_shape(client, admin_headers):
    res = client.post("/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert res.status_code == 200
    body = res.json()
    assert set(body) == {"token", "user"}
    assert body["user"] == {"email": ADMIN_EMAIL, "name": "Test Admin"}


def test_login_wrong_password_is_generic_401(client, admin_headers):
    res = client.post("/api/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong-password"})
    assert res.status_code == 401
    assert res.json() == {"message": "Invalid credentials", "code": "invalid_credentials"}


def test_login_unknown_email_same_error(client):
    res = client.post("/api/auth/login", json={"email": "nobody@umbb-test.com", "password": "whatever123"})
    assert res.status_code == 401
    assert res.json()["code"] == "invalid_credentials"


def test_login_is_rate_limited_after_5_failures(client, admin_headers):
    for _ in range(5):
        assert client.post("/api/auth/login", json={"email": ADMIN_EMAIL, "password": "bad"}).status_code == 401
    res = client.post("/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert res.status_code == 429


def test_login_validation_error_has_message(client):
    res = client.post("/api/auth/login", json={"email": "not-an-email", "password": "x"})
    assert res.status_code == 422
    assert "message" in res.json()


def test_write_routes_reject_missing_or_bad_token(client):
    assert client.post("/api/announcements", json=announcement_payload()).status_code == 401
    bad = {"Authorization": "Bearer not.a.valid.token"}
    assert client.post("/api/announcements", json=announcement_payload(), headers=bad).status_code == 401
    assert client.put("/api/announcements/1", json=announcement_payload(), headers=bad).status_code == 401
    assert client.delete("/api/announcements/1", headers=bad).status_code == 401


def test_status_all_requires_admin(client, admin_headers):
    assert client.get("/api/announcements?status=all").status_code == 401
    assert client.get("/api/announcements?status=all", headers=admin_headers).status_code == 200


def test_inactive_admin_token_is_rejected(client, admin_headers):
    from sqlalchemy import update
    from app.database.connection import SessionLocal
    from app.models import AdminUser

    with SessionLocal() as db:
        db.execute(update(AdminUser).values(is_active=False))
        db.commit()
    assert client.get("/api/announcements?status=all", headers=admin_headers).status_code == 401
