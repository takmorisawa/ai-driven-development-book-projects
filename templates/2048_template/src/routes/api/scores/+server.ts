import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from './$types';

// シンプルなUUID生成関数
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Prismaクライアントをシングルトンとして初期化
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// データベースの初期化
async function initializeDatabase() {
  try {
    // データベース接続をテスト
    await prisma.$connect();
    
    // テーブルの存在を確認し、存在しない場合は作成
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS Score (
      id TEXT PRIMARY KEY,
      points INTEGER NOT NULL,
      player TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`;
    
    console.log('データベース初期化完了');
  } catch (error) {
    console.error('データベース初期化エラー:', error);
  }
}

// アプリケーション起動時にデータベースを初期化
initializeDatabase();

// スコアを登録するPOSTリクエスト
export const POST: RequestHandler = async ({ request }) => {
  try {
    console.log('スコア登録処理開始');
    const { points, player } = await request.json();
    console.log('受信データ:', { points, player });

    // バリデーション
    if (typeof points !== 'number' || typeof player !== 'string') {
      return json({ error: '不正なデータです' }, { status: 400 });
    }

    if (points < 0) {
      return json({ error: 'スコアは0以上である必要があります' }, { status: 400 });
    }

    if (player.trim().length === 0) {
      return json({ error: 'プレイヤー名は必須です' }, { status: 400 });
    }

    if (player.length > 50) {
      return json({ error: 'プレイヤー名は50文字以内で入力してください' }, { status: 400 });
    }

    // データベース接続をテスト
    await prisma.$connect();
    console.log('データベース接続成功（POST）');

    // スコアを登録
    const newScore = await prisma.score.create({
      data: {
        id: generateUUID(),
        points,
        player: player.trim()
      }
    });

    console.log('スコア登録成功:', newScore);

    return json({
      success: true,
      data: newScore,
      message: 'スコアが正常に登録されました'
    });

  } catch (error) {
    console.error('スコア登録エラー詳細:', {
      message: error instanceof Error ? error.message : '不明なエラー',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    
    return json(
      { 
        error: 'スコアの登録中にエラーが発生しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};

// 上位5位のランキングを取得するGETリクエスト
export const GET: RequestHandler = async () => {
  try {
    console.log('ランキング取得処理開始');
    
    // データベース接続をテスト
    await prisma.$connect();
    console.log('データベース接続成功');

    const topScores = await prisma.score.findMany({
      orderBy: {
        points: 'desc'
      },
      take: 5,
      select: {
        id: true,
        points: true,
        player: true,
        createdAt: true
      }
    });

    console.log('ランキング取得成功:', topScores.length, '件');

    return json({
      success: true,
      data: topScores,
      message: 'ランキングを取得しました'
    });

  } catch (error) {
    console.error('ランキング取得エラー詳細:', {
      message: error instanceof Error ? error.message : '不明なエラー',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    
    return json(
      { 
        error: 'ランキングの取得中にエラーが発生しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};
