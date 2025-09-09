import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// お気に入りの曲IDリストを保持するSvelteのwritableストア
export const favoriteIds = writable<number[]>([]);

// ローカルストレージのキー
const FAVORITE_KEY = 'favorite_songs';

/**
 * ローカルストレージからお気に入りリストを取得する
 * @returns お気に入りの曲IDの配列
 */
export function getFavorite(): number[] {
    if (!browser) return [];
    
    try {
        const stored = localStorage.getItem(FAVORITE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (error) {
        console.error('お気に入りの取得に失敗しました:', error);
    }
    
    return [];
}

/**
 * 指定された曲IDをお気に入りリストに追加する
 * @param songId 追加する曲のID
 */
export function addToFavorite(songId: number): void {
    if (!browser) return;
    
    try {
        const currentFavorites = getFavorite();
        
        // 既にお気に入りに追加されている場合は何もしない
        if (currentFavorites.includes(songId)) {
            return;
        }
        
        const updatedFavorites = [...currentFavorites, songId];
        localStorage.setItem(FAVORITE_KEY, JSON.stringify(updatedFavorites));
        favoriteIds.set(updatedFavorites);
    } catch (error) {
        console.error('お気に入りの追加に失敗しました:', error);
    }
}

/**
 * 指定された曲IDをお気に入りリストから削除する
 * @param songId 削除する曲のID
 */
export function removeFromFavorite(songId: number): void {
    if (!browser) return;
    
    try {
        const currentFavorites = getFavorite();
        const updatedFavorites = currentFavorites.filter(id => id !== songId);
        
        localStorage.setItem(FAVORITE_KEY, JSON.stringify(updatedFavorites));
        favoriteIds.set(updatedFavorites);
    } catch (error) {
        console.error('お気に入りの削除に失敗しました:', error);
    }
}

// ブラウザ環境でのみ初期化を実行
if (browser) {
    const initialFavorites = getFavorite();
    favoriteIds.set(initialFavorites);
}
