# Getting Started

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Python | 3.12+ | Backend runtime |
| uv | latest | Python package manager |
| Node.js | 18+ | Frontend runtime |
| Docker | 24+ | Container orchestration |
| Anthropic API key | — | Claude AI |

## Installation

### 1. Clone and configure environment

```bash
git clone https://github.com/Motssembillahmahin/ntrca-study
cd ntrca-study
cp .env.example .env
```

Edit `.env` and set your key:

```env
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=sqlite:///./data/study.db
```

### 2. Install dependencies

```bash
make install
```

This runs `uv sync` in `backend/` and `npm install` in `frontend/`.

## Running Locally

### Option A — Docker (recommended)

```bash
make dev        # build and start both services with live reload
```

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`

### Option B — Without Docker

```bash
# Terminal 1 — Backend
cd backend
mkdir -p data
ANTHROPIC_API_KEY=your-key uv run uvicorn app.main:app --reload

# Terminal 2 — Frontend
cd frontend
npm run dev
```

## Verifying the Setup

```bash
curl http://localhost:8000/health
# → {"status":"ok"}

curl http://localhost:8000/topics
# → {"ICT": [...], "Bangla": [...], ...}
```

## Running Tests

```bash
make test
# → 16 passed
```

## Linting and Formatting

```bash
make lint       # ruff check
make format     # ruff format
```
