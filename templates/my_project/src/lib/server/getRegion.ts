import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getRegion(id: number) {
  return await prisma.region.findUnique({
    where: { id },
    include: {
      products: {
        orderBy: {
          ranking: 'asc',
        },
      },
      landmarks: true,
      terrains: true,
    },
  });
}

