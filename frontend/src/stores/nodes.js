
// stores/comments.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { API_ENDPOINTS } from '@/config'
import axios from 'axios'

export const useNodesStore = defineStore('nodes', () => {
  async function fetchAllNodes() {
    try {
      const response = await axios.get(API_ENDPOINTS.NODES)
      const data = response.data

      return data
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }
  }

  fetchAllNodes()

  return {
    fetchAllNodes
  }
})
