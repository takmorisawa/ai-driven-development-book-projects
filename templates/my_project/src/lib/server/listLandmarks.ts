import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function listLandmarks(regionId?: number) {
  return await prisma.landmark.findMany({
    where: regionId ? { regionId } : undefined,
    include: {
      region: true,
    },
  });
}

