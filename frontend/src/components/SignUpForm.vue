<template>
  <div class="sign-up-form">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
      <!-- <el-form-item label="Name" prop="name">
        <el-input v-model="form.name" />
      </el-form-item> -->
      <el-form-item label="Email" prop="email">
        <el-input v-model="form.email" type="email" />
      </el-form-item>
      <el-form-item label="Password" prop="password">
        <el-input v-model="form.password" type="password" />
      </el-form-item>
      <el-form-item label="Confirm" prop="confirmPassword">
        <el-input v-model="form.confirmPassword" type="password" />
      </el-form-item>
      <el-form-item label="Disabilities" prop="disabilities">
        <el-select v-model="form.disabilities" multiple placeholder="Select disabilities">
          <el-option v-for="disability in authStore.disabilities" :key="disability" :label="disability"
            :value="disability" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <div class="form-actions">
          <el-button @click="handleCancel">Cancel</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="authStore.loading">
            Sign Up
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
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  disabilities: []
})

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please enter the password'))
  } else {
    if (form.confirmPassword !== '') {
      if (formRef.value) {
        formRef.value.validateField('confirmPassword')
      }
    }
    callback()
  }
}

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please confirm the password'))
  } else if (value !== form.password) {
    callback(new Error("Passwords don't match"))
  } else {
    callback()
  }
}

const rules = {
  name: [
    { required: true, message: 'Please enter your name', trigger: 'blur' },
    { min: 2, message: 'Name must be at least 2 characters', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Please enter your email', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please enter your password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm your password', trigger: 'blur' },
    { validator: validatePass2, trigger: 'blur' }
  ],
  disabilities: [
    { required: true, message: 'Please select at least one disability', trigger: 'change' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const { confirmPassword, ...userData } = form

        if (!userData.name) {
          userData.name = userData.email.split('@')[0]
        }

        await authStore.register(userData)

        // Now login to get the token
        await authStore.login({
          email: userData.email,
          password: userData.password
        })

        emit('success')
      } catch (error) {
        console.error('Registration failed:', error)
      }
    }
  })
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.sign-up-form {
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