import { ApiTags } from '@nestjs/swagger';
import { CreateQuoteDto, AcceptQuoteParamDto } from './dto/quotes.dto';
import { Controller, Post, Body, Get, Param, Inject } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@ApiTags('quotes') // ← هذا هو "فوق الكلاس"
@Controller('quotes')
export class QuotesController {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  @Get('rfq/:rfqId')
  async listByRfq(@Param('rfqId') rfqId: string) {
    try {
      return await this.prisma.quote.findMany({
        where: { rfqId },
        orderBy: { id: 'desc' },
      });
    } catch (e: any) {
      console.error('QUOTES LIST ERROR:', e?.message, e?.stack);
      return [];
    }
  }

  @Post()
  async create(@Body() dto: CreateQuoteDto) {  // ← استخدم DTO بدل any
    try {
      const rfqId = (dto?.rfqId || '').toString().trim();
      if (!rfqId) throw new Error('rfqId is required');

      const currency = (dto?.currency || 'USD').toString().toUpperCase().slice(0, 3);
      const pricePerUnitMinor = Number(dto?.pricePerUnitMinor || 0);
      if (!Number.isFinite(pricePerUnitMinor) || pricePerUnitMinor <= 0) {
        throw new Error('pricePerUnitMinor must be > 0');
      }

      let supplier = await this.prisma.company.findFirst({
        where: { legalName: 'Demo Supplier TR' },
        select: { id: true },
      });
      if (!supplier) {
        supplier = await this.prisma.company.create({
          data: { legalName: 'Demo Supplier TR', countryCode: 'TR', vatNumber: 'TR-DEMO' },
          select: { id: true },
        });
      }

      const created = await this.prisma.quote.create({
        data: {
          rfqId,
          supplierCompanyId: supplier.id,
          currency,
          pricePerUnitMinor,
          moq: dto?.moq ? Number(dto.moq) : null,
          leadTimeDays: dto?.leadTimeDays ? Number(dto.leadTimeDays) : null,
          status: 'PENDING',
        } as any,
      });

      return created;
    } catch (e: any) {
      console.error('QUOTE CREATE ERROR:', e?.message, e?.stack);
      return { error: true, message: e?.message || 'create failed' };
    }
  }

  @Post(':id/accept')
  async accept(@Param() p: AcceptQuoteParamDto) { // ← DTO للـ param
    const { id } = p;
    try {
      const updated = await this.prisma.quote.update({
        where: { id },
        data: { status: 'ACCEPTED' },
      });
      return updated;
    } catch (e: any) {
      console.error('QUOTE ACCEPT ERROR:', e?.message, e?.stack);
      return { error: true, message: e?.message || 'accept failed' };
    }
  }
}
