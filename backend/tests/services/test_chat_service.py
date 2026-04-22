import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.services.chat_service import ChatService


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


def test_save_and_get_history(db):
    svc = ChatService(db)
    svc.save_message("user", "What is OSI model?")
    svc.save_message("assistant", "OSI has 7 layers.")

    history = svc.get_history()

    assert len(history) == 2
    assert history[0]["role"] == "user"
    assert history[1]["role"] == "assistant"


def test_history_capped_at_20_messages(db):
    svc = ChatService(db)
    for i in range(25):
        svc.save_message("user", f"message {i}")

    history = svc.get_history()
    assert len(history) == 20


def test_clear_history(db):
    svc = ChatService(db)
    svc.save_message("user", "hello")
    svc.clear_history()

    assert svc.get_history() == []
