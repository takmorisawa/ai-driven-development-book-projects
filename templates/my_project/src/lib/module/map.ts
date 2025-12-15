import { writable } from 'svelte/store';
import type { RegionWithRelations, ProductWithRegion, LandmarkWithRegion, TerrainWithRegion } from '$lib/type';

export type MapFilter = {
  showProducts: boolean;
  showLandmarks: boolean;
  showTerrains: boolean;
};

export type Marker = {
  id: number;
  type: 'product' | 'landmark' | 'terrain';
  name: string;
  latitude: number;
  longitude: number;
  data: ProductWithRegion | LandmarkWithRegion | TerrainWithRegion;
};

export const mapInstance = writable<any>(null);
export const markers = writable<Marker[]>([]);
export const currentFilter = writable<MapFilter>({
  showProducts: true,
  showLandmarks: true,
  showTerrains: true,
});
export const selectedMarker = writable<Marker | null>(null);

export function initMap(containerId: string, options?: { center?: [number, number]; zoom?: number }) {
  if (typeof window === 'undefined') {
    return;
  }

  import('leaflet').then((L) => {
    const map = L.default.map(containerId, {
      center: options?.center || [36.5, 138.0],
      zoom: options?.zoom || 6,
    });

    L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    mapInstance.set(map);
  });
}

export function addMarker(marker: Marker) {
  markers.update((ms) => [...ms, marker]);
}

export function removeMarker(markerId: number) {
  markers.update((ms) => ms.filter((m) => m.id !== markerId));
}

export function setZoom(zoom: number) {
  mapInstance.update((map) => {
    if (map) {
      map.setZoom(zoom);
    }
    return map;
  });
}

export function setCenter(lat: number, lng: number) {
  mapInstance.update((map) => {
    if (map) {
      map.setView([lat, lng], map.getZoom());
    }
    return map;
  });
}

export function setFilter(filter: MapFilter) {
  currentFilter.set(filter);
}

