import { Controller, Get, Post, Body, Param, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from './prisma.service';
import { IdParamDto } from './dto/id-param.dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  // GET /orders/:id  → يرجع الطلب مع العلاقات
  @Get(':id')
  async get(@Param() params: IdParamDto) {
    const { id } = params;
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        escrow: true,
        shipments: true,
        items: true,
        contract: true,
      },
    });
  }

  // POST /orders  → إنشاء طلب من Quote
  // body: { quoteId: string, totalMinor?: number, totalCurrency?: string }
  @Post()
  async createFromQuote(@Body() dto: any) {
    try {
      const quoteId = (dto?.quoteId || '').toString().trim();
      if (!quoteId) throw new Error('quoteId is required');

      const quote = await this.prisma.quote.findUnique({ where: { id: quoteId } });
      if (!quote) throw new Error('Quote not found');

      // totalMinor: إن لم يُرسل، نستخدم pricePerUnitMinor من الـ Quote
      const totalMinor = Number(dto?.totalMinor ?? quote.pricePerUnitMinor ?? 0);
      if (!Number.isFinite(totalMinor) || totalMinor <= 0) {
        throw new Error('totalMinor must be > 0');
      }
      const totalCurrency =
        (dto?.totalCurrency || quote.currency || 'USD').toString().toUpperCase().slice(0, 3);

      // المشتري الديمو (بدون upsert على non-unique)
      let buyer = await this.prisma.company.findFirst({
        where: { legalName: 'Demo Buyer PS' },
        select: { id: true },
      });
      if (!buyer) {
        buyer = await this.prisma.company.create({
          data: { legalName: 'Demo Buyer PS', countryCode: 'PS', vatNumber: 'PS-DEMO' },
          select: { id: true },
        });
      }

      // المورد مأخوذ من الـ Quote
      const supplierCompanyId = quote.supplierCompanyId;

      // أنشئ الطلب (مقيد بكون quoteId فريد)
      const order = await this.prisma.order.create({
        data: {
          quoteId,
          buyerCompanyId: buyer.id,
          supplierCompanyId,
          totalMinor,
          totalCurrency,
          status: 'PLACED',
        },
      });

      // أنشئ Escrow مربوط بالطلب
      const escrow = await this.prisma.escrow.create({
        data: {
          orderId: order.id,
          heldMinor: totalMinor,
          currency: totalCurrency,
          released: false,
        },
      });

      // أنشئ Line Item بسيط
      const item = await this.prisma.orderItem.create({
        data: {
          orderId: order.id,
          name: 'Line Item',
          qty: 1,
          unit: null,
          unitMinor: totalMinor,
        },
      });

      // رجّع الطلب مع العلاقات
      const full = await this.prisma.order.findUnique({
        where: { id: order.id },
        include: { escrow: true, shipments: true, items: true, contract: true },
      });

      return full;
    } catch (e: any) {
      console.error('ORDER CREATE ERROR:', e?.message, e?.stack);
      return { error: true, message: e?.message || 'create order failed' };
    }
  }

  // POST /orders/:id/escrow/release  → تحرير الضمان
  @Post(':id/escrow/release')
  async releaseEscrow(@Param() params: IdParamDto) {
    try {
      const { id } = params;
      const order = await this.prisma.order.findUnique({
        where: { id },
        include: { escrow: true },
      });
      if (!order) return { error: true, code: 404, message: 'Order not found' };
      if (!order.escrow) return { error: true, code: 404, message: 'Escrow not found' };

      const updated = await this.prisma.escrow.update({
        where: { id: order.escrow.id },
        data: { released: true },
      });

      return { ok: true, escrow: updated };
    } catch (e: any) {
      console.error('ESCROW RELEASE ERROR:', e?.message, e?.stack);
      return { error: true, message: e?.message || 'escrow release failed' };
    }
  }
}
