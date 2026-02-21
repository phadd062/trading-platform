from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from libs.contracts.events import Order, PortfolioSnapshot, RiskDecision
from libs.eventbus.nats_bus import NatsEventBus
from libs.topics import TOPIC

from .auth import get_current_user
from .router.order import order_router
from .router.portfolio import portfolio_router
from .router.token import token_router


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
app.include_router(token_router, prefix="/token")
app.include_router(portfolio_router, dependencies=[Depends(get_current_user)])
app.include_router(order_router)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
