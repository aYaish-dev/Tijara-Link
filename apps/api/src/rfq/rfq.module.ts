import { Module } from '@nestjs/common';
import { RfqController } from './rfq.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [RfqController],
  providers: [PrismaService],
})
export class RfqModule {}
