# Marco teórico financiero — NEXO REWARDS / Banexcoin Bolivia

> Modelo financiero del producto. Complementa [`tech-notes.md`](./tech-notes.md) (problema),
> [`deep-investigation.md`](./deep-investigation.md) (regulación) y
> [`architecture-sketch.md`](./architecture-sketch.md) (arquitectura).

## 1. Modelo financiero de Banexcoin

Banexcoin es una fintech boliviana clasificada como **Proveedor de Servicios de Activos
Virtuales (PSAV)**. Funciona como puente entre la economía tradicional boliviana y los activos
digitales:

1. El usuario **deposita Bs** vía transferencia bancaria o pago QR.
2. Banexcoin **convierte Bs → USDT** y acredita el monedero digital del usuario.
3. Al pagar a un comercio, Banexcoin hace el inverso: **convierte USDT → Bs** al tipo de cambio
   vigente y envía la transferencia al comercio sobre el sistema QR interoperable del BCB.

El usuario no maneja cripto explícitamente. El comercio no sabe que hubo cripto. Para ambos
extremos parece un pago QR estándar.

## 2. Cashback — qué es y por qué tiene sentido aquí

El **cashback** es un mecanismo estándar de fidelización financiera donde el usuario recupera un
porcentaje de lo gastado (tarjetas de crédito, billeteras, etc.).

En Banexcoin la lógica estratégica es concreta:

- Incentiva el uso frecuente de la plataforma.
- Aumenta el volumen de transacciones procesadas.
- Genera lealtad en un mercado boliviano cada vez más competitivo en medios de pago.

El reintegro puede entregarse en dos formatos, ambos registrables y auditables:

- **USDT** acreditado al monedero del usuario.
- **Bolivianos** depositados a la cuenta bancaria vinculada.

## 3. Los tres pilares del modelo financiero

### Pilar 1 — Tipo de cambio dinámico (USDT / Bs)

Todo el sistema depende del **FX USDT/Bs**, hoy ≈ **6.96 Bs/USDT**. No es fijo: varía con el
mercado cripto.

**Requisitos técnicos:**

- Consultarlo en tiempo real (p. ej. API de Binance).
- Registrar **qué FX se usó en cada reembolso** (para auditoría histórica).
- Si mañana cambia el FX, el ledger conserva el valor equivalente en Bs al momento del pago.

### Pilar 2 — Clasificación por niveles de consumo

Estructura de **incentivos escalonados** según consumo mensual:

| Nivel  | Rango mensual (Bs)   | Cashback |
| ------ | -------------------- | -------- |
| Bronce | 500 – 1,999          | 1 %      |
| Plata  | 2,000 – 4,999        | 3 %      |
| Oro    | > 5,000              | 5 %      |

> **⚠ Discrepancia entre fuentes**
>
> - [`tech-notes.md` §3](./tech-notes.md#3-qué-debe-hacer-el-sistema) reproduce el ejemplo del
>   brief original: tres niveles con cashback **1 % / 1.5 % / 2 %**, sin rangos fijos.
> - [`architecture-sketch.md` §3](./architecture-sketch.md#3-reglas-de-negocio) menciona
>   umbrales **500 / 1,000 / 3,000 Bs** sin porcentaje explícito.
> - Este documento usa los rangos y porcentajes **Bronce/Plata/Oro** como referencia operativa.
>
> Antes de codificar los thresholds finales, **confirmar con Banexcoin** cuál es la tabla
> oficial. Mantener la tabla en configuración (no hardcoded) para permitir cambios sin redeploy.

### Pilar 3 — Idempotencia del proceso de reembolso

**Idempotencia** = ejecutar N veces el mismo proceso produce el mismo efecto que ejecutarlo una.

En finanzas, sin idempotencia se produce **doble gasto**, que es fraude. El cashback de un mes
solo se paga una vez; si la corrida se ejecuta dos veces, la segunda debe ser **rechazada
automáticamente**. Estrategia: una vez calculado y aprobado, el período se **bloquea**.

## 4. Marco normativo aplicado al producto

Para el detalle regulatorio completo ver [`deep-investigation.md`](./deep-investigation.md).
Resumen aplicado:

| Requisito                          | Cómo se traduce en el sistema                                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Boliviano como única moneda legal  | El sistema no "reemplaza" al Bs: lo usa como entrada y salida. Toda salida registra equivalente en Bs.              |
| Registro PSAV ante la UIF          | Banexcoin ya está registrada — el sistema sólo debe respetar las políticas internas.                                |
| KYC obligatorio                    | Antes de emitir cualquier reembolso, validar `kyc_status == ACTIVE`. Si está pendiente/rechazado → no hay cashback. |
| Controles ALD/CFT                  | Operaciones individuales o acumuladas que superen ~**Bs 50,000** se flaggean para revisión manual.                  |
| Trazabilidad para auditorías UIF   | Log inmutable de cada operación flaggeada, con metadatos completos.                                                 |

## 5. Flujo financiero completo (end-to-end)

1. Ingesta de archivos mensuales generados por la plataforma QR de Banexcoin.
2. **ETL** limpia y carga las transacciones en la base de datos; descarta duplicados e inválidos.
3. El motor **agrega el consumo mensual por usuario** y lo clasifica (Bronce/Plata/Oro).
4. Para cada usuario elegible (KYC activo, sin alertas AML) calcula el cashback en **Bs**, lo
   convierte a **USDT** con el FX del momento.
5. Se emite el reembolso y se registra en el **ledger de auditoría**: fecha, monto en Bs, monto
   en USDT, FX usado, nivel del usuario, estado KYC.
6. Se **bloquea el período** para hacer la operación idempotente.

Para el detalle pipeline y módulos del backend ver
[`architecture-sketch.md` §5](./architecture-sketch.md#5-pipeline-de-ejecución).

## 6. Por qué es innovador en el contexto boliviano

- Combinar criptoactivos con el sistema de pagos QR del BCB es nuevo en Bolivia.
- Automatizar el cashback con validaciones KYC/AML integradas y FX en tiempo real resuelve un
  problema operativo real, hoy manual o semiautomático.
- Reduce el tiempo de cálculo de **días a segundos**.
- Elimina el error humano en la clasificación de niveles.
- Garantiza **trazabilidad completa** para auditorías regulatorias.
- Escala horizontalmente sin cambios en la lógica de negocio.
