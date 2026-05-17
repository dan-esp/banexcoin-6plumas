# Boceto de arquitectura — BanexReintegra

> Documento de referencia, no fuente canónica de verdad de producto o reglas vigentes. La verdad
> actual vive en `constitution/` y `specs/feature/`. Este archivo conserva el mapa lógico,
> hipótesis arquitectónicas y notas extendidas que respaldan esas decisiones.
>
> Complementa
> [`tech-notes.md`](./tech-notes.md) (problema),
> [`deep-investigation.md`](./deep-investigation.md) (regulación) y
> [`teoric-references.md`](./teoric-references.md) (modelo financiero).

## 1. Resumen del dataset

| Métrica                             | Valor          |
| ----------------------------------- | -------------- |
| Transacciones QR válidas            | **5,325**      |
| Usuarios únicos                     | **239**        |
| Duplicados detectados               | 1              |
| Montos > 5,000 Bs (flag AML)        | 12             |
| Período cubierto                    | May – Ago 2025 |
| Meses de datos                      | 4              |

## 2. Módulos del sistema

| #   | Módulo                  | Responsabilidad                                                                                                                          | Archivo de referencia       |
| --- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| 01  | **ETL / Ingesta**       | Carga y parsea el Excel. Filtra sólo hoja **"Pago QR"** (tipo `S-001`). Descarta retiros, depósitos, transfers, cobros QR, servicios.    | `etl_loader.py`             |
| 02  | **Validador de datos**  | Detecta duplicados por `Transacción Id`. Valida montos, fechas, estado `Completed`. Genera reporte de inconsistencias.                   | `validator.py`              |
| 03  | **Capa de datos (DB)**  | PostgreSQL con 5 tablas: `users`, `transactions`, `monthly_aggregations`, `cashback_runs`, `disbursements`.                              | `models.py` / `schema.sql`  |
| 04  | **Motor de cashback**   | Agrega consumo mensual por usuario, asigna nivel, calcula reintegro en Bs y USDT. **Idempotente**.                                       | `cashback_engine.py`        |
| 05  | **Exportador BanexTransfer** | Genera CSV compatible con BanexTransfer (incluye email + USDT redondeado a 2 decimales). Revisión manual previa al envío.            | `exporter.py`               |
| 06  | **Dashboard / API REST**     | API para subir archivo, ejecutar cálculo, revisar resultados y exportar. Frontend para operación.                                    | `main.py` / `App.jsx`       |

> En este monorepo los módulos 01–05 viven en **`apps/api/private`** (NestJS). El módulo 06 se
> reparte entre **`apps/api/private`** (endpoints internos), **`apps/api/public`** (lectura) y
> **`apps/frontend`** (UI). Adicionalmente, **`apps/api/ai`** (FastAPI) provee detección de
> anomalías sobre las transacciones (Isolation Forest).

## 3. Reglas de negocio

### Filtros de ingesta

- Sólo se procesa la hoja **`Pago QR`** del Excel.
- Filtro triple obligatorio:
  - `Tipo de servicio == "S-001"` (PAGO QR; disminuye saldo del cliente en USDT).
  - `Estado == "Completed"`.
  - `Side Cliente == "Sell"`.
  - `Moneda == "BOB"`.
- Cualquier otra hoja (Depósitos, Retiros, Transfers, Cobro QR, etc.) **se ignora**.

### Identificador de usuario

- `Creado por` (email) es el **identificador único** del usuario para BanexTransfer.

### Calidad de datos

- Montos no numéricos → `NaN` → se reportan como **errores críticos**, no se procesan.
- Duplicados por `Transacción Id` se descartan y se reportan.

### Umbrales de niveles

Ver [`teoric-references.md` §3 Pilar 2](./teoric-references.md#pilar-2--clasificación-por-niveles-de-consumo)
para tabla y nota de discrepancia con el brief original.

## 4. Datos del Excel original

| Aspecto                          | Detalle                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Hojas disponibles                | 9: Depósitos, Retiros, Pago QR, Cobro QR, Transfers, Saldos, Servicios, EXTRACTO PAGOS/COBROS, (otra)         |
| Transacciones en `Pago QR`       | 5,325 filas, todas con `Estado=Completed`, `Side=Sell`, `Moneda=BOB`                                          |
| Rango de fechas                  | May – Ago 2025 (4 meses)                                                                                       |
| Tipo de servicio correcto        | `S-001` (PAGO QR, disminuye el saldo del cliente en USDT)                                                     |

## 5. Pipeline de ejecución

```
01  Subir Excel              → POST /upload
02  Filtrar QR               → sólo S-001 + Completed + Sell + BOB
03  Validar                  → duplicados, montos, emails
04  Agregar                  → Σ Bs por usuario / mes
05  Asignar nivel            → según tabla de tiers (config)
06  Calcular                 → Bs · USDT · tipo de cambio
07  Revisar (admin)          → aprobación manual
08  Exportar                 → CSV BanexTransfer
```

## 6. Código de referencia — `etl_loader.py`

> Snippet original del boceto. Es **referencia pedagógica**, no código del repo. La
> implementación real vive en `apps/api/private` (NestJS) y, para análisis exploratorio o
> anomalías, en `apps/api/ai` (FastAPI).

```python
import pandas as pd
from pathlib import Path

SHEET_QR = "Pago QR"
TIPO_VALIDO = "S-001"
ESTADO_VALIDO = "Completed"
SIDE_VALIDO = "Sell"


def cargar_transacciones(path: str) -> pd.DataFrame:
    xf = pd.ExcelFile(path)
    if SHEET_QR not in xf.sheet_names:
        raise ValueError(f"Hoja '{SHEET_QR}' no encontrada")

    df = pd.read_excel(path, sheet_name=SHEET_QR)

    # Filtrar sólo pagos QR válidos
    df = df[
        (df["Tipo de servicio"] == TIPO_VALIDO)
        & (df["Estado"] == ESTADO_VALIDO)
        & (df["Side Cliente"] == SIDE_VALIDO)
        & (df["Moneda"] == "BOB")
    ].copy()

    # Parseo de fechas
    df["fecha"] = pd.to_datetime(
        df["Fecha de creación"].str.split(",").str[0],
        format="%d/%m/%Y %H:%M:%S",
        errors="coerce",
    )
    df["mes"] = df["fecha"].dt.to_period("M")
    df["monto_bs"] = pd.to_numeric(df["Monto Pagado"], errors="coerce")
    df["email"] = df["Creado por"]
    df["tx_id"] = df["Transacción Id"].astype(str)

    return df[[
        "tx_id", "email", "mes", "monto_bs", "fecha",
        "Número de Cuenta", "Número de cotización",
    ]]
```

## 7. Integración con el servicio AI

El servicio `apps/api/ai` consume el mismo dataset (post-ETL) para entrenar un
**IsolationForest** sobre features derivadas:

- `monto_bs`, `monto_usdt`, `tipo_cambio`
- `hour`, `dayofweek` (extraídos de `timestamp`)
- Agregados por usuario: `user_tx_count`, `user_mean_bs`, `user_std_bs`, `user_total_bs`

Marca como `is_anomaly` las transacciones con `decision_function < 0` (etiqueta `-1` del
estimador). Los 12 montos > 5,000 Bs detectados en el dataset deberían aparecer entre las top
anomalías como verificación de cordura.

Contrato HTTP del servicio: ver [`../CLAUDE.md`](../CLAUDE.md) y el código en
[`apps/api/ai/src/main.py`](../apps/api/ai/src/main.py).
