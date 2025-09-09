import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { updateSong } from './updateSong';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

describe('updateSong', () => {
  const testImageBuffer = Buffer.from('dummy image content');
  const testAudioBuffer = Buffer.from('dummy audio content');
  const updatedImageBuffer = Buffer.from('updated image content');
  const updatedAudioBuffer = Buffer.from('updated audio content');
  
  let originalArtistId: number;
  let newArtistId: number;
  let originalSongId: number;

  beforeAll(async () => {
    // テスト用のディレクトリを作成
    const uploadDir = path.join(process.cwd(), 'static', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // テスト用の元のアーティストを作成
    const originalArtist = await prisma.artist.create({
      data: {
        name: 'Original Artist',
        profile: 'Original artist profile',
        image: '/uploads/original-artist.png',
      },
    });
    originalArtistId = originalArtist.id;

    // テスト用の新しいアーティストを作成（更新テスト用）
    const newArtist = await prisma.artist.create({
      data: {
        name: 'New Artist',
        profile: 'New artist profile',
        image: '/uploads/new-artist.png',
      },
    });
    newArtistId = newArtist.id;

    // テスト用の元の曲を作成
    const originalSong = await prisma.song.create({
      data: {
        title: 'Original Song',
        artistId: originalArtistId,
        image: '/uploads/original-song.jpg',
        audio: '/uploads/original-song.mp3',
      },
    });
    originalSongId = originalSong.id;
  });

  afterAll(async () => {
    // テストデータを削除
    const testSongs = await prisma.song.findMany({
      where: {
        OR: [
          { title: 'Updated Song' },
          { title: 'Original Song' },
          { title: 'Partially Updated Song' },
        ]
      }
    });

    for (const song of testSongs) {
      await prisma.song.delete({
        where: { id: song.id }
      });
    }

    const testArtists = await prisma.artist.findMany({
      where: {
        OR: [
          { name: 'Original Artist' },
          { name: 'New Artist' },
        ]
      }
    });

    for (const artist of testArtists) {
      await prisma.artist.delete({
        where: { id: artist.id }
      });
    }

    // アップロードされたファイルを削除
    const uploadDir = path.join(process.cwd(), 'static', 'uploads');
    if (fs.existsSync(uploadDir)) {
      fs.readdirSync(uploadDir).forEach(file => {
        if (file.startsWith('test') || file.includes('updated')) {
          const filePath = path.join(uploadDir, file);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });
    }

    await prisma.$disconnect();
  });

  it('should update song with all fields including files', async () => {
    // テスト用の更新画像ファイルを作成
    const testImageFile = new File([updatedImageBuffer], 'test-updated-image.jpg', {
      type: 'image/jpeg',
      lastModified: new Date().getTime(),
    });

    // テスト用の更新音声ファイルを作成
    const testAudioFile = new File([updatedAudioBuffer], 'test-updated-audio.mp3', {
      type: 'audio/mpeg',
      lastModified: new Date().getTime(),
    });

    // エラー対策のためにFile.prototype.arrayBufferを上書き
    testImageFile.arrayBuffer = async function() {
      return updatedImageBuffer.buffer;
    };

    testAudioFile.arrayBuffer = async function() {
      return updatedAudioBuffer.buffer;
    };

    // 曲を更新
    const updatedSong = await updateSong(
      originalSongId,
      'Updated Song',
      newArtistId,
      testImageFile,
      testAudioFile
    );

    // データベースの更新を確認
    expect(updatedSong).toBeDefined();
    expect(updatedSong.title).toBe('Updated Song');
    expect(updatedSong.artistId).toBe(newArtistId);
    expect(updatedSong.image).toMatch(/^\/uploads\/[a-f0-9-]+\.jpg$/);
    expect(updatedSong.audio).toMatch(/^\/uploads\/[a-f0-9-]+\.mp3$/);
    expect(updatedSong.artist.name).toBe('New Artist');

    // ファイルが実際に保存されているか確認
    const uploadDir = path.join(process.cwd(), 'static', 'uploads');
    const imageFileName = updatedSong.image!.replace('/uploads/', '');
    const audioFileName = updatedSong.audio.replace('/uploads/', '');
    
    const imageFilePath = path.join(uploadDir, imageFileName);
    const audioFilePath = path.join(uploadDir, audioFileName);

    expect(fs.existsSync(imageFilePath)).toBe(true);
    expect(fs.existsSync(audioFilePath)).toBe(true);

    // ファイルの内容が正しいか確認
    const savedImageBuffer = fs.readFileSync(imageFilePath);
    const savedAudioBuffer = fs.readFileSync(audioFilePath);

    expect(savedImageBuffer.equals(updatedImageBuffer)).toBe(true);
    expect(savedAudioBuffer.equals(updatedAudioBuffer)).toBe(true);
  });

  it('should update song without changing files', async () => {
    // 元の曲の情報を取得
    const originalSong = await prisma.song.findUnique({
      where: { id: originalSongId }
    });

    if (!originalSong) {
      throw new Error('Original song not found');
    }

    // ファイルを指定せずに曲を更新
    const updatedSong = await updateSong(
      originalSongId,
      'Partially Updated Song',
      originalArtistId
    );

    // タイトルとアーティストIDは更新されるが、ファイルパスは変更されない
    expect(updatedSong.title).toBe('Partially Updated Song');
    expect(updatedSong.artistId).toBe(originalArtistId);
    expect(updatedSong.image).toBe(originalSong.image);
    expect(updatedSong.audio).toBe(originalSong.audio);
  });

  it('should update only image file', async () => {
    // 元の曲の情報を取得
    const originalSong = await prisma.song.findUnique({
      where: { id: originalSongId }
    });

    if (!originalSong) {
      throw new Error('Original song not found');
    }

    // テスト用の画像ファイルのみを作成
    const testImageFile = new File([updatedImageBuffer], 'test-image-only.png', {
      type: 'image/png',
      lastModified: new Date().getTime(),
    });

    testImageFile.arrayBuffer = async function() {
      return updatedImageBuffer.buffer;
    };

    // 画像ファイルのみを更新
    const updatedSong = await updateSong(
      originalSongId,
      'Image Only Updated Song',
      originalArtistId,
      testImageFile
    );

    // 画像は更新されるが、音声は変更されない
    expect(updatedSong.title).toBe('Image Only Updated Song');
    expect(updatedSong.image).toMatch(/^\/uploads\/[a-f0-9-]+\.png$/);
    expect(updatedSong.audio).toBe(originalSong.audio);

    // 新しい画像ファイルが保存されているか確認
    const uploadDir = path.join(process.cwd(), 'static', 'uploads');
    const imageFileName = updatedSong.image!.replace('/uploads/', '');
    const imageFilePath = path.join(uploadDir, imageFileName);

    expect(fs.existsSync(imageFilePath)).toBe(true);
    
    const savedImageBuffer = fs.readFileSync(imageFilePath);
    expect(savedImageBuffer.equals(updatedImageBuffer)).toBe(true);
  });

  it('should update only audio file', async () => {
    // 元の曲の情報を取得
    const originalSong = await prisma.song.findUnique({
      where: { id: originalSongId }
    });

    if (!originalSong) {
      throw new Error('Original song not found');
    }

    // テスト用の音声ファイルのみを作成
    const testAudioFile = new File([updatedAudioBuffer], 'test-audio-only.wav', {
      type: 'audio/wav',
      lastModified: new Date().getTime(),
    });

    testAudioFile.arrayBuffer = async function() {
      return updatedAudioBuffer.buffer;
    };

    // 音声ファイルのみを更新
    const updatedSong = await updateSong(
      originalSongId,
      'Audio Only Updated Song',
      originalArtistId,
      undefined,
      testAudioFile
    );

    // 音声は更新されるが、画像は変更されない
    expect(updatedSong.title).toBe('Audio Only Updated Song');
    expect(updatedSong.audio).toMatch(/^\/uploads\/[a-f0-9-]+\.wav$/);
    expect(updatedSong.image).toBe(originalSong.image);

    // 新しい音声ファイルが保存されているか確認
    const uploadDir = path.join(process.cwd(), 'static', 'uploads');
    const audioFileName = updatedSong.audio.replace('/uploads/', '');
    const audioFilePath = path.join(uploadDir, audioFileName);

    expect(fs.existsSync(audioFilePath)).toBe(true);
    
    const savedAudioBuffer = fs.readFileSync(audioFilePath);
    expect(savedAudioBuffer.equals(updatedAudioBuffer)).toBe(true);
  });

  it('should handle different file extensions correctly', async () => {
    // 異なる拡張子のファイルをテスト
    const testWebpFile = new File([updatedImageBuffer], 'test-image.webp', {
      type: 'image/webp',
      lastModified: new Date().getTime(),
    });

    const testFlacFile = new File([updatedAudioBuffer], 'test-audio.flac', {
      type: 'audio/flac',
      lastModified: new Date().getTime(),
    });

    testWebpFile.arrayBuffer = async function() {
      return updatedImageBuffer.buffer;
    };

    testFlacFile.arrayBuffer = async function() {
      return updatedAudioBuffer.buffer;
    };

    const updatedSong = await updateSong(
      originalSongId,
      'Different Extensions Song',
      originalArtistId,
      testWebpFile,
      testFlacFile
    );

    expect(updatedSong.image).toMatch(/^\/uploads\/[a-f0-9-]+\.webp$/);
    expect(updatedSong.audio).toMatch(/^\/uploads\/[a-f0-9-]+\.flac$/);

    // ファイルが実際に保存されているか確認
    const uploadDir = path.join(process.cwd(), 'static', 'uploads');
    const imageFileName = updatedSong.image!.replace('/uploads/', '');
    const audioFileName = updatedSong.audio.replace('/uploads/', '');
    
    const imageFilePath = path.join(uploadDir, imageFileName);
    const audioFilePath = path.join(uploadDir, audioFileName);

    expect(fs.existsSync(imageFilePath)).toBe(true);
    expect(fs.existsSync(audioFilePath)).toBe(true);
  });
});

