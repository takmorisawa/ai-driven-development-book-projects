import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function updateSong(id: number, title: string, artistId: number, imageFile?: File, audioFile?: File) {
  let imagePath = null;
  let audioPath = null;

  if (imageFile) {
    // 画像ファイルを保存するパスを設定
    const uploadDir = path.join(process.cwd(), 'static', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // ファイル拡張子を取得
    const fileExtension = path.extname(imageFile.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // 画像ファイルを保存
    const buffer = await imageFile.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    imagePath = `/uploads/${fileName}`;
  }

  if (audioFile) {
    // 音声ファイルを保存するパスを設定
    const uploadDir = path.join(process.cwd(), 'static', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // ファイル拡張子を取得
    const fileExtension = path.extname(audioFile.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // 音声ファイルを保存
    const buffer = await audioFile.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    audioPath = `/uploads/${fileName}`;
  }

  // 曲情報をデータベースで更新
  const updatedSong = await prisma.song.update({
    where: { id },
    data: {
      title,
      artistId,
      ...(imagePath && { image: imagePath }),
      ...(audioPath && { audio: audioPath }),
    },
    include: {
      artist: true,
    },
  });

  return updatedSong;
}
