from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app

MOCK_MCQ = [
    {
        "question": "Test Q",
        "options": ["A", "B", "C", "D"],
        "correct_idx": 0,
        "explanation": "A is correct.",
    }
]


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

    with patch("app.routers.quiz.ClaudeService") as mock_cls:
        mock_instance = MagicMock()
        mock_instance.generate_mcqs.return_value = MOCK_MCQ
        mock_cls.return_value = mock_instance
        yield TestClient(app)

    app.dependency_overrides.clear()


def test_start_quiz_returns_session_with_questions(client):
    resp = client.post(
        "/quiz/start",
        json={"subject": "ICT", "subtopic": "Number Systems", "count": 1},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["subject"] == "ICT"
    assert len(data["questions"]) == 1
    assert data["questions"][0]["question_text"] == "Test Q"


def test_submit_correct_answer_returns_is_correct_true(client):
    start = client.post(
        "/quiz/start",
        json={"subject": "ICT", "subtopic": "Number Systems", "count": 1},
    )
    session = start.json()
    question_id = session["questions"][0]["id"]

    resp = client.post(
        f"/quiz/{session['id']}/answer",
        json={"question_id": question_id, "answer_idx": 0},
    )
    assert resp.status_code == 200
    assert resp.json()["is_correct"] is True


def test_list_sessions_returns_created_session(client):
    client.post(
        "/quiz/start",
        json={"subject": "ICT", "subtopic": "Number Systems", "count": 1},
    )
    resp = client.get("/quiz/sessions")
    assert resp.status_code == 200
    assert len(resp.json()) == 1
