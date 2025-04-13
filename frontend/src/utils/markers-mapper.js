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
  const address = formatAddress(node)

  // Build wheelchair accessibility info if available
  let accessibilityInfo = ''
  if (node.wheelchair) {
    accessibilityInfo = `<p class="wheelchair-status wheelchair-${node.wheelchair}">
        Wheelchair accessibility: ${node.wheelchair}
      </p>`

    if (node.wheelchair_description) {
      accessibilityInfo += `<p class="wheelchair-description">
          ${node.wheelchair_description}
        </p>`
    }

    if (node.wheelchair_toilet) {
      accessibilityInfo += `<p class="wheelchair-toilet">
          Accessible toilet: ${node.wheelchair_toilet}
        </p>`
    }
  }

  // Build contact info if available
  let contactInfo = ''
  if (node.website || node.phone) {
    contactInfo = '<div class="contact-info">'

    if (node.website) {
      contactInfo += `<p><a href="${node.website}" target="_blank" rel="noopener">Website</a></p>`
    }

    if (node.phone) {
      contactInfo += `<p>Phone: <a href="tel:${node.phone}">${node.phone}</a></p>`
    }

    contactInfo += '</div>'
  }

  return `
      <div class="leaflet-popup-content">
        <h3>${node.name}</h3>
        <p class="type">${nodeType.replace('_', ' ')}</p>
        ${address ? `<p class="address">${address}</p>` : ''}
        ${accessibilityInfo}
        ${contactInfo}
      </div>
    `
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
