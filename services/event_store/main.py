import asyncio
import asyncpg
import json

from libs.contracts.events import (
    Fill,
    Order,
    OrderIntent,
    PortfolioSnapshot,
    RiskDecision,
    RiskStatus,
    Tick,
)
from libs.eventbus.nats_bus import NatsEventBus
from libs.topics import TOPIC
from libs.helper.postgres import connection_string, DDL


class EventStore:
    def __init__(self, bus: NatsEventBus):
        self.bus = bus
        self.pool = None

    async def connect_db(self):
        self.pool = await asyncpg.create_pool(
            connection_string(), min_size=1, max_size=5
        )
        async with self.pool.acquire() as connection:
            await connection.execute(DDL)

    async def write_to_postgres(self, topic, event):
        if self.pool is None:
            raise RuntimeError("DB pool not initialized")

        payload = event.model_dump()

        async with self.pool.acquire() as connection:
            await connection.execute(
                """
                INSERT INTO event_log (event_id, ts_ms, topic, event_type, strategy_id, intent_id, order_id, fill_id, symbol, payload)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
                ON CONFLICT (event_id) DO NOTHING;
                """,
                payload.get("event_id"),
                payload.get("ts_ms"),
                topic,
                payload.get("event_type"),
                payload.get("strategy_id"),
                payload.get("intent_id"),
                payload.get("order_id"),
                payload.get("fill_id"),
                payload.get("symbol"),
                json.dumps(payload),
            )

    async def on_tick(self, tick):
        await self.write_to_postgres(TOPIC.TICKS, tick)

    async def on_order_intent(self, order_intent):
        await self.write_to_postgres(TOPIC.ORDERINTENT, order_intent)

    async def on_risk_decision(self, risk_decision):
        await self.write_to_postgres(TOPIC.RISKDECISION, risk_decision)

    async def on_order(self, order):
        await self.write_to_postgres(TOPIC.ORDERS, order)

    async def on_fill(self, fill):
        await self.write_to_postgres(TOPIC.FILLS, fill)

    async def on_portfolio(self, portfolio_snapshot):
        await self.write_to_postgres(TOPIC.PORTFOLIO, portfolio_snapshot)

    async def on_risk_status(self, risk_status):
        await self.write_to_postgres(TOPIC.RISKSTATUS, risk_status)


async def main():
    bus = NatsEventBus()
    store = EventStore(bus)
    await bus.connect()
    await store.connect_db()
    await bus.subscribe(TOPIC.TICKS, Tick, store.on_tick)
    await bus.subscribe(TOPIC.ORDERINTENT, OrderIntent, store.on_order_intent)
    await bus.subscribe(TOPIC.RISKDECISION, RiskDecision, store.on_risk_decision)
    await bus.subscribe(TOPIC.ORDERS, Order, store.on_order)
    await bus.subscribe(TOPIC.FILLS, Fill, store.on_fill)
    await bus.subscribe(TOPIC.PORTFOLIO, PortfolioSnapshot, store.on_portfolio)
    await bus.subscribe(TOPIC.RISKSTATUS, RiskStatus, store.on_risk_status)
    stop = asyncio.Event()
    await stop.wait()


if __name__ == "__main__":
    asyncio.run(main())
