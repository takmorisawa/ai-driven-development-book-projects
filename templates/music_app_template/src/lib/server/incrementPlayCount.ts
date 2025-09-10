import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 指定された曲の再生回数を1カウントアップする
 * @param songId - 再生回数をアップする曲のID
 * @returns 更新された曲情報（アーティスト情報を含む）
 */
export async function incrementPlayCount(songId: number) {
  console.log('incrementPlayCount called with songId:', songId);
  
  try {
    // まず曲が存在するかチェック
    const existingSong = await prisma.song.findUnique({
      where: { id: songId },
      include: { artist: true }
    });
    
    console.log('Existing song:', existingSong);
    
    if (!existingSong) {
      throw new Error(`Song with id ${songId} not found`);
    }
    
    // 曲の再生回数を1増やす
    const updatedSong = await prisma.song.update({
      where: { id: songId },
      data: {
        playCount: {
          increment: 1,
        },
      },
      include: {
        artist: true,
      },
    });

    console.log('Play count incremented successfully:', updatedSong);
    return updatedSong;
  } catch (error) {
    console.error('Error in incrementPlayCount:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      songId: songId
    });
    throw error;
  }
}
