# Architecture

## System Overview

```
Browser (React + Vite :5173)
    │
    ├── REST calls (fetch)      ──► FastAPI :8000
    │                                   │
    └── SSE streams (EventSource) ──►   ├── SQLite (study.db)
                                        │
                                        └── Anthropic API (claude-sonnet-4-6)
```

In Docker the frontend is served by nginx which also proxies `/api/*` to the backend, so there is only one exposed port in production.

## Request Flow

### Quiz Generation

```
POST /quiz/start
  → QuizRouter
    → QuizService.create_session()
      → ClaudeService.generate_mcqs()   # Anthropic API call
        ← JSON array of questions
      → persist QuizSession + Questions to SQLite
    ← QuizSessionSchema (JSON)
```

### Streamed Explanation

```
GET /stream/explain?question_id=1&answer_idx=2
  → StreamRouter
    → ClaudeService.stream_explanation()  # Anthropic streaming call
      ← async text chunks
    → StreamingResponse (text/event-stream)
      ← SSE: data: chunk\n\n ... data: [DONE]\n\n
```

### Streamed Chat

```
GET /stream/chat?message=...
  → StreamRouter
    → ChatService.get_history()
    → ClaudeService.stream_chat()         # Anthropic streaming call
      ← async text chunks
    → accumulates full response
    → ChatService.save_message() × 2 (user + assistant)
    ← SSE stream
```

## Layer Separation

| Layer | Responsibility | Location |
|---|---|---|
| Routers | HTTP routing, request parsing, response shaping | `app/routers/` |
| Services | All business logic | `app/services/` |
| Models | ORM table definitions | `app/models/` |
| Schemas | Pydantic I/O contracts | `app/schemas/` |
| Prompts | Claude prompt templates | `app/prompts/` |

Routers contain no business logic. All logic lives in services. This keeps routers thin and services independently testable.

## Technology Choices

| Decision | Choice | Reason |
|---|---|---|
| Streaming | SSE (EventSource) | Simpler than WebSocket for one-way server→client text |
| Database | SQLite | Zero setup; suitable for a single-user local app |
| ORM | SQLAlchemy 2.0 | Typed `Mapped`/`mapped_column`, async-compatible |
| Package manager | uv | Fast, lockfile-based, replaces pip+venv |
| Prompt caching | `cache_control: ephemeral` | Reduces latency and cost on repeated sessions |
| Template strings | `.replace()` not `.format()` | Prompt templates contain JSON `{}`; `.format()` raises `KeyError` |
