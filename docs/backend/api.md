# Backend — API Reference

Base URL: `http://localhost:8000`

---

## Health

### `GET /health`

Liveness check.

**Response**
```json
{"status": "ok"}
```

---

## Topics

### `GET /topics`

Returns the full subject → subtopic map used to populate the quiz picker.

**Response**
```json
{
  "ICT": ["Number Systems", "Logic Gates & Boolean Algebra", ...],
  "Bangla": ["Grammar: সন্ধি ও সমাস", ...],
  "English": ["Tenses", ...],
  "Math": ["Percentage & Ratio", ...],
  "GK": ["Bangladesh Constitution", ...]
}
```

---

## Quiz

### `POST /quiz/start`

Ask Claude to generate MCQs for a subject/subtopic and persist them as a session.

**Request body**
```json
{
  "subject": "ICT",
  "subtopic": "Number Systems",
  "count": 10
}
```

| Field | Type | Default | Description |
|---|---|---|---|
| subject | string | required | Must match a key in `/topics` |
| subtopic | string | required | Must match a subtopic under subject |
| count | int | 10 | Number of questions to generate |

**Response** — `QuizSessionSchema`
```json
{
  "id": 1,
  "subject": "ICT",
  "subtopic": "Number Systems",
  "total_questions": 10,
  "correct_count": 0,
  "created_at": "2026-04-22T18:00:00",
  "questions": [
    {
      "id": 1,
      "question_text": "What is the decimal value of binary 1010?",
      "options": ["8", "10", "12", "16"],
      "correct_idx": 1,
      "explanation": "1010 in binary = 1×8 + 0×4 + 1×2 + 0×1 = 10."
    }
  ]
}
```

**Errors**
- `422` — Claude returned malformed JSON or the subtopic is invalid

---

### `POST /quiz/{session_id}/answer`

Record a user's answer for a question and update the session's correct count.

**Request body**
```json
{
  "question_id": 1,
  "answer_idx": 1
}
```

**Response** — `AnswerResult`
```json
{
  "is_correct": true,
  "correct_idx": 1,
  "explanation": "1010 in binary = 10 in decimal."
}
```

---

### `GET /quiz/sessions`

List all past quiz sessions, newest first.

**Response** — `QuizSessionSchema[]`

---

## Stream (SSE)

Both stream endpoints return `Content-Type: text/event-stream`. Each event is a text chunk. The stream ends with `data: [DONE]\n\n`.

### `GET /stream/explain?question_id=&answer_idx=`

Stream a Claude explanation for a specific question and the user's chosen answer.

| Param | Type | Description |
|---|---|---|
| question_id | int | ID of the question |
| answer_idx | int | Index of the option the user selected |

**SSE events**
```
data: The correct answer is B.

data:  Binary 1010 means...

data: [DONE]
```

---

### `GET /stream/chat?message=`

Send a message to the NTRCA study assistant. Claude has access to the last 20 messages of chat history.

| Param | Type | Description |
|---|---|---|
| message | string | User's message |

The user message and assistant response are persisted to `chat_messages` after the stream completes.

---

## Progress

### `GET /progress`

Return aggregate study statistics across all recorded quiz sessions.

**Response** — `ProgressStats`
```json
{
  "total_questions": 80,
  "total_correct": 52,
  "overall_accuracy": 0.65,
  "topic_stats": [
    {
      "subject": "ICT",
      "subtopic": "Number Systems",
      "total": 30,
      "correct": 24,
      "accuracy": 0.8
    }
  ],
  "weak_areas": [
    {
      "subject": "Bangla",
      "subtopic": "Grammar: সন্ধি ও সমাস",
      "accuracy": 0.2
    }
  ]
}
```

`weak_areas` contains subtopics where accuracy < 60% and at least 3 questions have been attempted, sorted by accuracy ascending.
