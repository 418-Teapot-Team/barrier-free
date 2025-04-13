<template>
  <sidebar :collapsed="collapsed" :collapsed-width="collapsedWidth" :sidebar-width="sidebarWidth"
    @toggle-sidebar="toggleSidebar" />
  <div class="main-content" :style="mainContentStyle">
    <div class="main-header">
      <div class="header-title">Barrier Free</div>
      <div class="header-actions">
        <user-profile />
      </div>
    </div>

    <el-dialog v-model="nodeModalVisible">
      <node-modal :node="currentNode" @success="onNodeModalSuccess" @cancel="nodeModalVisible = false" />
    </el-dialog>

    <map-view ref="mapViewRef" />
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import MapView from '@/components/Map.vue'
import UserProfile from '@/components/UserProfile.vue'
import { ref, computed, inject } from 'vue'
import 'leaflet/dist/leaflet.css'

const osmap = inject('osmap')

const collapsed = ref(false)
const sidebarWidth = ref('20%')
const collapsedWidth = ref('4px')
const mapViewRef = ref(null)
const nodeModalVisible = ref(false)
const currentNode = ref(null)

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
    osmap.resize()
  }, 300)
}

window.showNodeModal = function (node) {
  nodeModalVisible.value = true
  currentNode.value = node
}

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
</style>
