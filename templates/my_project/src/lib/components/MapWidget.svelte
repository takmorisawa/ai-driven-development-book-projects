<script lang="ts">
  import { onMount } from 'svelte';
  import { mapInstance, markers, currentFilter, selectedMarker } from '$lib/module/map';
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

      const iconColor =
        marker.type === 'product' ? '#22c55e' : marker.type === 'landmark' ? '#3b82f6' : '#b45309';
      const icon = leaflet.default.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${iconColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
        iconSize: [20, 20],
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
</script>

<div class="relative w-full">
  <div id="map-container" bind:this={mapContainer} class="w-full h-full min-h-[400px]"></div>
  <div class="absolute top-4 right-4 bg-white bg-opacity-95 text-gray-800 p-3 rounded-lg shadow-lg z-[1000] border-2 border-orange-200">
    <h3 class="text-sm font-bold mb-2 text-orange-600">凡例</h3>
    <div class="space-y-2 text-xs">
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full bg-green-500 border-2 border-gray-300"></div>
        <span class="text-gray-700">名産品</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-gray-300"></div>
        <span class="text-gray-700">名所</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full bg-amber-700 border-2 border-gray-300"></div>
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
</style>

