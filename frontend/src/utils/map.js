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

  /** @type {Array<L.Marker>} */
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

    this.#markerClusterGroup = L.markerClusterGroup()

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
        alternatives: true,
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
  /**
   * @param {OSMap} mapInstance - Instance of OSMap
   */
  constructor(mapInstance) {
    super()

    /** @type {OSMap} */
    this.mapInstance = mapInstance
  }

  subscribeBBoxChange() {
    const map = this.mapInstance._getMapInstance()

    if (!map) {
      throw new Error('OSMapController error: Map is not initialized')
    }

    let debounceTimer = null

    const triggerBBoxChange = () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }

      debounceTimer = setTimeout(() => {
        const bbox = this.mapInstance.getBBox()
        this.emit('bbox-changed', bbox)
      }, 500)
    }

    map.on('moveend', triggerBBoxChange)
    map.on('zoomend', triggerBBoxChange)
    map.on('resize', triggerBBoxChange)
  }

  /**
   * Manually emit bbox-changed (e.g. on init)
   */
  triggerChangeBBox() {
    const bbox = this.mapInstance.getBBox()
    this.emit('bbox-changed', bbox)
  }

  /**
   * Clean up all events
   */
  unsubscribeBBoxChange() {
    const map = this.mapInstance._getMapInstance()
    map.off('moveend')
    map.off('zoomend')
    map.off('resize')
    this.removeListeners('bbox-changed')
  }
}
