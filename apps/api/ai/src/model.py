from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from threading import Lock

import joblib
import numpy as np
from sklearn.ensemble import IsolationForest

from .config import settings
from .features import FEATURE_COLUMNS, build_features, feature_matrix


@dataclass
class TrainedModel:
    estimator: IsolationForest
    trained_at: datetime
    n_samples: int
    n_features: int
    contamination: str | float
    feature_names: list[str]


class ModelStore:
    def __init__(self, path: Path) -> None:
        self._path = path
        self._lock = Lock()
        self._model: TrainedModel | None = None
        self._load_if_exists()

    def _load_if_exists(self) -> None:
        if self._path.exists():
            self._model = joblib.load(self._path)

    @property
    def current(self) -> TrainedModel | None:
        return self._model

    def train(self, rows: list[dict], contamination: str | float | None) -> TrainedModel:
        if not rows:
            raise ValueError("rows is empty")

        df = build_features(rows)
        X = feature_matrix(df)

        cont = contamination if contamination is not None else settings.contamination
        est = IsolationForest(
            n_estimators=settings.n_estimators,
            contamination=cont,  # type: ignore[arg-type]
            random_state=settings.random_state,
            n_jobs=-1,
        )
        est.fit(X)

        trained = TrainedModel(
            estimator=est,
            trained_at=datetime.now(UTC),
            n_samples=int(X.shape[0]),
            n_features=int(X.shape[1]),
            contamination=cont,
            feature_names=FEATURE_COLUMNS,
        )

        with self._lock:
            self._model = trained
            self._path.parent.mkdir(parents=True, exist_ok=True)
            joblib.dump(trained, self._path)

        return trained

    def predict(self, rows: list[dict]) -> list[tuple[str, float, bool]]:
        if self._model is None:
            raise RuntimeError("model not trained")

        df = build_features(rows)
        X = feature_matrix(df)
        scores = self._model.estimator.decision_function(X)
        preds = self._model.estimator.predict(X)
        out: list[tuple[str, float, bool]] = []
        for uid, s, p in zip(df["user_id"].tolist(), scores.tolist(), preds.tolist(), strict=True):
            out.append((str(uid), float(s), bool(p == -1)))
        return out


_store: ModelStore | None = None


def get_store() -> ModelStore:
    global _store
    if _store is None:
        _store = ModelStore(settings.model_path)
    return _store


__all__ = ["ModelStore", "TrainedModel", "get_store", "np"]
