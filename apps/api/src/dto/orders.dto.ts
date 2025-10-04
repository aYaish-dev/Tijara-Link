import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty() @IsString() quoteId!: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  totalMinor!: number | undefined;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  totalCurrency!: string | undefined;
}

export class IdParamDto {
  @ApiProperty() @IsString() id!: string;
}
