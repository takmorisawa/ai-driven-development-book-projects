import { writable } from 'svelte/store';
import { get } from 'svelte/store';
import type { TravelPlanItem, TripPlan } from '$lib/type';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'tripPlans';

function createTripPlansStore() {
  const { subscribe, set, update } = writable<TripPlan[]>([]);

  // ローカルストレージから読み込み
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        set(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse trip plans from localStorage', e);
        set([]);
      }
    }
  }

  return {
    subscribe,
    create: (name: string): TripPlan => {
      const newPlan: TripPlan = {
        id: uuidv4(),
        name,
        createdAt: new Date().toISOString(),
        items: [],
      };
      update((plans) => {
        const newPlans = [...plans, newPlan];
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlans));
        }
        return newPlans;
      });
      return newPlan;
    },
    delete: (planId: string) => {
      update((plans) => {
        const newPlans = plans.filter((p) => p.id !== planId);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlans));
        }
        return newPlans;
      });
    },
    addItem: (planId: string, item: TravelPlanItem) => {
      update((plans) => {
        const newPlans = plans.map((plan) => {
          if (plan.id === planId) {
            const exists = plan.items.some((i) => i.id === item.id && i.type === item.type);
            if (exists) {
              return plan;
            }
            return {
              ...plan,
              items: [...plan.items, item],
            };
          }
          return plan;
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlans));
        }
        return newPlans;
      });
    },
    removeItem: (planId: string, itemId: number, itemType: 'region' | 'landmark' | 'terrain') => {
      update((plans) => {
        const newPlans = plans.map((plan) => {
          if (plan.id === planId) {
            return {
              ...plan,
              items: plan.items.filter((item) => !(item.id === itemId && item.type === itemType)),
            };
          }
          return plan;
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlans));
        }
        return newPlans;
      });
    },
    updateName: (planId: string, newName: string) => {
      update((plans) => {
        const newPlans = plans.map((plan) => {
          if (plan.id === planId) {
            return {
              ...plan,
              name: newName,
            };
          }
          return plan;
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlans));
        }
        return newPlans;
      });
    },
    get: (): TripPlan[] => {
      return get({ subscribe });
    },
    getById: (planId: string): TripPlan | undefined => {
      return get({ subscribe }).find((p) => p.id === planId);
    },
  };
}

export const tripPlans = createTripPlansStore();

export function createTripPlan(name: string): TripPlan {
  return tripPlans.create(name);
}

export function deleteTripPlan(planId: string) {
  tripPlans.delete(planId);
}

export function addToTripPlan(planId: string, itemId: number, itemType: 'region' | 'landmark' | 'terrain', name: string, latitude: number, longitude: number) {
  tripPlans.addItem(planId, {
    id: itemId,
    type: itemType,
    name,
    latitude,
    longitude,
  });
}

export function removeFromTripPlan(planId: string, itemId: number, itemType: 'region' | 'landmark' | 'terrain') {
  tripPlans.removeItem(planId, itemId, itemType);
}

export function updateTripPlanName(planId: string, newName: string) {
  tripPlans.updateName(planId, newName);
}

export function getTripPlans(): TripPlan[] {
  return tripPlans.get();
}

export function getTripPlanById(planId: string): TripPlan | undefined {
  return tripPlans.getById(planId);
}

// 後方互換性のための関数（既存のコードとの互換性を保つ）
export const travelPlanItems = {
  subscribe: tripPlans.subscribe,
  add: (item: TravelPlanItem) => {
    const plans = tripPlans.get();
    if (plans.length === 0) {
      tripPlans.create('デフォルトの旅行プラン');
    }
    const defaultPlan = tripPlans.get()[0];
    if (defaultPlan) {
      tripPlans.addItem(defaultPlan.id, item);
    }
  },
  remove: (id: number, type: 'region' | 'landmark' | 'terrain') => {
    const plans = tripPlans.get();
    plans.forEach((plan) => {
      tripPlans.removeItem(plan.id, id, type);
    });
  },
  get: (): TravelPlanItem[] => {
    const plans = tripPlans.get();
    return plans.flatMap((plan) => plan.items);
  },
  clear: () => {
    const plans = tripPlans.get();
    plans.forEach((plan) => {
      tripPlans.delete(plan.id);
    });
  },
};

export function addToTravelPlan(itemId: number, itemType: 'region' | 'landmark' | 'terrain', name: string, latitude: number, longitude: number) {
  const plans = tripPlans.get();
  if (plans.length === 0) {
    tripPlans.create('デフォルトの旅行プラン');
  }
  const defaultPlan = tripPlans.get()[0];
  if (defaultPlan) {
    addToTripPlan(defaultPlan.id, itemId, itemType, name, latitude, longitude);
  }
}

export function removeFromTravelPlan(itemId: number, itemType: 'region' | 'landmark' | 'terrain') {
  const plans = tripPlans.get();
  plans.forEach((plan) => {
    removeFromTripPlan(plan.id, itemId, itemType);
  });
}

export function getTravelPlan(): TravelPlanItem[] {
  return travelPlanItems.get();
}

