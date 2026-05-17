from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="AI_", extra="ignore")

    port: int = 8080
    model_path: Path = Path("/app/data/model.joblib")
    contamination: str | float = "auto"
    n_estimators: int = 200
    random_state: int = 42
    clerk_jwks_url: str | None = Field(default=None, validation_alias="CLERK_JWKS_URL")
    clerk_authorized_parties: str | None = Field(
        default=None,
        validation_alias="CLERK_AUTHORIZED_PARTIES",
    )


settings = Settings()
