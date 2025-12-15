import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getRegion(id: number) {
  return await prisma.region.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          region: true,
        },
        orderBy: {
          ranking: 'asc',
        },
      },
      landmarks: {
        include: {
          region: true,
        },
      },
      terrains: {
        include: {
          region: true,
        },
      },
    },
  });
}

