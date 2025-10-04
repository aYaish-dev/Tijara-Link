import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';
export class CreateQuoteDto {
  @ApiProperty() @IsString() rfqId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() currency?: string;
  @ApiProperty() @IsInt() @Min(1) pricePerUnitMinor!: number;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1) moq?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(0) leadTimeDays?: number;
}

export class AcceptQuoteParamDto {
  @ApiProperty() @IsString() id!: string;
}
