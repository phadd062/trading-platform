import asyncio
import time
import uuid

from libs.contracts.events import (Order, OrderIntent, PortfolioSnapshot,
                                   RiskDecision, Side, Tick)
from libs.eventbus.nats_bus import NatsEventBus
from libs.topics import TOPIC


class RiskEngine:
    def __init__(self, bus):
        self.bus = bus
        self.last_market_price = {}
        self.snapshots = {}

        self.kill_switch = set()
        self.max_abs_pos_per_symbol = 5.0
        self.max_gross_exposure = 10_000.0
        self.max_loss = -200.0

    async def on_tick(self, tick):
        self.last_market_price[tick.symbol] = tick.last

    async def portfolio_snapshot(self, portfolio_snapshot):
        self.snapshots[portfolio_snapshot.strategy_id] = portfolio_snapshot

    async def risk_gate(self, order_intent):
        reasons = []
        snapshot = self.snapshots.get(order_intent.strategy_id)
        reject = False

        if not snapshot:
            reject = True
            reasons.append("no_snapshot")

        if not reject and self.max_loss_calc(order_intent):
            reasons.append("max_loss")
        if not reject and self.max_pos(order_intent):
            reasons.append("max_pos")
        if not reject and self.max_exposure(order_intent):
            reasons.append("max_exposure")

        reject = len(reasons) > 0

        risk_decision = RiskDecision(
            ts_ms=int(time.time() * 1000),
            intent_id=order_intent.intent_id,
            approved=not reject,
            reasons=reasons,
            kill_switch=False,
        )

        await self.bus.publish(TOPIC.RISKDECISION, risk_decision)

        if reject:
            print(f"[risk] REJECT intent_id={order_intent.intent_id} reasons={reasons}")
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
        return self.max_abs_pos_per_symbol < abs(self.proposed_position(order_intent))

    def max_exposure(self, order_intent):
        net_exposure = (
            abs(self.proposed_position(order_intent))
            * self.last_market_price[order_intent.symbol]
        )
        return self.max_gross_exposure < net_exposure

    def max_loss_calc(self, order_intent):
        return self.snapshots[order_intent.strategy_id].net_pnl < self.max_loss

    def proposed_position(self, order_intent):
        if order_intent.side == Side.SELL:
            return (
                self.snapshots[order_intent.strategy_id].positions.get(
                    order_intent.symbol, 0.0
                )
                - order_intent.quantity
            )

        return (
            self.snapshots[order_intent.strategy_id].positions.get(
                order_intent.symbol, 0.0
            )
            + order_intent.quantity
        )


async def main():
    bus = NatsEventBus()
    risk = RiskEngine(bus)
    await bus.connect()
    await bus.subscribe(TOPIC.TICKS, Tick, risk.on_tick)
    await bus.subscribe(TOPIC.PORTFOLIO, PortfolioSnapshot, risk.portfolio_snapshot)
    await bus.subscribe(TOPIC.ORDERINTENT, OrderIntent, risk.risk_gate)
    stop = asyncio.Event()
    await stop.wait()


if __name__ == "__main__":
    asyncio.run(main())
