/**
 * EventBus.js
 * 
 * A simple pub/sub system for component communication.
 * Allows components to communicate without direct references to each other.
 */

class EventBusClass {
  constructor() {
    // Store all event subscribers
    this.subscribers = {};
    
    // Debug mode for logging events
    this.debug = false;
    
    console.log('EventBus initialized');
  }
  
  /**
   * Enable or disable debug mode
   * @param {boolean} enabled - Whether to enable debug mode
   */
  setDebugMode(enabled) {
    this.debug = enabled;
    console.log(`EventBus debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Subscribe to an event
   * @param {string} eventName - Name of the event to subscribe to
   * @param {Function} callback - Function to call when the event occurs
   * @returns {Function} - Unsubscribe function
   */
  subscribe(eventName, callback) {
    // Create array for this event if it doesn't exist
    if (!this.subscribers[eventName]) {
      this.subscribers[eventName] = [];
    }
    
    // Add callback to subscribers
    this.subscribers[eventName].push(callback);
    
    if (this.debug) {
      console.log(`EventBus: Subscribed to "${eventName}", total subscribers: ${this.subscribers[eventName].length}`);
    }
    
    // Return unsubscribe function
    return () => {
      this.unsubscribe(eventName, callback);
    };
  }
  
  /**
   * Unsubscribe from an event
   * @param {string} eventName - Name of the event to unsubscribe from
   * @param {Function} callback - The callback function to remove
   */
  unsubscribe(eventName, callback) {
    // Skip if no subscribers for this event
    if (!this.subscribers[eventName]) {
      return;
    }
    
    // Remove the callback from subscribers
    this.subscribers[eventName] = this.subscribers[eventName].filter(
      subscriber => subscriber !== callback
    );
    
    if (this.debug) {
      console.log(`EventBus: Unsubscribed from "${eventName}", remaining subscribers: ${this.subscribers[eventName].length}`);
    }
    
    // Clean up empty subscriber arrays
    if (this.subscribers[eventName].length === 0) {
      delete this.subscribers[eventName];
    }
  }
  
  /**
   * Publish an event
   * @param {string} eventName - Name of the event to publish
   * @param {any} data - Data to pass to subscribers
   */
  publish(eventName, data) {
    // Skip if no subscribers
    if (!this.subscribers[eventName]) {
      if (this.debug) {
        console.log(`EventBus: Published "${eventName}" but no subscribers`);
      }
      return;
    }
    
    if (this.debug) {
      console.log(`EventBus: Publishing "${eventName}" to ${this.subscribers[eventName].length} subscribers`, data);
    }
    
    // Call each subscriber
    this.subscribers[eventName].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in subscriber for event "${eventName}":`, error);
      }
    });
  }
  
  /**
   * Check if an event has subscribers
   * @param {string} eventName - Name of the event to check
   * @returns {boolean} - Whether the event has subscribers
   */
  hasSubscribers(eventName) {
    return !!this.subscribers[eventName] && this.subscribers[eventName].length > 0;
  }
  
  /**
   * Get number of subscribers for an event
   * @param {string} eventName - Name of the event to check
   * @returns {number} - Number of subscribers
   */
  subscriberCount(eventName) {
    return this.subscribers[eventName] ? this.subscribers[eventName].length : 0;
  }
  
  /**
   * Clear all subscribers for an event
   * @param {string} eventName - Name of the event to clear
   */
  clear(eventName) {
    if (eventName) {
      // Clear specific event
      delete this.subscribers[eventName];
      if (this.debug) {
        console.log(`EventBus: Cleared all subscribers for "${eventName}"`);
      }
    } else {
      // Clear all events
      this.subscribers = {};
      if (this.debug) {
        console.log('EventBus: Cleared all subscribers for all events');
      }
    }
  }
}

// Create a singleton instance
const EventBus = new EventBusClass();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EventBus;
} 