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
        marker.type === 'product' ? 'green' : marker.type === 'landmark' ? 'blue' : 'brown';
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

<div id="map-container" bind:this={mapContainer} class="w-full h-full min-h-[400px]"></div>

<style>
  :global(.custom-marker) {
    background: transparent;
    border: none;
  }
</style>

