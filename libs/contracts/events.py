from enum import Enum
import time
import uuid

from pydantic import BaseModel, ConfigDict, Field


class EventModel(BaseModel):
    model_config = ConfigDict(extra="forbid")
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    ts_ms: int = Field(default_factory=lambda: int(time.time() * 1000))


class Side(str, Enum):
    BUY = "BUY"
    SELL = "SELL"


class Tick(EventModel):
    type: str = Field(default="Tick", frozen=True)
    symbol: str
    bid: float
    ask: float
    last: float
    volume: float = 0.0


class OrderIntent(EventModel):
    type: str = Field(default="OrderIntent", frozen=True)
    intent_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    strategy_id: str
    symbol: str
    side: Side
    quantity: float
    order_type: str = "MARKET"
    limit_price: float | None = None
    reason: str | None = None


class Order(EventModel):
    type: str = Field(default="Order", frozen=True)
    order_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    intent_id: str
    strategy_id: str
    symbol: str
    side: Side
    quantity: float
    order_type: str = "MARKET"
    limit_price: float | None = None


class Fill(EventModel):
    type: str = Field(default="Fill", frozen=True)
    order_id: str
    fill_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    strategy_id: str
    symbol: str
    side: Side
    quantity: float
    price: float
    fees: float = 0.0


class PortfolioSnapshot(EventModel):
    type: str = Field(default="PortfolioSnapshot", frozen=True)
    strategy_id: str
    positions: dict[str, float]
    average_cost: dict[str, float]
    realized_pnl: float
    unrealized_pnl: float = 0.0
    net_pnl: float = 0.0


class RiskDecision(EventModel):
    type: str = Field(default="RiskDecision", frozen=True)
    intent_id: str
    approved: bool
    reasons: list[str] = Field(default_factory=list)
    kill_switch: bool = False


class RiskStatus(EventModel):
    type: str = Field(default="RiskStatus", frozen=True)
    ok: bool
    kill_switch: bool
    breached: list[str] = Field(default_factory=list)
