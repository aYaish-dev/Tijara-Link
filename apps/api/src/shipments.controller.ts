import { Controller, Post, Body, Get, Param, Inject } from '@nestjs/common';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PrismaService } from './prisma.service';

enum ShipmentMode {
  AIR = 'AIR',
  SEA = 'SEA',
  ROAD = 'ROAD',
  RAIL = 'RAIL',
}

enum ShipmentStatus {
  BOOKED = 'BOOKED',
  IN_TRANSIT = 'IN_TRANSIT',
  CUSTOMS = 'CUSTOMS',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

class CreateShipmentDto {
  @IsOptional()
  @IsEnum(ShipmentMode, {
    message: `mode must be one of ${Object.values(ShipmentMode).join(', ')}`,
  })
  mode?: ShipmentMode;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  tracking?: string;
}

@Controller()
export class ShipmentsController {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  @Post('orders/:orderId/shipments')
  async create(@Param('orderId') orderId: string, @Body() dto: CreateShipmentDto) {
    try {
      const mode = dto.mode || ShipmentMode.SEA;
      const tracking = dto.trackingNumber?.trim() || dto.tracking?.trim() || null; // الحقل في DB اسمه "tracking"
      const created = await this.prisma.shipment.create({
        data: { orderId, mode, tracking, status: ShipmentStatus.BOOKED },
      });
      return created;
    } catch (e: any) {
      console.error('SHIPMENT CREATE ERROR:', e?.message, e?.stack);
      return { error: true, message: e?.message || 'create shipment failed' };
    }
  }

  @Get('orders/:orderId/shipments')
  async list(@Param('orderId') orderId: string) {
    try {
      const rows = await this.prisma.shipment.findMany({
        where: { orderId },
        orderBy: { createdAt: 'desc' },
      });
      return rows;
    } catch (e: any) {
      console.error('SHIPMENT LIST ERROR:', e?.message, e?.stack);
      return [];
    }
  }

  @Post('shipments/:id/status')
  async setStatus(@Param('id') id: string, @Body() dto: any) {
    try {
      const status = (dto?.status || '').toString().toUpperCase();
      if (!status) throw new Error('status is required');
      const updated = await this.prisma.shipment.update({
        where: { id },
        data: { status },
      });
      return updated;
    } catch (e: any) {
      console.error('SHIPMENT STATUS ERROR:', e?.message, e?.stack);
      return { error: true, message: e?.message || 'update status failed' };
    }
  }
}
