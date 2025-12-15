import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function listTerrains(regionId?: number) {
  return await prisma.terrain.findMany({
    where: regionId ? { regionId } : undefined,
    include: {
      region: true,
    },
  });
}

