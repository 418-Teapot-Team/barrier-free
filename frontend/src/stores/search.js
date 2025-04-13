import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSearchStore = defineStore('search', () => {
  const searchQuery = ref('')
  const searchResults = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  async function searchLocations(query) {
    if (!query.trim()) {
      searchResults.value = []
      return
    }
    
    try {
      isLoading.value = true
      error.value = null
      
      const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=30&lang=en`)
      
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      
      const data = await response.json()
      searchResults.value = data.features || []
    } catch (err) {
      error.value = err.message
      searchResults.value = []
    } finally {
      isLoading.value = false
    }
  }

  function setQueryWithoutSearch(query) {
    searchQuery.value = query;
  }

  return {
    searchQuery,
    searchResults,
    isLoading,
    error,
    searchLocations,
    setQueryWithoutSearch
  }
}) 