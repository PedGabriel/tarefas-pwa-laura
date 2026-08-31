<template>
  <div
    v-show="hasCoordinates"
    ref="mapElement"
    class="task-location-map"
    aria-label="Mapa da localização"
  />
  <span v-if="location?.accuracy" class="accuracy-info">
    Precisão aproximada: {{ Math.round(location.accuracy) }} metros
  </span>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useOnlineStatus } from '@/composables/useOnlineStatus';

const { isOnline } = useOnlineStatus();
const props = defineProps({
  location: {
    type: Object,
    default: null,
  },
})

const mapElement = ref(null)
let map = null
let marker = null
let accuracyCircle = null

const hasCoordinates = computed(() => {
  return (
    props.location &&
    typeof props.location.latitude === 'number' &&
    typeof props.location.longitude === 'number'
  )
})

function fixLeafletIcons() {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
  })
}

function renderLocation() {
  if (!map || !hasCoordinates.value) return

  const point = [props.location.latitude, props.location.longitude]

  map.setView(point, 16)

  if (marker) map.removeLayer(marker)
  if (accuracyCircle) map.removeLayer(accuracyCircle)

  marker = L.marker(point).addTo(map)

  if (props.location.label) {
    marker.bindPopup(props.location.label).openPopup()
  }

  if (props.location.accuracy > 0) {
    accuracyCircle = L.circle(point, {
      radius: props.location.accuracy,
      color: '#4a90d9',
      fillColor: '#4a90d9',
      fillOpacity: 0.15,
    }).addTo(map)
  }

  nextTick(() => {
    map?.invalidateSize()
  })
}

onMounted(() => {
  fixLeafletIcons()

  if (mapElement.value) {
    map = L.map(mapElement.value).setView([0, 0], 2)

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    renderLocation()
  }
})

watch(
  () => props.location,
  () => {
    nextTick(() => {
      renderLocation()
    })
  },
  { deep: true, immediate: true },
)

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.task-location-map {
  width: 100%;
  height: 240px;
  margin-top: 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ddd;
}
</style>