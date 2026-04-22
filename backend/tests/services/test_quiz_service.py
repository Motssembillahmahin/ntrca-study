from unittest.mock import MagicMock

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.study import QuizSession
from app.services.quiz_service import QuizService


@pytest.fixture
def db():
    engine = create_engine(
        "sqlite:///:memory:", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


@pytest.fixture
def mock_claude():
    svc = MagicMock()
    svc.generate_mcqs.return_value = [
        {
            "question": "What is 2 in binary?",
            "options": ["10", "01", "11", "00"],
            "correct_idx": 0,
            "explanation": "2 = 10 in binary.",
        }
    ]
    return svc


def test_create_session_saves_questions(db, mock_claude):
    svc = QuizService(db, mock_claude)
    session = svc.create_session("ICT", "Number Systems", 1)

    assert session.id is not None
    assert session.subject == "ICT"
    assert session.subtopic == "Number Systems"
    assert len(session.questions) == 1
    assert session.questions[0].question_text == "What is 2 in binary?"


def test_record_answer_updates_correct_count(db, mock_claude):
    svc = QuizService(db, mock_claude)
    session = svc.create_session("ICT", "Number Systems", 1)
    question_id = session.questions[0].id

    result = svc.record_answer(session.id, question_id, answer_idx=0)

    assert result.is_correct is True
    updated = db.get(QuizSession, session.id)
    assert updated.correct_count == 1


def test_record_wrong_answer_does_not_increment_correct_count(db, mock_claude):
    svc = QuizService(db, mock_claude)
    session = svc.create_session("ICT", "Number Systems", 1)
    question_id = session.questions[0].id

    result = svc.record_answer(session.id, question_id, answer_idx=1)

    assert result.is_correct is False
    updated = db.get(QuizSession, session.id)
    assert updated.correct_count == 0
