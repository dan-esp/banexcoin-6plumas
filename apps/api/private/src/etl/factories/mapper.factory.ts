import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityType } from '../../common/enums/entity-type.enum.js';
import { IMapper } from '../interfaces/mapper.interface.js';
import { QrPaymentsMapper } from '../mappers/qr-payments.mapper.js';

/**
 * Factory pattern: resolves the correct domain mapper for a given EntityType.
 * Adding a new entity type requires only registering a new mapper here
 * and in EtlModule — EtlService and EtlController remain unchanged.
 */
@Injectable()
export class MapperFactory {
  constructor(private readonly qrPaymentsMapper: QrPaymentsMapper) {}

  resolve(entityType: EntityType): IMapper<unknown> {
    switch (entityType) {
      case EntityType.QR_PAYMENTS:
        return this.qrPaymentsMapper;
      default:
        throw new BadRequestException(`No mapper registered for entity type: "${entityType}"`);
    }
  }
}
