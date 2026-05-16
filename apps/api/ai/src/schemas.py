from datetime import datetime

from pydantic import BaseModel, Field


class Transaction(BaseModel):
    user_id: str
    monto_bs: float = Field(ge=0)
    monto_usdt: float = Field(ge=0)
    tipo_cambio: float = Field(gt=0)
    timestamp: datetime


class TrainRequest(BaseModel):
    rows: list[Transaction]
    contamination: str | float | None = None


class TrainResponse(BaseModel):
    n_samples: int
    n_features: int
    contamination: str | float
    trained_at: datetime


class PredictRequest(BaseModel):
    rows: list[Transaction]


class Prediction(BaseModel):
    user_id: str
    score: float
    is_anomaly: bool


class PredictResponse(BaseModel):
    predictions: list[Prediction]


class ModelInfo(BaseModel):
    trained_at: datetime
    n_samples: int
    n_features: int
    contamination: str | float
    feature_names: list[str]
