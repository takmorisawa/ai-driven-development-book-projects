import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function listRegions() {
  return await prisma.region.findMany({
    include: {
      products: true,
      landmarks: true,
      terrains: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
}

