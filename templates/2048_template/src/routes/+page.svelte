<script lang="ts">
	import { onMount } from 'svelte';

	// ゲーム状態の定義
	let board: number[][] = Array(4).fill(null).map(() => Array(4).fill(0));
	let score = 0;
	let gameOver = false;
	let gameWon = false;
	let canMove = true;

	// ランキング・スコア送信関連の状態
	let rankings: Array<{id: string, points: number, player: string, createdAt: string}> = [];
	let showNameInput = false;
	let playerName = '';
	let isSubmittingScore = false;
	let showRankings = false;

	// 初期化
	onMount(() => {
		initializeGame();
		document.addEventListener('keydown', handleKeyPress);
		return () => {
			document.removeEventListener('keydown', handleKeyPress);
		};
	});

	// ゲームの初期化
	function initializeGame() {
		board = Array(4).fill(null).map(() => Array(4).fill(0));
		score = 0;
		gameOver = false;
		gameWon = false;
		canMove = true;
		addRandomTile();
		addRandomTile();
	}

	// ランダムな位置に新しいタイルを追加
	function addRandomTile() {
		const emptyCells = [];
		for (let row = 0; row < 4; row++) {
			for (let col = 0; col < 4; col++) {
				if (board[row][col] === 0) {
					emptyCells.push({ row, col });
				}
			}
		}

		if (emptyCells.length > 0) {
			const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
			const value = Math.random() < 0.9 ? 2 : 4;
			board[randomCell.row][randomCell.col] = value;
		}
	}

	// キーボード入力の処理
	function handleKeyPress(event: KeyboardEvent) {
		if (!canMove || gameOver) return;

		let moved = false;
		switch (event.key) {
			case 'ArrowUp':
				event.preventDefault();
				moved = moveUp();
				break;
			case 'ArrowDown':
				event.preventDefault();
				moved = moveDown();
				break;
			case 'ArrowLeft':
				event.preventDefault();
				moved = moveLeft();
				break;
			case 'ArrowRight':
				event.preventDefault();
				moved = moveRight();
				break;
		}

		if (moved) {
			addRandomTile();
			checkGameState();
		}
	}

	// 上方向への移動
	function moveUp(): boolean {
		let moved = false;
		const newBoard = board.map(row => [...row]);

		for (let col = 0; col < 4; col++) {
			const column = [];
			for (let row = 0; row < 4; row++) {
				if (newBoard[row][col] !== 0) {
					column.push(newBoard[row][col]);
				}
			}

			// タイルの結合
			for (let i = 0; i < column.length - 1; i++) {
				if (column[i] === column[i + 1]) {
					column[i] *= 2;
					score += column[i];
					if (column[i] === 2048 && !gameWon) {
						gameWon = true;
					}
					column.splice(i + 1, 1);
				}
			}

			// 空のセルで埋める
			while (column.length < 4) {
				column.push(0);
			}

			// ボードを更新
			for (let row = 0; row < 4; row++) {
				if (newBoard[row][col] !== column[row]) {
					moved = true;
				}
				newBoard[row][col] = column[row];
			}
		}

		board = newBoard;
		return moved;
	}

	// 下方向への移動
	function moveDown(): boolean {
		let moved = false;
		const newBoard = board.map(row => [...row]);

		for (let col = 0; col < 4; col++) {
			const column = [];
			for (let row = 3; row >= 0; row--) {
				if (newBoard[row][col] !== 0) {
					column.push(newBoard[row][col]);
				}
			}

			// タイルの結合
			for (let i = 0; i < column.length - 1; i++) {
				if (column[i] === column[i + 1]) {
					column[i] *= 2;
					score += column[i];
					if (column[i] === 2048 && !gameWon) {
						gameWon = true;
					}
					column.splice(i + 1, 1);
				}
			}

			// 空のセルで埋める
			while (column.length < 4) {
				column.push(0);
			}

			// ボードを更新
			for (let row = 0; row < 4; row++) {
				if (newBoard[3 - row][col] !== column[row]) {
					moved = true;
				}
				newBoard[3 - row][col] = column[row];
			}
		}

		board = newBoard;
		return moved;
	}

	// 左方向への移動
	function moveLeft(): boolean {
		let moved = false;
		const newBoard = board.map(row => [...row]);

		for (let row = 0; row < 4; row++) {
			const rowData = newBoard[row].filter(cell => cell !== 0);

			// タイルの結合
			for (let i = 0; i < rowData.length - 1; i++) {
				if (rowData[i] === rowData[i + 1]) {
					rowData[i] *= 2;
					score += rowData[i];
					if (rowData[i] === 2048 && !gameWon) {
						gameWon = true;
					}
					rowData.splice(i + 1, 1);
				}
			}

			// 空のセルで埋める
			while (rowData.length < 4) {
				rowData.push(0);
			}

			// ボードを更新
			for (let col = 0; col < 4; col++) {
				if (newBoard[row][col] !== rowData[col]) {
					moved = true;
				}
				newBoard[row][col] = rowData[col];
			}
		}

		board = newBoard;
		return moved;
	}

	// 右方向への移動
	function moveRight(): boolean {
		let moved = false;
		const newBoard = board.map(row => [...row]);

		for (let row = 0; row < 4; row++) {
			const rowData = newBoard[row].filter(cell => cell !== 0).reverse();

			// タイルの結合
			for (let i = 0; i < rowData.length - 1; i++) {
				if (rowData[i] === rowData[i + 1]) {
					rowData[i] *= 2;
					score += rowData[i];
					if (rowData[i] === 2048 && !gameWon) {
						gameWon = true;
					}
					rowData.splice(i + 1, 1);
				}
			}

			// 空のセルで埋める
			while (rowData.length < 4) {
				rowData.push(0);
			}

			rowData.reverse();

			// ボードを更新
			for (let col = 0; col < 4; col++) {
				if (newBoard[row][col] !== rowData[col]) {
					moved = true;
				}
				newBoard[row][col] = rowData[col];
			}
		}

		board = newBoard;
		return moved;
	}

	// ゲーム状態をチェック
	function checkGameState() {
		// 移動可能かチェック
		if (!canMoveAny()) {
			gameOver = true;
			// ゲームオーバー時にランキングを取得
			fetchRankings();
		}
	}

	// 移動可能かどうかをチェック
	function canMoveAny(): boolean {
		// 空のセルがあるかチェック
		for (let row = 0; row < 4; row++) {
			for (let col = 0; col < 4; col++) {
				if (board[row][col] === 0) {
					return true;
				}
			}
		}

		// 隣接するセルと結合可能かチェック
		for (let row = 0; row < 4; row++) {
			for (let col = 0; col < 4; col++) {
				const current = board[row][col];
				if (
					(row < 3 && board[row + 1][col] === current) ||
					(col < 3 && board[row][col + 1] === current)
				) {
					return true;
				}
			}
		}

		return false;
	}

	// ゲームリスタート
	function restartGame() {
		initializeGame();
		showNameInput = false;
		showRankings = false;
		playerName = '';
	}

	// ランキングを取得
	async function fetchRankings() {
		try {
			const response = await fetch('/api/scores');
			const result = await response.json();
			if (result.success) {
				rankings = result.data;
			}
		} catch (error) {
			console.error('ランキング取得エラー:', error);
		}
	}

	// スコアを送信
	async function submitScore() {
		if (!playerName.trim()) {
			alert('プレイヤー名を入力してください');
			return;
		}

		isSubmittingScore = true;
		try {
			const response = await fetch('/api/scores', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					points: score,
					player: playerName.trim()
				})
			});

			const result = await response.json();
			if (result.success) {
				showNameInput = false;
				showRankings = true;
				// ランキングを再取得
				await fetchRankings();
			} else {
				alert(result.error || 'スコアの送信に失敗しました');
			}
		} catch (error) {
			console.error('スコア送信エラー:', error);
			alert('スコアの送信に失敗しました');
		} finally {
			isSubmittingScore = false;
		}
	}

	// ユーザー名入力ポップアップを表示
	function showNameInputDialog() {
		showNameInput = true;
	}

	// ランキング表示を切り替え
	function toggleRankings() {
		showRankings = !showRankings;
		if (showRankings) {
			fetchRankings();
		}
	}

	// タイルの色を取得
	function getTileColor(value: number): string {
		const colors: { [key: number]: string } = {
			0: '#cdc1b4',
			2: '#eee4da',
			4: '#ede0c8',
			8: '#f2b179',
			16: '#f59563',
			32: '#f67c5f',
			64: '#f65e3b',
			128: '#edcf72',
			256: '#edcc61',
			512: '#edc850',
			1024: '#edc53f',
			2048: '#edc22e'
		};
		return colors[value] || '#3c3a32';
	}

	// タイルのテキスト色を取得
	function getTextColor(value: number): string {
		return value <= 4 ? '#776e65' : '#f9f6f2';
	}
</script>

<main>
	<div class="game-container">
		<div class="header">
			<h1>2048</h1>
			<div class="score-container">
				<div class="score">スコア: {score}</div>
				<button on:click={toggleRankings} class="ranking-btn">
					{showRankings ? 'ランキングを閉じる' : 'ランキング'}
				</button>
				<button on:click={restartGame} class="restart-btn">リスタート</button>
			</div>
		</div>

		{#if gameWon && !gameOver}
			<div class="message win-message">
				<h2>おめでとうございます！</h2>
				<p>2048に到達しました！</p>
				<button on:click={() => gameWon = false}>続ける</button>
			</div>
		{/if}

		{#if gameOver}
			<div class="message game-over-message">
				<h2>ゲームオーバー</h2>
				<p>最終スコア: {score}</p>
				<div class="game-over-buttons">
					<button on:click={showNameInputDialog} class="submit-score-btn">スコアを登録</button>
					<button on:click={restartGame}>もう一度プレイ</button>
				</div>
			</div>
		{/if}

		<!-- ユーザー名入力ポップアップ -->
		{#if showNameInput}
			<div class="message name-input-popup">
				<h2>スコアを登録</h2>
				<p>最終スコア: {score}</p>
				<div class="input-group">
					<label for="player-name">プレイヤー名:</label>
					<input 
						id="player-name"
						bind:value={playerName} 
						type="text" 
						placeholder="名前を入力" 
						maxlength="50"
						disabled={isSubmittingScore}
						on:keydown={(e) => e.key === 'Enter' && submitScore()}
					/>
				</div>
				<div class="popup-buttons">
					<button 
						on:click={submitScore} 
						class="submit-btn"
						disabled={isSubmittingScore}
					>
						{isSubmittingScore ? '送信中...' : '登録'}
					</button>
					<button 
						on:click={() => showNameInput = false} 
						class="cancel-btn"
						disabled={isSubmittingScore}
					>
						キャンセル
					</button>
				</div>
			</div>
		{/if}

		<!-- ランキング表示 -->
		{#if showRankings}
			<div class="scoreboard">
				<h2>ランキング TOP5</h2>
				{#if rankings.length === 0}
					<p class="no-scores">まだスコアが登録されていません</p>
				{:else}
					<div class="ranking-list">
						{#each rankings as ranking, index}
							<div class="ranking-item" class:top-3={index < 3}>
								<span class="rank">{index + 1}位</span>
								<span class="player">{ranking.player}</span>
								<span class="score">{ranking.points}点</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<div class="game-board">
			{#each board as row, rowIndex}
				{#each row as cell, colIndex}
					<div 
						class="tile" 
						style="background-color: {getTileColor(cell)}; color: {getTextColor(cell)}"
					>
						{cell !== 0 ? cell : ''}
					</div>
				{/each}
			{/each}
		</div>

		<div class="instructions">
			<p>矢印キーを使ってタイルを移動させ、同じ数字を結合して2048を目指しましょう！</p>
		</div>
	</div>
</main>

<style>
	main {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background-color: #faf8ef;
		font-family: 'Arial', sans-serif;
	}

	.game-container {
		text-align: center;
		background-color: #bbada0;
		border-radius: 10px;
		padding: 20px;
		position: relative;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	h1 {
		color: #776e65;
		font-size: 48px;
		margin: 0;
		font-weight: bold;
	}

	.score-container {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.score {
		background-color: #bbada0;
		color: white;
		padding: 10px 20px;
		border-radius: 5px;
		font-size: 18px;
		font-weight: bold;
	}

	.restart-btn {
		background-color: #8f7a66;
		color: #f9f6f2;
		border: none;
		padding: 10px 20px;
		border-radius: 5px;
		cursor: pointer;
		font-size: 16px;
		font-weight: bold;
	}

	.restart-btn:hover {
		background-color: #9f8a76;
	}

	.ranking-btn {
		background-color: #119149;
		color: #f9f6f2;
		border: none;
		padding: 10px 20px;
		border-radius: 5px;
		cursor: pointer;
		font-size: 16px;
		font-weight: bold;
		margin-right: 10px;
	}

	.ranking-btn:hover {
		background-color: #229a59;
	}

	.game-board {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(4, 1fr);
		gap: 10px;
		background-color: #bbada0;
		border-radius: 10px;
		padding: 10px;
		width: 320px;
		height: 320px;
	}

	.tile {
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 5px;
		font-size: 32px;
		font-weight: bold;
		transition: all 0.15s ease-in-out;
	}

	.message {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: rgba(255, 255, 255, 0.95);
		padding: 30px;
		border-radius: 10px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
		z-index: 100;
	}

	.win-message {
		color: #119149;
	}

	.game-over-message {
		color: #776e65;
	}

	.message h2 {
		margin: 0 0 10px 0;
		font-size: 24px;
	}

	.message p {
		margin: 10px 0;
		font-size: 16px;
	}

	.message button {
		background-color: #8f7a66;
		color: #f9f6f2;
		border: none;
		padding: 10px 20px;
		border-radius: 5px;
		cursor: pointer;
		font-size: 16px;
		font-weight: bold;
		margin-top: 10px;
	}

	.message button:hover {
		background-color: #9f8a76;
	}

	.game-over-buttons {
		display: flex;
		gap: 10px;
		justify-content: center;
		margin-top: 15px;
	}

	.submit-score-btn {
		background-color: #119149 !important;
	}

	.submit-score-btn:hover {
		background-color: #229a59 !important;
	}

	/* ユーザー名入力ポップアップ */
	.name-input-popup {
		min-width: 300px;
	}

	.input-group {
		margin: 15px 0;
		text-align: left;
	}

	.input-group label {
		display: block;
		margin-bottom: 5px;
		font-weight: bold;
		color: #776e65;
	}

	.input-group input {
		width: 100%;
		padding: 10px;
		border: 2px solid #bbada0;
		border-radius: 5px;
		font-size: 16px;
		box-sizing: border-box;
	}

	.input-group input:focus {
		outline: none;
		border-color: #8f7a66;
	}

	.input-group input:disabled {
		background-color: #f0f0f0;
		cursor: not-allowed;
	}

	.popup-buttons {
		display: flex;
		gap: 10px;
		justify-content: center;
		margin-top: 20px;
	}

	.submit-btn {
		background-color: #119149 !important;
		min-width: 80px;
	}

	.submit-btn:hover:not(:disabled) {
		background-color: #229a59 !important;
	}

	.submit-btn:disabled {
		background-color: #cccccc !important;
		cursor: not-allowed;
	}

	.cancel-btn {
		background-color: #dc3545 !important;
	}

	.cancel-btn:hover:not(:disabled) {
		background-color: #c82333 !important;
	}

	.cancel-btn:disabled {
		background-color: #cccccc !important;
		cursor: not-allowed;
	}

	/* スコアボード */
	.scoreboard {
		background-color: rgba(255, 255, 255, 0.95);
		border-radius: 10px;
		padding: 20px;
		margin-bottom: 20px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	.scoreboard h2 {
		color: #776e65;
		margin: 0 0 15px 0;
		font-size: 20px;
	}

	.no-scores {
		color: #999;
		font-style: italic;
		margin: 0;
	}

	.ranking-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.ranking-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 15px;
		background-color: #f8f8f8;
		border-radius: 5px;
		font-weight: bold;
	}

	.ranking-item.top-3 {
		background: linear-gradient(135deg, #ffd700, #ffed4a);
		color: #8b4513;
	}

	.ranking-item.top-3:first-child {
		background: linear-gradient(135deg, #ffd700, #ffa500);
		color: #8b4513;
		box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
	}

	.ranking-item .rank {
		font-size: 14px;
		min-width: 40px;
		text-align: left;
	}

	.ranking-item .player {
		flex: 1;
		text-align: center;
		max-width: 150px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.ranking-item .score {
		min-width: 60px;
		text-align: right;
		color: #119149;
		font-weight: bold;
	}

	.ranking-item.top-3 .score {
		color: #8b4513;
	}

	.instructions {
		margin-top: 20px;
		color: #776e65;
		font-size: 14px;
		max-width: 320px;
	}

	/* レスポンシブデザイン */
	@media (max-width: 480px) {
		.header {
			flex-direction: column;
			gap: 15px;
			align-items: center;
		}

		.score-container {
			flex-direction: column;
			gap: 10px;
		}

		.ranking-btn, .restart-btn {
			width: 100%;
			margin: 0;
		}

		.game-board {
			width: 280px;
			height: 280px;
		}

		.tile {
			font-size: 24px;
		}

		.scoreboard {
			max-width: 280px;
		}

		.ranking-item .player {
			max-width: 100px;
		}
	}
</style>
