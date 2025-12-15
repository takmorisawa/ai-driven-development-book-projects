<script lang="ts">
  import { onMount } from 'svelte';
  import { mapInstance, markers, currentFilter, selectedMarker, viewportBounds } from '$lib/module/map';
  import type { Marker } from '$lib/module/map';
  import { get } from 'svelte/store';
  import 'leaflet/dist/leaflet.css';

  let mapContainer: HTMLDivElement;
  let leaflet: any;
  let leafletMap: any;
  let mapMarkers: any[] = [];

  onMount(async () => {
    if (typeof window === 'undefined' || !mapContainer) return;

    leaflet = await import('leaflet');
    // Leafletのアイコンパスを設定
    delete (leaflet.default.Icon.Default.prototype as any)._getIconUrl;
    leaflet.default.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = leaflet.default.map(mapContainer, {
      center: [36.5, 138.0],
      zoom: 6,
    });

    leaflet.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    mapInstance.set(map);
    leafletMap = map;
    updateMarkers();
    updateViewportBounds();

    // マップの移動・ズーム時にビューポートを更新
    map.on('move', () => {
      updateViewportBounds();
    });
    map.on('moveend', () => {
      updateViewportBounds();
    });
    map.on('zoom', () => {
      updateViewportBounds();
    });
    map.on('zoomend', () => {
      updateViewportBounds();
    });

    const unsubscribeMarkers = markers.subscribe(() => {
      updateMarkers();
    });

    const unsubscribeFilter = currentFilter.subscribe(() => {
      updateMarkers();
    });

    return () => {
      unsubscribeMarkers();
      unsubscribeFilter();
    };
  });

  function updateMarkers() {
    if (!leafletMap || !leaflet) return;

    mapMarkers.forEach((marker) => marker.remove());
    mapMarkers = [];

    const filter = get(currentFilter);
    const allMarkers = get(markers);

    allMarkers.forEach((marker: Marker) => {
      if (
        (marker.type === 'product' && !filter.showProducts) ||
        (marker.type === 'landmark' && !filter.showLandmarks) ||
        (marker.type === 'terrain' && !filter.showTerrains)
      ) {
        return;
      }

      const iconConfig =
        marker.type === 'product'
          ? { color: '#22c55e', emoji: '🍎', label: '名産品' }
          : marker.type === 'landmark'
            ? { color: '#3b82f6', emoji: '🏛️', label: '名所' }
            : { color: '#f59e0b', emoji: '⛰️', label: '地形' };

      const icon = leaflet.default.divIcon({
        className: `custom-marker custom-marker-${marker.type}`,
        html: `
          <div class="marker-container" style="
            background: linear-gradient(135deg, ${iconConfig.color} 0%, ${iconConfig.color}dd 100%);
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 0 2px ${iconConfig.color}33;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotate(-45deg);
            transition: transform 0.2s ease;
          ">
            <span style="
              transform: rotate(45deg);
              font-size: 16px;
              display: block;
            ">${iconConfig.emoji}</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const leafletMarker = leaflet.default
        .marker([marker.latitude, marker.longitude], { icon })
        .addTo(leafletMap)
        .bindPopup(marker.name);

      leafletMarker.on('click', () => {
        selectedMarker.set(marker);
      });

      mapMarkers.push(leafletMarker);
    });
  }

  function updateViewportBounds() {
    if (!leafletMap || !leaflet) return;
    
    const bounds = leafletMap.getBounds();
    if (bounds) {
      viewportBounds.set({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    }
  }
</script>

<div class="relative w-full">
  <div id="map-container" bind:this={mapContainer} class="w-full h-full min-h-[400px]"></div>
  <div class="absolute top-4 right-4 bg-white bg-opacity-95 text-gray-800 p-3 rounded-lg shadow-lg z-[1000] border-2 border-orange-200">
    <h3 class="text-sm font-bold mb-2 text-orange-600">凡例</h3>
    <div class="space-y-2 text-xs">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded-full bg-green-500 border-2 border-white shadow-md flex items-center justify-center text-xs">
          🍎
        </div>
        <span class="text-gray-700">名産品</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-md flex items-center justify-center text-xs">
          🏛️
        </div>
        <span class="text-gray-700">名所</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-md flex items-center justify-center text-xs">
          ⛰️
        </div>
        <span class="text-gray-700">地形</span>
      </div>
    </div>
  </div>
</div>

<style>
  :global(.custom-marker) {
    background: transparent;
    border: none;
  }

  :global(.custom-marker .marker-container:hover) {
    transform: rotate(-45deg) scale(1.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 0 3px rgba(255, 255, 255, 0.5);
  }

  :global(.leaflet-popup-content-wrapper) {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  :global(.leaflet-popup-content) {
    margin: 8px 12px;
    font-size: 14px;
    font-weight: 500;
    color: #1f2937;
  }
</style>

