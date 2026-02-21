from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class EventModel(BaseModel):
    model_config = ConfigDict(extra="forbid")
    ts_ms: int


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
    type: str = Field(default="Order", frozen=True)
    intent_id: str
    strategy_id: str
    symbol: str
    side: Side
    quantity: float
    order_type: str = "MARKET"
    limit_price: float | None = None
    reason: str | None = None


class Order(EventModel):
    type: str = Field(default="Order", frozen=True)
    order_id: str
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
    fill_id: str
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
