import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { EntityType } from '../../common/enums/entity-type.enum.js';
import { QrPaymentRow } from '../../common/interfaces/entity-rows.interface.js';
import { EtlStore } from '../../etl/store/etl-store.service.js';
import { PipelineContext } from './pipeline-context.js';

/**
 * Step 1 — Scope filter (BL-001).
 *
 * Reads QrPaymentRow[] from the ETL store.
 * Fails immediately if the store is empty — there is nothing to calculate.
 * This is the only step that talks to EtlStore.
 */
@Injectable()
export class ScopeFilterStep {
  constructor(private readonly etlStore: EtlStore) {}

  process(ctx: PipelineContext): PipelineContext {
    const rows = this.etlStore.get<QrPaymentRow>(EntityType.QR_PAYMENTS);

    if (rows.length === 0) {
      throw new UnprocessableEntityException(
        'No QR Payment rows found in the store. ' +
          'Upload a file first using POST /api/v1/etl/upload/qr-payments.',
      );
    }

    return {
      ...ctx,
      rows,
      audit: { ...ctx.audit, totalInput: rows.length },
    };
  }
}
