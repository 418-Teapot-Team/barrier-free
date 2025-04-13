/**
 * Application configuration
 */

// API base URL
export const API_URL = 'http://35.192.186.150:8000/api'

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_URL}/auth/login`,
    REGISTER: `${API_URL}/auth/register`,
    ME: `${API_URL}/auth/me`,
  }
}

// Other config variables can be added here
export const APP_NAME = 'Map Explorer' 