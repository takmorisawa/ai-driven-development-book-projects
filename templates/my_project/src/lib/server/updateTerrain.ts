import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function updateTerrain(
  id: number,
  name: string,
  regionId: number,
  latitude: number,
  longitude: number,
  description?: string,
  imageFile?: File
) {
  let imagePath: string | undefined;

  if (imageFile) {
    const uploadDir = path.join(process.cwd(), 'static', 'uploads');
    const fileName = `${uuidv4()}${path.extname(imageFile.name)}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = await imageFile.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));
    imagePath = `/uploads/${fileName}`;
  }

  const updateData: {
    name: string;
    regionId: number;
    latitude: number;
    longitude: number;
    description?: string;
    image?: string;
  } = {
    name,
    regionId,
    latitude,
    longitude,
    description,
  };

  if (imagePath) {
    updateData.image = imagePath;
  }

  return await prisma.terrain.update({
    where: { id },
    data: updateData,
  });
}
