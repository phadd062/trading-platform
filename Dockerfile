FROM python:3.14-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

COPY pyproject.toml uv.lock /app/
RUN uv sync --no-dev --frozen

COPY libs/ ./libs/
COPY services/ ./services/

ENV PYTHONPATH=/app
ENV PATH="/app/.venv/bin:$PATH"

CMD ["python", "-m", "services.api.main"]
