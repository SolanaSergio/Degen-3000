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
      console.error(`Container element with ID "${containerId}" not found.`);
      throw new Error(`Container element with ID "${containerId}" not found.`);
    }
    
    // Store the component ID for reference
    this.id = containerId;
    
    // Initialize state
    this.state = { ...initialState };
    
    // Track if the component has been rendered
    this.rendered = false;
    
    // Store event handler references for cleanup
    this.eventHandlers = [];
    
    // Auto-load component's CSS if it exists
    this.loadStyles();
    
    console.log(`Component created: ${this.constructor.name}#${this.id}`);
  }
  
  /**
   * Automatically load the component's CSS file
   * Uses naming convention: ComponentName/ComponentName.css
   */
  loadStyles() {
    const componentName = this.constructor.name;
    const styleId = `style-${componentName}`;
    
    // Skip if already loaded
    if (document.getElementById(styleId)) {
      return;
    }
    
    // Create link element
    const link = document.createElement('link');
    link.id = styleId;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = `/components/${componentName}/${componentName}.css`;
    
    // Add to document head
    document.head.appendChild(link);
    
    // Handle load errors
    link.onerror = () => {
      console.warn(`Could not load CSS for ${componentName} component.`);
      link.remove();
    };
  }
  
  /**
   * Update component state and trigger re-render
   * @param {Object} newState - State object to merge with current state
   * @param {boolean} shouldRender - Whether to re-render after state update
   */
  setState(newState, shouldRender = true) {
    // Merge with existing state
    this.state = { ...this.state, ...newState };
    
    // Trigger render if component is already in the DOM
    if (shouldRender && this.rendered) {
      this.update();
    }
    
    return this.state;
  }
  
  /**
   * Subscribe to an event from the EventBus
   * @param {string} eventName - Name of the event to listen for
   * @param {Function} callback - Function to call when event occurs
   */
  on(eventName, callback) {
    // Make sure EventBus is available
    if (typeof EventBus === 'undefined') {
      console.error('EventBus is not defined. Make sure to load EventBus.js before using on().');
      return null;
    }
    
    // Subscribe to the event
    const unsubscribe = EventBus.subscribe(eventName, callback.bind(this));
    
    // Store the subscription for cleanup
    this.eventHandlers.push({ eventName, unsubscribe });
    
    return unsubscribe;
  }
  
  /**
   * Publish an event to the EventBus
   * @param {string} eventName - Name of the event to publish
   * @param {any} data - Data to include with the event
   */
  emit(eventName, data) {
    // Make sure EventBus is available
    if (typeof EventBus === 'undefined') {
      console.error('EventBus is not defined. Make sure to load EventBus.js before using emit().');
      return;
    }
    
    // Publish the event
    EventBus.publish(eventName, data);
  }
  
  /**
   * Add a DOM event listener with automatic cleanup
   * @param {HTMLElement} element - Element to attach listener to
   * @param {string} eventName - DOM event name (e.g., 'click')
   * @param {Function} handler - Event handler function
   */
  addListener(element, eventName, handler) {
    // Bind handler to this component instance
    const boundHandler = handler.bind(this);
    
    // Add the event listener
    element.addEventListener(eventName, boundHandler);
    
    // Store reference for cleanup
    this.eventHandlers.push({
      element, 
      eventName, 
      handler: boundHandler,
      type: 'dom'
    });
    
    return boundHandler;
  }
  
  /**
   * Initial render of the component
   * Must be implemented by subclasses
   */
  render() {
    // Child classes should override this method
    console.warn(`${this.constructor.name} does not implement render()`);
    this.rendered = true;
  }
  
  /**
   * Update the component after state changes
   * Default implementation is to re-render completely
   */
  update() {
    // By default, just re-render the component
    // Subclasses can implement more efficient updates
    if (this.rendered) {
      this.render();
    }
  }
  
  /**
   * Mount component to a different container
   * @param {string|HTMLElement} newContainer - New container ID or element
   */
  mount(newContainer) {
    // Get the new container
    if (typeof newContainer === 'string') {
      newContainer = document.getElementById(newContainer);
    }
    
    if (!newContainer || !(newContainer instanceof HTMLElement)) {
      console.error('Invalid container for mounting');
      return false;
    }
    
    // Update container reference
    this.container = newContainer;
    this.id = newContainer.id || 'unnamed-container';
    
    // Render in the new container
    this.rendered = false;
    this.render();
    
    return true;
  }
  
  /**
   * Clean up the component before removal
   */
  destroy() {
    // Clean up all event handlers
    this.eventHandlers.forEach(handler => {
      if (handler.type === 'dom' && handler.element) {
        handler.element.removeEventListener(handler.eventName, handler.handler);
      } else if (handler.unsubscribe) {
        handler.unsubscribe();
      }
    });
    
    // Clear event handlers array
    this.eventHandlers = [];
    
    // Clear the container
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    console.log(`Component destroyed: ${this.constructor.name}#${this.id}`);
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ComponentBase;
} 