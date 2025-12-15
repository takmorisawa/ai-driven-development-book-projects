import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function listProducts(regionId?: number) {
  return await prisma.product.findMany({
    where: regionId ? { regionId } : undefined,
    include: {
      region: true,
    },
    orderBy: {
      ranking: 'asc',
    },
  });
}

