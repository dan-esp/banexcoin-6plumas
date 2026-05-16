# Investigación profunda — Banexcoin Bolivia

> Contexto regulatorio y de mercado. Complementa [`tech-notes.md`](./tech-notes.md)
> (problema), [`teoric-references.md`](./teoric-references.md) (modelo financiero) y
> [`architecture-sketch.md`](./architecture-sketch.md) (arquitectura).

## 1. Qué es Banexcoin Bolivia

Banexcoin Bolivia es una **fintech enfocada en activos virtuales** para personas y empresas. Su
plataforma digital permite enviar y recibir pagos desde/hacia Bolivia mediante criptoactivos,
con servicios de **custodia, transferencias, conversión a Bs y gestión de pagos locales**.

Hito histórico relevante: Banexcoin fue la **primera Empresa Proveedora de Servicios de Activos
Virtuales (PSAV) en Bolivia** en obtener el Certificado de Adecuación de la **ASFI**. Ese
certificado la habilita para:

- Billetera de activos virtuales con custodia y transferencias.
- Conversión de activos virtuales a bolivianos.
- Soluciones on/off ramp para personas y empresas.

## 2. Historia regulatoria — de la prohibición a la legalidad

Durante más de diez años Bolivia mantuvo una prohibición que limitaba el uso de criptoactivos en
el sistema financiero. En **junio 2024** el Banco Central de Bolivia (BCB) levantó la
restricción mediante la **Resolución de Directorio Nº 082/2024**.

El cambio no obedeció a un impulso innovador sino a la **crisis cambiaria post-bonanza
hidrocarburos**: el USDT se consolidó como referencia informal del tipo de cambio paralelo y
medio de intercambio cotidiano. En **mayo 2025** el uso de USDT alcanzó **USD 68 M** en
transacciones registradas por el BCB.

## 3. Marco normativo vigente (las 5 normas que rigen a Banexcoin)

| #   | Norma                                          | Fecha            | Qué hace                                                                                                                                                                       |
| --- | ---------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **BCB — Resolución de Directorio Nº 082/2024** | 25/06/2024       | Norma fundacional. Deroga la RD 144/2020 y habilita compra/venta de activos virtuales por canales electrónicos. El boliviano sigue siendo la única moneda de curso legal.      |
| 2   | **UIF — Resolución Administrativa Nº 19/2025** | 2025             | Convierte a Banexcoin en sujeto obligado. Obliga a los PSAV a registrarse, aplicar KYC, debida diligencia y gestión de riesgos ALD/CFT. Aplica solo a operadores con fin de lucro. |
| 3   | **Decreto Supremo Nº 5384 — Marco ETF**        | 07/05/2025       | Reglamenta la creación y funcionamiento de Empresas de Tecnología Financiera (ETF) bajo supervisión de la ASFI.                                                                  |
| 4   | **ASFI — Circular 885/2025**                   | 03/07/2025       | Regula fintech nacionales y sus alianzas con extranjeras en Blockchain, Activos Tokenizados, Activos Virtuales y PSAV. Adecuación obligatoria al **31/12/2025**.                |
| 5   | **ASFI — Resolución 540/2025**                 | 2025             | Alcanza >200 empresas (33 plataformas de pago + 176 PSAV). Solicitud de autorización formal antes del **31/12/2025**.                                                          |

## 4. Líneas de negocio autorizadas vs no autorizadas

| Autorizadas                                  | Aún no habilitadas                                              |
| -------------------------------------------- | --------------------------------------------------------------- |
| Pagos                                        | Banca digital (neobancos)                                       |
| Créditos                                     | Transferencias y remesas                                        |
| Activos virtuales                            | Inversiones                                                     |
| Tecnologías empresariales                    | Seguros digitales                                               |
|                                              | Infraestructura financiera                                      |
|                                              | Cumplimiento regulatorio                                        |

El cashback de **NEXO REWARDS** cae en **"pagos" + "activos virtuales"** — ambas autorizadas.

## 5. Obligaciones KYC (extraídas de los Términos y Condiciones oficiales)

- El cliente debe completar los datos y remitir toda la documentación e información solicitada
  por Banexcoin a través de los canales dispuestos, en aplicación de **"Conoce a tu Cliente"
  (KYC)**. Mientras esto no suceda, no puede operar en la plataforma.
- Banexcoin puede requerir información adicional para cumplir con políticas de prevención de
  legitimación de ganancias ilícitas, financiamiento del terrorismo y financiamiento de la
  proliferación de armas de destrucción masiva, origen de fondos y conocimiento del cliente.
- En ciertos casos puede exigirse **traducción, certificación, legalización (incluyendo
  apostilla)** de documentos.

**Impacto en el sistema:** ningún usuario sin KYC activo puede recibir cashback. Esto se valida
**antes** de emitir el reembolso, no después.

## 6. Prohibiciones explícitas que el sistema debe reflejar

| #   | Prohibición                          | Detalle                                                                                                                                                                            |
| --- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Pagos de terceros                    | No se aceptan pagos o fondeos hechos por terceros. Banexcoin puede rechazar, revertir o devolver.                                                                                  |
| 2   | Fondos desde cuentas no vinculadas   | No se aceptan transferencias a monederos de Banexcoin si los fondos no provienen de la cuenta bancaria registrada del cliente.                                                     |
| 3   | Acceso no autorizado                 | Intentos de acceso no autorizado al sitio resultan en cancelación o cierre de cuentas.                                                                                              |
| 4   | Riesgo asumido por el usuario        | El boliviano es la única moneda de curso legal. El cliente asume los riesgos inherentes al uso de activos virtuales (volatilidad, situación legal, naturaleza).                    |
| 5   | Cambios regulatorios futuros         | Si se aprueba normativa que prohíba o restrinja activos virtuales, Banexcoin queda exenta de responsabilidad por las consecuencias.                                                |

## 7. Vacíos legales aún vigentes en Bolivia

- **No existe régimen fiscal específico** para criptoactivos: no están reguladas ganancias de
  capital, declaración de tenencias ni tratamiento tributario.
- **No se diferencia legalmente** entre criptoactivos, tokens de valor, activos digitales
  financieros y tokens utilitarios.

**Impacto en el sistema:** el cashback en USDT podría considerarse a futuro ganancia de capital.
Mitigación recomendada: **registrar cada reembolso con su valor equivalente en Bs al momento de
la entrega** en el ledger de auditoría (FX dinámico, ver
[`teoric-references.md` §3 Pilar 1](./teoric-references.md#pilar-1--tipo-de-cambio-dinámico-usdt-bs)).

## 8. Posición competitiva vs plataformas extranjeras

Las plataformas extranjeras (Binance, etc.) que prestan servicios financieros a bolivianos desde
fuera del país **no están sujetas a la regulación boliviana**, salvo que establezcan oficina,
sucursal o representante local. La **Ley de Servicios Financieros Nº 393** habilita a la ASFI a
emitir advertencias públicas sobre servicios no autorizados.

→ Banexcoin es la **única PSAV boliviana con Certificado de Adecuación de la ASFI**. Es una
ventaja competitiva regulatoria, no solo técnica.

## 9. Síntesis para el proyecto

- Entorno regulatorio: de prohibición total (2020) → regulación activa (2024–2025), impulsado
  por crisis cambiaria.
- Banexcoin = actor más regulado y certificado del ecosistema boliviano de activos virtuales.
- El modelo depende del cumplimiento estricto de **KYC/AML ante la UIF**, supervisión de la
  **ASFI** y el **estándar QR del BCB**.
- NEXO REWARDS automatiza un proceso hoy manual, dentro de los límites de las cinco normas
  vigentes, y anticipa los vacíos legales (tributación futura) con **registros auditables desde
  el día uno**.
