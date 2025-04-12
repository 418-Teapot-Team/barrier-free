<template>
  <div class="app-container">
    <!-- Sidebar -->
    <transition name="slide">
      <div v-if="!collapsed" class="sidebar" :style="{ width: sidebarWidth }">
        <div class="sidebar-content">
          <h2 class="sidebar-title">Dashboard</h2>

          <!-- Input components -->
          <el-form label-position="top" label-width="100px" class="sidebar-form">
            <el-form-item label="Name">
              <el-input placeholder="Enter your name" v-model="form.name"></el-input>
            </el-form-item>

            <el-form-item label="Category">
              <el-select v-model="form.category" placeholder="Select category" style="width: 100%">
                <el-option
                  v-for="item in categories"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="Date">
              <el-date-picker
                v-model="form.date"
                type="date"
                placeholder="Pick a date"
                style="width: 100%"
              ></el-date-picker>
            </el-form-item>

            <el-form-item label="Range">
              <el-slider v-model="form.range"></el-slider>
            </el-form-item>

            <el-form-item label="Options">
              <el-checkbox-group v-model="form.options">
                <el-checkbox label="Option 1"></el-checkbox>
                <el-checkbox label="Option 2"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="Switch">
              <el-switch v-model="form.switch"></el-switch>
            </el-form-item>

            <el-form-item label="Upload">
              <el-upload
                class="upload-demo"
                action="#"
                :auto-upload="false"
                :on-change="handleFileChange"
              >
                <el-button size="small" type="primary">Click to upload</el-button>
              </el-upload>
            </el-form-item>

            <el-form-item>
              <el-button type="primary">Submit</el-button>
              <el-button>Cancel</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </transition>

    <!-- Main content area -->
    <div class="main-content" :style="mainContentStyle">
      <!-- Added header with buttons -->
      <div class="main-header">
        <div class="header-title">Map Explorer</div>
        <div class="header-actions">
          <el-button type="primary" :icon="Search">Search</el-button>
          <el-button type="success" :icon="Location">My Location</el-button>
        </div>
      </div>

      <!-- Added Leaflet map -->
      <div class="map-container" ref="mapContainer"></div>
    </div>

    <!-- Collapse/expand button - repositioned to be half on sidebar, half off -->
    <div class="collapse-btn-container" :style="collapseBtnStyle">
      <el-button class="collapse-btn" type="primary" circle size="small" @click="toggleSidebar">
        <el-icon v-if="collapsed"><ArrowRight /></el-icon>
        <el-icon v-else><ArrowLeft /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ArrowLeft, ArrowRight, Search, Location } from '@element-plus/icons-vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Sidebar state
const collapsed = ref(false)
const sidebarWidth = ref('20%')
const collapsedWidth = ref('4px')
const mapContainer = ref(null)
let map = null

// Form data
const form = reactive({
  name: '',
  category: '',
  date: '',
  range: 50,
  options: [],
  switch: false,
})

const categories = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
]

const uploadFiles = ref([])

// Computed styles
const mainContentStyle = computed(() => {
  return {
    width: collapsed.value
      ? `calc(100% - ${collapsedWidth.value})`
      : `calc(100% - ${sidebarWidth.value})`,
  }
})

const collapseBtnStyle = computed(() => {
  // Position the button to be half on sidebar and half off
  const btnSize = 20 // Approximate size of button in pixels
  return {
    left: collapsed.value ? collapsedWidth.value : `calc(${sidebarWidth.value} - ${btnSize / 2}px)`,
  }
})

// Methods
const toggleSidebar = () => {
  collapsed.value = !collapsed.value
  // When sidebar state changes, update the map size after DOM update
  setTimeout(() => {
    if (map) map.invalidateSize()
  }, 300)
}

const handleFileChange = (file) => {
  uploadFiles.value.push(file)
}

// Initialize Leaflet map
onMounted(() => {
  // Fix Leaflet's icon paths
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })

  // Initialize map
  map = L.map(mapContainer.value, {}).setView([51.505, -0.09], 13)

  // Add tile layer (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map)

  // Add a marker
  L.marker([51.5, -0.09]).addTo(map).bindPopup('A sample marker').openPopup()
})

// Clean up map on component unmount
onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style lang="scss" scoped>
// Variables
$sidebar-bg: #f5f7fa;
$primary-color: #409eff;
$shadow-light: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
$transition-speed: 0.3s;
$header-height: 60px;

.app-container {
  display: flex;
  height: 100vh;
  position: relative;
  overflow: hidden;
  padding: 0;
  margin: 0;
}

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
</style>
