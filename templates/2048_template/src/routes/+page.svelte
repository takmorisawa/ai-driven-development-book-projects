<script lang="ts">
	import { onMount } from 'svelte';

	// ゲーム状態の型定義
	type GameState = 'playing' | 'won' | 'gameOver';
	type Direction = 'up' | 'down' | 'left' | 'right';

	// ゲーム状態
	let board: number[][] = [];
	let score = 0;
	let gameState: GameState = 'playing';
	let bestScore = 0;

	// スワイプ検出用の変数
	let startX = 0;
	let startY = 0;
	let endX = 0;
	let endY = 0;

	// ゲーム初期化
	function initGame() {
		board = Array(4).fill(null).map(() => Array(4).fill(0));
		score = 0;
		gameState = 'playing';
		addRandomTile();
		addRandomTile();
		
		// 初期状態でゲームオーバーかチェック
		checkGameOver();
	}

	// ランダムな空きマスに新しいタイルを追加
	function addRandomTile() {
		const emptyCells: { row: number; col: number }[] = [];
		
		for (let row = 0; row < 4; row++) {
			for (let col = 0; col < 4; col++) {
				if (board[row][col] === 0) {
					emptyCells.push({ row, col });
				}
			}
		}

		if (emptyCells.length > 0) {
			const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
			// 90%の確率で2、10%の確率で4
			board[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
		}
	}

	// 配列を左に圧縮（0を詰める）
	function compressLeft(row: number[]): number[] {
		return row.filter(cell => cell !== 0);
	}

	// 配列を右に圧縮
	function compressRight(row: number[]): number[] {
		const compressed = row.filter(cell => cell !== 0);
		while (compressed.length < 4) {
			compressed.unshift(0);
		}
		return compressed;
	}

	// 配列を上に圧縮
	function compressUp(column: number[]): number[] {
		return column.filter(cell => cell !== 0);
	}

	// 配列を下に圧縮
	function compressDown(column: number[]): number[] {
		const compressed = column.filter(cell => cell !== 0);
		while (compressed.length < 4) {
			compressed.unshift(0);
		}
		return compressed;
	}

	// 左に合体処理
	function mergeLeft(row: number[]): { merged: number[]; scoreGained: number } {
		let scoreGained = 0;
		const merged = [...row];
		
		for (let i = 0; i < 3; i++) {
			if (merged[i] !== 0 && merged[i] === merged[i + 1]) {
				merged[i] *= 2;
				scoreGained += merged[i];
				merged[i + 1] = 0;
			}
		}
		
		return { merged, scoreGained };
	}

	// 右に合体処理
	function mergeRight(row: number[]): { merged: number[]; scoreGained: number } {
		let scoreGained = 0;
		const merged = [...row];
		
		for (let i = 3; i > 0; i--) {
			if (merged[i] !== 0 && merged[i] === merged[i - 1]) {
				merged[i] *= 2;
				scoreGained += merged[i];
				merged[i - 1] = 0;
			}
		}
		
		return { merged, scoreGained };
	}

	// 上に合体処理
	function mergeUp(column: number[]): { merged: number[]; scoreGained: number } {
		let scoreGained = 0;
		const merged = [...column];
		
		for (let i = 0; i < 3; i++) {
			if (merged[i] !== 0 && merged[i] === merged[i + 1]) {
				merged[i] *= 2;
				scoreGained += merged[i];
				merged[i + 1] = 0;
			}
		}
		
		return { merged, scoreGained };
	}

	// 下に合体処理
	function mergeDown(column: number[]): { merged: number[]; scoreGained: number } {
		let scoreGained = 0;
		const merged = [...column];
		
		for (let i = 3; i > 0; i--) {
			if (merged[i] !== 0 && merged[i] === merged[i - 1]) {
				merged[i] *= 2;
				scoreGained += merged[i];
				merged[i - 1] = 0;
			}
		}
		
		return { merged, scoreGained };
	}

	// 左に移動
	function moveLeft(): boolean {
		let moved = false;
		let totalScoreGained = 0;
		const newBoard = board.map(row => {
			const originalRow = [...row];
			const compressed = compressLeft(row);
			const padded = [...compressed];
			while (padded.length < 4) {
				padded.push(0);
			}
			
			// 圧縮だけで変化があるかチェック
			if (JSON.stringify(padded) !== JSON.stringify(originalRow)) {
				moved = true;
			}
			
			const { merged, scoreGained } = mergeLeft(padded);
			totalScoreGained += scoreGained;
			
			// 合体で変化があるかチェック
			if (JSON.stringify(merged) !== JSON.stringify(padded)) {
				moved = true;
			}
			
			const finalCompressed = compressLeft(merged);
			const finalPadded = [...finalCompressed];
			while (finalPadded.length < 4) {
				finalPadded.push(0);
			}
			
			return finalPadded;
		});
		
		if (moved) {
			board = newBoard;
			score += totalScoreGained;
			if (score > bestScore) {
				bestScore = score;
			}
		}
		
		return moved;
	}

	// 右に移動
	function moveRight(): boolean {
		let moved = false;
		let totalScoreGained = 0;
		const newBoard = board.map(row => {
			const originalRow = [...row];
			const compressed = compressRight(row);
			
			// 圧縮だけで変化があるかチェック
			if (JSON.stringify(compressed) !== JSON.stringify(originalRow)) {
				moved = true;
			}
			
			const { merged, scoreGained } = mergeRight(compressed);
			totalScoreGained += scoreGained;
			
			// 合体で変化があるかチェック
			if (JSON.stringify(merged) !== JSON.stringify(compressed)) {
				moved = true;
			}
			
			return compressRight(merged);
		});
		
		if (moved) {
			board = newBoard;
			score += totalScoreGained;
			if (score > bestScore) {
				bestScore = score;
			}
		}
		
		return moved;
	}

	// 上に移動
	function moveUp(): boolean {
		let moved = false;
		let totalScoreGained = 0;
		const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
		
		for (let col = 0; col < 4; col++) {
			const column = board.map(row => row[col]);
			const originalColumn = [...column];
			const compressed = compressUp(column);
			const padded = [...compressed];
			while (padded.length < 4) {
				padded.push(0);
			}
			
			// 圧縮だけで変化があるかチェック
			if (JSON.stringify(padded) !== JSON.stringify(originalColumn)) {
				moved = true;
			}
			
			const { merged, scoreGained } = mergeUp(padded);
			totalScoreGained += scoreGained;
			
			// 合体で変化があるかチェック
			if (JSON.stringify(merged) !== JSON.stringify(padded)) {
				moved = true;
			}
			
			const finalCompressed = compressUp(merged);
			const finalPadded = [...finalCompressed];
			while (finalPadded.length < 4) {
				finalPadded.push(0);
			}
			
			for (let row = 0; row < 4; row++) {
				newBoard[row][col] = finalPadded[row];
			}
		}
		
		if (moved) {
			board = newBoard;
			score += totalScoreGained;
			if (score > bestScore) {
				bestScore = score;
			}
		}
		
		return moved;
	}

	// 下に移動
	function moveDown(): boolean {
		let moved = false;
		let totalScoreGained = 0;
		const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
		
		for (let col = 0; col < 4; col++) {
			const column = board.map(row => row[col]);
			const originalColumn = [...column];
			const compressed = compressDown(column);
			
			// 圧縮だけで変化があるかチェック
			if (JSON.stringify(compressed) !== JSON.stringify(originalColumn)) {
				moved = true;
			}
			
			const { merged, scoreGained } = mergeDown(compressed);
			totalScoreGained += scoreGained;
			
			// 合体で変化があるかチェック
			if (JSON.stringify(merged) !== JSON.stringify(compressed)) {
				moved = true;
			}
			
			const finalCompressed = compressDown(merged);
			for (let row = 0; row < 4; row++) {
				newBoard[row][col] = finalCompressed[row];
			}
		}
		
		if (moved) {
			board = newBoard;
			score += totalScoreGained;
			if (score > bestScore) {
				bestScore = score;
			}
		}
		
		return moved;
	}

	// 移動処理のメイン関数
	function move(direction: Direction): boolean {
		if (gameState !== 'playing') return false;
		
		console.log(`${direction}方向に移動を試行`);
		console.log('移動前の盤面:', board);
		
		let moved = false;
		
		switch (direction) {
			case 'left':
				moved = moveLeft();
				break;
			case 'right':
				moved = moveRight();
				break;
			case 'up':
				moved = moveUp();
				break;
			case 'down':
				moved = moveDown();
				break;
		}
		
		console.log('移動結果:', moved);
		console.log('移動後の盤面:', board);
		
		if (moved) {
			// 勝利条件チェック
			for (let row = 0; row < 4; row++) {
				for (let col = 0; col < 4; col++) {
					if (board[row][col] === 2048 && gameState === 'playing') {
						gameState = 'won';
					}
				}
			}
			
			// 新しいタイルを追加
			addRandomTile();
		}
		
		// 移動後に関係なくゲームオーバー条件をチェック
		checkGameOver();
		
		return moved;
	}

	// ゲームオーバー判定
	function isGameOver(): boolean {
		// 空きマスがある場合はゲームオーバーではない
		for (let row = 0; row < 4; row++) {
			for (let col = 0; col < 4; col++) {
				if (board[row][col] === 0) {
					return false;
				}
			}
		}
		
		// 隣接する同じ数字がある場合はゲームオーバーではない
		for (let row = 0; row < 4; row++) {
			for (let col = 0; col < 4; col++) {
				const current = board[row][col];
				
				// 右隣
				if (col < 3 && board[row][col + 1] === current) {
					return false;
				}
				
				// 下隣
				if (row < 3 && board[row + 1][col] === current) {
					return false;
				}
			}
		}
		
		// 空きマスがなく、隣接する同じ数字もない場合はゲームオーバー
		return true;
	}

	// ゲームオーバーチェック関数
	function checkGameOver() {
		if (gameState !== 'playing') return;
		
		console.log('ゲームオーバーチェック開始');
		console.log('現在の盤面:', board);
		
		// 空きマスがある場合はゲームオーバーではない
		for (let row = 0; row < 4; row++) {
			for (let col = 0; col < 4; col++) {
				if (board[row][col] === 0) {
					console.log('空きマスが見つかりました:', row, col);
					return;
				}
			}
		}
		
		console.log('空きマスはありません');
		
		// 隣接する同じ数字がある場合はゲームオーバーではない
		for (let row = 0; row < 4; row++) {
			for (let col = 0; col < 4; col++) {
				const current = board[row][col];
				
				// 右隣
				if (col < 3 && board[row][col + 1] === current) {
					console.log('隣接する同じ数字が見つかりました:', row, col, current);
					return;
				}
				
				// 下隣
				if (row < 3 && board[row + 1][col] === current) {
					console.log('隣接する同じ数字が見つかりました:', row, col, current);
					return;
				}
			}
		}
		
		// 空きマスがなく、隣接する同じ数字もない場合はゲームオーバー
		console.log('ゲームオーバー条件を満たしました');
		gameState = 'gameOver';
	}

	// 実際に移動を試してゲームオーバーかどうかを判定
	function canMakeMove(): boolean {
		// 空きマスがある場合は移動可能
		for (let row = 0; row < 4; row++) {
			for (let col = 0; col < 4; col++) {
				if (board[row][col] === 0) {
					return true;
				}
			}
		}
		
		// 隣接する同じ数字がある場合は移動可能
		for (let row = 0; row < 4; row++) {
			for (let col = 0; col < 4; col++) {
				const current = board[row][col];
				
				// 右隣
				if (col < 3 && board[row][col + 1] === current) {
					return true;
				}
				
				// 下隣
				if (row < 3 && board[row + 1][col] === current) {
					return true;
				}
			}
		}
		
		return false;
	}

	// より確実なゲームオーバー判定（実際に移動を試す）
	function canMoveInDirection(direction: Direction): boolean {
		const originalBoard = board.map(row => [...row]);
		let moved = false;
		
		switch (direction) {
			case 'left':
				moved = moveLeft();
				break;
			case 'right':
				moved = moveRight();
				break;
			case 'up':
				moved = moveUp();
				break;
			case 'down':
				moved = moveDown();
				break;
		}
		
		// 盤面を元に戻す
		board = originalBoard;
		
		return moved;
	}

	// キーボードイベントハンドラー
	function handleKeydown(event: KeyboardEvent) {
		if (gameState !== 'playing') return;
		
		switch (event.key) {
			case 'ArrowLeft':
				event.preventDefault();
				move('left');
				break;
			case 'ArrowRight':
				event.preventDefault();
				move('right');
				break;
			case 'ArrowUp':
				event.preventDefault();
				move('up');
				break;
			case 'ArrowDown':
				event.preventDefault();
				move('down');
				break;
		}
	}

	// スワイプイベントハンドラー
	function handleTouchStart(event: TouchEvent) {
		if (gameState !== 'playing') return;
		
		const touch = event.touches[0];
		startX = touch.clientX;
		startY = touch.clientY;
	}

	function handleTouchEnd(event: TouchEvent) {
		if (gameState !== 'playing') return;
		
		const touch = event.changedTouches[0];
		endX = touch.clientX;
		endY = touch.clientY;
		
		const deltaX = endX - startX;
		const deltaY = endY - startY;
		const minSwipeDistance = 50;
		
		if (Math.abs(deltaX) > Math.abs(deltaY)) {
			// 水平スワイプ
			if (Math.abs(deltaX) > minSwipeDistance) {
				if (deltaX > 0) {
					move('right');
				} else {
					move('left');
				}
			}
		} else {
			// 垂直スワイプ
			if (Math.abs(deltaY) > minSwipeDistance) {
				if (deltaY > 0) {
					move('down');
				} else {
					move('up');
				}
			}
		}
	}

	// ゲームリスタート
	function restartGame() {
		initGame();
	}

	// コンポーネントマウント時の初期化
	onMount(() => {
		initGame();
		
		// ローカルストレージからベストスコアを読み込み
		if (typeof window !== 'undefined') {
			const savedBestScore = localStorage.getItem('2048-best-score');
			if (savedBestScore) {
				bestScore = parseInt(savedBestScore, 10);
			}
		}
		
		// ベストスコアをローカルストレージに保存
		$: if (typeof window !== 'undefined' && bestScore > 0) {
			localStorage.setItem('2048-best-score', bestScore.toString());
		}
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="game-container">
	<div class="header">
		<h1>2048</h1>
		<div class="scores">
			<div class="score-box">
				<div class="score-label">スコア</div>
				<div class="score-value">{score}</div>
			</div>
			<div class="score-box">
				<div class="score-label">ベスト</div>
				<div class="score-value">{bestScore}</div>
			</div>
		</div>
	</div>
	
	<div class="game-info">
		<p>矢印キーまたはスワイプで数字を動かして、同じ数字を合体させて2048を作ろう！</p>
	</div>
	
	<div class="game-board" 
		 on:touchstart={handleTouchStart} 
		 on:touchend={handleTouchEnd}>
		{#each board as row, rowIndex}
			{#each row as cell, colIndex}
				<div class="cell" class:empty={cell === 0} class:filled={cell !== 0}>
					{#if cell !== 0}
						{cell}
					{/if}
				</div>
			{/each}
		{/each}
	</div>
	
	{#if gameState === 'won'}
		<div class="game-overlay">
			<div class="game-message">
				<h2>おめでとう！</h2>
				<p>2048を作りました！</p>
				<button on:click={restartGame}>もう一度プレイ</button>
			</div>
		</div>
	{/if}
	
	{#if gameState === 'gameOver'}
		<div class="game-overlay">
			<div class="game-message">
				<h2>ゲームオーバー</h2>
				<p>最終スコア: {score}</p>
				<button on:click={restartGame}>もう一度プレイ</button>
			</div>
		</div>
	{/if}
	
	<div class="controls">
		<button on:click={restartGame}>新しいゲーム</button>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Arial', sans-serif;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
	}

	.game-container {
		max-width: 500px;
		margin: 0 auto;
		padding: 20px;
		text-align: center;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	h1 {
		color: #776e65;
		font-size: 3rem;
		margin: 0;
		font-weight: bold;
	}

	.scores {
		display: flex;
		gap: 10px;
	}

	.score-box {
		background: #bbada0;
		padding: 10px 15px;
		border-radius: 5px;
		color: white;
		min-width: 80px;
	}

	.score-label {
		font-size: 0.8rem;
		text-transform: uppercase;
		font-weight: bold;
	}

	.score-value {
		font-size: 1.5rem;
		font-weight: bold;
	}

	.game-info {
		margin-bottom: 20px;
		color: #776e65;
		font-size: 1.1rem;
	}

	.game-board {
		background: #bbada0;
		border-radius: 10px;
		padding: 10px;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(4, 1fr);
		gap: 10px;
		width: 100%;
		max-width: 400px;
		height: 400px;
		margin: 0 auto;
		position: relative;
	}

	.cell {
		background: #cdc1b4;
		border-radius: 5px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		font-weight: bold;
		color: #776e65;
		transition: all 0.2s ease;
	}

	.cell.empty {
		background: #cdc1b4;
	}

	.cell.filled {
		background: #eee4da;
		color: #776e65;
	}

	/* タイルの色分け */
	.cell:nth-child(1) { background: #eee4da; }
	.cell:nth-child(2) { background: #ede0c8; }
	.cell:nth-child(3) { background: #f2b179; }
	.cell:nth-child(4) { background: #f59563; }
	.cell:nth-child(5) { background: #f67c5f; }
	.cell:nth-child(6) { background: #f65e3b; }
	.cell:nth-child(7) { background: #edcf72; }
	.cell:nth-child(8) { background: #edcc61; }
	.cell:nth-child(9) { background: #edc850; }
	.cell:nth-child(10) { background: #edc53f; }
	.cell:nth-child(11) { background: #edc22e; }
	.cell:nth-child(12) { background: #3c3a32; color: #f9f6f2; }
	.cell:nth-child(13) { background: #3c3a32; color: #f9f6f2; }
	.cell:nth-child(14) { background: #3c3a32; color: #f9f6f2; }
	.cell:nth-child(15) { background: #3c3a32; color: #f9f6f2; }
	.cell:nth-child(16) { background: #3c3a32; color: #f9f6f2; }

	.game-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.game-message {
		background: white;
		padding: 40px;
		border-radius: 10px;
		text-align: center;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
	}

	.game-message h2 {
		color: #776e65;
		margin-bottom: 20px;
		font-size: 2rem;
	}

	.game-message p {
		color: #776e65;
		margin-bottom: 20px;
		font-size: 1.2rem;
	}

	button {
		background: #8f7a66;
		color: white;
		border: none;
		padding: 15px 30px;
		border-radius: 5px;
		font-size: 1.1rem;
		font-weight: bold;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	button:hover {
		background: #9f8a76;
	}

	.controls {
		margin-top: 20px;
	}

	/* レスポンシブデザイン */
	@media (max-width: 600px) {
		.game-container {
			padding: 10px;
		}
		
		h1 {
			font-size: 2rem;
		}
		
		.game-board {
			height: 300px;
		}
		
		.cell {
			font-size: 1.5rem;
		}
		
		.score-box {
			min-width: 60px;
			padding: 8px 12px;
		}
		
		.score-value {
			font-size: 1.2rem;
		}
	}
</style>
