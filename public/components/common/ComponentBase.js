/**
 * ComponentBase.js
 * Base class for all UI components
 * 
 * This provides common functionality for components including:
 * - State management
 * - DOM rendering and updates
 * - Event handling
 * - Component lifecycle management
 */

class ComponentBase {
  /**
   * Creates a new component instance
   * @param {string} containerId - The ID of the container DOM element
   * @param {Object} initialState - Optional initial state for the component
   */
  constructor(containerId, initialState = {}) {
    // Get the container element
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      console.error(`ComponentBase: Container with ID "${containerId}" not found`);
      return;
    }
    
    // Store component ID
    this.containerId = containerId;
    
    // Track event listeners for cleanup
    this.eventListeners = [];
    
    // Initialize state
    this.state = {
      ...initialState
    };
    
    // Track render status
    this.rendered = false;
    
    // Store a reference to EventBus if available - always use window.EventBus
    this.eventBus = typeof window !== 'undefined' && window.EventBus ? window.EventBus : null;
    
    // Optional CSS loading
    this.loadStyles();
  }
  
  /**
   * Load component-specific styles if available
   * This is called automatically during constructor
   */
  loadStyles() {
    // Derive component name from constructor
    const componentName = this.constructor.name;
    
    // Only attempt to load styles if this is a real component (not the base class)
    if (componentName !== 'ComponentBase') {
      // Try to load styles if they exist, but don't fail if missing
      
      // Create link element
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `components/${componentName}/${componentName}.css`;
      
      // Handle errors silently
      link.onerror = () => {
        console.debug(`Styles for ${componentName} not found at ${link.href}`);
      };
      
      // Append to head
      document.head.appendChild(link);
    }
  }
  
  /**
   * Update component state
   * @param {Object} newState - New state to merge with existing state
   * @param {boolean} shouldRender - Whether to update the DOM after state change
   */
  setState(newState, shouldRender = true) {
    // Merge new state with existing state
    this.state = {
      ...this.state,
      ...newState
    };
    
    // Update the DOM if needed
    if (shouldRender) {
      // If component has its own update method, use it
      if (typeof this.update === 'function') {
        this.update();
      } else {
        // Otherwise re-render the entire component
        this.render();
      }
    }
  }
  
  /**
   * Subscribe to an event
   * @param {string} eventName - Name of the event to subscribe to
   * @param {Function} callback - Function to call when event is published
   * @returns {Function} - Unsubscribe function
   */
  on(eventName, callback) {
    if (!this.eventBus) {
      console.error('ComponentBase: EventBus not available');
      return null;
    }
    
    // Bind callback to this component instance
    const boundCallback = callback.bind(this);
    
    // Subscribe to event
    const unsubscribe = this.eventBus.subscribe(eventName, boundCallback);
    
    // Track subscription for cleanup
    this.eventListeners.push({
      eventName,
      callback: boundCallback,
      unsubscribe
    });
    
    return unsubscribe;
  }
  
  /**
   * Publish an event
   * @param {string} eventName - Name of the event to publish
   * @param {any} data - Data to pass to subscribers
   */
  emit(eventName, data) {
    if (!this.eventBus) {
      console.error('ComponentBase: EventBus not available');
      return;
    }
    
    // Add component info to data
    const eventData = {
      ...data,
      component: this.constructor.name,
      containerId: this.containerId
    };
    
    // Publish event
    this.eventBus.publish(eventName, eventData);
  }
  
  /**
   * Add DOM event listener with automatic cleanup
   * @param {Element} element - DOM element to listen on
   * @param {string} eventName - Name of DOM event (e.g., 'click')
   * @param {Function} handler - Event handler function
   */
  addListener(element, eventName, handler) {
    // Bind handler to this component instance
    const boundHandler = handler.bind(this);
    
    // Add event listener
    element.addEventListener(eventName, boundHandler);
    
    // Track for cleanup
    this.eventListeners.push({
      element,
      eventName,
      handler: boundHandler,
      type: 'dom'
    });
  }
  
  /**
   * Render the component
   * This should be overridden by subclasses
   */
  render() {
    console.warn(`ComponentBase: render() not implemented in ${this.constructor.name}`);
    this.container.innerHTML = `<div>Component ${this.constructor.name} (not implemented)</div>`;
    this.rendered = true;
  }
  
  /**
   * Update the DOM after state changes
   * This should be overridden by subclasses for better performance
   */
  update() {
    // Default implementation just re-renders the whole component
    if (this.rendered) {
      this.render();
    }
  }
  
  /**
   * Change the container element
   * @param {string|Element} newContainer - New container element or ID
   * @returns {boolean} - Whether the mount was successful
   */
  mount(newContainer) {
    let container;
    
    // Get container element from string ID or use element directly
    if (typeof newContainer === 'string') {
      container = document.getElementById(newContainer);
    } else if (newContainer instanceof Element) {
      container = newContainer;
    }
    
    // Check if container is valid
    if (!container) {
      console.error(`ComponentBase: Invalid container`);
      return false;
    }
    
    // Update container
    this.container = container;
    this.containerId = container.id;
    
    // Re-render
    if (this.rendered) {
      this.render();
    }
    
    return true;
  }
  
  /**
   * Clean up component
   * This should be called when removing a component
   */
  destroy() {
    // Remove all event listeners
    this.eventListeners.forEach(listener => {
      if (listener.type === 'dom') {
        // DOM event listener
        listener.element.removeEventListener(listener.eventName, listener.handler);
      } else {
        // EventBus subscription
        if (listener.unsubscribe) {
          listener.unsubscribe();
        }
      }
    });
    
    // Clear event listeners
    this.eventListeners = [];
    
    // Clear container
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    // Clear state
    this.state = {};
    this.rendered = false;
    
    console.log(`ComponentBase: ${this.constructor.name} destroyed`);
  }
}

// Make sure it's available globally
if (typeof window !== 'undefined') {
  window.ComponentBase = ComponentBase;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ComponentBase;
} 