<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { OSMap } from '@/utils/map'

/** @type {OSMap} */
const osmap = inject('osmap')

const mapContainer = ref(null)
const locationListener = ref(null)

onMounted(() => {
  osmap.registerContainer(mapContainer.value)

  osmap.initialize([49.842957, 24.031111], 13)

  osmap.registerTileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    minZoom: 5,
  })

  osmap.controller.subscribeBBoxChange()

  osmap.controller.on('bbox-changed', (bbox) => {
    console.log('bbox', bbox)
  })

  osmap.controller.triggerChangeBBox()
})

onUnmounted(() => {
  osmap.controller.unsubscribeBBoxChange()
  osmap.remove()
})

const resize = () => {
  if (osmap.map) {
    osmap.map.invalidateSize()
  }
}

defineExpose({ resize })
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
