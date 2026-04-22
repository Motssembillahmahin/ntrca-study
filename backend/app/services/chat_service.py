from sqlalchemy.orm import Session

from app.models.study import ChatMessage

HISTORY_LIMIT = 20


class ChatService:
    def __init__(self, db: Session) -> None:
        self._db = db

    def save_message(self, role: str, content: str) -> ChatMessage:
        msg = ChatMessage(role=role, content=content)
        self._db.add(msg)
        self._db.commit()
        return msg

    def get_history(self) -> list[dict]:
        messages = (
            self._db.query(ChatMessage)
            .order_by(ChatMessage.id.desc())
            .limit(HISTORY_LIMIT)
            .all()
        )
        return [{"role": m.role, "content": m.content} for m in reversed(messages)]

    def clear_history(self) -> None:
        self._db.query(ChatMessage).delete()
        self._db.commit()
