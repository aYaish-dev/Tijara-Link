import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';
const prisma = new PrismaClient();

async function main() {
  const buyer = await prisma.company.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000000001', legalName: 'Pal Buyer Co.', countryCode: 'PS' }
  });
  const supplier = await prisma.company.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000000002', legalName: 'TR Supplier Ltd.', countryCode: 'TR' }
  });

  const demoPassword = await hash('x');

  await prisma.user.upsert({
    where: { id: '00000000-0000-0000-0000-000000000011' },
    update: { password: demoPassword },
    create: {
      id: '00000000-0000-0000-0000-000000000011',
      companyId: buyer.id,
      email: 'buyer@demo.ps',
      fullName: 'Buyer One',
      role: 'BUYER',
      password: demoPassword,
    },
  });

  await prisma.user.upsert({
    where: { id: '00000000-0000-0000-0000-000000000012' },
    update: { password: demoPassword },
    create: {
      id: '00000000-0000-0000-0000-000000000012',
      companyId: supplier.id,
      email: 'supplier@demo.tr',
      fullName: 'Supplier One',
      role: 'SUPPLIER',
      password: demoPassword,
    },
  });

  await prisma.product.createMany({
    data: [
      { companyId: supplier.id, nameI18n: { en: 'Cement (50kg)', ar: 'أسمنت (50كج)', tr: 'Çimento (50kg)' }, hsCode: '2523.29', unit: 'bag' },
      { companyId: supplier.id, nameI18n: { en: 'Rebar Steel', ar: 'حديد تسليح', tr: 'İnşaat demiri' }, hsCode: '7214.20', unit: 'ton' }
    ]
  });

  console.log('Seeded demo data.');
}

main().finally(async () => { await prisma.$disconnect(); });
