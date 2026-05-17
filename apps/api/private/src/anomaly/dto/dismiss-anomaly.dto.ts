import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DismissAnomalyDto {
  @ApiProperty({
    description: 'Optional reason for dismissing the anomaly.',
    required: false,
    example: 'Reviewed manually — legitimate high-value transaction.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
