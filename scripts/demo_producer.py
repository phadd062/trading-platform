import asyncio
import time
import random

from libs.contracts.events import Tick
from libs.eventbus.nats_bus import NatsEventBus


async def main():
    bus = NatsEventBus()
    await bus.connect()

    symbol = "SPY"
    last = 400.0

    while True:
        last += random.uniform(-0.2, 0.2)
        bid = last - 0.01
        ask = last + 0.01
        tick = Tick(
            symbol=symbol,
            ts_ms=int(time.time() * 1000),
            bid=bid,
            ask=ask,
            last=last,
            volume=random.uniform(0, 1000),
        )
        await bus.publish("ticks", tick)
        print(f"[producer] sent {symbol} last={last:.2f}")
        await asyncio.sleep(10)


if __name__ == "__main__":
    asyncio.run(main())
