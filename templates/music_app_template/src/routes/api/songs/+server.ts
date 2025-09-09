import { json } from '@sveltejs/kit';
import { listSong } from '$lib/server/listSong';

export async function GET({ url }) {
  const artistIdParam = url.searchParams.get('artistId');
  const songIdsParam = url.searchParams.get('songIds');
  
  let artistId: number | undefined;
  let songIds: number[] | undefined;

  // artistIdパラメータの処理
  if (artistIdParam) {
    artistId = parseInt(artistIdParam, 10);
    if (isNaN(artistId)) {
      return json({ error: 'Invalid artist ID' }, { status: 400 });
    }
  }

  // songIdsパラメータの処理（カンマ区切りの文字列を想定）
  if (songIdsParam) {
    try {
      songIds = songIdsParam.split(',').map(id => {
        const parsed = parseInt(id.trim(), 10);
        if (isNaN(parsed)) {
          throw new Error('Invalid song ID');
        }
        return parsed;
      });
    } catch (error) {
      return json({ error: 'Invalid song IDs' }, { status: 400 });
    }
  }

  try {
    const songs = await listSong(songIds, artistId);
    return json(songs, { status: 200 });
  } catch (error) {
    console.error(error);
    return json({ error: 'Failed to fetch songs' }, { status: 500 });
  }
}
