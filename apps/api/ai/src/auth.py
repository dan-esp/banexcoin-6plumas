from __future__ import annotations

from functools import lru_cache

import jwt
from fastapi import Request
from fastapi.responses import JSONResponse
from jwt import PyJWKClient
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

from .config import settings

PUBLIC_PATHS = {
    "/health",
    "/docs",
    "/redoc",
    "/openapi.json",
    "/model/info",
    "/train",
    "/train/upload",
}


def _parse_list(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


def _read_bearer_token(header: str | None) -> str | None:
    if not header:
        return None

    scheme, _, token = header.partition(" ")
    if scheme.lower() != "bearer" or not token:
        return None

    return token


@lru_cache
def _jwks_client() -> PyJWKClient:
    if not settings.clerk_jwks_url:
        raise RuntimeError("CLERK_JWKS_URL is not configured")
    return PyJWKClient(settings.clerk_jwks_url)


def verify_clerk_token(token: str) -> dict:
    signing_key = _jwks_client().get_signing_key_from_jwt(token)
    decode_kwargs: dict = {
        "algorithms": ["RS256"],
        "options": {"verify_aud": False},
    }

    claims = jwt.decode(token, signing_key.key, **decode_kwargs)
    authorized_parties = _parse_list(settings.clerk_authorized_parties)

    if authorized_parties and claims.get("azp") not in authorized_parties:
        raise jwt.InvalidTokenError("unauthorized authorized party")

    if not claims.get("sub"):
        raise jwt.InvalidTokenError("missing subject")

    return claims


def select_claims(claims: dict) -> dict[str, str]:
    selected = {
        "authorized_party": claims.get("azp"),
        "organization_id": claims.get("org_id"),
        "organization_role": claims.get("org_role"),
        "role": claims.get("role"),
    }
    return {key: value for key, value in selected.items() if isinstance(value, str)}


class ClerkAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        if request.url.path in PUBLIC_PATHS:
            return await call_next(request)

        token = _read_bearer_token(request.headers.get("authorization"))
        if not token:
            return JSONResponse({"error": "unauthorized"}, status_code=401)

        try:
            claims = verify_clerk_token(token)
            request.state.auth = {
                "user_id": claims["sub"],
                "session_id": claims.get("sid"),
                "claims": select_claims(claims),
                "token": token,
            }
        except Exception:
            return JSONResponse({"error": "unauthorized"}, status_code=401)

        return await call_next(request)
