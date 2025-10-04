import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max, IsString } from 'class-validator';

export class OrderIdParamDto {
  @ApiProperty() @IsString() orderId!: string;
}

export class UpsertReviewDto {
  @ApiProperty() @IsInt() @Min(1) @Max(5) rating!: number;
  @ApiProperty() @IsString() comment!: string;
}
