from __future__ import annotations

from io import BytesIO

import pandas as pd

REQUIRED_COLUMNS = {"user_id", "monto_bs", "monto_usdt", "tipo_cambio", "timestamp"}

# Raw Banexcoin Excel sheet name and filter values
_RAW_SHEET = "Pago QR"
_TIPO_VALIDO = "S-001"
_ESTADO_VALIDO = "Completed"
_SIDE_VALIDO = "Sell"
_MONEDA_VALIDA = "BOB"


def _load_raw_banexcoin(content: bytes) -> pd.DataFrame:
    """Load raw Banexcoin Excel, apply QR filter, and normalize column names."""
    df = pd.read_excel(BytesIO(content), sheet_name=_RAW_SHEET)

    df = df[
        (df["Tipo de servicio"] == _TIPO_VALIDO)
        & (df["Estado"] == _ESTADO_VALIDO)
        & (df["Side Cliente"] == _SIDE_VALIDO)
        & (df["Moneda"] == _MONEDA_VALIDA)
    ].copy()

    # Parse '15/04/2025 09:01:55, UTC -04:00' → datetime
    df["timestamp"] = pd.to_datetime(
        df["Fecha de creación"].str.split(",").str[0],
        format="%d/%m/%Y %H:%M:%S",
        errors="coerce",
    )
    df["monto_bs"] = pd.to_numeric(df["Monto Pagado"], errors="coerce")
    df["monto_usdt"] = pd.to_numeric(df["Monto intercambio"], errors="coerce")
    df["tipo_cambio"] = pd.to_numeric(df["Precio"], errors="coerce")
    df["user_id"] = df["Creado por"]  # alias, e.g. 'VictorFernandez452024'

    df = df.dropna(subset=["monto_bs", "monto_usdt", "tipo_cambio", "timestamp"])
    return df[list(REQUIRED_COLUMNS)]


def parse_upload(filename: str, content: bytes) -> list[dict]:
    name = filename.lower()
    if name.endswith(".csv"):
        df = pd.read_csv(BytesIO(content))
    elif name.endswith((".xlsx", ".xls")):
        xf = pd.ExcelFile(BytesIO(content))
        if _RAW_SHEET in xf.sheet_names:
            # Raw Banexcoin workbook → auto-filter + map columns
            return _load_raw_banexcoin(content).to_dict(orient="records")
        df = pd.read_excel(BytesIO(content))
    else:
        raise ValueError(f"unsupported file type: {filename}")

    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"missing columns: {sorted(missing)}")

    df = df[list(REQUIRED_COLUMNS)]
    return df.to_dict(orient="records")
