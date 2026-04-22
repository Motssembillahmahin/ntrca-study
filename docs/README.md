# NTRCA Study Dashboard — Documentation

AI-powered study dashboard for NTRCA ICT exam preparation. Built with FastAPI, React, and Claude (Anthropic).

## Table of Contents

| Document | Description |
|---|---|
| [Getting Started](./getting-started.md) | Installation, environment setup, running locally |
| [Architecture](./architecture.md) | System design, data flow, stack decisions |
| [Backend — API](./backend/api.md) | All HTTP endpoints, request/response schemas |
| [Backend — Services](./backend/services.md) | Business logic layer (Quiz, Progress, Chat, Claude, Topics) |
| [Backend — Database](./backend/database.md) | ORM models, schema, relationships |
| [Backend — Claude Integration](./backend/claude.md) | Anthropic SDK usage, prompt caching, streaming |
| [Frontend — Pages](./frontend/pages.md) | Dashboard, Quiz, Progress pages |
| [Frontend — Components](./frontend/components.md) | QuizCard, ChatSidebar, ProgressRing |
| [Frontend — API Layer](./frontend/api-layer.md) | Fetch functions, useStream SSE hook |
| [Deployment](./deployment.md) | Docker, environment variables, Makefile reference |

## Quick Start

```bash
cp .env.example .env          # add your ANTHROPIC_API_KEY
make install                  # install backend + frontend deps
make dev                      # start both services via Docker
```

App runs at `http://localhost:5173`.
