// APIテストプログラム (TypeScript版)
const API_BASE_URL = 'http://localhost:5173/api/scores';

// テスト用のスコアデータ
const testScores = [
    { player: 'Alice', points: 2048 },
    { player: 'Bob', points: 1024 },
    { player: 'Charlie', points: 4096 },
    { player: 'David', points: 512 },
    { player: 'Eve', points: 8192 },
    { player: 'Frank', points: 256 },
    { player: 'Grace', points: 16384 }
];

// HTTPリクエストを送信する関数
async function makeRequest(url: string, options: RequestInit = {}): Promise<{ status: number; data: any }> {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        console.error('Request failed:', error);
        return { status: 0, data: { error: (error as Error).message } };
    }
}

// スコア登録のテスト
async function testScoreRegistration(): Promise<void> {
    console.log('=== スコア登録テスト ===');
    
    for (const score of testScores) {
        console.log(`\nスコア登録: ${score.player} - ${score.points}点`);
        const result = await makeRequest(API_BASE_URL, {
            method: 'POST',
            body: JSON.stringify(score)
        });
        
        console.log(`ステータス: ${result.status}`);
        console.log(`レスポンス:`, result.data);
        
        if (result.status === 201) {
            console.log('✅ スコア登録成功');
        } else {
            console.log('❌ スコア登録失敗');
        }
    }
}

// ランキング取得のテスト
async function testRankingRetrieval(): Promise<void> {
    console.log('\n=== ランキング取得テスト ===');
    
    const result = await makeRequest(API_BASE_URL, {
        method: 'GET'
    });
    
    console.log(`ステータス: ${result.status}`);
    console.log(`レスポンス:`, JSON.stringify(result.data, null, 2));
    
    if (result.status === 200 && result.data.rankings) {
        console.log('✅ ランキング取得成功');
        console.log('\n--- 上位5位ランキング ---');
        result.data.rankings.forEach((ranking: any) => {
            console.log(`${ranking.rank}位: ${ranking.player} - ${ranking.points}点`);
        });
    } else {
        console.log('❌ ランキング取得失敗');
    }
}

// エラーハンドリングのテスト
async function testErrorHandling(): Promise<void> {
    console.log('\n=== エラーハンドリングテスト ===');
    
    // 不正なデータでのテスト
    const invalidData = [
        { player: '', points: 100 }, // 空のプレイヤー名
        { player: 'Test', points: -100 }, // 負のスコア
        { player: 'Test', points: 'invalid' as any }, // 文字列のスコア
        { player: 123 as any, points: 100 }, // 数値のプレイヤー名
        {} // 空のオブジェクト
    ];
    
    for (let i = 0; i < invalidData.length; i++) {
        console.log(`\n不正データテスト ${i + 1}:`, invalidData[i]);
        const result = await makeRequest(API_BASE_URL, {
            method: 'POST',
            body: JSON.stringify(invalidData[i])
        });
        
        console.log(`ステータス: ${result.status}`);
        console.log(`レスポンス:`, result.data);
        
        if (result.status === 400) {
            console.log('✅ 適切なエラーレスポンス');
        } else {
            console.log('❌ エラーハンドリングに問題');
        }
    }
}

// メインテスト実行
async function runTests(): Promise<void> {
    console.log('🚀 APIテスト開始');
    console.log('注意: 開発サーバーが http://localhost:5173 で起動していることを確認してください\n');
    
    try {
        // 1. スコア登録テスト
        await testScoreRegistration();
        
        // 2. ランキング取得テスト
        await testRankingRetrieval();
        
        // 3. エラーハンドリングテスト
        await testErrorHandling();
        
        console.log('\n🎉 全テスト完了');
        
    } catch (error) {
        console.error('テスト実行中にエラーが発生しました:', error);
    }
}

// テスト実行
runTests();
