import { Controller, Get, Post, Body, Param, Inject } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from './prisma.service';
import { IdParamDto } from './dto/id-param.dto';
import { CreateOrderDto } from './dto/orders.dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List orders with logistics and review details' })
  @ApiOkResponse({ description: 'Orders enriched with escrow, shipments, contract, and review data' })
  async list() {
    const orders = await this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        escrow: true,
        shipments: {
          include: { customs: true },
          orderBy: { createdAt: 'desc' },
        },
        contract: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return orders.map((order) => {
      const latestReview = order.reviews?.[0] ?? null;
      return {
        id: order.id,
        status: order.status,
        totalMinor: order.totalMinor,
        totalCurrency: order.totalCurrency,
        createdAt: order.createdAt?.toISOString?.() ?? order.createdAt,
        buyerCompanyId: order.buyerCompanyId,
        buyerId: order.buyerCompanyId,
        supplierCompanyId: order.supplierCompanyId,
        supplierId: order.supplierCompanyId,
        escrow: order.escrow
          ? {
              id: order.escrow.id,
              heldMinor: order.escrow.heldMinor,
              currency: order.escrow.currency,
              released: order.escrow.released,
              createdAt: order.escrow.createdAt?.toISOString?.() ?? order.escrow.createdAt,
            }
          : null,
        shipments: order.shipments.map((shipment) => ({
          id: shipment.id,
          orderId: shipment.orderId,
          mode: shipment.mode,
          tracking: shipment.tracking,
          status: shipment.status,
          createdAt: shipment.createdAt?.toISOString?.() ?? shipment.createdAt,
          customs: shipment.customs.map((customs) => ({
            id: customs.id,
            shipmentId: customs.shipmentId,
            status: customs.status,
            data: customs.data,
          })),
        })),
        contract: order.contract
          ? {
              id: order.contract.id,
              hash: order.contract.hash,
              buyerSignedAt:
                order.contract.buyerSignedAt?.toISOString?.() ?? order.contract.buyerSignedAt,
              supplierSignedAt:
                order.contract.supplierSignedAt?.toISOString?.() ?? order.contract.supplierSignedAt,
              
            }
          : null,
        review: latestReview
          ? {
              id: latestReview.id,
              rating: latestReview.rating,
              comment: latestReview.text,
              text: latestReview.text,
              orderId: latestReview.orderId,
              supplierCompanyId: latestReview.companyId,
              
            }
          : null,
      };
    });
  }

  // GET /orders/:id  → يرجع الطلب مع العلاقات
  @Get(':id')
  async get(@Param() params: IdParamDto) {
    const { id } = params;
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        escrow: true,
        shipments: { include: { customs: true } },
        items: true,
        contract: true,
        reviews: true,
      },
    });

    return this.mapOrder(order);
  }

  // POST /orders  → إنشاء طلب من Quote
  // body: { quoteId: string, totalMinor?: number, totalCurrency?: string }
  @Post()
  async createFromQuote(@Body() dto: CreateOrderDto) {
    try {
      const quoteId = dto.quoteId.toString().trim();
      if (!quoteId) throw new Error('quoteId is required');

      const quote = await this.prisma.quote.findUnique({ where: { id: quoteId } });
      if (!quote) throw new Error('Quote not found');

      // totalMinor: إن لم يُرسل، نستخدم pricePerUnitMinor من الـ Quote
      const totalMinor = Number(dto.totalMinor ?? quote.pricePerUnitMinor ?? 0);
      if (!Number.isFinite(totalMinor) || totalMinor <= 0) {
        throw new Error('totalMinor must be > 0');
      }
      const totalCurrency =
        (dto.totalCurrency || quote.currency || 'USD').toString().toUpperCase().slice(0, 3);

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
        include: {
          escrow: true,
          shipments: { include: { customs: true } },
          items: true,
          contract: true,
          reviews: true,
        },
      });

      return this.mapOrder(full);
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

  private mapOrder(order: any) {
    if (!order) return order;

    const { buyerCompanyId, supplierCompanyId, shipments, reviews, ...rest } = order;

    return {
      ...rest,
      buyerId: buyerCompanyId,
      supplierId: supplierCompanyId,
      shipments: Array.isArray(shipments)
        ? shipments.map((shipment) => ({
            ...shipment,
            customs: shipment?.customs ?? null,
          }))
        : [],
      review: Array.isArray(reviews) ? reviews[0] ?? null : null,
    };
  }
}
