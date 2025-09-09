import { writable, readable } from 'svelte/store';
import type { SongWithArtist } from '$lib/type';

// ストア定義
export const isPlaying = writable<boolean>(false);
export const currentSong = writable<SongWithArtist | null>(null);
export const currentAudio = writable<HTMLAudioElement | null>(null);
export const audioDuration = writable<number>(0);
export const currentVolume = writable<number>(1.0);

// 現在の再生時間を監視するreadableストア
export const playbackTime = readable<number>(0, (set) => {
	let interval: NodeJS.Timeout;
	let audio: HTMLAudioElement | null = null;

	// currentAudioの変更を監視
	const unsubscribe = currentAudio.subscribe((audioElement) => {
		if (interval) {
			clearInterval(interval);
		}

		audio = audioElement;

		if (audio) {
			interval = setInterval(() => {
				if (audio && !audio.paused) {
					set(audio.currentTime);
				}
			}, 100);
		}
	});

	return () => {
		if (interval) {
			clearInterval(interval);
		}
		unsubscribe();
	};
});

/**
 * 指定された曲を再生する
 * @param song 再生する曲（SongWithArtist型）
 */
export function playSong(song: SongWithArtist): void {
	try {
		let audio: HTMLAudioElement | null = null;
		let currentSongValue: SongWithArtist | null = null;

		// 現在のオーディオと曲を取得
		const unsubscribeAudio = currentAudio.subscribe(value => audio = value);
		const unsubscribeSong = currentSong.subscribe(value => currentSongValue = value);
		
		unsubscribeAudio();
		unsubscribeSong();

		// 同じ曲の場合は再生を再開
		if (currentSongValue && currentSongValue.id === song.id && audio) {
			audio.play();
			isPlaying.set(true);
			return;
		}

		// 既存のオーディオを停止・破棄
		if (audio) {
			audio.pause();
			audio.src = '';
		}

		// 新しいオーディオオブジェクトを作成
		const newAudio = new Audio(`/${song.audio}`);
		
		// 音量を設定
		let volumeValue = 1.0;
		const unsubscribeVolume = currentVolume.subscribe(value => volumeValue = value);
		unsubscribeVolume();
		newAudio.volume = volumeValue;

		// メタデータ読み込み完了時の処理
		newAudio.addEventListener('loadedmetadata', () => {
			audioDuration.set(newAudio.duration);
		});

		// 再生終了時の処理
		newAudio.addEventListener('ended', () => {
			isPlaying.set(false);
		});

		// エラー処理
		newAudio.addEventListener('error', (e) => {
			console.error('音声再生エラー:', {
				error: e,
				songId: song.id,
				songTitle: song.title,
				audioUrl: song.audio,
				function: 'playSong'
			});
			isPlaying.set(false);
		});

		// ストアを更新
		currentAudio.set(newAudio);
		currentSong.set(song);
		
		// 再生開始
		newAudio.play().then(() => {
			isPlaying.set(true);
		}).catch((error) => {
			console.error('再生開始エラー:', {
				error: error,
				message: error.message,
				stack: error.stack,
				songId: song.id,
				songTitle: song.title,
				audioUrl: song.audio,
				function: 'playSong'
			});
			isPlaying.set(false);
		});

	} catch (error) {
		console.error('playSong関数でエラーが発生しました:', {
			error: error,
			message: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
			songId: song.id,
			songTitle: song.title,
			audioUrl: song.audio,
			function: 'playSong'
		});
		isPlaying.set(false);
	}
}

/**
 * 現在再生中の曲を一時停止する
 */
export function stopSong(): void {
	try {
		let audio: HTMLAudioElement | null = null;
		const unsubscribe = currentAudio.subscribe(value => audio = value);
		unsubscribe();

		if (audio) {
			audio.pause();
			isPlaying.set(false);
		}
	} catch (error) {
		console.error('stopSong関数でエラーが発生しました:', {
			error: error,
			message: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
			function: 'stopSong'
		});
	}
}

/**
 * 現在のオーディオの音量を設定する
 * @param volume 音量（0.0〜1.0）
 */
export function setVolume(volume: number): void {
	try {
		// 音量の範囲チェック
		const clampedVolume = Math.max(0, Math.min(1, volume));
		
		let audio: HTMLAudioElement | null = null;
		const unsubscribe = currentAudio.subscribe(value => audio = value);
		unsubscribe();

		if (audio) {
			audio.volume = clampedVolume;
		}
		
		currentVolume.set(clampedVolume);
	} catch (error) {
		console.error('setVolume関数でエラーが発生しました:', {
			error: error,
			message: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
			volume: volume,
			function: 'setVolume'
		});
	}
}

/**
 * 再生中の曲の現在の再生位置（秒単位）を取得する
 * @returns 現在の再生位置（秒）
 */
export function getCurrentTime(): number {
	try {
		let audio: HTMLAudioElement | null = null;
		const unsubscribe = currentAudio.subscribe(value => audio = value);
		unsubscribe();

		return audio ? audio.currentTime : 0;
	} catch (error) {
		console.error('getCurrentTime関数でエラーが発生しました:', {
			error: error,
			message: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
			function: 'getCurrentTime'
		});
		return 0;
	}
}

/**
 * 再生中の曲の総再生時間（秒単位）を取得する
 * @returns 総再生時間（秒）
 */
export function getDuration(): number {
	try {
		let audio: HTMLAudioElement | null = null;
		const unsubscribe = currentAudio.subscribe(value => audio = value);
		unsubscribe();

		return audio ? audio.duration || 0 : 0;
	} catch (error) {
		console.error('getDuration関数でエラーが発生しました:', {
			error: error,
			message: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
			function: 'getDuration'
		});
		return 0;
	}
}
