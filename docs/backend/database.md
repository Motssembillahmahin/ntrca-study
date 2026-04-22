# Backend — Database

SQLite database at `backend/data/study.db`. Managed via SQLAlchemy 2.0 ORM with `DeclarativeBase` and typed `Mapped`/`mapped_column` syntax.

The schema is created automatically on startup via `Base.metadata.create_all()` — no migrations needed.

---

## Schema

```
quiz_sessions
─────────────
id              INTEGER  PK  autoincrement
subject         TEXT     NOT NULL
subtopic        TEXT     NOT NULL
total_questions INTEGER  DEFAULT 0
correct_count   INTEGER  DEFAULT 0
created_at      DATETIME server_default=now()

questions
─────────
id              INTEGER  PK  autoincrement
session_id      INTEGER  FK → quiz_sessions.id  NOT NULL
question_text   TEXT     NOT NULL
options_json    TEXT     NOT NULL   (JSON array of 4 strings)
correct_idx     INTEGER  NOT NULL   (0–3)
explanation     TEXT     NOT NULL

answers
───────
id              INTEGER  PK  autoincrement
question_id     INTEGER  FK → questions.id  NOT NULL
user_answer_idx INTEGER  NOT NULL
is_correct      BOOLEAN  NOT NULL
answered_at     DATETIME server_default=now()

chat_messages
─────────────
id              INTEGER  PK  autoincrement
role            TEXT     NOT NULL   ('user' | 'assistant')
content         TEXT     NOT NULL
created_at      DATETIME server_default=now()
```

---

## Relationships

```
QuizSession  1 ──── * Question   (cascade delete)
Question     1 ──── 0..1 Answer
```

Deleting a `QuizSession` cascades to its `Question` rows. `Answer` rows are not cascaded from `Question` — this is intentional; answers are immutable records.

---

## Models

All models are in `app/models/study.py`.

### QuizSession

```python
class QuizSession(Base):
    __tablename__ = "quiz_sessions"
    id: Mapped[int]
    subject: Mapped[str]
    subtopic: Mapped[str]
    total_questions: Mapped[int]   # updated when session is created
    correct_count: Mapped[int]     # incremented on each correct answer
    created_at: Mapped[datetime]
    questions: Mapped[list["Question"]]
```

### Question

```python
class Question(Base):
    __tablename__ = "questions"
    id: Mapped[int]
    session_id: Mapped[int]
    question_text: Mapped[str]
    options_json: Mapped[str]    # raw JSON string
    correct_idx: Mapped[int]
    explanation: Mapped[str]

    @property
    def options(self) -> list[str]:   # deserializes options_json
        return json.loads(self.options_json)
```

`options_json` stores a JSON array as a plain TEXT column (e.g. `'["option A", "option B", "option C", "option D"]'`). The `.options` property deserializes it transparently so callers never deal with JSON strings directly.

### Answer

```python
class Answer(Base):
    __tablename__ = "answers"
    id: Mapped[int]
    question_id: Mapped[int]
    user_answer_idx: Mapped[int]
    is_correct: Mapped[bool]
    answered_at: Mapped[datetime]
```

### ChatMessage

```python
class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id: Mapped[int]
    role: Mapped[str]      # 'user' | 'assistant'
    content: Mapped[str]
    created_at: Mapped[datetime]
```

---

## Database Session

`app/database.py` exposes:

```python
def get_db():            # FastAPI dependency — yields a Session, closes on exit
def init_db() -> None:   # called at startup — creates all tables
```

The `engine` uses `check_same_thread=False` to allow SQLite to be used across threads in FastAPI's thread pool.
