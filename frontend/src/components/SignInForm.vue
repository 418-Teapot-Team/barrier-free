<template>
  <div class="sign-in-form">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
      <el-form-item label="Email" prop="email">
        <el-input v-model="form.email" type="email" />
      </el-form-item>
      <el-form-item label="Password" prop="password">
        <el-input v-model="form.password" type="password" />
      </el-form-item>
      <el-form-item>
        <div class="form-actions">
          <el-button @click="handleCancel">Cancel</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="authStore.loading">
            Sign In
          </el-button>
        </div>
      </el-form-item>
    </el-form>
    <div v-if="authStore.error" class="error-message">
      {{ authStore.error }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['success', 'cancel'])
const authStore = useAuthStore()
const formRef = ref(null)

const form = reactive({
  email: '',
  password: ''
})

const rules = {
  email: [
    { required: true, message: 'Please enter your email', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please enter your password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await authStore.login(form)
        emit('success')
      } catch (error) {
        console.error('Login failed:', error)
      }
    }
  })
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.sign-in-form {
  padding: 20px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.error-message {
  color: #f56c6c;
  margin-top: 10px;
  font-size: 14px;
}
</style> 