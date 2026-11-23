from sqlalchemy import text

from app.database.connection import engine

VALID = {"name": "Amina B.", "email": "amina@example.com", "subject": "Question", "message": "Bonjour, ma question est la suivante."}


def test_contact_message_is_stored(client):
    res = client.post("/api/contact", json=VALID)
    assert res.status_code == 201
    assert isinstance(res.json()["id"], str)
    with engine.connect() as conn:
        row = conn.execute(text("SELECT name, email, status FROM contact_messages")).one()
    assert row.name == "Amina B." and row.status == "new"


def test_contact_validation(client):
    assert client.post("/api/contact", json={**VALID, "email": "bad"}).status_code == 422
    assert client.post("/api/contact", json={**VALID, "message": "court"}).status_code == 422
    assert client.post("/api/contact", json={**VALID, "name": "   "}).status_code == 422


def test_contact_is_rate_limited(client):
    for _ in range(5):
        assert client.post("/api/contact", json=VALID).status_code == 201
    assert client.post("/api/contact", json=VALID).status_code == 429
