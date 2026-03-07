import asyncio
import json
import os
import uuid

import asyncpg

from libs.contracts.events import Tick
from libs.eventbus.nats_bus import NatsEventBus
from libs.helper.postgres import connection_string
from libs.topics import TOPIC


class ReplayMarketData:
    def __init__(self, bus):
        self.bus = bus
        self.pool = None

    async def connect_db(self):
        self.pool = await asyncpg.create_pool(
            connection_string(),
            min_size=1,
            max_size=5,
        )
        print("[replay_market_data] connected to postgres")

    async def run_replay_market_data(self):
        if self.pool is None:
            raise RuntimeError("DB pool not initialized")

        start_ts_ms = int(os.getenv("REPLAY_START_TS_MS", 0))
        end_ts_ms = int(os.getenv("REPLAY_END_TS_MS", 0))
        speed = float(os.getenv("REPLAY_SPEED", 1.0))
        limit = int(os.getenv("REPLAY_LIMIT", 0))

        if start_ts_ms <= 0 or end_ts_ms <= 0:
            raise ValueError("REPLAY_START_TS_MS and REPLAY_END_TS_MS must be set")
        if end_ts_ms < start_ts_ms:
            raise ValueError("REPLAY_END_TS_MS must be >= REPLAY_START_TS_MS")
        if speed <= 0:
            raise ValueError("REPLAY_SPEED must be > 0")

        sql = """
        SELECT payload FROM event_log
        WHERE topic = $1 AND ts_ms BETWEEN $2 AND $3
        ORDER BY ts_ms ASC
        """

        published = 0
        previous_ts_ms = None

        async with self.pool.acquire() as connection:
            async with connection.transaction():
                async for row in connection.cursor(
                    sql, TOPIC.TICKS, start_ts_ms, end_ts_ms
                ):
                    payload = row["payload"]
                    if isinstance(payload, str):
                        payload = json.loads(payload)

                    tick = Tick.model_validate(payload)
                    tick = tick.model_copy(update={"event_id": str(uuid.uuid4())})

                    if previous_ts_ms:
                        delta_ms = tick.ts_ms - previous_ts_ms
                        if delta_ms > 0:
                            await asyncio.sleep((delta_ms / 1000.0) / speed)

                    previous_ts_ms = tick.ts_ms
                    await self.bus.publish(TOPIC.TICKS, tick)

                    published += 1
                    if published % 100 == 0:
                        print(f"[replay_market_data] published {published} ticks")

                    if limit > 0 and published >= limit:
                        print(f"[replay_market_data] reached limit={limit}")
                        break

        print(f"[replay_market_data] finished, published={published}")


async def main():
    bus = NatsEventBus()
    replay_market_data = ReplayMarketData(bus)
    await bus.connect()
    await replay_market_data.connect_db()
    await replay_market_data.run_replay_market_data()
    stop = asyncio.Event()
    await stop.wait()


if __name__ == "__main__":
    asyncio.run(main())
