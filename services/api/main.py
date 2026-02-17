from fastapi import FastAPI

from libs.contracts.events import PortfolioSnapshot, RiskDecision, Order
from libs.eventbus.nats_bus import NatsEventBus
from libs.topics import TOPIC
from contextlib import asynccontextmanager


class API:
    def __init__(self, bus):
        self.bus = bus
        self.portfolios = {}
        self.orders = []
        self.risk_events = []

    async def on_portfolio(self, snapshot):
        self.portfolios[snapshot.strategy_id] = snapshot

    async def on_risk(self, risk_decision):
        self.risk_events.append(risk_decision)
        if len(self.risk_events) > 50:
            self.risk_events.pop(0)

    async def on_order(self, order):
        self.orders.append(order)
        if len(self.orders) > 50:
            self.orders.pop(0)


@asynccontextmanager
async def lifespan(app):
    bus = NatsEventBus()
    api = API(bus)
    app.state.api = api
    await bus.connect()
    await bus.subscribe(TOPIC.PORTFOLIO, PortfolioSnapshot, api.on_portfolio)
    await bus.subscribe(TOPIC.RISKDECISION, RiskDecision, api.on_risk)
    await bus.subscribe(TOPIC.ORDERS, Order, api.on_order)
    yield
    await bus.close()


app = FastAPI(lifespan=lifespan)


@app.get("/portfolio/{strategy_id}")
async def get_portfolio(strategy_id):
    snap = app.state.api.portfolios.get(strategy_id)
    return snap.model_dump() if snap else {}


@app.get("/orders")
async def get_risk():
    return [order.model_dump() for order in app.state.api.orders]


@app.get("/risk")
async def get_risk():
    return [risk.model_dump() for risk in app.state.api.risk_events]
