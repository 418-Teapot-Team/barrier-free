import L from 'leaflet'

import { EventEmitter } from './event-emitter'

export class OSMap {
  #container = null
  /** @type {L.Map} */
  #map = null
  /** @type {L.TileLayer} */
  #tileLayer = null
  /** @type {Array<L.Marker>} */
  #markers = new Array()

  /** @type {OSMapController | null} */
  #controller = null

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
   * Adds a marker to the map.
   *
   * @param {L.LatLngExpression} latlng - Coordinates for the marker.
   * @param {L.MarkerOptions} options - Options for the marker.
   * @param {Object} [popup] - Popup configuration.
   * @param {string} popup.content - Content of the popup.
   * @param {L.PopupOptions} [popup.options] - Options for the popup (optional).
   *
   * @returns {L.Marker} The created Leaflet marker.
   */
  addMarker(latlng, options, popup) {
    if (!this.#map) {
      throw Error('register title error: map should be initialized first')
    }
    const marker = L.marker(latlng, options).addTo(this.#map)

    if (popup) {
      marker.bindPopup(popup.content, popup.options)
    }

    this.#markers.push(marker)

    return marker
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

    const triggerBBoxChange = () => {
      const bbox = this.mapInstance.getBBox()
      this.emit('bbox-changed', bbox)
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
