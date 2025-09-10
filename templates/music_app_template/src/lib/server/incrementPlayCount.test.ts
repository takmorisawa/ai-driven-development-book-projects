import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { incrementPlayCount } from './incrementPlayCount';

const prisma = new PrismaClient();

describe('incrementPlayCount', () => {
  let testArtistId: number;
  let testSongId: number;

  beforeEach(async () => {
    // テスト用のアーティストを作成
    const artist = await prisma.artist.create({
      data: {
        name: 'テストアーティスト',
        profile: 'テスト用のプロフィール',
      },
    });
    testArtistId = artist.id;

    // テスト用の楽曲を作成
    const song = await prisma.song.create({
      data: {
        title: 'テスト楽曲',
        artistId: testArtistId,
        audio: 'test-audio.mp3',
        playCount: 0,
      },
    });
    testSongId = song.id;
  });

  afterEach(async () => {
    // テストデータをクリーンアップ
    await prisma.song.deleteMany({
      where: { artistId: testArtistId },
    });
    await prisma.artist.deleteMany({
      where: { id: testArtistId },
    });
  });

  it('楽曲の再生回数が1増加すること', async () => {
    // 初期の再生回数を確認
    const initialSong = await prisma.song.findUnique({
      where: { id: testSongId },
    });
    expect(initialSong?.playCount).toBe(0);

    // 再生回数をインクリメント
    const updatedSong = await incrementPlayCount(testSongId);

    // 再生回数が1増加していることを確認
    expect(updatedSong.playCount).toBe(1);
    expect(updatedSong.id).toBe(testSongId);
    expect(updatedSong.title).toBe('テスト楽曲');
  });

  it('複数回呼び出すと再生回数が累積されること', async () => {
    // 3回インクリメント
    await incrementPlayCount(testSongId);
    await incrementPlayCount(testSongId);
    const finalSong = await incrementPlayCount(testSongId);

    // 再生回数が3になっていることを確認
    expect(finalSong.playCount).toBe(3);
  });

  it('アーティスト情報も含まれて返されること', async () => {
    const updatedSong = await incrementPlayCount(testSongId);

    // アーティスト情報が含まれていることを確認
    expect(updatedSong.artist).toBeDefined();
    expect(updatedSong.artist.name).toBe('テストアーティスト');
    expect(updatedSong.artist.id).toBe(testArtistId);
  });

  it('存在しない楽曲IDの場合はエラーが発生すること', async () => {
    const nonExistentSongId = 99999;

    // 存在しない楽曲IDでエラーが発生することを確認
    await expect(incrementPlayCount(nonExistentSongId)).rejects.toThrow();
  });
});
