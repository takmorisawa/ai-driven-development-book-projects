import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function updateRegion(
  id: number,
  name: string,
  prefectureCode: string,
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
    prefectureCode: string;
    latitude: number;
    longitude: number;
    description?: string;
  } = {
    name,
    prefectureCode,
    latitude,
    longitude,
    description,
  };

  return await prisma.region.update({
    where: { id },
    data: updateData,
  });
}
