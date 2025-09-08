<script lang="ts">
	import { onMount } from 'svelte';

	// ゲーム状態の定義
	let board = Array(8).fill(null).map(() => Array(8).fill(0)); // 0: 空, 1: 黒, 2: 白
	let currentPlayer = 1; // 1: 黒（先手）, 2: 白
	let gameOver = false;
	let winner: string | null = null;
	let blackCount = 2;
	let whiteCount = 2;
	let validMoves: number[][] = [];

	// 初期化
	onMount(() => {
		initializeBoard();
	});

	// ボードの初期化
	function initializeBoard() {
		board = Array(8).fill(null).map(() => Array(8).fill(0));
		// 中央の4つのマスに初期配置
		board[3][3] = 2; // 白
		board[3][4] = 1; // 黒
		board[4][3] = 1; // 黒
		board[4][4] = 2; // 白
		
		currentPlayer = 1;
		gameOver = false;
		winner = null;
		updateCounts();
		updateValidMoves();
	}

	// 石の数をカウント
	function updateCounts() {
		blackCount = 0;
		whiteCount = 0;
		for (let row = 0; row < 8; row++) {
			for (let col = 0; col < 8; col++) {
				if (board[row][col] === 1) blackCount++;
				else if (board[row][col] === 2) whiteCount++;
			}
		}
	}

	// 有効な手を更新
	function updateValidMoves() {
		validMoves = [];
		for (let row = 0; row < 8; row++) {
			for (let col = 0; col < 8; col++) {
				if (isValidMove(row, col, currentPlayer)) {
					validMoves.push([row, col]);
				}
			}
		}
		console.log(`Valid moves for player ${currentPlayer}:`, validMoves);
	}

	// 有効な手かどうかをチェック
	function isValidMove(row: number, col: number, player: number) {
		if (board[row][col] !== 0) return false;

		const directions = [
			[-1, -1], [-1, 0], [-1, 1],
			[0, -1],           [0, 1],
			[1, -1],  [1, 0],  [1, 1]
		];

		for (let [dr, dc] of directions) {
			if (canFlipInDirection(row, col, dr, dc, player)) {
				return true;
			}
		}
		return false;
	}

	// 指定方向に石を裏返せるかチェック
	function canFlipInDirection(row: number, col: number, dr: number, dc: number, player: number) {
		let r = row + dr;
		let c = col + dc;
		let hasOpponentStone = false;

		while (r >= 0 && r < 8 && c >= 0 && c < 8) {
			if (board[r][c] === 0) return false;
			if (board[r][c] === player) return hasOpponentStone;
			hasOpponentStone = true;
			r += dr;
			c += dc;
		}
		return false;
	}

	// 石を置く
	function makeMove(row: number, col: number) {
		if (gameOver || !isValidMove(row, col, currentPlayer)) return;

		board[row][col] = currentPlayer;
		flipStones(row, col, currentPlayer);
		
		// 次のプレイヤーに交代
		currentPlayer = currentPlayer === 1 ? 2 : 1;
		updateCounts();
		updateValidMoves();

		// 次のプレイヤーが打てない場合はパス
		if (validMoves.length === 0) {
			currentPlayer = currentPlayer === 1 ? 2 : 1;
			updateValidMoves();
			
			// 両プレイヤーが打てない場合はゲーム終了
			if (validMoves.length === 0) {
				endGame();
			}
		}

		// ボードが満杯の場合もゲーム終了
		if (blackCount + whiteCount === 64) {
			endGame();
		}
	}

	// 石を裏返す
	function flipStones(row: number, col: number, player: number) {
		const directions = [
			[-1, -1], [-1, 0], [-1, 1],
			[0, -1],           [0, 1],
			[1, -1],  [1, 0],  [1, 1]
		];

		for (let [dr, dc] of directions) {
			if (canFlipInDirection(row, col, dr, dc, player)) {
				let r = row + dr;
				let c = col + dc;
				while (board[r][c] !== player) {
					board[r][c] = player;
					r += dr;
					c += dc;
				}
			}
		}
	}

	// ゲーム終了
	function endGame() {
		gameOver = true;
		if (blackCount > whiteCount) {
			winner = '黒';
		} else if (whiteCount > blackCount) {
			winner = '白';
		} else {
			winner = '引き分け';
		}
	}

	// パス
	function pass() {
		if (validMoves.length > 0) return;
		currentPlayer = currentPlayer === 1 ? 2 : 1;
		updateValidMoves();
		if (validMoves.length === 0) {
			endGame();
		}
	}

	// セルが有効な手かどうかをチェック
	function isValidCell(row: number, col: number) {
		const isValid = validMoves.some(([r, c]) => r === row && c === col);
		if (isValid) {
			console.log(`Cell [${row}, ${col}] is valid`);
		}
		return isValid;
	}
</script>

<main>
	<h1>オセロゲーム</h1>
	
	<div class="game-info">
		<div class="scores">
			<div class="score black">
				<div class="stone black-stone"></div>
				<span>黒: {blackCount}</span>
			</div>
			<div class="score white">
				<div class="stone white-stone"></div>
				<span>白: {whiteCount}</span>
			</div>
		</div>
		
		{#if !gameOver}
			<div class="current-player">
				現在のプレイヤー: 
				<span class="player-indicator {currentPlayer === 1 ? 'black' : 'white'}">
					{currentPlayer === 1 ? '黒' : '白'}
				</span>
			</div>
			<div class="debug-info">
				有効な手の数: {validMoves.length}<br>
				候補: {JSON.stringify(validMoves)}
			</div>
			{#if validMoves.length === 0}
				<button on:click={pass} class="pass-button">パス</button>
			{/if}
		{:else}
			<div class="game-result">
				<h2>ゲーム終了!</h2>
				<p class="winner">勝者: {winner}</p>
			</div>
		{/if}
	</div>

	<div class="board">
		{#each board as row, rowIndex}
			{#each row as cell, colIndex}
				<button 
					class="cell {isValidCell(rowIndex, colIndex) ? 'valid-move' : ''}"
					on:click={() => makeMove(rowIndex, colIndex)}
					disabled={gameOver}
				>
					{#if cell === 1}
						<div class="stone black-stone"></div>
					{:else if cell === 2}
						<div class="stone white-stone"></div>
					{:else if isValidCell(rowIndex, colIndex)}
						<div class="hint-dot {currentPlayer === 1 ? 'black-hint' : 'white-hint'}"></div>
					{/if}
				</button>
			{/each}
		{/each}
	</div>

	<button on:click={initializeBoard} class="reset-button">ゲームリセット</button>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20px;
		font-family: Arial, sans-serif;
	}

	h1 {
		color: #333;
		margin-bottom: 20px;
	}

	.game-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 20px;
		gap: 10px;
	}

	.scores {
		display: flex;
		gap: 30px;
		align-items: center;
	}

	.score {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 18px;
		font-weight: bold;
	}

	.current-player {
		font-size: 16px;
		font-weight: bold;
	}

	.debug-info {
		font-size: 12px;
		background-color: #f0f0f0;
		padding: 8px;
		border-radius: 4px;
		margin: 5px 0;
		font-family: monospace;
		max-width: 400px;
		word-break: break-all;
	}

	.player-indicator {
		padding: 4px 8px;
		border-radius: 4px;
	}

	.player-indicator.black {
		background-color: #333;
		color: white;
	}

	.player-indicator.white {
		background-color: #f0f0f0;
		color: #333;
		border: 1px solid #ccc;
	}

	.game-result {
		text-align: center;
	}

	.winner {
		font-size: 20px;
		font-weight: bold;
		color: #2c5530;
	}

	.board {
		display: grid;
		grid-template-columns: repeat(8, 60px);
		grid-template-rows: repeat(8, 60px);
		gap: 2px;
		background-color: #2c5530;
		padding: 10px;
		border-radius: 8px;
		margin-bottom: 20px;
	}

	.cell {
		width: 60px;
		height: 60px;
		background-color: #4a7c59;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.cell:hover:not(:disabled) {
		background-color: #5a8c69;
	}

	.cell.valid-move:hover {
		background-color: #7abc89;
		box-shadow: inset 0 0 0 3px #ffeb3b, 0 0 20px rgba(255, 235, 59, 0.9);
		transform: scale(1.05);
	}

	.cell.valid-move {
		background-color: #6a9c79;
		box-shadow: inset 0 0 0 2px #ffeb3b, 0 0 8px rgba(255, 235, 59, 0.5);
		animation: pulse-hint 2s infinite;
	}

	@keyframes pulse-hint {
		0%, 100% {
			box-shadow: inset 0 0 0 2px #ffeb3b, 0 0 8px rgba(255, 235, 59, 0.5);
		}
		50% {
			box-shadow: inset 0 0 0 2px #ffeb3b, 0 0 15px rgba(255, 235, 59, 0.8);
		}
	}

	.cell:disabled {
		cursor: default;
	}

	.stone {
		width: 45px;
		height: 45px;
		border-radius: 50%;
		border: 2px solid #333;
	}

	.black-stone {
		background-color: #333;
	}

	.white-stone {
		background-color: #f0f0f0;
	}

	.hint-dot {
		width: 15px;
		height: 15px;
		border-radius: 50%;
		opacity: 0.7;
		animation: bounce-hint 1.5s infinite ease-in-out;
	}

	.black-hint {
		background-color: #333;
		border: 1px solid #666;
	}

	.white-hint {
		background-color: #f0f0f0;
		border: 1px solid #ccc;
	}

	@keyframes bounce-hint {
		0%, 100% {
			transform: scale(1);
			opacity: 0.7;
		}
		50% {
			transform: scale(1.2);
			opacity: 0.9;
		}
	}

	.reset-button, .pass-button {
		padding: 10px 20px;
		font-size: 16px;
		background-color: #4CAF50;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.reset-button:hover, .pass-button:hover {
		background-color: #45a049;
	}

	.pass-button {
		background-color: #ff9800;
		margin-top: 10px;
	}

	.pass-button:hover {
		background-color: #e68900;
	}
</style>
