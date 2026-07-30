FROM python:3.14-slim

WORKDIR /app

COPY pyproject.toml uv.lock /app/
RUN uv sync --no-dev

COPY libs/ ./libs/
COPY services/ ./services/

ENV PYTHONPATH=/app

CMD ["python", "-m", "services.api.main"] 
