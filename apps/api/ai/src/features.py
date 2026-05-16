import numpy as np
import pandas as pd

FEATURE_COLUMNS = [
    "monto_bs",
    "monto_usdt",
    "tipo_cambio",
    "hour",
    "dayofweek",
    "user_tx_count",
    "user_mean_bs",
    "user_std_bs",
    "user_total_bs",
]


def build_features(rows: list[dict]) -> pd.DataFrame:
    df = pd.DataFrame(rows)
    df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True)
    df["hour"] = df["timestamp"].dt.hour
    df["dayofweek"] = df["timestamp"].dt.dayofweek

    grp = df.groupby("user_id")["monto_bs"]
    df["user_tx_count"] = grp.transform("count")
    df["user_mean_bs"] = grp.transform("mean")
    df["user_std_bs"] = grp.transform("std").fillna(0.0)
    df["user_total_bs"] = grp.transform("sum")

    feats = df[FEATURE_COLUMNS].to_numpy(dtype=np.float64)
    return df.assign(_features=list(feats))


def feature_matrix(df: pd.DataFrame) -> np.ndarray:
    return np.vstack(df["_features"].to_numpy())
