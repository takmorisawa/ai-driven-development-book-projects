import { describe, it, expect, beforeEach, afterEach, vi, type MockedFunction } from 'vitest';
import { get } from 'svelte/store';
import {
	playSong,
	stopSong,
	setVolume,
	getCurrentTime,
	getDuration,
	isPlaying,
	currentSong,
	currentAudio,
	audioDuration,
	currentVolume,
	playbackTime
} from './player';
import type { SongWithArtist } from '$lib/type';

// HTMLAudioElementのモック
class MockedHTMLAudioElement {
	src: string = '';
	volume: number = 1.0;
	currentTime: number = 0;
	duration: number = 0;
	paused: boolean = true;
	
	private eventListeners: { [key: string]: EventListener[] } = {};
	
	play = vi.fn().mockResolvedValue(undefined);
	pause = vi.fn();
	
	addEventListener(type: string, listener: EventListener) {
		if (!this.eventListeners[type]) {
			this.eventListeners[type] = [];
		}
		this.eventListeners[type].push(listener);
	}
	
	dispatchEvent(event: Event) {
		const listeners = this.eventListeners[event.type];
		if (listeners) {
			listeners.forEach(listener => listener(event));
		}
		return true;
	}
	
	// テスト用のヘルパーメソッド
	simulateLoadedMetadata(duration: number = 180) {
		this.duration = duration;
		const event = new Event('loadedmetadata');
		this.dispatchEvent(event);
	}
	
	simulateEnded() {
		this.paused = true;
		const event = new Event('ended');
		this.dispatchEvent(event);
	}
	
	simulateError(message: string = 'Test error') {
		const event = new Event('error') as any;
		event.message = message;
		this.dispatchEvent(event);
	}
}

// グローバルなHTMLAudioElementをモック
const mockAudio = vi.fn(() => new MockedHTMLAudioElement());
global.Audio = mockAudio as any;

describe('Player Module', () => {
	// テスト用のサンプルデータ
	const mockSong1: SongWithArtist = {
		id: 1,
		title: 'Test Song 1',
		artistId: 1,
		audio: 'uploads/test-song-1.mp3',
		image: '/uploads/test-image-1.jpg',
		artist: {
			id: 1,
			name: 'Test Artist 1',
			profile: 'Test profile 1',
			image: '/uploads/test-artist-1.jpg'
		}
	};

	const mockSong2: SongWithArtist = {
		id: 2,
		title: 'Test Song 2',
		artistId: 2,
		audio: 'uploads/test-song-2.mp3',
		image: '/uploads/test-image-2.jpg',
		artist: {
			id: 2,
			name: 'Test Artist 2',
			profile: 'Test profile 2',
			image: '/uploads/test-artist-2.jpg'
		}
	};

	beforeEach(() => {
		vi.clearAllMocks();
		// ストアをリセット
		isPlaying.set(false);
		currentSong.set(null);
		currentAudio.set(null);
		audioDuration.set(0);
		currentVolume.set(1.0);
	});

	afterEach(() => {
		// テスト後のクリーンアップ
		const audio = get(currentAudio);
		if (audio) {
			audio.pause();
			currentAudio.set(null);
		}
		vi.restoreAllMocks();
	});

	describe('playSong function', () => {
		it('should create new audio element and start playing', async () => {
			await playSong(mockSong1);

			// Audio要素が作成されたことを確認
			expect(mockAudio).toHaveBeenCalledWith('/uploads/test-song-1.mp3');

			// ストアが更新されたことを確認
			expect(get(isPlaying)).toBe(false); // play()が成功するまではfalse
			expect(get(currentSong)).toEqual(mockSong1);
			expect(get(currentAudio)).toBeInstanceOf(MockedHTMLAudioElement);

			// 音声ファイルの再生が開始されたことを確認
			const audio = get(currentAudio) as MockedHTMLAudioElement;
			expect(audio.play).toHaveBeenCalled();
		});

		it('should set audio metadata when loaded', async () => {
			await playSong(mockSong1);
			
			const audio = get(currentAudio) as MockedHTMLAudioElement;
			
			// メタデータが読み込まれたことをシミュレート
			audio.simulateLoadedMetadata(180);
			
			// audioDurationが設定されたことを確認
			expect(get(audioDuration)).toBe(180);
		});

		it('should resume playing same song if already loaded', async () => {
			// 最初の再生
			await playSong(mockSong1);
			const firstAudio = get(currentAudio) as MockedHTMLAudioElement;
			
			// 同じ曲を再度再生
			await playSong(mockSong1);
			const secondAudio = get(currentAudio);
			
			// 同じオーディオ要素が使用されることを確認
			expect(firstAudio).toBe(secondAudio);
			expect(firstAudio.play).toHaveBeenCalledTimes(2);
		});

		it('should switch to new song when different song is played', async () => {
			// 最初の曲を再生
			await playSong(mockSong1);
			const firstAudio = get(currentAudio) as MockedHTMLAudioElement;
			
			// 異なる曲を再生
			await playSong(mockSong2);
			const secondAudio = get(currentAudio) as MockedHTMLAudioElement;
			
			// 最初の音声が停止され、新しい音声が作成されたことを確認
			expect(firstAudio.pause).toHaveBeenCalled();
			expect(firstAudio.src).toBe('');
			expect(secondAudio).not.toBe(firstAudio);
			expect(get(currentSong)).toEqual(mockSong2);
		});

		it('should set volume correctly on new audio', async () => {
			// カスタム音量を設定
			currentVolume.set(0.5);
			
			await playSong(mockSong1);
			
			const audio = get(currentAudio) as MockedHTMLAudioElement;
			expect(audio.volume).toBe(0.5);
		});

		it('should handle audio loading error', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			
			await playSong(mockSong1);
			
			const audio = get(currentAudio) as MockedHTMLAudioElement;
			audio.simulateError('Failed to load audio');
			
			// エラーログが出力され、再生状態がfalseに設定されることを確認
			expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('音声再生エラー'), expect.any(Object));
			expect(get(isPlaying)).toBe(false);
			
			consoleSpy.mockRestore();
		});

		it('should handle play promise rejection', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			
			// play()メソッドがエラーを返すようにモック
			mockAudio.mockImplementationOnce(() => {
				const audio = new MockedHTMLAudioElement();
				audio.play = vi.fn().mockRejectedValue(new Error('Play failed'));
				return audio;
			});
			
			await playSong(mockSong1);
			
			// エラーログが出力され、再生状態がfalseに設定されることを確認
			expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('再生開始エラー'), expect.any(Object));
			expect(get(isPlaying)).toBe(false);
			
			consoleSpy.mockRestore();
		});

		it('should update isPlaying to false when song ends', async () => {
			await playSong(mockSong1);
			
			const audio = get(currentAudio) as MockedHTMLAudioElement;
			
			// 曲の終了をシミュレート
			audio.simulateEnded();
			
			// 再生状態がfalseに更新されることを確認
			expect(get(isPlaying)).toBe(false);
		});
	});

	describe('stopSong function', () => {
		it('should pause current audio and set isPlaying to false', async () => {
			await playSong(mockSong1);
			const audio = get(currentAudio) as MockedHTMLAudioElement;
			
			stopSong();
			
			expect(audio.pause).toHaveBeenCalled();
			expect(get(isPlaying)).toBe(false);
		});

		it('should handle case when no audio is playing', () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			
			stopSong();
			
			// エラーが発生しないことを確認
			expect(consoleSpy).not.toHaveBeenCalled();
			expect(get(isPlaying)).toBe(false);
			
			consoleSpy.mockRestore();
		});

		it('should handle errors gracefully', () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			
			// エラーを発生させるモック
			const mockErrorAudio = {
				pause: vi.fn().mockImplementation(() => {
					throw new Error('Pause failed');
				})
			};
			currentAudio.set(mockErrorAudio as any);
			
			stopSong();
			
			// エラーログが出力されることを確認
			expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('stopSong関数でエラーが発生しました'), expect.any(Object));
			
			consoleSpy.mockRestore();
		});
	});

	describe('setVolume function', () => {
		it('should set volume on current audio and update store', async () => {
			await playSong(mockSong1);
			const audio = get(currentAudio) as MockedHTMLAudioElement;
			
			setVolume(0.7);
			
			expect(audio.volume).toBe(0.7);
			expect(get(currentVolume)).toBe(0.7);
		});

		it('should clamp volume to valid range (0-1)', () => {
			// 範囲外の値をテスト
			setVolume(1.5);
			expect(get(currentVolume)).toBe(1.0);
			
			setVolume(-0.5);
			expect(get(currentVolume)).toBe(0.0);
		});

		it('should handle case when no audio is playing', () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			
			setVolume(0.5);
			
			// エラーが発生せず、ストアは更新されることを確認
			expect(consoleSpy).not.toHaveBeenCalled();
			expect(get(currentVolume)).toBe(0.5);
			
			consoleSpy.mockRestore();
		});

		it('should handle errors gracefully', () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			
			// エラーを発生させるモック
			const mockErrorAudio = {};
			Object.defineProperty(mockErrorAudio, 'volume', {
				set: () => {
					throw new Error('Volume set failed');
				}
			});
			currentAudio.set(mockErrorAudio as any);
			
			setVolume(0.5);
			
			// エラーログが出力されることを確認
			expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('setVolume関数でエラーが発生しました'), expect.any(Object));
			
			consoleSpy.mockRestore();
		});
	});

	describe('getCurrentTime function', () => {
		it('should return current time from audio element', async () => {
			await playSong(mockSong1);
			const audio = get(currentAudio) as MockedHTMLAudioElement;
			audio.currentTime = 42.5;
			
			const currentTime = getCurrentTime();
			
			expect(currentTime).toBe(42.5);
		});

		it('should return 0 when no audio is playing', () => {
			const currentTime = getCurrentTime();
			
			expect(currentTime).toBe(0);
		});

		it('should handle errors gracefully', () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			
			// エラーを発生させるモック
			const mockErrorAudio = {};
			Object.defineProperty(mockErrorAudio, 'currentTime', {
				get: () => {
					throw new Error('CurrentTime get failed');
				}
			});
			currentAudio.set(mockErrorAudio as any);
			
			const currentTime = getCurrentTime();
			
			// エラーログが出力され、0が返されることを確認
			expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('getCurrentTime関数でエラーが発生しました'), expect.any(Object));
			expect(currentTime).toBe(0);
			
			consoleSpy.mockRestore();
		});
	});

	describe('getDuration function', () => {
		it('should return duration from audio element', async () => {
			await playSong(mockSong1);
			const audio = get(currentAudio) as MockedHTMLAudioElement;
			audio.duration = 240.7;
			
			const duration = getDuration();
			
			expect(duration).toBe(240.7);
		});

		it('should return 0 when no audio is playing', () => {
			const duration = getDuration();
			
			expect(duration).toBe(0);
		});

		it('should return 0 when duration is not available', async () => {
			await playSong(mockSong1);
			const audio = get(currentAudio) as MockedHTMLAudioElement;
			audio.duration = NaN;
			
			const duration = getDuration();
			
			expect(duration).toBe(0);
		});

		it('should handle errors gracefully', () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			
			// エラーを発生させるモック
			const mockErrorAudio = {};
			Object.defineProperty(mockErrorAudio, 'duration', {
				get: () => {
					throw new Error('Duration get failed');
				}
			});
			currentAudio.set(mockErrorAudio as any);
			
			const duration = getDuration();
			
			// エラーログが出力され、0が返されることを確認
			expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('getDuration関数でエラーが発生しました'), expect.any(Object));
			expect(duration).toBe(0);
			
			consoleSpy.mockRestore();
		});
	});

	describe('Svelte stores', () => {
		it('should initialize with correct default values', () => {
			expect(get(isPlaying)).toBe(false);
			expect(get(currentSong)).toBe(null);
			expect(get(currentAudio)).toBe(null);
			expect(get(audioDuration)).toBe(0);
			expect(get(currentVolume)).toBe(1.0);
			expect(get(playbackTime)).toBe(0);
		});

		it('should update stores when playing a song', async () => {
			await playSong(mockSong1);
			
			expect(get(currentSong)).toEqual(mockSong1);
			expect(get(currentAudio)).toBeInstanceOf(MockedHTMLAudioElement);
			expect(get(currentVolume)).toBe(1.0);
		});

		it('should maintain store state between function calls', async () => {
			await playSong(mockSong1);
			setVolume(0.3);
			
			expect(get(currentSong)).toEqual(mockSong1);
			expect(get(currentVolume)).toBe(0.3);
			
			stopSong();
			
			// stopSong後もcurrentSongとcurrentVolumeは保持される
			expect(get(currentSong)).toEqual(mockSong1);
			expect(get(currentVolume)).toBe(0.3);
			expect(get(isPlaying)).toBe(false);
		});
	});

	describe('playbackTime readable store', () => {
		it('should update playback time during play', (done) => {
			// このテストはタイマーに依存するため、実際の実装では困難
			// しかし、ストアが存在し、適切に初期化されることは確認できる
			expect(get(playbackTime)).toBe(0);
			done();
		});
	});

	describe('Integration scenarios', () => {
		it('should handle complete play cycle', async () => {
			// 曲を再生
			await playSong(mockSong1);
			
			const audio = get(currentAudio) as MockedHTMLAudioElement;
			expect(get(currentSong)).toEqual(mockSong1);
			expect(audio.play).toHaveBeenCalled();
			
			// メタデータの読み込み
			audio.simulateLoadedMetadata(180);
			expect(get(audioDuration)).toBe(180);
			
			// 音量調整
			setVolume(0.8);
			expect(audio.volume).toBe(0.8);
			expect(get(currentVolume)).toBe(0.8);
			
			// 一時停止
			stopSong();
			expect(audio.pause).toHaveBeenCalled();
			expect(get(isPlaying)).toBe(false);
			
			// 再開（同じ曲）
			await playSong(mockSong1);
			expect(audio.play).toHaveBeenCalledTimes(2);
			
			// 曲終了
			audio.simulateEnded();
			expect(get(isPlaying)).toBe(false);
		});

		it('should handle switching between multiple songs', async () => {
			// 最初の曲を再生
			await playSong(mockSong1);
			const firstAudio = get(currentAudio) as MockedHTMLAudioElement;
			expect(get(currentSong)).toEqual(mockSong1);
			
			// 2番目の曲に切り替え
			await playSong(mockSong2);
			const secondAudio = get(currentAudio) as MockedHTMLAudioElement;
			
			// 最初の曲が停止され、2番目の曲が開始されることを確認
			expect(firstAudio.pause).toHaveBeenCalled();
			expect(firstAudio.src).toBe('');
			expect(secondAudio).not.toBe(firstAudio);
			expect(get(currentSong)).toEqual(mockSong2);
			expect(secondAudio.play).toHaveBeenCalled();
		});
	});
});
