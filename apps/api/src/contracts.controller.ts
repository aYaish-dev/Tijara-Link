import { Controller, Post, Param, Body, Inject } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { createHash } from 'crypto';

@Controller('contracts')
export class ContractsController {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  @Post('order/:orderId')
  async create(@Param('orderId') orderId: string, @Body() dto: any) {
    try {
      const terms = (dto?.terms || 'Standard TijaraLink Terms');
      const hash = createHash('sha256').update(terms).digest('hex');

      const existing = await this.prisma.contract.findFirst({ where: { orderId } });
      if (existing) return existing;

      const created = await this.prisma.contract.create({
        data: { orderId, hash }, // جدول Contract يحتوي hash فقط
      });
      return created;
    } catch (e: any) {
      console.error('CONTRACT CREATE ERROR:', e?.message, e?.stack);
      return { error: true, message: e?.message || 'create contract failed' };
    }
  }

  @Post(':id/sign')
  async sign(@Param('id') id: string, @Body() dto: any) {
    try {
      const role = (dto?.role || '').toString().toLowerCase(); // buyer | supplier
      if (role === 'buyer') {
        return await this.prisma.contract.update({
          where: { id },
          data: { buyerSignedAt: new Date() },
        });
      }
      if (role === 'supplier') {
        return await this.prisma.contract.update({
          where: { id },
          data: { supplierSignedAt: new Date() },
        });
      }
      throw new Error('role must be buyer or supplier');
    } catch (e: any) {
      console.error('CONTRACT SIGN ERROR:', e?.message, e?.stack);
      return { error: true, message: e?.message || 'sign failed' };
    }
  }
}
