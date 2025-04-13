import L from 'leaflet'

const baseIconConfig = {
  iconSize: [24, 24],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowUrl: null,
}

export const accessibilityIcons = {
  accessible: L.icon({
    ...baseIconConfig,
    iconUrl: '/images/marker-accessible.png',
    className: 'marker-icon accessible-marker',
  }),

  limited: L.icon({
    ...baseIconConfig,
    iconUrl: '/images/marker-limited.png',
    className: 'marker-icon limited-marker',
  }),

  'not-accessible': L.icon({
    ...baseIconConfig,
    iconUrl: '/images/marker-not-accessible.png',
    className: 'marker-icon not-accessible-marker',
  }),

  unknown: L.icon({
    ...baseIconConfig,
    iconUrl: '/images/marker-unknown.png',
    className: 'marker-icon unknown-marker',
  }),
}

export function getCustomMarkerIcon() {
  return accessibilityIcons.unknown
}

// Get the appropriate marker icon based on wheelchair accessibility status
export function getAccessibilityMarkerIcon(accessibilityStatus) {
  return accessibilityIcons[accessibilityStatus] || accessibilityIcons.unknown
}
