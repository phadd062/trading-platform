import asyncio
import time
import uuid

from libs.contracts.events import OrderIntent, Order
from libs.eventbus.nats_bus import NatsEventBus
from libs.topics import TOPIC


class RiskEngine:
    def __init__(self, bus):
        self.bus = bus
        
        self.max_abs_pos_per_symbol = 5.0
        self.max_gross_exposure = 10_000.0
        self.max_loss = -200.0
        self.last_price = {}
        self.last_status = {}

    async def risk_gate(self, order_intent):
        order = Order(
            ts_ms=int(time.time() * 1000),
            order_id=str(uuid.uuid4()),
            intent_id=order_intent.intent_id,
            strategy_id=order_intent.strategy_id,
            symbol=order_intent.symbol,
            side=order_intent.side,
            quantity=order_intent.quantity,
            order_type=order_intent.order_type,
            limit_price=order_intent.limit_price,
        )
        await self.bus.publish(TOPIC.ORDERS, order)
        print(
            f"[risk] APPROVE intent_id={order_intent.intent_id} -> order_id={order.order_id}"
        )


async def main():
    bus = NatsEventBus()
    risk = RiskEngine(bus)
    await bus.connect()
    await bus.subscribe(TOPIC.ORDERINTENT, OrderIntent, risk.risk_gate)
    stop = asyncio.Event()
    await stop.wait()


if __name__ == "__main__":
    asyncio.run(main())
