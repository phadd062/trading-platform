from datetime import timedelta

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher
from pydantic import BaseModel

from .utils.helper import create_token

SECRET_KEY = "0s1)xw+delwrhqa1+$kc57d()8s7h$^kq$yyz881w7s8cmy1@wg$hka==0vt0-%+p3%6n58!&3yjj^kfyq_8_-41dlqvj#i9_g^s"
ALGORITHM = "HS512"

ACCESS_EXPIRE_MIN = 1
REFRESH_EXPIRE_HOURS = 12

LOGIN_TOKEN_URL = "/login"
REFRESH_TOKEN_URL = "/refresh"

HASHERS = (Argon2Hasher(),)
password_hash = PasswordHash(HASHERS)

FAKE_USERS = {
    "peter": {
        "username": "peter",
        "full_name": "Peter Haddad",
        "email": "hello@peterhaddad.ca",
        "hashed_password": "$argon2id$v=19$m=65536,t=3,p=4$csJbrYjh7KITe60fkjL3Mw$0zj+1BVyRst4bqUGUL+LHMvffF++xIxwI7g8gCkdcdI",
        "disabled": False,
    }
}


class LoginRequest(BaseModel):
    username: str
    password: str


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token/login")


def get_user(username):
    return FAKE_USERS.get(username)


def authenticate_user(username, password):
    user = get_user(username)
    if (
        not user
        or not password_hash.verify(password, user["hashed_password"])
        or user.get("disabled")
    ):
        return None
    return user


def create_access_token(subject):
    return create_token(
        subject=subject,
        token_type="access",
        expires_delta=timedelta(minutes=ACCESS_EXPIRE_MIN),
        secret_key=SECRET_KEY,
        algorithm=ALGORITHM,
    )


def create_refresh_token(subject):
    return create_token(
        subject=subject,
        token_type="refresh",
        expires_delta=timedelta(hours=REFRESH_EXPIRE_HOURS),
        secret_key=SECRET_KEY,
        algorithm=ALGORITHM,
    )


def get_current_user(token=Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        username = payload.get("sub")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user = get_user(username)
        if not user or user.get("disabled"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
