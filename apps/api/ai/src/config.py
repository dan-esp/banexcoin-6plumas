from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="AI_", extra="ignore")

    port: int = 8080
    model_path: Path = Path("/app/data/model.joblib")
    contamination: str | float = "auto"
    n_estimators: int = 200
    random_state: int = 42


settings = Settings()
