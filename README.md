# NTRCA Study Dashboard

AI-powered exam preparation dashboard for the NTRCA (Non-Government Teachers' Registration and Certification Authority) ICT subject exam in Bangladesh.

Built with **FastAPI**, **React**, and **Claude** (`claude-sonnet-4-6`).

---

## Features

- **AI Quiz Generation** — Claude generates NTRCA-style MCQs for any subject and subtopic on demand
- **Streaming Explanations** — after each answer, a Claude explanation streams in real time via SSE
- **Study Chat** — persistent chat assistant pre-loaded with NTRCA exam context
- **Progress Tracking** — per-topic accuracy charts and automatic weak area detection (< 60% threshold)
- **Dashboard** — overview of study progress with subject-level accuracy rings

## Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, SQLAlchemy 2.0, SQLite |
| AI | Anthropic SDK (`claude-sonnet-4-6`), prompt caching, SSE streaming |
| Frontend | React 18, Vite, TypeScript, Recharts |
| Packaging | uv (backend), npm (frontend) |
| Infrastructure | Docker, docker-compose |

## Quick Start

### Prerequisites

- Python 3.12+, [uv](https://docs.astral.sh/uv/), Node.js 18+, Docker
- An [Anthropic API key](https://console.anthropic.com/)

### Run with Docker

```bash
git clone https://github.com/Motssembillahmahin/ntrca-study
cd ntrca-study

cp .env.example .env
# edit .env and set ANTHROPIC_API_KEY=sk-ant-...

make install   # install backend + frontend dependencies
make dev       # build and start both services
```

Open `http://localhost:5173`.

### Run without Docker

```bash
# Terminal 1 — backend
cd backend
mkdir -p data
ANTHROPIC_API_KEY=sk-ant-... uv run uvicorn app.main:app --reload

# Terminal 2 — frontend
cd frontend
npm run dev
```

## Project Structure

```
ntrca-study/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, lifespan, CORS
│   │   ├── config.py          # pydantic-settings (env vars)
│   │   ├── database.py        # SQLAlchemy engine, session, init
│   │   ├── models/            # ORM models (QuizSession, Question, Answer, ChatMessage)
│   │   ├── schemas/           # Pydantic I/O schemas
│   │   ├── services/          # All business logic (Claude, Quiz, Progress, Chat, Topics)
│   │   ├── routers/           # HTTP routing only (quiz, stream, progress, topics)
│   │   └── prompts/           # Claude prompt templates
│   └── tests/                 # 16 unit + integration tests
├── frontend/
│   └── src/
│       ├── pages/             # Dashboard, Quiz, Progress
│       ├── components/        # QuizCard, ChatSidebar, ProgressRing
│       ├── api/               # fetch wrappers
│       └── hooks/             # useStream (SSE)
├── docs/                      # Full project documentation
├── docker-compose.yml
├── Makefile
└── .env.example
```

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Liveness check |
| GET | `/topics` | Subject → subtopic map |
| POST | `/quiz/start` | Generate MCQs via Claude |
| POST | `/quiz/{id}/answer` | Record answer |
| GET | `/quiz/sessions` | List past sessions |
| GET | `/stream/explain` | SSE: stream explanation |
| GET | `/stream/chat` | SSE: stream chat reply |
| GET | `/progress` | Aggregate study stats |

## Development

```bash
make test      # run 16 pytest tests
make lint      # ruff check
make format    # ruff format
make logs      # docker compose logs -f
```

## Documentation

Full documentation is in the [`/docs`](./docs/README.md) directory:

- [Getting Started](./docs/getting-started.md)
- [Architecture](./docs/architecture.md)
- [Backend — API Reference](./docs/backend/api.md)
- [Backend — Services](./docs/backend/services.md)
- [Backend — Database](./docs/backend/database.md)
- [Backend — Claude Integration](./docs/backend/claude.md)
- [Frontend — Pages](./docs/frontend/pages.md)
- [Frontend — Components](./docs/frontend/components.md)
- [Frontend — API Layer](./docs/frontend/api-layer.md)
- [Deployment](./docs/deployment.md)
