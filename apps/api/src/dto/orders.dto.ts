import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty() @IsString() quoteId: string;
  @ApiProperty() @IsInt() @Min(1) totalMinor: number;
  @ApiProperty() @IsString() totalCurrency: string;
}

export class IdParamDto {
  @ApiProperty() @IsString() id: string;
}
