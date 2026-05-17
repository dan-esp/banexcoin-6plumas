from __future__ import annotations

from fastapi import FastAPI, File, HTTPException, UploadFile

from .auth import ClerkAuthMiddleware
from .io import parse_upload
from .model import get_store
from .schemas import (
    ModelInfo,
    Prediction,
    PredictRequest,
    PredictResponse,
    TrainRequest,
    TrainResponse,
)

app = FastAPI(
    title="BanexReintegra AI API",
    description=(
        "Review-support API for training and running IsolationForest anomaly detection over "
        "Banexcoin QR transaction features. This service never calculates cashback, approves "
        "batches, or changes payout amounts."
    ),
    version="0.0.1",
    openapi_tags=[
        {"name": "health", "description": "Service status checks."},
        {"name": "model", "description": "Current anomaly model metadata."},
        {"name": "training", "description": "Model training from JSON or uploaded workbooks."},
        {"name": "prediction", "description": "Anomaly scoring for review prioritization."},
    ],
)
app.add_middleware(ClerkAuthMiddleware)


@app.get(
    "/health",
    tags=["health"],
    summary="Check service health",
    description="Returns a small liveness response for the AI anomaly service.",
)
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get(
    "/model/info",
    response_model=ModelInfo,
    tags=["model"],
    summary="Get current model metadata",
    description="Returns metadata for the current trained model.",
    responses={404: {"description": "No model has been trained in this service instance."}},
)
def model_info() -> ModelInfo:
    m = get_store().current
    if m is None:
        raise HTTPException(status_code=404, detail="no model trained")
    return ModelInfo(
        trained_at=m.trained_at,
        n_samples=m.n_samples,
        n_features=m.n_features,
        contamination=m.contamination,
        feature_names=m.feature_names,
    )


@app.post(
    "/train",
    response_model=TrainResponse,
    tags=["training"],
    summary="Train model from JSON rows",
    description="Trains the anomaly model from explicit transaction rows.",
    responses={400: {"description": "Training data is invalid or insufficient."}},
)
def train(req: TrainRequest) -> TrainResponse:
    rows = [r.model_dump() for r in req.rows]
    try:
        m = get_store().train(rows, req.contamination)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return TrainResponse(
        n_samples=m.n_samples,
        n_features=m.n_features,
        contamination=m.contamination,
        trained_at=m.trained_at,
    )


@app.post(
    "/train/upload",
    response_model=TrainResponse,
    tags=["training"],
    summary="Train model from an uploaded file",
    description="Trains the anomaly model from an uploaded CSV or workbook accepted by the parser.",
    responses={400: {"description": "The uploaded file cannot be parsed or trained."}},
)
async def train_upload(
    file: UploadFile = File(..., description="CSV or workbook file with transaction rows"),
) -> TrainResponse:
    content = await file.read()
    try:
        rows = parse_upload(file.filename or "", content)
        m = get_store().train(rows, None)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return TrainResponse(
        n_samples=m.n_samples,
        n_features=m.n_features,
        contamination=m.contamination,
        trained_at=m.trained_at,
    )


@app.post(
    "/predict",
    response_model=PredictResponse,
    tags=["prediction"],
    summary="Score transaction anomalies",
    description="Scores submitted transactions with the current trained anomaly model.",
    responses={
        400: {"description": "Prediction rows do not match expected feature inputs."},
        409: {"description": "No trained model is available for prediction."},
    },
)
def predict(req: PredictRequest) -> PredictResponse:
    rows = [r.model_dump() for r in req.rows]
    try:
        out = get_store().predict(rows)
    except RuntimeError as e:
        raise HTTPException(status_code=409, detail=str(e)) from e
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return PredictResponse(
        predictions=[Prediction(user_id=u, score=s, is_anomaly=a) for u, s, a in out]
    )
