import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IdParamDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  id!: string;
}
