/**
 * EventBus.js
 * 
 * A simple pub/sub system for component communication.
 * Allows components to communicate without direct references to each other.
 * 
 * IMPORTANT: This is a singleton. Do NOT use `new EventBus()`.
 * Instead, use the global EventBus instance via `window.EventBus`.
 */

// Create an immediately invoked function expression (IIFE) to create a closed scope
(function() {
  // Define the EventBus class
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
     * @param {boolean} enabled - Whether debug mode should be enabled
     */
    setDebugMode(enabled) {
      this.debug = enabled;
      
      if (this.debug) {
        console.log('EventBus debug mode enabled');
      }
    }
    
    /**
     * Subscribe to an event
     * @param {string} eventName - Name of the event to subscribe to
     * @param {Function} callback - Function to call when event is published
     * @returns {Function} - Unsubscribe function
     */
    subscribe(eventName, callback) {
      // Allow subscribing to all events with '*'
      if (!this.subscribers[eventName]) {
        this.subscribers[eventName] = [];
      }
      
      this.subscribers[eventName].push(callback);
      
      if (this.debug) {
        console.log(`EventBus: Subscribed to "${eventName}". Current subscriber count: ${this.subscribers[eventName].length}`);
      }
      
      // Return unsubscribe function
      return () => this.unsubscribe(eventName, callback);
    }
    
    /**
     * Unsubscribe from an event
     * @param {string} eventName - Name of the event to unsubscribe from
     * @param {Function} callback - Function to remove from subscribers
     * @returns {boolean} - Whether the unsubscribe was successful
     */
    unsubscribe(eventName, callback) {
      if (!this.subscribers[eventName]) {
        if (this.debug) {
          console.warn(`EventBus: Attempted to unsubscribe from "${eventName}", but no subscribers exist`);
        }
        return false;
      }
      
      const index = this.subscribers[eventName].indexOf(callback);
      if (index === -1) {
        if (this.debug) {
          console.warn(`EventBus: Attempted to unsubscribe from "${eventName}", but callback was not found`);
        }
        return false;
      }
      
      this.subscribers[eventName].splice(index, 1);
      
      if (this.debug) {
        console.log(`EventBus: Unsubscribed from "${eventName}". Current subscriber count: ${this.subscribers[eventName].length}`);
      }
      
      return true;
    }
    
    /**
     * Publish an event
     * @param {string} eventName - Name of the event to publish
     * @param {*} data - Data to pass to subscribers
     */
    publish(eventName, data = {}) {
      // Add event name to data for wildcard subscribers
      const eventData = { ...data, _eventName: eventName };
      
      // First notify specific event subscribers
      if (this.subscribers[eventName]) {
        this.subscribers[eventName].forEach(callback => {
          try {
            callback(eventData);
          } catch (e) {
            console.error(`EventBus: Error in "${eventName}" event handler:`, e);
          }
        });
      }
      
      // Then notify wildcard subscribers
      if (this.subscribers['*']) {
        this.subscribers['*'].forEach(callback => {
          try {
            callback(eventName, eventData);
          } catch (e) {
            console.error(`EventBus: Error in wildcard event handler:`, e);
          }
        });
      }
      
      if (this.debug) {
        console.log(`EventBus: Published "${eventName}" with data:`, data);
      }
    }
    
    /**
     * Check if an event has subscribers
     * @param {string} eventName - Name of the event
     * @returns {boolean} - Whether the event has subscribers
     */
    hasSubscribers(eventName) {
      return this.subscribers[eventName] && this.subscribers[eventName].length > 0;
    }
    
    /**
     * Get number of subscribers for an event
     * @param {string} eventName - Name of the event
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
        this.subscribers[eventName] = [];
        if (this.debug) {
          console.log(`EventBus: Cleared subscribers for "${eventName}"`);
        }
      } else {
        this.subscribers = {};
        if (this.debug) {
          console.log('EventBus: Cleared all subscribers');
        }
      }
    }
  }

  // Create a single instance of EventBusClass
  const eventBusInstance = new EventBusClass();

  // Enhanced protection against EventBus constructor usage
  // This creates a more detailed Proxy to prevent EventBus from being used as a constructor
  const EventBusProxy = new Proxy(eventBusInstance, {
    // Trap constructor calls
    construct(target, args) {
      console.error("ERROR: EventBus is not a constructor. Use window.EventBus directly.");
      
      // Instead of throwing, return a dummy object that won't crash the application
      // This prevents fatal errors while still logging the problem
      return {
        subscribe: () => () => {},
        publish: () => {},
        setDebugMode: () => {},
        hasSubscribers: () => false,
        subscriberCount: () => 0,
        clear: () => {},
        unsubscribe: () => false,
        __isErrorProxy: true
      };
    },
    
    // Trap property access to enhance error messages
    get(target, prop, receiver) {
      if (prop === 'prototype') {
        // Return a dummy object when prototype is accessed, usually before construction
        return {
          constructor: function() {
            console.error("ERROR: EventBus is a singleton and cannot be instantiated. Use window.EventBus instead.");
            return {
              subscribe: () => () => {},
              publish: () => {},
              __isErrorProxy: true
            };
          }
        };
      }
      
      // Return the actual property
      return Reflect.get(target, prop, receiver);
    },
    
    // Add additional trap for function calls
    apply(target, thisArg, args) {
      console.error("ERROR: EventBus is not a function. Use window.EventBus methods directly.");
      return undefined;
    }
  });

  // Expose the EventBus globally
  if (typeof window !== 'undefined') {
    window.EventBus = EventBusProxy;
    
    // Add extra safety - add a direct property that confirms EventBus is loaded
    window.isEventBusLoaded = true;
    
    // Create a global debugDegen object to help with debugging
    window.debugDegen = window.debugDegen || {};
    window.debugDegen.checkEventBus = function() {
      console.log("EventBus check:", window.EventBus ? "Loaded" : "Not loaded");
      console.log("EventBus instance:", window.EventBus);
      return window.EventBus;
    };
  }

  // For module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventBusProxy;
  }
})(); 