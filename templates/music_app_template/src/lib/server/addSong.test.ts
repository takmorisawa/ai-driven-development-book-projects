import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { addSong } from './addSong';
import { addArtist } from './addArtist';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

describe('addSong', () => {
  const testImageBuffer = Buffer.from('dummy image content');
  const testAudioBuffer = Buffer.from('dummy audio content');
  let testArtistId: number;

  beforeAll(async () => {
    // テスト用のディレクトリを作成
    const uploadDir = path.join(process.cwd(), 'static', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // テスト用のアーティストを作成
    const testArtistFile = new File([testImageBuffer], 'test-artist.png', {
      type: 'image/png',
      lastModified: new Date().getTime(),
    });

    // エラー対策のためにFile.prototype.arrayBufferを上書き
    testArtistFile.arrayBuffer = async function() {
      return testImageBuffer.buffer;
    };

    const testArtist = await addArtist('Test Artist for Song', 'This is a test artist for song tests.', testArtistFile);
    testArtistId = testArtist.id;
  });

  afterAll(async () => {
    // テストデータを削除
    const testArtist = await prisma.artist.findFirst({
      where: { name: 'Test Artist for Song' },
      include: { songs: true }
    });

    if (testArtist) {
      // 関連する曲を先に削除
      if (testArtist.songs.length > 0) {
        await prisma.song.deleteMany({
          where: { artistId: testArtist.id }
        });
      }

      // アーティストを削除
      await prisma.artist.delete({
        where: { id: testArtist.id }
      });
    }

    // テスト用の楽曲も削除
    const testSongs = await prisma.song.findMany({
      where: { title: 'Test Song' }
    });

    for (const song of testSongs) {
      await prisma.song.delete({
        where: { id: song.id }
      });
    }

    // アップロードされたファイルを削除
    const uploadDir = path.join(process.cwd(), 'static', 'uploads');
    if (fs.existsSync(uploadDir)) {
      fs.readdirSync(uploadDir).forEach(file => {
        if (file.startsWith('test') || file.includes('test')) {
          const filePath = path.join(uploadDir, file);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });
    }

    await prisma.$disconnect();
  });

  it('should add a new song to the database with correct files', async () => {
    // テスト用の画像ファイルを作成
    const testImageFile = new File([testImageBuffer], 'test-song-image.jpg', {
      type: 'image/jpeg',
      lastModified: new Date().getTime(),
    });

    // テスト用の音声ファイルを作成
    const testAudioFile = new File([testAudioBuffer], 'test-song-audio.mp3', {
      type: 'audio/mpeg',
      lastModified: new Date().getTime(),
    });

    // エラー対策のためにFile.prototype.arrayBufferを上書き
    testImageFile.arrayBuffer = async function() {
      return testImageBuffer.buffer;
    };

    testAudioFile.arrayBuffer = async function() {
      return testAudioBuffer.buffer;
    };

    // 曲を追加
    const song = await addSong('Test Song', testArtistId, testImageFile, testAudioFile);

    // データベースに正しく保存されているか確認
    expect(song).toBeDefined();
    expect(song.title).toBe('Test Song');
    expect(song.artistId).toBe(testArtistId);
    expect(song.image).toMatch(/^\/uploads\/[a-f0-9-]+\.jpg$/);
    expect(song.audio).toMatch(/^\/uploads\/[a-f0-9-]+\.mp3$/);

    // ファイルが実際に保存されているか確認
    const uploadDir = path.join(process.cwd(), 'static', 'uploads');
    const imageFileName = song.image.replace('/uploads/', '');
    const audioFileName = song.audio.replace('/uploads/', '');
    
    const imageFilePath = path.join(uploadDir, imageFileName);
    const audioFilePath = path.join(uploadDir, audioFileName);

    expect(fs.existsSync(imageFilePath)).toBe(true);
    expect(fs.existsSync(audioFilePath)).toBe(true);

    // ファイルの内容が正しいか確認
    const savedImageBuffer = fs.readFileSync(imageFilePath);
    const savedAudioBuffer = fs.readFileSync(audioFilePath);

    expect(savedImageBuffer.equals(testImageBuffer)).toBe(true);
    expect(savedAudioBuffer.equals(testAudioBuffer)).toBe(true);

    // データベースから曲を取得して、アーティストとの関連も確認
    const savedSong = await prisma.song.findUnique({
      where: { id: song.id },
      include: { artist: true }
    });

    expect(savedSong).toBeDefined();
    expect(savedSong?.artist.name).toBe('Test Artist for Song');
    expect(savedSong?.artist.id).toBe(testArtistId);
  });

  it('should handle different file extensions correctly', async () => {
    // 異なる拡張子のファイルをテスト
    const testPngFile = new File([testImageBuffer], 'test-song-image.png', {
      type: 'image/png',
      lastModified: new Date().getTime(),
    });

    const testWavFile = new File([testAudioBuffer], 'test-song-audio.wav', {
      type: 'audio/wav',
      lastModified: new Date().getTime(),
    });

    testPngFile.arrayBuffer = async function() {
      return testImageBuffer.buffer;
    };

    testWavFile.arrayBuffer = async function() {
      return testAudioBuffer.buffer;
    };

    const song = await addSong('Test Song PNG WAV', testArtistId, testPngFile, testWavFile);

    expect(song.image).toMatch(/^\/uploads\/[a-f0-9-]+\.png$/);
    expect(song.audio).toMatch(/^\/uploads\/[a-f0-9-]+\.wav$/);

    // ファイルが実際に保存されているか確認
    const uploadDir = path.join(process.cwd(), 'static', 'uploads');
    const imageFileName = song.image.replace('/uploads/', '');
    const audioFileName = song.audio.replace('/uploads/', '');
    
    const imageFilePath = path.join(uploadDir, imageFileName);
    const audioFilePath = path.join(uploadDir, audioFileName);

    expect(fs.existsSync(imageFilePath)).toBe(true);
    expect(fs.existsSync(audioFilePath)).toBe(true);
  });
});
