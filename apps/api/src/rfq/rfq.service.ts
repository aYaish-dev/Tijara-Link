import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RfqService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  list() {
    return this.prisma.rfq.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, status: true, destinationCountry: true, createdAt: true },
    });
  }

  async create(dto: any) {
    const title = (dto?.title || '').toString().trim();
    if (!title) throw new Error('title is required');
    return this.prisma.rfq.create({
      data: {
        title,
        details: dto?.details?.toString(),
        destinationCountry: dto?.destinationCountry?.toString(),
        status: 'OPEN',
      },
      select: { id: true, title: true, status: true, destinationCountry: true, createdAt: true },
    });
  }
}
