import { defineStore } from 'pinia'
import axios from 'axios'
import { WM_API_ENDPOINTS, WM_API_KEY } from '@/config'

export const useWheelmapStore = defineStore('wheelmap', {
  state: () => ({
    loading: false,
    error: null,
  }),

  getters: {
    isLoading: (state) => state.loading,
    hasError: (state) => state.error !== null,
  },

  actions: {
    /**
     * Function which gets list of nodes for desired bounding box
     * @param {string} bbox
     * @returns {Promise<any>} result of api call
     */
    async fetchNodes(bbox) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.get(WM_API_ENDPOINTS.NODES, {
          params: {
            api_key: WM_API_KEY,
            bbox,
            per_page: 10000,
            limit: 10000,
            ts: 0,
          },
        })
        console.log(response.data.nodes)
        return response.data.nodes || []
      } catch (error) {
        console.error('Error fetching wheelmap nodes:', error)
        this.error = error.message || 'Failed to fetch wheelmap data'
      } finally {
        this.loading = false
      }
    },
  },
})

// category: {identifier: "transport"}
// city
// :
// null
// housenumber
// :
// null
// id
// :
// 6601681822
// lat
// :
// 37.53437761686388
// lon
// :
// -122.29449415151078
// name
// :
// "El Camino Real & 37th Avenue"
// node_type
// :
// {identifier: "stop_position"}
// identifier
// :
// "stop_position"
// osm_id
// :
// "node/6601681822"
// osm_type
// :
// "node"
// phone
// :
// null
// postcode
// :
// null
// street
// :
// null
// tags
// :
// {}
// website
// :
// null
// wheelchair
// :
// null
// wheelchair_description
// :
// null
// wheelchair_toilet
// :
// null
