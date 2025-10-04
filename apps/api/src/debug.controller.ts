import { Controller, Get, Inject } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('debug')
export class DebugController {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  @Get('db')
  async db() {
    try {
      const one = await this.prisma.$queryRawUnsafe<any[]>('SELECT 1 as ok');
      const rfqCount = await this.prisma.rfq.count().catch(() => -1);
      return { ok: true, engine: one, rfqCount };
    } catch (e: any) {
      return { ok: false, error: e?.message || String(e) };
    }
  }
}
