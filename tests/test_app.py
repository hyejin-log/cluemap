"""[유지보수] 서버 라우팅 테스트 — `pytest` 로 실행해요."""

import pytest
from fastapi.testclient import TestClient

import app.main as server


@pytest.fixture
def client(tmp_path, monkeypatch):
    (tmp_path / "assets").mkdir()
    (tmp_path / "index.html").write_text("<title>ClueMap</title>", encoding="utf-8")
    (tmp_path / "assets" / "app.js").write_text("console.log(1)", encoding="utf-8")
    monkeypatch.setattr(server, "DIST", tmp_path.resolve())
    return TestClient(server.app)


def test_healthz(client):
    assert client.get("/healthz").json() == {"ok": True}


def test_index_and_spa_fallback(client):
    assert "ClueMap" in client.get("/").text
    assert "ClueMap" in client.get("/board").text


def test_static_asset_is_cached(client):
    response = client.get("/assets/app.js")
    assert response.status_code == 200
    assert "immutable" in response.headers["cache-control"]


def test_missing_file_and_path_traversal(client):
    assert client.get("/assets/none.js").status_code == 404
    assert client.get("/..%2F..%2Fetc%2Fpasswd").status_code in (404, 200)
    assert "root:" not in client.get("/..%2F..%2Fetc%2Fpasswd").text


def test_missing_build_returns_503(tmp_path, monkeypatch):
    monkeypatch.setattr(server, "DIST", tmp_path.resolve())
    assert TestClient(server.app).get("/").status_code == 503
