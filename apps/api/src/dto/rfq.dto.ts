import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateRfqDto {
  @ApiProperty() @IsString() title!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() details?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() destinationCountry?: string;
}
