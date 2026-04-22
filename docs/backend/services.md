# Backend — Services

All business logic lives in `backend/app/services/`. Routers delegate to services and contain no logic themselves.

---

## ClaudeService

`app/services/claude_service.py`

Wraps the Anthropic SDK. Responsible for all Claude API calls.

**Constructor**
```python
ClaudeService(api_key: str)
```
Loads the system prompt from `app/prompts/system.txt` and the MCQ template from `app/prompts/quiz_gen.txt` at init time.

**Methods**

### `generate_mcqs(subject, subtopic, count) → list[dict]`

Calls Claude synchronously and returns a list of question dicts.

Each dict has:
```python
{
    "question": str,
    "options": list[str],   # exactly 4 items
    "correct_idx": int,     # 0–3
    "explanation": str,
}
```

Raises `ValueError` if Claude returns invalid JSON.

Template substitution uses `.replace()` (not `.format()`) because the prompt template contains raw JSON `{}` braces that would conflict with Python's string `.format()`.

### `stream_explanation(question_text, options, correct_idx, answer_idx) → AsyncGenerator[str]`

Streams a Claude explanation for a question. Yields text chunks as they arrive from the API.

### `stream_chat(message, history) → AsyncGenerator[str]`

Streams a chat reply. `history` is a list of `{"role": ..., "content": ...}` dicts (last 20 messages from `ChatService`).

**Prompt caching**

The system prompt block carries `cache_control: {"type": "ephemeral"}`. On repeated calls within a session Claude skips re-processing the ~2000-token system prompt, reducing latency and API cost.

---

## QuizService

`app/services/quiz_service.py`

Manages quiz sessions and answer recording.

**Constructor**
```python
QuizService(db: Session, claude: ClaudeService)
```

**Methods**

### `create_session(subject, subtopic, count) → QuizSession`

1. Calls `ClaudeService.generate_mcqs()` to get questions from Claude
2. Persists a `QuizSession` row
3. Persists one `Question` row per question (options stored as JSON string)
4. Returns the session with all questions loaded

### `record_answer(session_id, question_id, answer_idx) → AnswerResult`

1. Checks `answer_idx == question.correct_idx`
2. Persists an `Answer` row
3. Increments `QuizSession.correct_count` if correct
4. Returns `AnswerResult` with correctness, the correct index, and explanation

### `list_sessions() → list[QuizSession]`

Returns all sessions ordered by `created_at` descending.

---

## ProgressService

`app/services/progress_service.py`

Computes aggregate statistics from all `QuizSession` rows.

**Constructor**
```python
ProgressService(db: Session)
```

**Constants**
```python
WEAK_AREA_THRESHOLD = 0.60        # accuracy below this → weak area
MIN_QUESTIONS_FOR_WEAK_AREA = 3   # need enough data before flagging
```

**Methods**

### `get_stats() → ProgressStats`

Aggregates all sessions into per-(subject, subtopic) buckets, then computes:
- `total_questions`, `total_correct`, `overall_accuracy`
- `topic_stats` — one `TopicStat` per unique (subject, subtopic) pair
- `weak_areas` — subtopics below threshold with enough attempts, sorted by accuracy ascending

Returns a zeroed `ProgressStats` if the database is empty.

---

## ChatService

`app/services/chat_service.py`

Persists and retrieves conversational history for the study chat assistant.

**Constructor**
```python
ChatService(db: Session)
```

**Constants**
```python
HISTORY_LIMIT = 20   # max messages sent to Claude as context
```

**Methods**

### `save_message(role, content) → ChatMessage`

Persists a single message. `role` is `"user"` or `"assistant"`.

### `get_history() → list[dict]`

Returns the last 20 messages ordered chronologically (oldest first). Ordered by `id` (not `created_at`) to avoid non-deterministic ordering when two messages share the same timestamp.

### `clear_history() → None`

Deletes all chat messages.

---

## TopicsService

`app/services/topics_service.py`

Static registry of exam subjects and subtopics. No database dependency.

**Functions**

### `get_all_topics() → dict[str, list[str]]`

Returns the full `TOPICS` dict.

### `is_valid_subtopic(subject, subtopic) → bool`

Returns `True` if the subtopic exists under the given subject.

**Subjects and subtopics**

| Subject | Subtopics |
|---|---|
| ICT | Number Systems, Logic Gates & Boolean Algebra, Networking & OSI Model, Database & SQL, OOP Concepts, Web (HTML & CSS), Computer Organization, Programming Basics, ICT Act & Digital Bangladesh |
| Bangla | Grammar: সন্ধি ও সমাস, Grammar: কারক ও বিভক্তি, Literature Basics, Proverbs & Idioms |
| English | Tenses, Voice Change, Narration, Parts of Speech, Vocabulary & Synonyms |
| Math | Percentage & Ratio, Profit & Loss, Algebra, Geometry |
| GK | Bangladesh Constitution, Liberation War 1971, Current Affairs, International Affairs |
