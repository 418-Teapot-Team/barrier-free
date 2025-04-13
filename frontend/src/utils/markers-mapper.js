import { createApp } from 'vue'
import PopupContent from '@/components/PopupContent.vue'

/**
 * Maps wheelmap nodes to the Leaflet cluster marker format
 * @param {Array} nodes - The nodes array returned from the API
 * @returns {Array<{id: number | string, latlng: L.LatLngExpression, options: L.MarkerOptions, popup?: string}>}
 */
import { getAccessibilityMarkerIcon } from './icons';

function mapNodesToClusterMarkers(nodes) {
  // Filter out nodes with null names
  return nodes
    .filter((node) => node.name !== null)
    .map((node) => {
      const nodeType = node.node_type?.identifier || 'default'
      
      // Determine wheelchair accessibility status for styling
      let wheelchairStatus = 'unknown'
      if (node.wheelchair === 'yes') wheelchairStatus = 'accessible'
      else if (node.wheelchair === 'limited') wheelchairStatus = 'limited'
      else if (node.wheelchair === 'no') wheelchairStatus = 'not-accessible'
      
      // Get the appropriate icon based on accessibility status
      const icon = getAccessibilityMarkerIcon(wheelchairStatus);

      return {
        id: node.id,
        latlng: [node.lat, node.lon], // Leaflet accepts [lat, lng] format
        options: {
          icon: icon, // Use icon based on accessibility
          title: node.name,
          alt: node.name,
          className: `marker-${wheelchairStatus} marker-${nodeType}`,
        },
        popup: {
          content: createPopupContent(node, nodeType),
        },
      }
    })
}

/**
 * Helper function to format the address from node properties
 * @param {Object} node - The node object
 * @returns {string} Formatted address
 */
function formatAddress(node) {
  const parts = []

  if (node.housenumber) parts.push(node.housenumber)
  if (node.street) parts.push(node.street)
  if (node.city) parts.push(node.city)
  if (node.postcode) parts.push(node.postcode)

  return parts.join(', ')
}

/**
 * Creates a popup content string for Leaflet
 * @param {Object} node - The node object
 * @param {string} nodeType - The node type identifier
 * @returns {string} HTML string for the popup content
 */
function createPopupContent(node, nodeType) {
  const container = document.createElement('div')
  const app = createApp(PopupContent, { node, nodeType })
  app.mount(container)
  return container
}

export class WheelmapMarkersMapper {
  /**
   * Transform wheelmap response to leaflet markers with id
   * @param {Array} nodes
   * @returns {Array<{id: number | string, latlng: L.LatLngExpression, options: L.MarkerOptions, popup?: Object}>}
   */
  static map(nodes) {
    // Using a simplified approach without mapping different icons
    return mapNodesToClusterMarkers(nodes);
  }
}
