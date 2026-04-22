import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app


@pytest.fixture
def client(tmp_path):
    db_url = f"sqlite:///{tmp_path}/test.db"
    test_engine = create_engine(db_url, connect_args={"check_same_thread": False})
    TestSession = sessionmaker(bind=test_engine)
    Base.metadata.create_all(test_engine)

    def override_db():
        db = TestSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_db
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_get_progress_empty_returns_zeros(client):
    resp = client.get("/progress")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_questions"] == 0
    assert data["overall_accuracy"] == 0.0
    assert data["weak_areas"] == []


def test_topics_returns_all_subjects(client):
    resp = client.get("/topics")
    assert resp.status_code == 200
    data = resp.json()
    assert "ICT" in data
    assert "Bangla" in data
    assert len(data["ICT"]) > 0
