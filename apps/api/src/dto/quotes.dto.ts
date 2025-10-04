import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsInt, Min } from 'class-validator';

export class CreateQuoteDto {
  @ApiProperty() @IsString() rfqId!: string;
  @ApiProperty() @IsString() currency!: string;
  @ApiProperty() @IsInt() @Min(1) pricePerUnitMinor!: number;
  @ApiProperty() @IsInt() @Min(1) moq!: number;
  @ApiProperty() @IsInt() @Min(0) leadTimeDays!: number;
}

export class AcceptQuoteParamDto {
  @ApiProperty() @IsString() id!: string;
}
