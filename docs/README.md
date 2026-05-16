# Documentación — BanexReintegra

Índice de la documentación del proyecto. Orden de lectura recomendado:

| #   | Archivo                                                  | Propósito                                                                            |
| --- | -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1   | [`tech-notes.md`](./tech-notes.md)                       | **Problema y alcance.** Qué resuelve BanexReintegra, requisitos y restricciones.     |
| 2   | [`deep-investigation.md`](./deep-investigation.md)       | **Contexto regulatorio.** Marco legal boliviano (BCB, UIF, ASFI), KYC/AML, vacíos.   |
| 3   | [`teoric-references.md`](./teoric-references.md)         | **Modelo financiero.** Cashback, FX dinámico, niveles, idempotencia.                 |
| 4   | [`architecture-sketch.md`](./architecture-sketch.md)     | **Arquitectura.** Módulos, pipeline, reglas de negocio, dataset, mapeo a servicios.  |

> Léelos en este orden si vienes desde cero. Si vienes a programar, salta directo a
> `architecture-sketch.md` y a `apps/api/ai/README.md`.

## Mapa rápido proyecto ↔ documentación

| Pregunta                                                   | Dónde está la respuesta                                                                                   |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| ¿Qué hace este sistema?                                    | [`tech-notes.md §2-3`](./tech-notes.md#2-descripción-del-problema)                                        |
| ¿Por qué legalmente puede existir?                         | [`deep-investigation.md §3-4`](./deep-investigation.md#3-marco-normativo-vigente-las-5-normas-que-rigen-a-banexcoin) |
| ¿Cómo se calcula el cashback?                              | [`teoric-references.md §3`](./teoric-references.md#3-los-tres-pilares-del-modelo-financiero)              |
| ¿Cuáles son los niveles y porcentajes?                     | [`teoric-references.md §3 Pilar 2`](./teoric-references.md#pilar-2--clasificación-por-niveles-de-consumo) (con nota de discrepancia) |
| ¿Cómo se filtra el Excel?                                  | [`architecture-sketch.md §3`](./architecture-sketch.md#3-reglas-de-negocio)                                |
| ¿Qué microservicio hace qué?                               | [`tech-notes.md §6`](./tech-notes.md#6-mapeo-a-microservicios-del-repo)                                   |
| ¿Cómo detectamos anomalías?                                | [`architecture-sketch.md §7`](./architecture-sketch.md#7-integración-con-el-servicio-ai) + [`apps/api/ai/README.md`](../apps/api/ai/README.md) |
| ¿Qué obligaciones KYC/AML cumplir antes de emitir cashback? | [`deep-investigation.md §5`](./deep-investigation.md#5-obligaciones-kyc-extraídas-de-los-términos-y-condiciones-oficiales) + [`teoric-references.md §4`](./teoric-references.md#4-marco-normativo-aplicado-al-producto) |

## Hechos clave de un vistazo

- **5,325** transacciones QR válidas sobre **239** usuarios únicos en **May–Ago 2025**.
- **1** duplicado, **12** montos > 5,000 Bs candidatos a flag AML.
- FX USDT/Bs actual ≈ **6.96** (dinámico).
- Umbral AML referencial: operaciones individuales o acumuladas **> Bs 50,000**.
- Plazo regulatorio clave: adecuación ASFI **al 31/12/2025**.

## Otros recursos

- `dataset.xlsx` — Dataset original (no se versiona código sobre él, sólo es referencia).
- [`../CLAUDE.md`](../CLAUDE.md) — Guía para Claude Code (arquitectura del repo, comandos).
- [`../README.md`](../README.md) — README de proyecto.
