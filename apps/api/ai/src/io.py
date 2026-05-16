from __future__ import annotations

from io import BytesIO

import pandas as pd

REQUIRED_COLUMNS = {"user_id", "monto_bs", "monto_usdt", "tipo_cambio", "timestamp"}


def parse_upload(filename: str, content: bytes) -> list[dict]:
    name = filename.lower()
    if name.endswith(".csv"):
        df = pd.read_csv(BytesIO(content))
    elif name.endswith((".xlsx", ".xls")):
        df = pd.read_excel(BytesIO(content))
    else:
        raise ValueError(f"unsupported file type: {filename}")

    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"missing columns: {sorted(missing)}")

    df = df[list(REQUIRED_COLUMNS)]
    return df.to_dict(orient="records")
