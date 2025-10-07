import { PrismaClient } from '@prisma/client';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Prismaクライアントをグローバルに管理
const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// スコア登録のPOSTエンドポイント
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { player, points } = await request.json();

		// バリデーション
		if (!player || typeof player !== 'string' || !points || typeof points !== 'number' || points < 0) {
			return json({ error: 'Invalid player name or points' }, { status: 400 });
		}

		// スコアをデータベースに保存
		const score = await prisma.score.create({
			data: {
				player: player.trim(),
				points: points
			}
		});

		return json({ 
			message: 'Score saved successfully', 
			score: {
				id: score.id,
				player: score.player,
				points: score.points,
				createAt: score.createAt
			}
		}, { status: 201 });

	} catch (error) {
		console.error('Error saving score:', error);
		return json({ error: 'Failed to save score' }, { status: 500 });
	}
};

// 上位5位のランキング取得のGETエンドポイント
export const GET: RequestHandler = async () => {
	try {
		// 上位5位のスコアを取得（ポイントの降順）
		const topScores = await prisma.score.findMany({
			orderBy: {
				points: 'desc'
			},
			take: 5,
			select: {
				id: true,
				player: true,
				points: true,
				createAt: true
			}
		});

		return json({
			rankings: topScores.map((score, index) => ({
				rank: index + 1,
				player: score.player,
				points: score.points,
				createAt: score.createAt
			}))
		});

	} catch (error) {
		console.error('Error fetching rankings:', error);
		return json({ error: 'Failed to fetch rankings' }, { status: 500 });
	}
};
