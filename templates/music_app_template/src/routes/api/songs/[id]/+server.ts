import { json, type RequestEvent } from '@sveltejs/kit';
import { incrementPlayCount } from '$lib/server/incrementPlayCount';

/**
 * PUT /api/songs/[id]
 * 指定された曲の再生回数を1カウントアップする
 */
export async function PUT({ params }: RequestEvent) {
  try {
    // URLパラメータから曲IDを取得
    const songId = parseInt(params.id || '', 10);
    
    // 曲IDのバリデーション
    if (isNaN(songId) || songId <= 0) {
      return json(
        { error: 'Invalid song ID' }, 
        { status: 400 }
      );
    }

    // 再生回数をカウントアップ
    const updatedSong = await incrementPlayCount(songId);

    return json(
      { 
        message: 'Play count incremented successfully',
        song: "test"
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('Error incrementing play count:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      songId: params.id,
      function: 'PUT /api/songs/[id]'
    });

    // Prismaエラーを判定してより具体的なエラーを返す
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return json(
        { error: 'Song not found' }, 
        { status: 404 }
      );
    }

    return json(
      { error: 'Failed to increment play count' }, 
      { status: 500 }
    );
  }
}
