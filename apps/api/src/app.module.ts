import { ReviewsController } from './reviews.controller';
import { Module, Controller, Get } from '@nestjs/common';
import { IdentityModule } from './identity/identity.module';
import { RfqModule } from './rfq/rfq.module';

import { PrismaService } from './prisma.service';
import { CustomsController } from './customs.controller';
import { DebugController } from './debug.controller';
import { QuotesController } from './quotes.controller';
import { OrdersController } from './orders.controller';

// إذا أنشأت هذه الكنترولرات، اتركها؛ إذا لسا ما أنشأتها احذفها من القائمة تحت
import { ShipmentsController } from './shipments.controller';
import { CustomsOpsController } from './customs-ops.controller';
import { ContractsController } from './contracts.controller';
import { ReviewsController } from './reviews.controller';

@Controller('health')
class HealthController {
  @Get()
  ok() {
    return { ok: true, ts: new Date().toISOString() };
  }
}

@Module({
  imports: [
    IdentityModule,
    RfqModule,
  ],
  controllers: [
    HealthController,
    CustomsController,
    DebugController,
    QuotesController,
    OrdersController,
    // علّق/احذف أي سطر من التالي إذا ما كان الملف موجود عندك
    ShipmentsController,
    CustomsOpsController,
    ContractsController,
    ReviewsController,
  ],
  providers: [PrismaService],
})
export class AppModule {}
