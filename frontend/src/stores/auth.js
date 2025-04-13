import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '@/config'

// Token storage keys
const TOKEN_KEY = 'auth_token'

// Set up axios interceptor for authentication
const setupAxiosAuth = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete axios.defaults.headers.common['Authorization']
  }
}

// Load token from localStorage on initialization
const loadStoredToken = () => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    setupAxiosAuth(token)
  }
  return token
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const token = ref(loadStoredToken())

  const isAuthenticated = computed(() => !!token.value)

  // Set token and store in localStorage
  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken)
      setupAxiosAuth(newToken)
    } else {
      localStorage.removeItem(TOKEN_KEY)
      setupAxiosAuth(null)
    }
  }

  // Fetch current user info - don't set error on failure as this is an expected case
  async function fetchCurrentUser() {
    if (!token.value) {
      user.value = null
      return null
    }

    try {
      loading.value = true
      const response = await axios.get(API_ENDPOINTS.AUTH.ME)
      user.value = response.data
      return response.data
    } catch (err) {
      // Check if error is due to token expiration (401 Unauthorized)
      if (err.response && err.response.status === 401) {
        // Clear token and user data
        setToken(null)
        user.value = null
      }
      return null
    } finally {
      loading.value = false
    }
  }

  // Login user
  async function login(credentials) {
    try {
      loading.value = true
      error.value = null // Clear previous errors
      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
      
      // Save token
      if (response.data && response.data.token) {
        setToken(response.data.token)
        
        // Fetch user details after getting token
        await fetchCurrentUser()
      } else {
        throw new Error('No token received from server')
      }
      
      return response.data
    } catch (err) {
      // Extract error message from response with proper format {"error":"Incorrect email"}
      error.value = err.response?.data?.error || 'Login failed'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Register user
  async function register(userData) {
    try {
      loading.value = true
      error.value = null // Clear previous errors
      const response = await axios.post(API_ENDPOINTS.AUTH.REGISTER, userData)
      
      // No token handling here, just return the response
      return response.data
    } catch (err) {
      // Extract error message from response
      error.value = err.response?.data?.error || 'Registration failed'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Logout user
  function logout() {
    user.value = null
    setToken(null)
  }

  // Clear any existing errors
  function clearError() {
    error.value = null
  }

  // Initialize on app start
  function init() {
    if (token.value) {
      fetchCurrentUser()
    }
  }

  return { 
    user, 
    loading, 
    error, 
    token,
    isAuthenticated, 
    fetchCurrentUser, 
    login, 
    register, 
    logout,
    clearError,
    init
  }
}) 