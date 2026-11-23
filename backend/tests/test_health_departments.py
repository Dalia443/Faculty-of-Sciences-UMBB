def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok", "database": "connected"}


def test_departments_list_matches_frontend_shape(client):
    res = client.get("/api/departments")
    assert res.status_code == 200
    data = res.json()
    assert [d["slug"] for d in data] == [
        "mathematics", "physics", "chemistry", "computer-science", "biology", "foreign-languages",
    ]
    first = data[0]
    assert set(first) == {"id", "slug", "name", "description", "overview"}
    assert isinstance(first["id"], str)
    assert first["name"] == {"fr": "Mathématiques", "en": "Mathematics"}


def test_department_by_id_and_404(client):
    first_id = client.get("/api/departments").json()[0]["id"]
    assert client.get(f"/api/departments/{first_id}").status_code == 200
    res = client.get("/api/departments/99999")
    assert res.status_code == 404
    assert res.json()["message"] == "Department not found"
    assert client.get("/api/departments/abc").status_code == 404


def test_departments_are_read_only(client, admin_headers):
    assert client.post("/api/departments", json={}, headers=admin_headers).status_code == 405
    assert client.delete("/api/departments/1", headers=admin_headers).status_code == 405
