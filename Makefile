.PHONY: install dev test lint format build up down logs shell-backend

install:
	cd backend && uv sync
	cd frontend && npm install

dev:
	docker compose up --build

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

test:
	cd backend && uv run pytest -v

lint:
	cd backend && uv run ruff check .

format:
	cd backend && uv run ruff format .

shell-backend:
	docker compose exec backend bash
