import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function addSong(title: string, artistId: number, imageFile: File, audioFile: File) {
  // アップロードディレクトリのパスを設定
  const uploadDir = path.join(process.cwd(), 'static', 'uploads');

  // 画像ファイルの保存
  const imageFileName = `${uuidv4()}${path.extname(imageFile.name)}`;
  const imageFilePath = path.join(uploadDir, imageFileName);
  const imageBuffer = await imageFile.arrayBuffer();
  fs.writeFileSync(imageFilePath, Buffer.from(imageBuffer));

  // 音声ファイルの保存
  const audioFileName = `${uuidv4()}${path.extname(audioFile.name)}`;
  const audioFilePath = path.join(uploadDir, audioFileName);
  const audioBuffer = await audioFile.arrayBuffer();
  fs.writeFileSync(audioFilePath, Buffer.from(audioBuffer));

  // 曲情報をデータベースに保存
  const song = await prisma.song.create({
    data: {
      title,
      artistId,
      image: `/uploads/${imageFileName}`,
      audio: `/uploads/${audioFileName}`,
    },
  });

  return song;
}
