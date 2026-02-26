import asyncio

from libs.contracts.events import Fill, Order, Side, Tick
from libs.eventbus.nats_bus import NatsEventBus
from libs.topics import TOPIC


class ExecutionSimulator:
    def __init__(self, bus):
        self.bus = bus
        self.latest_tick = {}

    async def tick_handler(self, tick):
        self.latest_tick[tick.symbol] = tick

    async def order_handler(self, order):
        tick = self.latest_tick.get(order.symbol)
        price = tick.ask if order.side == Side.BUY else tick.bid
        fill = Fill(
            order_id=order.order_id,
            strategy_id=order.strategy_id,
            symbol=order.symbol,
            side=order.side,
            quantity=order.quantity,
            price=price,
            fees=0.0,
        )

        await self.bus.publish(TOPIC.FILLS, fill)
        print(
            f"[exec] filled {order.side.value} {order.symbol} qty={order.quantity} @ {price:.2f} (order={order.order_id})"
        )


async def main():
    bus = NatsEventBus()
    execution_simulator = ExecutionSimulator(bus)
    await bus.connect()
    await bus.subscribe(TOPIC.TICKS, Tick, execution_simulator.tick_handler)
    await bus.subscribe(TOPIC.ORDERS, Order, execution_simulator.order_handler)
    close = asyncio.Event()
    await close.wait()


if __name__ == "__main__":
    asyncio.run(main())
