import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet-routing-machine'

import { EventEmitter } from './event-emitter'

export class OSMap {
  #container = null
  /** @type {L.Map} */

  #map = null
  /** @type {L.TileLayer} */
  #tileLayer = null

  /** @type {Array<{id: string | number, marker: L.Marker}>} */
  #markers = new Array()

  /** @type {L.MarkerClusterGroup} */
  #markerClusterGroup = null

  /** @type {OSMapController | null} */
  #controller = null

  /**
   * @type {L.Routing.Control | null}
   */
  #routeControl = null

  /**
   * Sets a map container
   * @param {any} - html element ref where map should be rendered
   * @returns {void}
   */
  registerContainer(container) {
    this.#container = container
  }

  /**
   * Creates a map instance with all required defaults
   * @param {L.LatLngExpression} center
   * @param {number} zoom
   * @returns {void}
   */
  initialize(center, zoom) {
    if (!this.#container) {
      throw Error('initialize error: container should be registered first')
    }
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    })

    this.#map = L.map(this.#container, {}).setView(center, zoom)

    this.#markerClusterGroup = L.markerClusterGroup({
      disableClusteringAtZoom: 20,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount()
        const size = getClusterSizeCategory(count) // small, medium, large (for sizing if needed)
        const color = getClusterColor(count) // gradient color

        const html = `
          <div style="
            background-color: ${color};
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            border: 2px solid white;
            box-shadow: 0 0 6px rgba(0,0,0,0.3);
          ">
            ${count}
          </div>
        `

        return L.divIcon({
          html,
          className: 'custom-cluster-icon', // optional for further styling
          iconSize: [size, size],
        })
      },
    })

    this.#controller = new OSMapController(this)
  }

  /**
   * Adds a new tile layer to the map
   * @param {string} urlTemplate - map layer template
   * @param {L.TileLayerOptions} options
   * @returns {void}
   */
  registerTileLayer(urlTemplate, options) {
    if (!this.#map) {
      throw Error('register title error: map should be initialized first')
    }
    this.#tileLayer = L.tileLayer(urlTemplate, options).addTo(this.#map)
  }

  /**
   * Adds a single marker to the map with clustering.
   * @param {number | string} id - id of node used for marker
   * @param {L.LatLngExpression} latlng - Coordinates for the marker.
   * @param {L.MarkerOptions} options - Options for the marker.
   * @param {Object} [popup] - Popup configuration.
   * @param {string} popup.content - Content of the popup.
   * @param {L.PopupOptions} [popup.options] - Options for the popup (optional).
   *
   * @returns {L.Marker} The created Leaflet marker.
   */
  addMarker(id, latlng, options, popup) {
    if (!this.#map) {
      throw Error('register title error: map should be initialized first')
    }

    const marker = L.marker(latlng, options)

    if (popup) {
      marker.bindPopup(popup.content, popup.options)
    }

    this.#markerClusterGroup.addLayer(marker)

    if (!this.#map.hasLayer(this.#markerClusterGroup)) {
      this.#map.addLayer(this.#markerClusterGroup)
    }

    this.#markers.push({ id, ...marker })

    return marker
  }

  /**
   * Adds multiple markers to the map with clustering.
   * @param {Array<{id: number | string, latlng: L.LatLngExpression, options: L.MarkerOptions, popup?: Object}>} markersData - Array of marker data (id, latlng, options, and optional popup).
   * @returns {Array<L.Marker>} Array of created Leaflet markers.
   */
  addMarkers(markersData) {
    if (!this.#map) {
      throw Error('addMarkers error: map should be initialized first')
    }

    const createdMarkers = markersData.map((markerData) => {
      const { id, latlng, options, popup } = markerData
      const marker = L.marker(latlng, options)

      if (popup) {
        marker.bindPopup(popup.content, popup.options)
      }

      this.#markerClusterGroup.addLayer(marker)

      return { id, marker }
    })

    if (!this.#map.hasLayer(this.#markerClusterGroup)) {
      this.#map.addLayer(this.#markerClusterGroup)
    }

    this.#markers.push(...createdMarkers)

    return createdMarkers.map((item) => item.marker)
  }

  /**
   * Override some markers
   * @param {Array<{id: string | number, marker: L.Marker}>}
   */
  mergeMarkers(newMarkers) {}

  /**
   * Clears all markers from the map and the cluster group.
   * @returns {void}
   */
  clearAllMarkers() {
    if (!this.#map) {
      throw Error('clearAllMarkers error: map should be initialized first')
    }

    // Remove all markers from the cluster group
    this.#markerClusterGroup.clearLayers()

    // Clear the markers array as well
    this.#markers = []
  }

  /**
   * Moves the map view to a specific location and optional zoom level.
   * @param {L.LatLngExpression} latlng - Coordinates to move to.
   * @param {number} [zoom] - Optional zoom level.
   * @returns {void}
   */
  moveTo(latlng, zoom) {
    if (!this.#map) {
      throw Error('moveTo error: map should be initialized first')
    }
    if (typeof zoom === 'number') {
      this.#map.setView(latlng, zoom)
    } else {
      this.#map.panTo(latlng)
    }
  }

  /**
   * Moves the map view to a specific location and optional zoom level, then moves to specific marker and opens its popup.
   * @param {number | string} id - id of marker
   * @param {L.LatLngExpression} latlng - Coordinates to move to.
   * @returns {void}
   */
  moveToMarker(id, latlng) {
    if (!this.#map) {
      throw Error('moveToMarker error: map should be initialized first')
    }
    this.#controller.setLock(true)
    this.moveTo(latlng, 20)
    this.#controller.triggerChangeBBox(() => {
      const marker = this.#markers.find((item) => Math.abs(+item.id) === Math.abs(+id))
      if (marker) {
        marker.marker.openPopup()
      }

      this.#controller.setLock(false)
    })
  }

  /**
   * Builds a route between waypoints with a given travel mode.
   *
   * @param {Array<L.LatLngExpression>} waypoints - Array of coordinates to build the route through.
   * @param {Object} [options] - Routing options.
   * @param {'car' | 'bicycle' | 'foot'} [options.vehicle='car'] - Vehicle type for the route.
   * @param {Object} [options.routingOptions] - Additional routing options passed to the control.
   *
   * @returns {void}
   */
  buildRoute(waypoints, options = {}) {
    if (!this.#map) {
      throw new Error('buildRoute error: map should be initialized first')
    }

    const vehicle = options.vehicle || 'car'

    if (this.#routeControl) {
      this.#map.removeControl(this.#routeControl)
      this.#routeControl = null
    }

    // Map to OSRM profile
    const profile =
      {
        car: 'driving',
        bicycle: 'cycling',
        foot: 'walking',
      }[vehicle] || 'driving'

    const serviceUrl = `https://router.project-osrm.org/route/v1`

    this.#routeControl = L.Routing.control({
      waypoints: waypoints.map((point) => L.latLng(point)),
      router: L.Routing.osrmv1({
        serviceUrl,
        profile,
        useHints: false,
        steps: true,
        alternatives: false,
      }),
      lineOptions: {
        styles: [{ color: 'blue', opacity: 0.7, weight: 5 }],
      },
      show: false,
      routeWhileDragging: false,
      addWaypoints: false,
      createMarker: () => null,
      ...options.routingOptions,
    }).addTo(this.#map)
  }

  /**
   * Clears the current route from the map if exists.
   *
   * @returns {void}
   */
  clearRoute() {
    if (!this.#map) {
      throw new Error('clearRoute error: map should be initialized first')
    }

    if (this.#routeControl) {
      this.#map.removeControl(this.#routeControl)
      this.#routeControl = null
    }
  }

  /**
   * Get all added markers
   * @returns {Array<L.Marker>}
   */
  getMarkers() {
    return this.#markers
  }

  /**
   * Returns bounding box of current map
   * @returns {string} bbox string
   */
  getBBox() {
    return this.#map.getBounds().toBBoxString()
  }

  /**
   * Resizing map invalidating its size
   * @returns {void}
   */
  resize() {
    if (!this.#map) {
      throw Error('register title error: map should be initialized first')
    }
    this.#map.invalidateSize()
  }

  /**
   * Clean up map component
   */
  remove() {
    if (this.#map) {
      this.#map.remove()
    }
  }

  /**
   * Controller instance
   * @returns {OSMapController}
   * @throws {Error} if controller is not initialized
   */
  get controller() {
    if (!this.#controller) {
      throw Error('controller error: controller not initialized, initialize map first')
    }
    return this.#controller
  }

  /**
   * Returns raw map instance
   * @returns {L.Map}
   */
  _getMapInstance() {
    return this.#map
  }

  /**
   * Returns raw tile layer
   * @returns {L.TileLayer}
   */
  _getTileLayer() {
    return this.#tileLayer
  }
}

export class OSMapVueAdapter {
  install(app) {
    const osmap = new OSMap()
    app.config.globalProperties.$osmap = osmap
    app.provide('osmap', osmap)
  }
}

export class OSMapController extends EventEmitter {
  #lock = false
  #debounceTimer = null
  #mapListenersBound = false

  /**
   * @param {OSMap} mapInstance - Instance of OSMap
   */
  constructor(mapInstance) {
    super()

    /** @type {OSMap} */
    this.mapInstance = mapInstance
  }

  /**
   * Enable or disable event emission globally.
   * @param {boolean} value - true to lock, false to unlock
   */
  setLock(value) {
    this.#lock = value
  }

  /**
   * Subscribe to bbox change events with debounced handling.
   */
  subscribeBBoxChange() {
    const map = this.mapInstance._getMapInstance()

    if (!map) {
      throw new Error('OSMapController error: Map is not initialized')
    }

    if (this.#mapListenersBound) return
    this.#mapListenersBound = true

    const boundTrigger = this.#onBboxChange.bind(this)

    map.on('moveend', boundTrigger)
    map.on('zoomend', boundTrigger)
    map.on('resize', boundTrigger)
  }

  /**
   * Manually triggers a bbox-changed event and executes a callback after all async listeners complete ignoring lock
   * @param {Function} callback - Function to be called after all event listeners finish their async operations
   * @returns {Promise<void>}
   */
  async triggerChangeBBox(callback) {
    const bbox = this.mapInstance.getBBox()

    try {
      // Use promise-based event emission to handle async listeners
      await this.emitAsync('bbox-changed', bbox)
    } catch (e) {
      throw e
    } finally {
      if (typeof callback === 'function') {
        callback(bbox)
      }
    }
  }

  #onBboxChange() {
    if (this.#lock) return

    if (this.#debounceTimer) {
      clearTimeout(this.#debounceTimer)
    }

    this.#debounceTimer = setTimeout(() => {
      if (!this.#lock) {
        const bbox = this.mapInstance.getBBox()
        this.emit('bbox-changed', bbox)
      }
    }, 500)
  }

  /**
   * Clean up all events and listeners
   */
  unsubscribeBBoxChange() {
    const map = this.mapInstance._getMapInstance()
    map.off('moveend')
    map.off('zoomend')
    map.off('resize')
    this.removeListeners('bbox-changed')
    this.#mapListenersBound = false
  }

  /**
   * Returns current lock state.
   * @returns {boolean}
   */
  isLocked() {
    return this.#lock
  }
}

function getClusterSizeCategory(count) {
  if (count < 10) return 30
  if (count < 50) return 40
  return 50
}

function getClusterColor(count) {
  const min = 1
  const max = 100
  const ratio = Math.min(1, (count - min) / (max - min))

  const colorStops = [
    { stop: 0.0, color: '#3498db' },
    { stop: 0.33, color: '#2ecc71' },
    { stop: 0.66, color: '#f1c40f' },
    { stop: 1.0, color: '#e67e22' },
  ]

  for (let i = 0; i < colorStops.length - 1; i++) {
    const start = colorStops[i]
    const end = colorStops[i + 1]

    if (ratio >= start.stop && ratio <= end.stop) {
      const localRatio = (ratio - start.stop) / (end.stop - start.stop)
      return interpolateColor(start.color, end.color, localRatio)
    }
  }

  return colorStops[colorStops.length - 1].color
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

function interpolateColor(color1, color2, factor = 0.5) {
  const c1 = hexToRgb(color1)
  const c2 = hexToRgb(color2)

  const r = Math.round(c1.r + factor * (c2.r - c1.r))
  const g = Math.round(c1.g + factor * (c2.g - c1.g))
  const b = Math.round(c1.b + factor * (c2.b - c1.b))

  return `rgb(${r}, ${g}, ${b})`
}
