import { Controller, Post, Body, Get, Param, Inject } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller()
export class ShipmentsController {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  @Post('orders/:orderId/shipments')
  async create(@Param('orderId') orderId: string, @Body() dto: any) {
    try {
      const mode = (dto?.mode || 'SEA').toString().toUpperCase(); // AIR | SEA | ROAD
      const tracking =
        dto?.trackingNumber?.toString() || dto?.tracking?.toString() || null; // الحقل في DB اسمه "tracking"
      const created = await this.prisma.shipment.create({
        data: { orderId, mode, tracking, status: 'BOOKED' },
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
