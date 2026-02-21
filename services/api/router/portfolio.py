from fastapi import APIRouter

portfolio_router = APIRouter()


@portfolio_router.get("/api/context")
async def login():
    return {"lang": "en"}
