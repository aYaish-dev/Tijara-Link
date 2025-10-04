import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateContractParamDto {
  @ApiProperty() @IsString() orderId: string;
}

export class CreateContractBodyDto {
  @ApiProperty() @IsString() terms: string; // رح نعمل له hash داخليًا
}

export class ContractIdParamDto {
  @ApiProperty() @IsString() id: string;
}

export class SignContractDto {
  @ApiProperty({ enum: ['buyer','supplier'] })
  @IsString() role: 'buyer'|'supplier';
}
