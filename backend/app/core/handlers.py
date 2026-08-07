from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.exceptions import (
    InvalidTokenException,
    UserAlreadyExistsException,
    InvalidCredentialsException,
    UserNotFoundException,
)


def register_exception_handlers(app: FastAPI):

    @app.exception_handler(UserAlreadyExistsException)
    async def user_already_exists_handler(
        request: Request,
        exc: UserAlreadyExistsException,
    ):
        return JSONResponse(
            status_code=409,
            content={
                "detail": "User already exists",
            },
        )

    @app.exception_handler(InvalidCredentialsException)
    async def invalid_credentials_handler(
        request: Request,
        exc: InvalidCredentialsException,
    ):
        return JSONResponse(
            status_code=401,
            content={
                "detail": "Invalid username or password",
            },
        )

    @app.exception_handler(UserNotFoundException)
    async def user_not_found_handler(
        request: Request,
        exc: UserNotFoundException,
    ):
        return JSONResponse(
            status_code=404,
            content={
                "detail": "User not found",
            },
        )

    @app.exception_handler(InvalidTokenException)
    async def invalid_token_handler(    
        request: Request,
        exc: InvalidTokenException,
    ):
        return JSONResponse(
            status_code=401,
            content={
                "detail": "Invalid token",
            },
        )