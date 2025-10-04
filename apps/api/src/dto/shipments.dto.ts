import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateShipmentDto {
  @ApiProperty({ enum: ['AIR','SEA','ROAD'] })
  @IsString() @IsIn(['AIR','SEA','ROAD'])
  mode!: 'AIR'|'SEA'|'ROAD';

  @ApiProperty({ required: false }) @IsOptional() @IsString()
  trackingNumber?: string;
}

export class UpdateShipmentStatusDto {
  @ApiProperty({ enum: ['BOOKED','AT_CUSTOMS','IN_TRANSIT','DELIVERED'] })
  @IsString() @IsIn(['BOOKED','AT_CUSTOMS','IN_TRANSIT','DELIVERED'])
  status!: 'BOOKED'|'AT_CUSTOMS'|'IN_TRANSIT'|'DELIVERED';
}

export class ShipmentIdParamDto {
  @ApiProperty() @IsString() id!: string;
}

export class ShipmentIdInParentParamDto {
  @ApiProperty() @IsString() orderId!: string;
}

export class AttachCustomsDto {
  @ApiProperty() data: any;
  @ApiProperty() @IsString() status!: string;
}

export class CustomsIdParamDto {
  @ApiProperty() @IsString() id!: string;
}

export class UpdateCustomsStatusDto {
  @ApiProperty() @IsString() status!: string;
}
