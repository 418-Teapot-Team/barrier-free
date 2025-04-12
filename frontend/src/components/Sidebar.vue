<script setup>
import { reactive, ref, computed } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

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
</style>
