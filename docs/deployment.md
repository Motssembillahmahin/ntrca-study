# Deployment

---

## Environment Variables

Create `.env` in the project root (copy from `.env.example`):

| Variable | Required | Default | Description |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | yes | — | Anthropic API key (`sk-ant-...`) |
| `DATABASE_URL` | no | `sqlite:///./data/study.db` | SQLite file path |

The backend reads these via pydantic-settings (`app/config.py`). The `.env` file at the project root is mounted into the backend container via `env_file` in docker-compose.

---

## Docker

### Services

```yaml
backend:   port 8000
frontend:  port 5173 (dev) / 80 (nginx prod)
```

The SQLite database is stored in a named Docker volume `ntrca-data` mounted at `/app/data` in the backend container. This persists study data across container restarts.

### Commands

```bash
make build   # docker compose build
make up      # docker compose up -d  (detached)
make dev     # docker compose up --build  (foreground, live reload)
make down    # docker compose down
make logs    # docker compose logs -f
```

### Backend Dockerfile

```dockerfile
FROM python:3.12-slim
WORKDIR /app
RUN pip install uv
COPY pyproject.toml uv.lock ./
RUN uv sync --no-dev
COPY app/ ./app/
RUN mkdir -p data
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

`RUN mkdir -p data` ensures the SQLite directory exists before the app starts — without this, SQLite cannot create the database file.

### Frontend Dockerfile

The frontend is built with `npm run build` and served via nginx. The nginx config proxies `/api/*` to the backend container, mirroring the Vite dev proxy.

---

## Running Without Docker

```bash
# Backend
cd backend
mkdir -p data
ANTHROPIC_API_KEY=sk-ant-... uv run uvicorn app.main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm run dev
```

---

## Makefile Reference

| Command | Description |
|---|---|
| `make install` | `uv sync` (backend) + `npm install` (frontend) |
| `make dev` | `docker compose up --build` (foreground) |
| `make up` | `docker compose up -d` (detached) |
| `make down` | `docker compose down` |
| `make build` | `docker compose build` |
| `make logs` | `docker compose logs -f` |
| `make test` | `uv run pytest -v` |
| `make lint` | `uv run ruff check .` |
| `make format` | `uv run ruff format .` |
| `make shell-backend` | Open bash shell inside the backend container |

---

## Production Considerations

- **SQLite** is suitable for a single-user local app. For a multi-user deployment, replace it with PostgreSQL and update `DATABASE_URL`.
- **HTTPS** — put a reverse proxy (nginx/Caddy) in front if exposing publicly.
- **API key security** — never commit `.env` to git. It is listed in `.gitignore`.
