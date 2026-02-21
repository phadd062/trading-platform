import asyncio
import random
import time
import uuid

from libs.contracts.events import OrderIntent, Side, Tick
from libs.eventbus.nats_bus import NatsEventBus
from libs.strategy_id import STRATEGYID
from libs.topics import TOPIC


class StrategyEngine:
    def __init__(self, bus):
        self.bus = bus
        self.last_price = {}

    async def tick_handler(self, tick):
        prev = self.last_price.get(tick.symbol)
        self.last_price[tick.symbol] = tick.last

        if prev is None:
            return

        delta = tick.last - prev
        threshold = 0.15

        if delta >= threshold:
            side = Side.BUY
        elif delta <= -threshold:
            side = Side.SELL
        else:
            return

        order_intent = OrderIntent(
            ts_ms=int(time.time() * 1000),
            intent_id=str(uuid.uuid4()),
            strategy_id=random.choice([STRATEGYID.MOMENTUM, STRATEGYID.RSI]),
            symbol=tick.symbol,
            side=side,
            quantity=1.0,
            order_type="MARKET",
            limit_price=None,
        )

        await self.bus.publish(TOPIC.ORDERINTENT, order_intent)
        print(
            f"[strategy] {side.value} {tick.symbol} delta={delta} -> intent_id={order_intent.intent_id}"
        )


async def main():
    bus = NatsEventBus()
    engine = StrategyEngine(bus)
    await bus.connect()
    await bus.subscribe(TOPIC.TICKS, Tick, engine.tick_handler)
    stop = asyncio.Event()
    await stop.wait()


if __name__ == "__main__":
    asyncio.run(main())
