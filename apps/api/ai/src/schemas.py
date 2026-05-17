from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class Transaction(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "user_id": "u-123",
                "monto_bs": 350.5,
                "monto_usdt": 50.1,
                "tipo_cambio": 6.96,
                "timestamp": "2026-05-12T14:33:00Z",
            }
        }
    )

    user_id: str = Field(description="Stable user or account identifier.", examples=["u-123"])
    monto_bs: float = Field(ge=0, description="Transaction amount in bolivianos.", examples=[350.5])
    monto_usdt: float = Field(ge=0, description="Transaction amount in USDT.", examples=[50.1])
    tipo_cambio: float = Field(
        gt=0,
        description="Exchange rate used for the transaction.",
        examples=[6.96],
    )
    timestamp: datetime = Field(
        description="Transaction creation timestamp in ISO 8601 format.",
        examples=["2026-05-12T14:33:00Z"],
    )


class TrainRequest(BaseModel):
    rows: list[Transaction] = Field(description="Training transactions.")
    contamination: str | float | None = Field(
        default=None,
        description=(
            "IsolationForest contamination value or 'auto'. Uses the model default when omitted."
        ),
        examples=["auto", 0.05],
    )


class TrainResponse(BaseModel):
    n_samples: int = Field(description="Number of rows used to train the model.", examples=[250])
    n_features: int = Field(
        description="Number of engineered features used by the model.",
        examples=[5],
    )
    contamination: str | float = Field(
        description="Contamination setting used for training.",
        examples=["auto"],
    )
    trained_at: datetime = Field(
        description="Timestamp when the model was trained.",
        examples=["2026-05-16T12:00:00Z"],
    )


class PredictRequest(BaseModel):
    rows: list[Transaction] = Field(description="Transactions to score with the current model.")


class Prediction(BaseModel):
    user_id: str = Field(
        description="Identifier copied from the scored transaction.",
        examples=["u-123"],
    )
    score: float = Field(description="IsolationForest anomaly score.", examples=[-0.081])
    is_anomaly: bool = Field(description="Whether the model classifies this row as anomalous.")


class PredictResponse(BaseModel):
    predictions: list[Prediction] = Field(description="One anomaly result per submitted row.")


class ModelInfo(BaseModel):
    trained_at: datetime = Field(
        description="Timestamp when the current in-memory model was trained.",
        examples=["2026-05-16T12:00:00Z"],
    )
    n_samples: int = Field(description="Number of rows used to train the model.", examples=[250])
    n_features: int = Field(
        description="Number of engineered features used by the model.",
        examples=[5],
    )
    contamination: str | float = Field(
        description="Contamination setting used for training.",
        examples=["auto"],
    )
    feature_names: list[str] = Field(
        description="Feature names produced by deterministic feature engineering.",
        examples=[["monto_bs", "monto_usdt", "tipo_cambio", "hour", "day_of_week"]],
    )
