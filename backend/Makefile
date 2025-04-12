.PHONY: run
run:
	@uv run uvicorn "src.api.main:app" --reload

.PHONY: lint
lint:
	@uv run pyright && uv run ruff check .