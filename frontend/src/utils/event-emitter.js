/**
 * A lightweight custom EventEmitter implementation.
 * Allows registering, emitting, and removing event listeners.
 */
export class EventEmitter {
  constructor() {
    /** @type {Object<string, Set<Function>>} */
    this.events = {}
  }

  /**
   * Registers a listener for the specified event.
   *
   * @param {string} event - The name of the event to listen for.
   * @param {Function} listener - The callback function to invoke when the event is emitted.
   */
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = new Set()
    }
    this.events[event].add(listener)
  }

  /**
   * Registers a one-time listener for the specified event.
   * The listener is automatically removed after the first call.
   *
   * @param {string} event - The name of the event to listen for.
   * @param {Function} listener - The callback function to invoke once.
   */
  once(event, listener) {
    const wrapper = (...args) => {
      this.off(event, wrapper)
      listener(...args)
    }
    this.on(event, wrapper)
  }

  /**
   * Removes a specific listener for an event.
   *
   * @param {string} event - The event name.
   * @param {Function} listener - The specific listener function to remove.
   */
  off(event, listener) {
    if (this.events[event]) {
      this.events[event].delete(listener)
      if (this.events[event].size === 0) {
        delete this.events[event]
      }
    }
  }

  /**
   * Emits an event and calls all registered listeners with the provided arguments.
   *
   * @param {string} event - The name of the event to emit.
   * @param {...any} args - Arguments passed to each listener.
   */
  emit(event, ...args) {
    if (this.events[event]) {
      // Clone the set to prevent issues if a listener modifies the set during iteration
      for (const listener of [...this.events[event]]) {
        listener(...args)
      }
    }
  }

  /**
   * Emits an event and waits for all listeners to complete, including async listeners.
   * Returns a promise that resolves after all listeners have completed.
   *
   * @param {string} event - The name of the event to emit.
   * @param {...any} args - Arguments passed to each listener.
   * @returns {Promise<void>} - A promise that resolves when all listeners have completed.
   */
  async emitAsync(event, ...args) {
    if (!this.events[event]) return

    // Create an array of promises from all listeners
    const listenerPromises = [...this.events[event]].map((listener) => {
      try {
        const result = listener(...args)
        // Handle both synchronous listeners and those that return promises
        return result instanceof Promise ? result : Promise.resolve(result)
      } catch (error) {
        // Prevent one failed listener from breaking the entire chain
        return Promise.reject(error)
      }
    })

    // Wait for all listeners to complete, even if some fail
    await Promise.allSettled(listenerPromises)
  }

  /**
   * Removes all listeners for all events.
   */
  removeAllListeners() {
    this.events = {}
  }

  /**
   * Removes all listeners for a specific event.
   *
   * @param {string} event - The name of the event to clear.
   */
  removeListeners(event) {
    if (this.events[event]) {
      delete this.events[event]
    }
  }

  /**
   * Returns the number of listeners registered for the given event.
   *
   * @param {string} event - The name of the event.
   * @returns {number} - Number of listeners.
   */
  listenerCount(event) {
    return this.events[event] ? this.events[event].size : 0
  }

  /**
   * Returns an array of all listener functions registered for the given event.
   *
   * @param {string} event - The name of the event.
   * @returns {Function[]} - Array of listener functions.
   */
  listeners(event) {
    return this.events[event] ? Array.from(this.events[event]) : []
  }
}
