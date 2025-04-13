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
    DISABILITIES: `${API_URL}/disabilities`,
  },
  NODES: `${API_URL}/nodes`,
  ADD_COMMENT: `${API_URL}/comments`,
  ADD_PROPOSAL: `${API_URL}/accessibility_propositions`,
}

// WheelMap API
export const WM_API_URL = 'https://ac-o-2.global.ssl.fastly.net/api/v1/legacy/api'
export const WM_API_KEY = '3s8GNQvBCmwm45zro_jP'

export const WM_API_ENDPOINTS = {
  NODES: `${WM_API_URL}/nodes/`,
}

export const APP_NAME = 'Barrier Free'
