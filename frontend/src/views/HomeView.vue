<template>
  <sidebar
    :collapsed="collapsed"
    :collapsed-width="collapsedWidth"
    :sidebar-width="sidebarWidth"
    @toggle-sidebar="toggleSidebar"
  />
  <div class="main-content" :style="mainContentStyle">
    <div class="main-header">
      <div class="header-title">Map Explorer</div>
      <div class="header-actions">
        <el-button type="primary" :icon="Search">Search</el-button>
        <el-button type="success" :icon="Location">My Location</el-button>
      </div>
    </div>

    <div class="map-container" ref="mapContainer"></div>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Search, Location } from '@element-plus/icons-vue'
import 'leaflet/dist/leaflet.css'
import { OSMap } from '@/utils/map'

const collapsed = ref(false)
const sidebarWidth = ref('20%')
const collapsedWidth = ref('4px')

const mapContainer = ref(null)
const map = new OSMap()

const mainContentStyle = computed(() => {
  return {
    width: collapsed.value
      ? `calc(100% - ${collapsedWidth.value})`
      : `calc(100% - ${sidebarWidth.value})`,
  }
})

const toggleSidebar = () => {
  collapsed.value = !collapsed.value
  setTimeout(() => {
    map.resize()
  }, 300)
}

onMounted(() => {
  map.registerContainer(mapContainer.value)

  map.initialize([49.842957, 24.031111], 13)

  map.registerTileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    minZoom: 5,
  })

  const marker = map.addMarker([49.842957, 24.031111], null, {
    content: 'Lviv city center',
  })

  marker.openPopup()
})

onUnmounted(() => {
  map.remove()
})
</script>

<style lang="scss" scoped>
.main-content {
  height: 100%;
  background-color: #fff;
  transition: width $transition-speed ease;
  display: flex;
  flex-direction: column;
  padding: 0;
}

// Added header styles
.main-header {
  height: $header-height;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

// Added map container styles
.map-container {
  flex: 1;
  width: 100%;
  height: calc(100% - #{$header-height});
  z-index: 1;
}
</style>
