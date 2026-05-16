# Notas técnicas — BanexReintegra

> Punto de entrada operativo del proyecto. Para el contexto regulatorio ver
> [`deep-investigation.md`](./deep-investigation.md); para el modelo financiero
> [`teoric-references.md`](./teoric-references.md); para la arquitectura
> [`architecture-sketch.md`](./architecture-sketch.md).

## 1. Información de la empresa

| Campo                | Valor                                |
| -------------------- | ------------------------------------ |
| Empresa              | Banexcoin Bolivia                    |
| Representante        | Lorena Alejandra Grundy Castaños     |
| Teléfono             | 62602737                             |
| Correo               | informacion@banexcoin.com.bo         |
| Producto             | BanexReintegra (NEXO REWARDS)        |

## 2. Descripción del problema

BanexReintegra es la solución que automatiza el programa de **cashback en USDT** que Banexcoin
otorga sobre pagos QR, hoy ejecutado manualmente sobre un grupo reducido de usuarios.

Hoy un pago QR funciona así:

1. El usuario paga escaneando un QR del sistema financiero tradicional boliviano.
2. Se le debita el monto equivalente en **USDT** al tipo de cambio del momento.
3. El comercio recibe el pago en **bolivianos (Bs)**.
4. La transacción es inmediata y sin comisiones.

Esto permite al usuario ahorrar en USDT sin perder la facilidad de pago en moneda local. El
reintegro mensual incentiva esa práctica.

### Problemas del proceso manual actual

- Procesos operativos lentos y propensos a error.
- Difícil de escalar al universo total de usuarios.
- Alta carga operativa para el equipo.
- Falta de automatización en cálculos y reportes.

## 3. Qué debe hacer el sistema

1. **Carga de datos** — admitir archivos (CSV, XLSX) con el detalle mensual de pagos QR.
2. **Procesamiento automático** — calcular el gasto total mensual por usuario, clasificarlo en su
   nivel y aplicar el porcentaje de reintegro correspondiente.
3. **Estructura de niveles** — los rangos y porcentajes están definidos por Banexcoin. Ver
   [`teoric-references.md` §3](./teoric-references.md#3-los-tres-pilares-del-modelo-financiero)
   para los valores actuales y la nota de discrepancia con el ejemplo del brief original.
4. **Cálculo de reintegros** — emitir el monto en USDT **y** en Bs equivalentes al tipo de cambio
   del momento (FX ≈ 6.96 Bs/USDT, dinámico).
5. **Generación de reportes** — exportar por usuario: monto total consumido, nivel alcanzado,
   reintegro en USDT, reintegro en Bs.
6. **Preparación para ejecución** — generar archivos compatibles con **BanexTransfer** para
   transferencias internas masivas de USDT.

## 4. Restricciones y consideraciones clave

- **100 % independiente** — sin integración directa con el sistema actual de Banexcoin.
- Funciona únicamente a partir de archivos cargados manualmente.
- Escalable a volúmenes masivos futuros.
- Minimiza errores humanos: validación, deduplicación e idempotencia (ver
  [`teoric-references.md` §3, Pilar 3](./teoric-references.md#pilar-3--idempotencia-del-proceso-de-reembolso)).
- Cumple KYC/AML antes de emitir cualquier reintegro (ver
  [`deep-investigation.md` §4](./deep-investigation.md#4-obligaciones-kyc-extraídas-de-los-términos-y-condiciones-oficiales)).

## 5. Información disponible para los equipos

- Reportes de transacciones de pagos con QR por usuario (XLSX, hoja **Pago QR**).
- Montos de consumo mensual en Bs y su equivalente en USDT.
- Tipo de cambio aplicado por transacción.
- Identificación de usuarios (ID o cuenta — en el dataset actual: email).
- Estructura de niveles de reintegro (rangos y porcentajes definidos por Banexcoin).

## 6. Mapeo a microservicios del repo

| Capa                                 | Servicio              | Stack                          |
| ------------------------------------ | --------------------- | ------------------------------ |
| Carga + ETL + cálculo + export       | `apps/api/private`    | NestJS (interno)               |
| API pública / consultas / vistas     | `apps/api/public`     | Hono on Bun                    |
| Detección de anomalías (Iso. Forest) | `apps/api/ai`         | FastAPI + scikit-learn         |
| Consola operativa                    | `apps/frontend`       | Next.js 16                     |

Ver [`architecture-sketch.md`](./architecture-sketch.md) para los módulos lógicos detallados.
