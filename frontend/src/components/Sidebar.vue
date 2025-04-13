<script setup>
import { reactive, ref, computed, watch, inject } from 'vue'
import { ArrowLeft, ArrowRight, Search } from '@element-plus/icons-vue'
import { useSearchStore } from '../stores/search'

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

watch(() => searchStore.searchQuery, (newQuery) => {
  handleSearch(newQuery)
})

const handleSelectLocation = (location) => {
  const [longitude, latitude] = location.geometry.coordinates;
  osmap.moveTo([latitude, longitude], 20);
  
  // searchStore.setQueryWithoutSearch(location.properties.name);
  searchStore.searchResults = [];
}

const categories = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
]

const form = reactive({
  name: '',
  category: '',
  date: '',
  range: 50,
  options: [],
  switch: false,
})

const uploadFiles = ref([])

const collapseBtnStyle = computed(() => {
  const btnSize = 20
  return {
    left: collapsed ? collapsedWidth : `calc(${sidebarWidth} - ${btnSize / 2}px)`,
  }
})

const handleFileChange = (file) => {
  uploadFiles.value.push(file)
}
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
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <!-- Search results -->
          <div v-if="searchStore.isLoading" class="search-results-loading">
            <el-skeleton :rows="3" animated />
          </div>
          
          <div v-else-if="searchStore.searchResults.length > 0" class="search-results">
            <el-scrollbar height="250px">
              <div 
                v-for="(result, index) in searchStore.searchResults" 
                :key="index"
                class="search-result-item"
                @click="handleSelectLocation(result)"
              >
                <div class="result-name">{{ result.properties.name }}</div>
                <div class="result-details" v-if="result.properties.state || result.properties.country">
                  {{ result.properties.state || '' }}
                  {{ result.properties.state && result.properties.country ? ',' : '' }}
                  {{ result.properties.country || '' }}
                </div>
                <div class="result-type">{{ result.properties.type }}</div>
              </div>
            </el-scrollbar>
          </div>
          
          <div v-if="searchStore.error" class="search-error">
            {{ searchStore.error }}
          </div>
        </div>

        <!-- <el-form label-position="top" label-width="100px" class="sidebar-form">
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
        </el-form> -->
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
</style>
