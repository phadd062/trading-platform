import asyncio

from libs.contracts.events import Fill, PortfolioSnapshot, Side, Tick
from libs.eventbus.nats_bus import NatsEventBus
from libs.strategy_id import STRATEGYID
from libs.topics import TOPIC

from collections import defaultdict


class PortfolioService:
    def __init__(self, bus):
        self.bus = bus
        self.position_state = defaultdict(dict)
        self.average_cost_state = {}
        self.realized_pnl_state = {}
        self.last_market_price = {}

    async def on_tick(self, tick):
        self.last_market_price[tick.symbol] = tick.last

        for strategy, position in self.position_state.items():
            if position.get(tick.symbol, 0.0) != 0.0:
                await self.publish_portfolio_snapshot(strategy, tick.symbol)

    async def on_fill(self, fill):
        strategy_id = fill.strategy_id
        symbol = fill.symbol
        quantity = fill.quantity if fill.side == Side.BUY else -fill.quantity
        fill_price = fill.price

        previous_position, new_position = self.compute_position_state(
            strategy_id, symbol, quantity
        )
        previous_average_cost = self.compute_average_cost_state(
            strategy_id, symbol, quantity, fill_price, previous_position, new_position
        )
        self.compute_realized_pnl_state(
            strategy_id,
            symbol,
            quantity,
            fill_price,
            previous_position,
            previous_average_cost,
        )
        await self.publish_portfolio_snapshot(strategy_id, symbol)

    async def publish_initial(self, strategy_id):
        portfolio_snapshot = PortfolioSnapshot(
            strategy_id=strategy_id,
            positions={},
            average_cost={},
            realized_pnl=0.0,
            unrealized_pnl=0.0,
            net_pnl=0.0,
        )
        await self.bus.publish(TOPIC.PORTFOLIO, portfolio_snapshot)
        print(f"[portfolio] initial snapshot published strategy_id={strategy_id}")

    async def publish_portfolio_snapshot(self, strategy_id, symbol):
        positions = dict(self.position_state.get(strategy_id, {}))
        average_cost = dict(self.average_cost_state.get(strategy_id, {}))

        realized_pnl = sum(self.realized_pnl_state.get(strategy_id, {}).values())
        unrealized_pnl = self.compute_unrealized_pnl_state(strategy_id, symbol)
        net_pnl = realized_pnl + unrealized_pnl

        portfolio_snapshot = PortfolioSnapshot(
            strategy_id=strategy_id,
            positions=positions,
            average_cost=average_cost,
            realized_pnl=realized_pnl,
            unrealized_pnl=unrealized_pnl,
            net_pnl=net_pnl,
        )

        await self.bus.publish(TOPIC.PORTFOLIO, portfolio_snapshot)
        print(
            f"[portfolio] {strategy_id} net_pnl={net_pnl} realized={realized_pnl} unreal={unrealized_pnl}"
        )

    def compute_position_state(self, strategy_id, symbol, quantity):
        position_state_strategy = self.position_state[strategy_id]
        previous_position = position_state_strategy.get(symbol, 0.0)
        new_position = previous_position + quantity
        position_state_strategy[symbol] = new_position
        return previous_position, new_position

    def compute_average_cost_state(
        self, strategy_id, symbol, quantity, fill_price, previous_position, new_position
    ):
        average_cost_state_strategy = self.average_cost_state.setdefault(
            strategy_id, {}
        )
        previous_average_cost = average_cost_state_strategy.setdefault(symbol, 0.0)

        if new_position == 0:
            average_cost_state_strategy.pop(symbol, None)
        elif (previous_position > 0 and quantity > 0) or (
            previous_position < 0 and quantity < 0
        ):
            average_cost_state_strategy[symbol] = (
                previous_average_cost * abs(previous_position)
                + fill_price * abs(quantity)
            ) / abs(new_position)
        elif (
            (previous_position == 0)
            or (previous_position < 0 and new_position > 0)
            or (previous_position > 0 and new_position < 0)
        ):
            average_cost_state_strategy[symbol] = fill_price

        return previous_average_cost

    def compute_realized_pnl_state(
        self,
        strategy_id,
        symbol,
        quantity,
        fill_price,
        previous_position,
        previous_average_cost,
    ):
        realized_by_strategy = self.realized_pnl_state.setdefault(strategy_id, {})
        realized_by_strategy.setdefault(symbol, 0.0)

        if (
            previous_position == 0
            or (previous_position > 0 and quantity > 0)
            or (previous_position < 0 and quantity < 0)
        ):
            return 0.0, realized_by_strategy[symbol]

        closed_qty = min(abs(previous_position), abs(quantity))

        if previous_position > 0:
            pnl_delta = (fill_price - previous_average_cost) * closed_qty
        else:
            pnl_delta = (previous_average_cost - fill_price) * closed_qty

        realized_by_strategy[symbol] += pnl_delta
        return pnl_delta, realized_by_strategy[symbol]

    def compute_unrealized_pnl_state(self, strategy_id, symbol):
        new_position = self.position_state.get(strategy_id, {}).get(symbol, 0.0)
        last_market_price = self.last_market_price.get(symbol)
        if new_position == 0 or last_market_price is None:
            return 0.0
        computed_average_cost = self.average_cost_state.get(strategy_id, {}).get(
            symbol, 0.0
        )
        return (last_market_price - computed_average_cost) * new_position


async def main():
    bus = NatsEventBus()
    portfolio_service = PortfolioService(bus)
    await bus.connect()
    await bus.subscribe(TOPIC.TICKS, Tick, portfolio_service.on_tick)
    await bus.subscribe(TOPIC.FILLS, Fill, portfolio_service.on_fill)

    await portfolio_service.publish_initial(STRATEGYID.MOMENTUM)
    await portfolio_service.publish_initial(STRATEGYID.RSI)

    stop = asyncio.Event()
    await stop.wait()


if __name__ == "__main__":
    asyncio.run(main())
