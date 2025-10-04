import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateRfqDto } from './rfq.dto';
@ApiTags('rfq')

@Controller('rfq')
export class RfqController {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  @Get()
  async list() {
    try {
      return await this.prisma.rfq.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, status: true, destinationCountry: true, createdAt: true },
      });
    } catch (e: any) {
      console.error('RFQ LIST ERROR:', e?.stack || e);
      return [];
    }
  }

  @Post()
  async create(@Body() dto: CreateRfqDto) {
    try {
      const title = (dto?.title || '').toString().trim();
      if (!title) throw new Error('title is required');
      return await this.prisma.rfq.create({
        data: {
          title,
          details: dto?.details?.toString(),
          destinationCountry: dto?.destinationCountry?.toString(),
          status: 'OPEN',
        },
        select: { id: true, title: true, status: true, destinationCountry: true, createdAt: true },
      });
    } catch (e: any) {
      console.error('RFQ CREATE ERROR:', e?.stack || e);
      return { error: true, message: e?.message || 'create failed' };
    }
  }
}
