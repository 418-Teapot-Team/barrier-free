<script setup>
import { ref, computed, watch, inject } from 'vue'
import { ArrowLeft, ArrowRight, Search, Plus, Delete } from '@element-plus/icons-vue'
import { useSearchStore } from '../stores/search'

// Define component name to satisfy multi-word component name rule
defineOptions({
  name: 'AppSidebar',
})

// Rename component in file name later to satisfy multi-word component name rule
const osmap = inject('osmap')

const { collapsed, collapsedWidth, sidebarWidth } = defineProps({
  collapsed: {
    required: true,
    type: Boolean,
  },
  sidebarWidth: {
    required: true,
    type: String,
  },
  collapsedWidth: {
    required: true,
    type: String,
  },
})

defineEmits(['toggleSidebar'])

const searchStore = useSearchStore()

// debounce function for search
let searchTimeout = null
const handleSearch = (query) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchStore.searchLocations(query)
  }, 300)
}

watch(
  () => searchStore.searchQuery,
  (newQuery) => {
    // Only trigger search if not in route builder search mode
    if (activeSearchIndex.value === null) {
      handleSearch(newQuery)
    }
  },
)

const handleSelectLocation = (location) => {
  const [longitude, latitude] = location.geometry.coordinates
  osmap.moveToMarker(location.properties.osm_id, [latitude, longitude])

  // searchStore.setQueryWithoutSearch(location.properties.name);
  searchStore.searchResults = []
}

// Route builder functionality
const routePoints = ref([
  { query: '', location: null },
  { query: '', location: null },
])

const activeSearchIndex = ref(null)

const addRoutePoint = () => {
  routePoints.value.push({ query: '', location: null })
}

const removeRoutePoint = (index) => {
  if (routePoints.value.length > 2) {
    routePoints.value.splice(index, 1)
  }
}

const setActiveSearch = (index) => {
  activeSearchIndex.value = index
}

const handleRoutePointSearch = (query, index) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchStore.searchLocations(query)
    setActiveSearch(index)
  }, 300)
}

const selectLocationForRoutePoint = (location, index) => {
  const [longitude, latitude] = location.geometry.coordinates
  routePoints.value[index] = {
    query: location.properties.name,
    location: {
      lon: longitude,
      lat: latitude,
      osm_id: location.properties.osm_id,
      name: location.properties.name,
    },
  }
  osmap.moveTo([latitude, longitude], 20)
  searchStore.searchResults = []
  activeSearchIndex.value = null
}

const buildRoute = () => {
  // Check if at least 2 points are selected
  const validPoints = routePoints.value.filter((point) => point.location !== null)

  if (validPoints.length < 2) {
    alert('Please select at least 2 locations for the route')
    return
  }

  console.log(
    'Route points:',
    validPoints.map((point) => point.location),
  )
  osmap.buildRoute(
    validPoints.map((point) => [point.location.lat, point.location.lon]),
    {
      vehicle: 'foot',
    },
  )
}

const collapseBtnStyle = computed(() => {
  const btnSize = 20
  return {
    left: collapsed ? collapsedWidth : `calc(${sidebarWidth} - ${btnSize / 2}px)`,
  }
})
</script>
<template>
  <transition name="slide">
    <div v-if="!collapsed" class="sidebar" :style="{ width: sidebarWidth }">
      <div class="sidebar-content">
        <h2 class="sidebar-title">Dashboard</h2>

        <div class="search-container">
          <el-input
            v-model="searchStore.searchQuery"
            placeholder="Search for a location"
            prefix-icon="Search"
            clearable
            @focus="activeSearchIndex = null"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <!-- Search results - only show when not in route builder search mode -->
          <div
            v-if="activeSearchIndex === null && searchStore.isLoading"
            class="search-results-loading"
          >
            <el-skeleton :rows="3" animated />
          </div>

          <div
            v-else-if="activeSearchIndex === null && searchStore.searchResults.length > 0"
            class="search-results"
          >
            <el-scrollbar height="250px">
              <div
                v-for="(result, index) in searchStore.searchResults"
                :key="index"
                class="search-result-item"
                @click="handleSelectLocation(result)"
              >
                <div class="result-name">{{ result.properties.name }}</div>
                <div
                  class="result-details"
                  v-if="result.properties.state || result.properties.country"
                >
                  {{ result.properties.state || '' }}
                  {{ result.properties.state && result.properties.country ? ',' : '' }}
                  {{ result.properties.country || '' }}
                </div>
                <div class="result-type">{{ result.properties?.type }}</div>
              </div>
            </el-scrollbar>
          </div>

          <div v-if="activeSearchIndex === null && searchStore.error" class="search-error">
            {{ searchStore.error }}
          </div>
        </div>

        <!-- Route Builder Section -->
        <div class="route-builder">
          <h3>Route Builder</h3>

          <div v-for="(point, index) in routePoints" :key="index" class="route-point">
            <div class="route-point-header">
              <span>Location {{ index + 1 }}</span>
              <el-button
                v-if="routePoints.length > 2"
                type="danger"
                circle
                size="small"
                @click="removeRoutePoint(index)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>

            <el-input
              v-model="point.query"
              :placeholder="`Enter location ${index + 1}`"
              clearable
              @input="handleRoutePointSearch(point.query, index)"
              @focus="setActiveSearch(index)"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>

            <div v-if="point.location" class="selected-location">
              <div class="location-name">{{ point.location.name }}</div>
              <div class="location-coordinates">
                {{ point.location.lat.toFixed(6) }}, {{ point.location.lon.toFixed(6) }}
              </div>
            </div>
          </div>

          <!-- Route point search results -->
          <div
            v-if="activeSearchIndex !== null && searchStore.searchResults.length > 0"
            class="search-results"
          >
            <el-scrollbar height="250px">
              <div
                v-for="(result, index) in searchStore.searchResults"
                :key="index"
                class="search-result-item"
                @click="selectLocationForRoutePoint(result, activeSearchIndex)"
              >
                <div class="result-name">{{ result.properties.name }}</div>
                <div
                  class="result-details"
                  v-if="result.properties.state || result.properties.country"
                >
                  {{ result.properties.state || '' }}
                  {{ result.properties.state && result.properties.country ? ',' : '' }}
                  {{ result.properties.country || '' }}
                </div>
                <div class="result-type">{{ result.properties?.type }}</div>
              </div>
            </el-scrollbar>
          </div>

          <div class="route-actions">
            <el-button @click="addRoutePoint" type="primary" plain>
              <el-icon><Plus /></el-icon>
              Add Location
            </el-button>
            <el-button @click="buildRoute" type="success">Build Route</el-button>
          </div>
        </div>
      </div>
    </div>
  </transition>
  <div class="collapse-btn-container" :style="collapseBtnStyle">
    <el-button
      class="collapse-btn"
      type="primary"
      circle
      size="small"
      @click="$emit('toggleSidebar')"
    >
      <el-icon v-if="collapsed"><ArrowRight /></el-icon>
      <el-icon v-else><ArrowLeft /></el-icon>
    </el-button>
  </div>
</template>
<style lang="scss" scoped>
.sidebar {
  background-color: $sidebar-bg;
  height: 100%;
  transition: width $transition-speed ease;
  overflow-y: auto;
  box-shadow: $shadow-light;
  position: relative;

  &-content {
    padding: 20px;
  }

  &-title {
    margin-bottom: 20px;
    color: $primary-color;
  }

  &-form {
    width: 100%;
  }
}

.collapse-btn-container {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 999;
  transition: left $transition-speed ease;
}

.collapse-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}
/* Slide transition */
.slide {
  &-enter-active,
  &-leave-active {
    transition: transform $transition-speed ease;
  }

  &-enter-from,
  &-leave-to {
    transform: translateX(-100%);
  }
}

.search-container {
  margin-bottom: 20px;
}

.search-results {
  margin-top: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background: #fff;
}

.search-result-item {
  padding: 10px;
  border-bottom: 1px solid #e4e7ed;
  cursor: pointer;

  &:hover {
    background-color: #f5f7fa;
  }

  &:last-child {
    border-bottom: none;
  }
}

.result-name {
  font-weight: bold;
}

.result-details {
  font-size: 0.85em;
  color: #606266;
}

.result-type {
  font-size: 0.75em;
  color: #909399;
  text-transform: capitalize;
}

.search-results-loading {
  margin-top: 8px;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.search-error {
  margin-top: 8px;
  color: #f56c6c;
  font-size: 0.85em;
}

/* Route Builder Styles */
.route-builder {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.route-point {
  margin-bottom: 16px;

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
}

.selected-location {
  margin-top: 8px;
  padding: 8px;
  background-color: #f0f9eb;
  border-radius: 4px;
  border-left: 3px solid #67c23a;

  .location-name {
    font-weight: bold;
  }

  .location-coordinates {
    font-size: 0.85em;
    color: #606266;
    margin-top: 4px;
  }
}

.route-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}
</style>
