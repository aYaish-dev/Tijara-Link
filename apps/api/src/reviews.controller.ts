import { Controller, Post, Put, Get, Param, Body, Inject } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ApiTags } from '@nestjs/swagger';
import { OrderIdParamDto, UpsertReviewDto } from './dto/reviews.dto';

@ApiTags('reviews')
@Controller()
export class ReviewsController {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  // إنشاء أول مرة (سيفشل لو فيه review لنفس orderId بسبب unique)
  @Post('orders/:orderId/review')
  async create(@Param() p: OrderIdParamDto, @Body() dto: UpsertReviewDto) {
    try {
      const { orderId } = p;

      const order = await this.prisma.order.findUnique({ where: { id: orderId } });
      if (!order) throw new Error('Order not found');

      const rating = Number(dto.rating);
      const text = dto.comment?.toString() ?? null;

      const created = await this.prisma.review.create({
        data: {
          orderId,
          companyId: order.supplierCompanyId, // تقييم المورد المرتبط بالطلب
          rating,
          text,
        },
      });

      return created;
    } catch (e: any) {
      console.error('REVIEW CREATE ERROR:', e?.message, e?.stack);
      return { error: true, message: e?.message || 'create review failed' };
    }
  }

  // Upsert — لو موجود يعدّل، لو مش موجود ينشئ
  @Put('orders/:orderId/review')
  async upsert(@Param() p: OrderIdParamDto, @Body() dto: UpsertReviewDto) {
    try {
      const { orderId } = p;

      const order = await this.prisma.order.findUnique({ where: { id: orderId } });
      if (!order) throw new Error('Order not found');

      const rating = Number(dto.rating);
      const text = dto.comment?.toString() ?? null;

      const upserted = await this.prisma.review.upsert({
        where: { orderId }, // يعتمد على unique(orderId)
        update: { rating, text },
        create: {
          orderId,
          companyId: order.supplierCompanyId,
          rating,
          text,
        },
      });

      return upserted;
    } catch (e: any) {
      console.error('REVIEW UPSERT ERROR:', e?.message, e?.stack);
      return { error: true, message: e?.message || 'upsert review failed' };
    }
  }

  // قراءة مراجعات المورد + المتوسط
  @Get('suppliers/:companyId/reviews')
  async listForSupplier(@Param('companyId') companyId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, companyId: true, orderId: true, rating: true, text: true, createdAt: true },
    });

    let avg = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum: number, review: (typeof reviews)[number]) => sum + (review.rating ?? 0),
        0,
      );
      avg = Math.round((totalRating / reviews.length) * 10) / 10;
    }

    return { reviews, avg };
  }
}
