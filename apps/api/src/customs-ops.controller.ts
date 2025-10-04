import { Controller, Post, Body, Param, Inject } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller()
export class CustomsOpsController {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  @Post('shipments/:shipmentId/customs')
  async attach(@Param('shipmentId') shipmentId: string, @Body() dto: any) {
    try {
      const decl = await this.prisma.customsDecl.create({
        data: {
          shipmentId,
          data: dto?.data || {},
          status: dto?.status?.toString() || null,
        },
      });
      return decl;
    } catch (e: any) {
      console.error('CUSTOMS CREATE ERROR:', e?.message, e?.stack);
      return { error: true, message: e?.message || 'attach customs failed' };
    }
  }

  @Post('customs/:id/status')
  async setStatus(@Param('id') id: string, @Body() dto: any) {
    try {
      const status = (dto?.status || '').toString();
      if (!status) throw new Error('status is required');
      const updated = await this.prisma.customsDecl.update({ where: { id }, data: { status } });
      return updated;
    } catch (e: any) {
      console.error('CUSTOMS STATUS ERROR:', e?.message, e?.stack);
      return { error: true, message: e?.message || 'update customs status failed' };
    }
  }
}
