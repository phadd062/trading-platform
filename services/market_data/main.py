import asyncio
import random
import time

from libs.contracts.events import Tick
from libs.eventbus.nats_bus import NatsEventBus
from libs.topics import TOPIC


class MarketData:
    def __init__(self, bus):
        self.bus = bus
        self.symbols = ["SPY", "AAPL", "TSLA"]
        self.last = {
            symbol: 100.0 + idx * 10 for idx, symbol in enumerate(self.symbols)
        }

    async def run_market_data(self):
        while True:
            for symbol in self.symbols:
                self.last[symbol] += random.uniform(-0.2, 0.2)
                bid = self.last[symbol] - 0.01
                ask = self.last[symbol] + 0.01
                tick = Tick(
                    symbol=symbol,
                    ts_ms=int(time.time() * 1000),
                    bid=bid,
                    ask=ask,
                    last=self.last[symbol],
                    volume=random.uniform(0, 1000),
                )
                await self.bus.publish(TOPIC.TICKS, tick)
                print(f"[producer] sent {symbol} last={self.last[symbol]:.2f}")
            await asyncio.sleep(10)


async def main():
    bus = NatsEventBus()
    market_data = MarketData(bus)
    await bus.connect()
    await market_data.run_market_data()


if __name__ == "__main__":
    asyncio.run(main())
