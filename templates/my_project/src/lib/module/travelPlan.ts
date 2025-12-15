import { writable } from 'svelte/store';
import { get } from 'svelte/store';
import type { TravelPlanItem } from '$lib/type';

const STORAGE_KEY = 'travelPlan';

function createTravelPlanStore() {
  const { subscribe, set, update } = writable<TravelPlanItem[]>([]);

  // ローカルストレージから読み込み
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        set(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse travel plan from localStorage', e);
        set([]);
      }
    }
  }

  return {
    subscribe,
    add: (item: TravelPlanItem) => {
      update((items) => {
        const exists = items.some((i) => i.id === item.id && i.type === item.type);
        if (exists) {
          return items;
        }
        const newItems = [...items, item];
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
        }
        return newItems;
      });
    },
    remove: (id: number, type: 'region' | 'landmark') => {
      update((items) => {
        const newItems = items.filter((item) => !(item.id === id && item.type === type));
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
        }
        return newItems;
      });
    },
    get: (): TravelPlanItem[] => {
      return get({ subscribe });
    },
    clear: () => {
      set([]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
  };
}

export const travelPlanItems = createTravelPlanStore();

export function addToTravelPlan(itemId: number, itemType: 'region' | 'landmark', name: string, latitude: number, longitude: number) {
  travelPlanItems.add({
    id: itemId,
    type: itemType,
    name,
    latitude,
    longitude,
  });
}

export function removeFromTravelPlan(itemId: number, itemType: 'region' | 'landmark') {
  travelPlanItems.remove(itemId, itemType);
}

export function getTravelPlan(): TravelPlanItem[] {
  return travelPlanItems.get();
}

