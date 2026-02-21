from fastapi import APIRouter, Request

order_router = APIRouter()


@order_router.get("/api/portfolio/all-strategies")
async def get_portfolio(request: Request):
    snapshot = request.app.state.api.portfolios
    return snapshot


@order_router.get("/api/portfolio/debug-portfolios-type")
async def get_portfolios_type():
    return {"type": "hello"}


@order_router.get("/api/portfolio/{strategy_id}")
async def get_portfolio(request: Request, strategy_id: str):
    snapshot = request.app.state.api.portfolios.get(strategy_id)
    return snapshot


@order_router.get("/api/orders")
async def get_risk(request: Request):
    print(request)
    return [order for order in request.app.state.api.orders]


@order_router.get("/api/risk")
async def get_risk(request: Request):
    return [risk for risk in request.app.state.api.risk_events]
