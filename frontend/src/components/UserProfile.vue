<template>
  <div class="user-profile">
    <div v-if="authStore.isAuthenticated" class="user-info">
      <el-dropdown trigger="hover" class="account-indicator">
        <div class="account-wrapper">
          <div class="status-dot"></div>
          <span>Account</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="viewProfile">Profile</el-dropdown-item>
            <el-dropdown-item @click="logout">Sign Out</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div v-else class="auth-buttons">
      <el-button type="primary" @click="showSignInModal">Sign In</el-button>
      <el-button @click="showSignUpModal">Sign Up</el-button>
    </div>

    <!-- Sign In Modal -->
    <el-dialog v-model="signInModalVisible" title="Sign In" width="30%">
      <sign-in-form @success="onSignInSuccess" @cancel="signInModalVisible = false" />
    </el-dialog>

    <!-- Sign Up Modal -->
    <el-dialog v-model="signUpModalVisible" title="Sign Up" width="30%">
      <sign-up-form @success="onSignUpSuccess" @cancel="signUpModalVisible = false" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import SignInForm from './SignInForm.vue'
import SignUpForm from './SignUpForm.vue'

const authStore = useAuthStore()
const signInModalVisible = ref(false)
const signUpModalVisible = ref(false)

onMounted(async () => {
  try {
    await authStore.fetchCurrentUser()
  } catch (error) {
    // Silently handle the error since this is expected for non-logged in users
    console.log('User not authenticated yet')
  }
})

const showSignInModal = () => {
  // Clear any previous errors when opening the modal
  authStore.clearError()
  signInModalVisible.value = true
}

const showSignUpModal = () => {
  // Clear any previous errors when opening the modal
  authStore.clearError()
  signUpModalVisible.value = true
}

const onSignInSuccess = () => {
  signInModalVisible.value = false
}

const onSignUpSuccess = () => {
  signUpModalVisible.value = false
}

const logout = () => {
  authStore.logout()
}

const viewProfile = () => {
  // Handle profile viewing logic
  console.log('View profile clicked')
}
</script>

<style scoped>
.user-profile {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
}

.account-indicator {
  cursor: pointer;
  position: relative;
}

.account-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  background-color: rgba(64, 158, 255, 0.1);
  transition: all 0.3s ease;
  font-weight: 500;
  color: #409EFF;
}

.account-wrapper:hover {
  background-color: rgba(64, 158, 255, 0.2);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #52c41a; /* Green color for "online" status */
  position: relative;
}

.auth-buttons {
  display: flex;
  gap: 10px;
}
</style> 