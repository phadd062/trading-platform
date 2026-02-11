import asyncio
import time
import uuid

from libs.contracts.events import PortfolioSnapshot, OrderIntent, Order
from libs.eventbus.nats_bus import NatsEventBus
from libs.topics import TOPIC


class RiskEngine:
    def __init__(self, bus):
        self.bus = bus

        self.positions = {}
        self.average_cost = {}
        self.net_pnl = 0.0

        self.kill_switch = {}
        self.max_abs_pos_per_symbol = 17.0
        self.max_gross_exposure = 10_000.0
        self.max_loss = -200.0

    async def portfolio_snapshot(self, portfolio_snapshot):
        self.positions = portfolio_snapshot.positions
        self.average_cost = portfolio_snapshot.average_cost
        self.net_pnl = portfolio_snapshot.net_pnl

    async def risk_gate(self, order_intent):
        reject = (
            self.max_pos(order_intent)
            and self.max_exposure(order_intent)
            and self.max_loss_calc()
        )

        if reject:
            print(
                f"[risk] REJECT intent_id={order_intent.intent_id} -> order_id={order.order_id}"
            )
            return

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

    def max_pos(self, order_intent):
        return (
            self.max_abs_pos_per_symbol
            > self.positions.get(order_intent.strategy_id, {}).get(
                order_intent.symbol, 0.0
            )
            + order_intent.quantity
        )

    def max_exposure(self, order_intent):
        net_expore = sum(self.average_cost.get(order_intent.strategy_id, {}).values())
        return self.max_gross_exposure < net_expore

    def max_loss_calc(self):
        return self.net_pnl < -self.max_loss


async def main():
    bus = NatsEventBus()
    risk = RiskEngine(bus)
    await bus.connect()
    await bus.subscribe(TOPIC.PORTFOLIO, PortfolioSnapshot, risk.portfolio_snapshot)
    await bus.subscribe(TOPIC.ORDERINTENT, OrderIntent, risk.risk_gate)
    stop = asyncio.Event()
    await stop.wait()


if __name__ == "__main__":
    asyncio.run(main())
