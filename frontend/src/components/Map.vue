<script setup>
import { ref, onMounted, onUnmounted, inject, watch } from 'vue'
import { OSMap } from '@/utils/map'
import { useWheelmapStore } from '@/stores/wheelmap'
import { WheelmapMarkersMapper } from '@/utils/markers-mapper'

/** @type {OSMap} */
const osmap = inject('osmap')

const wheelmapStore = useWheelmapStore()

const mapContainer = ref(null)

onMounted(() => {
  osmap.registerContainer(mapContainer.value)

  osmap.initialize([49.842957, 24.031111], 13)

  osmap.registerTileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    minZoom: 5,
  })

  // setTimeout(() => {
  //   osmap.moveTo([51.505, -0.09], 10)
  // }, 1000)

  // setTimeout(() => {
  //   osmap.buildRoute(
  //     [
  //       [51.505, -0.09],
  //       [51.51, -0.1],
  //     ],
  //     {
  //       vehicle: 'car',
  //     },
  //   )
  // }, 3000)

  // Later, clear the route
  // setTimeout(() => {
  //   osmap.clearRoute()
  // }, 7000)
  // L.Routing.control({
  //   waypoints: [
  //     L.latLng(49.842957, 24.031111),
  //     L.latLng(50.26487, 28.67669),
  //     L.latLng(49.553516, 25.594767),
  //   ],
  // }).addTo(osmap._getMapInstance())

  osmap.controller.subscribeBBoxChange()

  osmap.controller.on('bbox-changed', (bbox) => {
    wheelmapStore.fetchNodes(bbox).then((nodes) => {
      osmap.clearAllMarkers()

      const preparedMarkers = WheelmapMarkersMapper.map(nodes)

      osmap.addMarkers(preparedMarkers)
    })
  })

  osmap.controller.triggerChangeBBox()
})

onUnmounted(() => {
  osmap.controller.unsubscribeBBoxChange()
  osmap.remove()
})
</script>
<template>
  <div class="map-container" ref="mapContainer"></div>
</template>
<style lang="scss" scoped>
.map-container {
  flex: 1;
  width: 100%;
  height: calc(100% - #{$header-height});
  z-index: 1;
}
</style>
