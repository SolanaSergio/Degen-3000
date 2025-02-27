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
      
      // Track event statistics
      this.stats = {
        publishCount: {},
        totalPublished: 0,
        lastPublished: null
      };
      
      // Track API related events specifically
      this.apiEvents = [];
      this.maxApiEvents = 50; // Max number of API events to keep
      
      // List of events that are related to API calls
      this.apiEventNames = [
        'messageSent',
        'botResponse',
        'apiRequest',
        'apiResponse',
        'apiError'
      ];
      
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
      // Update statistics
      this.stats.totalPublished++;
      this.stats.lastPublished = new Date();
      if (!this.stats.publishCount[eventName]) {
        this.stats.publishCount[eventName] = 0;
      }
      this.stats.publishCount[eventName]++;
      
      // Track API related events
      if (this.apiEventNames.includes(eventName)) {
        const apiEvent = {
          timestamp: new Date(),
          eventName,
          data: JSON.parse(JSON.stringify(data)), // Clone data to prevent mutations
          id: this.apiEvents.length + 1
        };
        
        this.apiEvents.push(apiEvent);
        
        // Keep only the most recent events
        if (this.apiEvents.length > this.maxApiEvents) {
          this.apiEvents.shift();
        }
        
        // Enhanced logging for API events
        if (this.debug || window.debugLogger) {
          const logFunc = window.debugLogger ? 
            window.debugLogger.api.bind(window.debugLogger) : 
            console.log.bind(console);
          
          logFunc('EVENT', `API Event: ${eventName}`, data);
        }
      }
      
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
    
    /**
     * Get event statistics
     * @returns {Object} - Statistics about events
     */
    getStats() {
      return {
        ...this.stats,
        subscribers: Object.keys(this.subscribers).map(key => ({
          eventName: key,
          count: this.subscribers[key].length
        })),
        apiEvents: this.apiEvents.length
      };
    }
    
    /**
     * Get recent API events
     * @param {number} [count=10] - Number of events to return
     * @returns {Array} - Recent API events
     */
    getApiEvents(count = 10) {
      return this.apiEvents.slice(-count);
    }
    
    /**
     * Log detailed information about the EventBus state
     */
    logDebugInfo() {
      console.group('%c🔔 EventBus Debug Info', 'color: #00ff66; font-weight: bold;');
      
      // General stats
      console.log('📊 General Statistics:');
      console.log(`- Total events published: ${this.stats.totalPublished}`);
      console.log(`- Last event published: ${this.stats.lastPublished ? this.stats.lastPublished.toISOString() : 'Never'}`);
      console.log(`- Active event types: ${Object.keys(this.subscribers).length}`);
      
      // Most active events
      const sortedEvents = Object.keys(this.stats.publishCount)
        .sort((a, b) => this.stats.publishCount[b] - this.stats.publishCount[a])
        .slice(0, 10);
      
      console.log('\n📈 Most Active Events:');
      sortedEvents.forEach((eventName, index) => {
        console.log(`${index + 1}. ${eventName}: ${this.stats.publishCount[eventName]} times`);
      });
      
      // Subscription info
      console.log('\n👥 Subscription Information:');
      Object.keys(this.subscribers)
        .filter(key => this.subscribers[key].length > 0)
        .sort((a, b) => this.subscribers[b].length - this.subscribers[a].length)
        .forEach(eventName => {
          console.log(`- ${eventName}: ${this.subscribers[eventName].length} subscribers`);
        });
      
      // Recent API events
      console.log('\n🔄 Recent API Events:');
      const recentApiEvents = this.getApiEvents(5);
      recentApiEvents.forEach((event, index) => {
        console.log(`${index + 1}. [${event.timestamp.toLocaleTimeString()}] ${event.eventName}`);
      });
      
      // API event details
      if (recentApiEvents.length > 0) {
        console.log('\n🔍 Latest API Event Details:');
        const latestEvent = recentApiEvents[recentApiEvents.length - 1];
        console.log(`- Event: ${latestEvent.eventName}`);
        console.log('- Data:', latestEvent.data);
        console.log(`- Time: ${latestEvent.timestamp.toISOString()}`);
      }
      
      console.groupEnd();
    }
    
    /**
     * Track a specific message and its response for debugging
     * @param {string} messageId - ID to track the message
     * @param {Object} messageData - Message data
     */
    trackMessage(messageId, messageData) {
      this.publish('apiRequest', {
        id: messageId,
        data: messageData,
        timestamp: new Date().toISOString()
      });
    }
    
    /**
     * Register a response to a tracked message
     * @param {string} messageId - ID of the tracked message
     * @param {Object} responseData - Response data
     * @param {boolean} isError - Whether the response is an error
     */
    trackResponse(messageId, responseData, isError = false) {
      this.publish(isError ? 'apiError' : 'apiResponse', {
        id: messageId,
        data: responseData,
        timestamp: new Date().toISOString()
      });
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
    
    // Add debugging commands
    window.debugDegen.logEventBusInfo = function() {
      window.EventBus.logDebugInfo();
      return "EventBus info logged to console";
    };
    
    // Add helper to enable API tracking
    window.debugDegen.enableApiTracking = function() {
      window.EventBus.setDebugMode(true);
      if (window.debugLogger) {
        window.debugLogger.enableLevels('api', 'event');
      }
      console.log("API tracking enabled");
    };
  }

  // For module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventBusProxy;
  }
})(); 