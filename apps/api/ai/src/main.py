from __future__ import annotations

from fastapi import FastAPI, File, HTTPException, UploadFile

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

app = FastAPI(title="banexcoin-ai", version="0.0.1")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/model/info", response_model=ModelInfo)
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


@app.post("/train", response_model=TrainResponse)
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


@app.post("/train/upload", response_model=TrainResponse)
async def train_upload(file: UploadFile = File(...)) -> TrainResponse:
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


@app.post("/predict", response_model=PredictResponse)
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
