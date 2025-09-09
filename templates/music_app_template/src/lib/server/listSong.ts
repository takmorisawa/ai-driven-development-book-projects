import type { SongWithArtist } from '$lib/type';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function listSong(
  songIds?: number[], 
  artistId?: number
): Promise<SongWithArtist[]> {
  if (songIds && songIds.length > 0) {
    // 複数の曲IDから特定の曲を取得
    const songs = await prisma.song.findMany({
      where: { id: { in: songIds } },
      include: { artist: true }
    });
    return songs;
  } else if (artistId) {
    // アーティストIDから特定のアーティストの曲のみ取得
    const songs = await prisma.song.findMany({
      where: { artistId },
      include: { artist: true }
    });
    return songs;
  } else {
    // すべての曲を取得
    const songs = await prisma.song.findMany({
      include: { artist: true }
    });
    return songs;
  }
}
