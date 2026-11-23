from tests.conftest import announcement_payload


def _create(client, headers, **overrides):
    res = client.post("/api/announcements", json=announcement_payload(**overrides), headers=headers)
    assert res.status_code == 201, res.text
    return res.json()


def test_create_returns_frontend_shape(client, admin_headers):
    created = _create(client, admin_headers)
    assert set(created) == {"id", "title", "content", "category", "status", "publishedAt"}
    assert isinstance(created["id"], str)
    assert created["title"] == {"fr": "Titre FR", "en": "Title EN"}
    assert created["publishedAt"] == "2026-11-20"
    assert "é è à" in created["content"]["fr"]  # accents conservés


def test_public_sees_only_published(client, admin_headers):
    _create(client, admin_headers, status="published")
    draft = _create(client, admin_headers, status="draft")
    public = client.get("/api/announcements").json()
    assert len(public) == 1 and public[0]["status"] == "published"
    assert client.get(f"/api/announcements/{draft['id']}").status_code == 404  # brouillon caché
    assert client.get(f"/api/announcements/{draft['id']}", headers=admin_headers).status_code == 200
    assert len(client.get("/api/announcements?status=all", headers=admin_headers).json()) == 2


def test_update_and_publish_toggle(client, admin_headers):
    created = _create(client, admin_headers, status="draft")
    new = announcement_payload(status="published", title={"fr": "Nouveau", "en": "New"}, category="exams")
    res = client.put(f"/api/announcements/{created['id']}", json=new, headers=admin_headers)
    assert res.status_code == 200
    assert res.json()["status"] == "published" and res.json()["category"] == "exams"
    assert client.get(f"/api/announcements/{created['id']}").status_code == 200


def test_delete(client, admin_headers):
    created = _create(client, admin_headers)
    assert client.delete(f"/api/announcements/{created['id']}", headers=admin_headers).status_code == 204
    assert client.get(f"/api/announcements/{created['id']}").status_code == 404
    assert client.delete(f"/api/announcements/{created['id']}", headers=admin_headers).status_code == 404


def test_validation_errors(client, admin_headers):
    bad_category = announcement_payload(category="nope")
    assert client.post("/api/announcements", json=bad_category, headers=admin_headers).status_code == 422
    empty_title = announcement_payload(title={"fr": "  ", "en": "x"})
    res = client.post("/api/announcements", json=empty_title, headers=admin_headers)
    assert res.status_code == 422 and "message" in res.json()
    bad_status = announcement_payload(status="archived")
    assert client.post("/api/announcements", json=bad_status, headers=admin_headers).status_code == 422
    bad_date = announcement_payload(publishedAt="2026-13-45")
    assert client.post("/api/announcements", json=bad_date, headers=admin_headers).status_code == 422


def test_search_filter_and_sorting(client, admin_headers):
    _create(client, admin_headers, title={"fr": "Examens de janvier", "en": "January exams"}, category="exams", publishedAt="2026-01-10")
    _create(client, admin_headers, title={"fr": "Journée portes ouvertes", "en": "Open day"}, category="events", publishedAt="2026-05-01")
    assert len(client.get("/api/announcements?category=exams").json()) == 1
    assert len(client.get("/api/announcements?q=ouvertes").json()) == 1
    assert len(client.get("/api/announcements?q=open").json()) == 1
    assert len(client.get("/api/announcements?q=100%25").json()) == 0  # % traité littéralement
    dates = [a["publishedAt"] for a in client.get("/api/announcements").json()]
    assert dates == sorted(dates, reverse=True)
    res = client.get("/api/announcements?limit=1")
    assert len(res.json()) == 1 and res.headers["X-Total-Count"] == "2"


def test_sql_injection_attempt_is_harmless(client, admin_headers):
    _create(client, admin_headers)
    res = client.get("/api/announcements", params={"q": "'; DROP TABLE announcements; --"})
    assert res.status_code == 200 and res.json() == []
    assert len(client.get("/api/announcements").json()) == 1
