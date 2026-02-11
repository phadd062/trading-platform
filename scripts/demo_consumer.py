import asyncio

from libs.contracts.events import Tick
from libs.eventbus.nats_bus import NatsEventBus
from libs.topics import TOPIC


async def handle_tick(t):
    print(f"[consumer] {t.symbol} last={t.last} bid={t.bid} ask={t.ask} ts={t.ts_ms}")


async def main():
    bus = NatsEventBus()
    await bus.connect()
    await bus.subscribe(TOPIC.TICKS, Tick, handle_tick)
    stop = asyncio.Event()
    await stop.wait()


if __name__ == "__main__":
    asyncio.run(main())
