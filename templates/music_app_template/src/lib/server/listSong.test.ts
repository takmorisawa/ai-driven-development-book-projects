import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { listSong } from './listSong';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

describe('listSong', () => {
  let testArtist1Id: number;
  let testArtist2Id: number;
  let testSong1Id: number;
  let testSong2Id: number;
  let testSong3Id: number;
  let testSong4Id: number;

  beforeAll(async () => {
    // テスト用のディレクトリを作成
    const uploadDir = path.join(process.cwd(), 'static', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // テスト用のアーティスト1と曲を作成
    const testArtist1 = await prisma.artist.create({
      data: {
        name: 'Test Artist 1',
        profile: 'This is test artist 1 profile.',
        image: '/uploads/test-artist1.png',
        songs: {
          create: [
            {
              title: 'Test Song 1 by Artist 1',
              audio: '/uploads/test-song1.mp3',
              image: '/uploads/test-song1.jpg',
            },
            {
              title: 'Test Song 2 by Artist 1',
              audio: '/uploads/test-song2.mp3',
              image: '/uploads/test-song2.jpg',
            },
          ],
        },
      },
      include: { songs: true }
    });

    testArtist1Id = testArtist1.id;
    testSong1Id = testArtist1.songs[0].id;
    testSong2Id = testArtist1.songs[1].id;

    // テスト用のアーティスト2と曲を作成
    const testArtist2 = await prisma.artist.create({
      data: {
        name: 'Test Artist 2',
        profile: 'This is test artist 2 profile.',
        image: '/uploads/test-artist2.png',
        songs: {
          create: [
            {
              title: 'Test Song 1 by Artist 2',
              audio: '/uploads/test-song3.mp3',
              image: '/uploads/test-song3.jpg',
            },
            {
              title: 'Test Song 2 by Artist 2',
              audio: '/uploads/test-song4.mp3',
              image: '/uploads/test-song4.jpg',
            },
          ],
        },
      },
      include: { songs: true }
    });

    testArtist2Id = testArtist2.id;
    testSong3Id = testArtist2.songs[0].id;
    testSong4Id = testArtist2.songs[1].id;
  });

  afterAll(async () => {
    // テストデータを削除
    const testArtists = await prisma.artist.findMany({
      where: {
        OR: [
          { name: 'Test Artist 1' },
          { name: 'Test Artist 2' },
        ]
      },
      include: { songs: true }
    });

    for (const artist of testArtists) {
      if (artist.songs.length > 0) {
        await prisma.song.deleteMany({
          where: { artistId: artist.id }
        });
      }

      await prisma.artist.delete({
        where: { id: artist.id }
      });
    }

    // アップロードされたファイルを削除
    const uploadDir = path.join(process.cwd(), 'static', 'uploads');
    if (fs.existsSync(uploadDir)) {
      fs.readdirSync(uploadDir).forEach(file => {
        if (file.startsWith('test')) {
          const filePath = path.join(uploadDir, file);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });
    }

    await prisma.$disconnect();
  });

  it('should list all songs with their artists', async () => {
    const songs = await listSong();

    expect(songs).toBeDefined();
    expect(songs.length).toBeGreaterThanOrEqual(4);

    // アーティスト1の曲を検証
    const artist1Songs = songs.filter(song => song.artistId === testArtist1Id);
    expect(artist1Songs.length).toBe(2);

    const song1 = artist1Songs.find(song => song.title === 'Test Song 1 by Artist 1');
    expect(song1).toBeDefined();
    expect(song1?.artist.name).toBe('Test Artist 1');
    expect(song1?.audio).toBe('/uploads/test-song1.mp3');
    expect(song1?.image).toBe('/uploads/test-song1.jpg');

    const song2 = artist1Songs.find(song => song.title === 'Test Song 2 by Artist 1');
    expect(song2).toBeDefined();
    expect(song2?.artist.name).toBe('Test Artist 1');

    // アーティスト2の曲を検証
    const artist2Songs = songs.filter(song => song.artistId === testArtist2Id);
    expect(artist2Songs.length).toBe(2);

    const song3 = artist2Songs.find(song => song.title === 'Test Song 1 by Artist 2');
    expect(song3).toBeDefined();
    expect(song3?.artist.name).toBe('Test Artist 2');

    const song4 = artist2Songs.find(song => song.title === 'Test Song 2 by Artist 2');
    expect(song4).toBeDefined();
    expect(song4?.artist.name).toBe('Test Artist 2');
  });

  it('should list songs by specific artist ID', async () => {
    const songs = await listSong(undefined, testArtist1Id);

    expect(songs).toBeDefined();
    expect(songs.length).toBe(2);

    // すべての曲がアーティスト1のものであることを確認
    songs.forEach(song => {
      expect(song.artistId).toBe(testArtist1Id);
      expect(song.artist.name).toBe('Test Artist 1');
    });

    // 曲のタイトルを確認
    const songTitles = songs.map(song => song.title);
    expect(songTitles).toContain('Test Song 1 by Artist 1');
    expect(songTitles).toContain('Test Song 2 by Artist 1');
  });

  it('should list songs by another specific artist ID', async () => {
    const songs = await listSong(undefined, testArtist2Id);

    expect(songs).toBeDefined();
    expect(songs.length).toBe(2);

    // すべての曲がアーティスト2のものであることを確認
    songs.forEach(song => {
      expect(song.artistId).toBe(testArtist2Id);
      expect(song.artist.name).toBe('Test Artist 2');
    });

    // 曲のタイトルを確認
    const songTitles = songs.map(song => song.title);
    expect(songTitles).toContain('Test Song 1 by Artist 2');
    expect(songTitles).toContain('Test Song 2 by Artist 2');
  });

  it('should list songs by specific song IDs', async () => {
    // 特定の曲IDのリストで曲を取得
    const songIds = [testSong1Id, testSong3Id];
    const songs = await listSong(songIds);

    expect(songs).toBeDefined();
    expect(songs.length).toBe(2);

    // 取得した曲のIDが期待値と一致することを確認
    const retrievedSongIds = songs.map(song => song.id);
    expect(retrievedSongIds).toContain(testSong1Id);
    expect(retrievedSongIds).toContain(testSong3Id);

    // 各曲の詳細を確認
    const song1 = songs.find(song => song.id === testSong1Id);
    expect(song1?.title).toBe('Test Song 1 by Artist 1');
    expect(song1?.artist.name).toBe('Test Artist 1');

    const song3 = songs.find(song => song.id === testSong3Id);
    expect(song3?.title).toBe('Test Song 1 by Artist 2');
    expect(song3?.artist.name).toBe('Test Artist 2');
  });

  it('should list multiple songs by song IDs from same artist', async () => {
    // 同じアーティストの複数の曲IDで取得
    const songIds = [testSong1Id, testSong2Id];
    const songs = await listSong(songIds);

    expect(songs).toBeDefined();
    expect(songs.length).toBe(2);

    // すべての曲が同じアーティストのものであることを確認
    songs.forEach(song => {
      expect(song.artistId).toBe(testArtist1Id);
      expect(song.artist.name).toBe('Test Artist 1');
    });

    const songTitles = songs.map(song => song.title);
    expect(songTitles).toContain('Test Song 1 by Artist 1');
    expect(songTitles).toContain('Test Song 2 by Artist 1');
  });

  it('should return empty array for non-existent song IDs', async () => {
    // 存在しない曲IDで取得
    const nonExistentSongIds = [99999, 99998];
    const songs = await listSong(nonExistentSongIds);

    expect(songs).toBeDefined();
    expect(songs.length).toBe(0);
  });

  it('should return empty array for non-existent artist ID', async () => {
    // 存在しないアーティストIDで取得
    const songs = await listSong(undefined, 99999);

    expect(songs).toBeDefined();
    expect(songs.length).toBe(0);
  });

  it('should return all songs when songIds is empty array', async () => {
    // 空の配列を渡した場合は全曲取得
    const songs = await listSong([]);

    expect(songs).toBeDefined();
    expect(songs.length).toBeGreaterThanOrEqual(4);

    // 両方のアーティストの曲が含まれていることを確認
    const artist1Songs = songs.filter(song => song.artistId === testArtist1Id);
    const artist2Songs = songs.filter(song => song.artistId === testArtist2Id);

    expect(artist1Songs.length).toBe(2);
    expect(artist2Songs.length).toBe(2);
  });

  it('should handle mixed existing and non-existing song IDs', async () => {
    // 存在する曲IDと存在しない曲IDを混在させる
    const mixedSongIds = [testSong1Id, 99999, testSong3Id, 99998];
    const songs = await listSong(mixedSongIds);

    expect(songs).toBeDefined();
    expect(songs.length).toBe(2);

    // 存在する曲のみが取得されることを確認
    const retrievedSongIds = songs.map(song => song.id);
    expect(retrievedSongIds).toContain(testSong1Id);
    expect(retrievedSongIds).toContain(testSong3Id);
    expect(retrievedSongIds).not.toContain(99999);
    expect(retrievedSongIds).not.toContain(99998);
  });

  it('should return songs with correct artist relationships', async () => {
    const songs = await listSong();

    // すべての曲にアーティスト情報が含まれていることを確認
    songs.forEach(song => {
      expect(song.artist).toBeDefined();
      expect(song.artist.id).toBeDefined();
      expect(song.artist.name).toBeDefined();
      expect(song.artist.profile).toBeDefined();
      expect(song.artistId).toBe(song.artist.id);
    });
  });
});
