import os


def connection_string():
    user = os.getenv("POSTGRES_USER")
    password = os.getenv("POSTGRES_PASSWORD")
    host = os.getenv("POSTGRES_HOST")
    port = int(os.getenv("POSTGRES_PORT"))
    db = os.getenv("POSTGRES_DB")
    return f"postgresql://{user}:{password}@{host}:{port}/{db}"


DDL = """
CREATE TABLE IF NOT EXISTS event_log (
  id            BIGSERIAL PRIMARY KEY,
  event_id      TEXT NOT NULL,
  ts_ms         BIGINT NOT NULL,
  topic         TEXT NOT NULL,
  event_type    TEXT NOT NULL,
  strategy_id   TEXT NULL,
  intent_id     TEXT NULL,
  order_id      TEXT NULL,
  fill_id       TEXT NULL,
  symbol        TEXT NULL,
  payload       JSONB NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_event_log_event_id  ON event_log (event_id);
CREATE INDEX IF NOT EXISTS idx_event_log_ts_ms            ON event_log (ts_ms);
CREATE INDEX IF NOT EXISTS idx_event_log_topic            ON event_log (topic);
CREATE INDEX IF NOT EXISTS idx_event_log_strategy         ON event_log (strategy_id);
CREATE INDEX IF NOT EXISTS idx_event_log_intent           ON event_log (intent_id);
CREATE INDEX IF NOT EXISTS idx_event_log_order            ON event_log (order_id);
CREATE INDEX IF NOT EXISTS idx_event_log_symbol           ON event_log (symbol);
"""
