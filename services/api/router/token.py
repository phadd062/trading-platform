import jwt
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from services.api.auth import (ALGORITHM, LOGIN_TOKEN_URL, REFRESH_TOKEN_URL,
                               SECRET_KEY, LoginRequest, authenticate_user,
                               create_access_token, create_refresh_token)

token_router = APIRouter()


@token_router.post(LOGIN_TOKEN_URL)
async def login(login: LoginRequest):
    user = authenticate_user(login.username, login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "refresh": create_refresh_token(subject=user["username"]),
        "access": create_access_token(subject=user["username"]),
    }


class RefreshRequest(BaseModel):
    refresh: str


@token_router.post(REFRESH_TOKEN_URL)
async def refresh(renewToken: RefreshRequest):
    payload = jwt.decode(renewToken.refresh, SECRET_KEY, algorithms=ALGORITHM)
    return {"access": create_access_token(subject=payload["sub"])}
