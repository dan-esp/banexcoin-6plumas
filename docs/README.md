# Documentación de Referencia — BanexReintegra

Esta carpeta ya no es la fuente principal de verdad del producto. Su función es conservar
investigación, contexto y notas largas que respaldan las decisiones actuales.

Capas de documentación del repo:

- [`../constitution/`](../constitution/) — verdad actual del producto: misión, roadmap, tech stack y principios.
- [`../specs/feature/`](../specs/feature/) — verdad actual de implementación: features, reglas y plan operativo.
- [`./`](./) — material de referencia: investigación, arquitectura extendida, contexto regulatorio y notas técnicas.

## Qué leer según la necesidad

Si quieres entender el producto actual:

1. [`../constitution/mission.md`](../constitution/mission.md)
2. [`../constitution/roadmap.md`](../constitution/roadmap.md)
3. [`../constitution/tech-stack.md`](../constitution/tech-stack.md)
4. [`../specs/feature/requirements.md`](../specs/feature/requirements.md)
5. [`../specs/feature/validation.md`](../specs/feature/validation.md)

Si quieres contexto profundo o respaldo:

1. [`tech-notes.md`](./tech-notes.md)
2. [`deep-investigation.md`](./deep-investigation.md)
3. [`teoric-references.md`](./teoric-references.md)
4. [`architecture-sketch.md`](./architecture-sketch.md)
5. [`tech-stack.md`](./tech-stack.md)

## Qué contiene esta carpeta

| Archivo | Rol |
| --- | --- |
| [`tech-notes.md`](./tech-notes.md) | Problema, alcance y mapeo general del sistema. |
| [`deep-investigation.md`](./deep-investigation.md) | Contexto regulatorio y riesgos KYC/AML. |
| [`teoric-references.md`](./teoric-references.md) | Modelo financiero y racional de cashback. |
| [`architecture-sketch.md`](./architecture-sketch.md) | Boceto detallado de arquitectura y pipeline. |
| [`tech-stack.md`](./tech-stack.md) | Inventario técnico detallado del repo actual. |
| [`deployment.md`](./deployment.md) | Deploy local/operacional y variables de entorno de referencia. |
| `dataset.xlsx` | Dataset de referencia para análisis manual. |

## Regla de mantenimiento

- Si un documento define la decisión vigente del producto, debe vivir en `constitution/` o `specs/`.
- Si un documento explica contexto, investigación o detalle histórico, debe vivir en `docs/`.
- Los archivos fuente del challenge viven en [`../resources/`](../resources/), no en `files/`.
