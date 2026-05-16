import { ApiProperty } from '@nestjs/swagger';
import { MapperError } from '../interfaces/mapper.interface.js';

export class UploadResponseDto {
  @ApiProperty({
    example: 'qr-payments',
    description: 'The entity type that was loaded.',
  })
  entityType: string;

  @ApiProperty({
    example: 5238,
    description: 'Number of rows successfully parsed and stored.',
  })
  rowsLoaded: number;

  @ApiProperty({
    example: 87,
    description: 'Number of rows skipped due to deduplication, filtering, or parse errors.',
  })
  skipped: number;

  @ApiProperty({
    type: 'array',
    description: 'Details of rows that failed to parse. Empty when all rows succeeded.',
    example: [],
  })
  errors: MapperError[];
}
