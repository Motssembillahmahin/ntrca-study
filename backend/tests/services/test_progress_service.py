import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.study import QuizSession
from app.services.progress_service import ProgressService


@pytest.fixture
def db_with_data():
    engine = create_engine(
        "sqlite:///:memory:", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    # ICT/Number Systems — 2 correct out of 3
    s1 = QuizSession(
        subject="ICT",
        subtopic="Number Systems",
        total_questions=3,
        correct_count=2,
    )
    db.add(s1)

    # Bangla/Grammar — 1 correct out of 5 (below 60% threshold)
    s2 = QuizSession(
        subject="Bangla",
        subtopic="Grammar: সন্ধি ও সমাস",
        total_questions=5,
        correct_count=1,
    )
    db.add(s2)
    db.commit()

    yield db
    db.close()


def test_get_stats_returns_correct_totals(db_with_data):
    svc = ProgressService(db_with_data)
    stats = svc.get_stats()

    assert stats.total_questions == 8
    assert stats.total_correct == 3


def test_get_stats_identifies_weak_areas(db_with_data):
    svc = ProgressService(db_with_data)
    stats = svc.get_stats()

    weak_subtopics = [w.subtopic for w in stats.weak_areas]
    assert "Grammar: সন্ধি ও সমাস" in weak_subtopics  # 20% — below threshold
    assert "Number Systems" not in weak_subtopics  # 67% — above threshold


def test_get_stats_empty_db():
    engine = create_engine(
        "sqlite:///:memory:", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    svc = ProgressService(db)
    stats = svc.get_stats()

    assert stats.total_questions == 0
    assert stats.overall_accuracy == 0.0
    assert stats.weak_areas == []
    db.close()
