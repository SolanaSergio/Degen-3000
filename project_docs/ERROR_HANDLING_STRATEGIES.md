# Error Handling Strategies - DEGEN ROAST 3000

This document outlines comprehensive error handling strategies for components in the DEGEN ROAST 3000 application. Proper error handling ensures components can gracefully recover from failures, provide useful feedback to users and developers, and maintain application stability.

## Error Handling Principles

All components should follow these error handling principles:

1. **Fail Gracefully**: Components should continue functioning even when parts fail
2. **Provide Clear Feedback**: Users should understand when something goes wrong
3. **Self-Healing**: Components should attempt to recover from errors when possible
4. **Useful Reporting**: Error information should help developers diagnose issues
5. **Prevent Cascading Failures**: Errors in one component shouldn't break others

## Error Prevention Strategies

### Type Checking and Validation

Validate inputs and state to catch errors before they occur:

```javascript
/**
 * Play a sound with input validation
 * @param {string} category - Sound category
 * @param {string} soundId - Sound identifier
 * @returns {boolean} Whether the sound was played successfully
 */
playSound(category, soundId) {
  // Validate inputs
  if (typeof category !== 'string' || !category) {
    console.warn('Invalid category provided to playSound:', category);
    return false;
  }
  
  if (typeof soundId !== 'string' || !soundId) {
    console.warn('Invalid soundId provided to playSound:', soundId);
    return false;
  }
  
  // Check if category exists
  if (!this.state.sounds[category]) {
    console.warn(`Category not found: ${category}`);
    return false;
  }
  
  // Check if sound exists
  if (!this.state.sounds[category][soundId]) {
    console.warn(`Sound not found in category ${category}: ${soundId}`);
    return false;
  }
  
  // Get sound data
  const soundData = this.state.sounds[category][soundId];
  
  // Validate sound data
  if (!soundData.src) {
    console.error(`Sound ${category}/${soundId} has no src defined`);
    return false;
  }
  
  // Play sound...
  try {
    // Actual sound playing logic
    const audio = new Audio(soundData.src);
    audio.volume = this.state.muted ? 0 : this.state.volume;
    audio.play();
    return true;
  } catch (error) {
    console.error(`Error playing sound ${category}/${soundId}:`, error);
    return false;
  }
}
```

### Defensive Programming

Use defensive programming techniques to handle unexpected scenarios:

```javascript
/**
 * Update component state defensively
 * @param {Object} newState - New state properties to apply
 */
setState(newState) {
  // Guard against non-object state updates
  if (!newState || typeof newState !== 'object') {
    console.error('setState called with invalid state:', newState);
    return;
  }
  
  try {
    // Create a safely merged state
    const safeState = { ...this.state };
    
    // Only copy valid properties
    Object.keys(newState).forEach(key => {
      // Skip null/undefined unless explicitly allowed
      if (newState[key] === null || newState[key] === undefined) {
        if (!this.allowNullProperties.includes(key)) {
          return;
        }
      }
      
      // Apply valid state properties
      safeState[key] = newState[key];
    });
    
    // Update state
    this.state = safeState;
    
    // Trigger render if needed
    this.render();
  } catch (error) {
    console.error('Error in setState:', error);
    // Don't update state on error
  }
}
```

### Pre-Flight Checks

Implement pre-flight checks before performing risky operations:

```javascript
/**
 * Initialize a component with pre-flight checks
 */
init() {
  // Verify container exists
  if (!this.container) {
    console.error(`Cannot initialize ${this.constructor.name}: container not found`);
    // Report error and exit
    this.reportInitializationError('container_not_found');
    return;
  }
  
  // Verify required dependencies
  if (!this.checkDependencies()) {
    // checkDependencies already logs specific missing dependencies
    this.reportInitializationError('missing_dependencies');
    return;
  }
  
  // Check for conflicting component instances
  if (this.container.querySelector(`.${this.constructor.name.toLowerCase()}-component`)) {
    console.warn(`Container already has a ${this.constructor.name} component`);
    // Handle conflict (e.g., remove old instance)
    this.handleComponentConflict();
  }
  
  // Proceed with normal initialization
  this.setupEventListeners();
  this.render();
}

/**
 * Check for required dependencies
 * @returns {boolean} Whether all dependencies are available
 */
checkDependencies() {
  let allDependenciesAvailable = true;
  
  // Check for EventBus
  if (!window.EventBus) {
    console.error(`${this.constructor.name} requires EventBus to be loaded`);
    allDependenciesAvailable = false;
  }
  
  // Check for other required dependencies
  if (this.requiresThemeManager && !window.ThemeManager) {
    console.error(`${this.constructor.name} requires ThemeManager to be loaded`);
    allDependenciesAvailable = false;
  }
  
  return allDependenciesAvailable;
}
```

## Error Detection and Reporting

### Centralized Error Tracking

Implement centralized error tracking to detect and report errors:

```javascript
// In a global error tracking module (errorTracker.js)
class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 100; // Limit stored errors
    this.initialized = false;
    
    // Flag to track if we're in an error handler
    this.handlingError = false;
  }
  
  /**
   * Initialize global error tracking
   */
  init() {
    if (this.initialized) return;
    
    // Track unhandled errors
    window.addEventListener('error', this.handleGlobalError.bind(this));
    
    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
    
    // Track EventBus errors if available
    if (window.EventBus) {
      window.EventBus.subscribe('error', this.trackComponentError.bind(this));
    }
    
    this.initialized = true;
  }
  
  /**
   * Handle global JavaScript errors
   * @param {ErrorEvent} event - Error event
   */
  handleGlobalError(event) {
    // Prevent infinite loops if error occurs in error handler
    if (this.handlingError) return;
    
    this.handlingError = true;
    
    try {
      const error = {
        type: 'uncaught_error',
        message: event.message,
        stack: event.error ? event.error.stack : null,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        timestamp: new Date().toISOString()
      };
      
      this.trackError(error);
    } finally {
      this.handlingError = false;
    }
  }
  
  /**
   * Handle unhandled promise rejections
   * @param {PromiseRejectionEvent} event - Rejection event
   */
  handlePromiseRejection(event) {
    if (this.handlingError) return;
    
    this.handlingError = true;
    
    try {
      const error = {
        type: 'unhandled_rejection',
        message: event.reason instanceof Error ? event.reason.message : String(event.reason),
        stack: event.reason instanceof Error ? event.reason.stack : null,
        timestamp: new Date().toISOString()
      };
      
      this.trackError(error);
    } finally {
      this.handlingError = false;
    }
  }
  
  /**
   * Track component-specific errors
   * @param {Object} data - Error data from component
   */
  trackComponentError(data) {
    const error = {
      type: 'component_error',
      component: data.component,
      message: data.message,
      details: data.details,
      timestamp: new Date().toISOString()
    };
    
    this.trackError(error);
  }
  
  /**
   * Add error to tracking list and log
   * @param {Object} error - Error information
   */
  trackError(error) {
    // Add to tracked errors
    this.errors.unshift(error);
    
    // Trim if too many
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }
    
    // Log error
    console.error('Tracked error:', error);
    
    // Report to analytics if available
    this.reportToAnalytics(error);
  }
  
  /**
   * Get all tracked errors
   * @returns {Array} List of tracked errors
   */
  getErrors() {
    return [...this.errors];
  }
  
  /**
   * Report error to analytics service
   * @param {Object} error - Error information
   */
  reportToAnalytics(error) {
    // If analytics service exists, report error
    if (window.analyticsService) {
      try {
        window.analyticsService.trackError(error);
      } catch (e) {
        // Don't let analytics errors cause more problems
        console.warn('Failed to report error to analytics:', e);
      }
    }
  }
}

// Create singleton instance
window.errorTracker = new ErrorTracker();
window.errorTracker.init();
```

### Component Error Reporting

Implement component-specific error reporting:

```javascript
// In ComponentBase.js - Add error reporting methods
/**
 * Report a component error
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 */
reportError(message, details = {}) {
  // Log to console
  console.error(`${this.constructor.name} Error:`, message, details);
  
  // Emit error event for central tracking
  if (this.eventBus) {
    this.emit('error', {
      component: this.constructor.name,
      containerId: this.containerId,
      message: message,
      details: details,
      timestamp: new Date().toISOString()
    });
  }
  
  // Track in component instance
  this.errors = this.errors || [];
  this.errors.push({
    message,
    details,
    timestamp: new Date().toISOString()
  });
}

/**
 * Report a rendering error
 * @param {Error} error - The error object
 */
reportRenderError(error) {
  this.reportError('Render failed', {
    message: error.message,
    stack: error.stack,
    state: JSON.stringify(this.state)
  });
  
  // Show error UI if container exists
  if (this.container) {
    this.renderErrorState();
  }
}

/**
 * Report an initialization error
 * @param {string} code - Error code
 * @param {Object} details - Additional details
 */
reportInitializationError(code, details = {}) {
  this.reportError(`Initialization failed: ${code}`, details);
  
  // Set component state to reflect error
  this.state = {
    ...this.state,
    initialized: false,
    initializationError: {
      code,
      details,
      timestamp: new Date().toISOString()
    }
  };
  
  // Show error UI if container exists
  if (this.container) {
    this.renderErrorState();
  }
}
```

## Error Recovery Strategies

### Retry Mechanisms

Implement retry mechanisms for operations that might fail temporarily:

```javascript
/**
 * Load a sound with retry mechanism
 * @param {string} soundUrl - URL of the sound to load
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<HTMLAudioElement>} Loaded audio element
 */
async loadSoundWithRetry(soundUrl, maxRetries = 3) {
  let retries = 0;
  
  // Exponential backoff retry
  const backoff = (attempt) => Math.min(1000 * Math.pow(2, attempt), 10000);
  
  const tryLoad = async () => {
    try {
      const audio = new Audio();
      
      // Create a promise for audio loading
      const loadPromise = new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
        audio.addEventListener('error', (e) => reject(new Error(`Failed to load audio: ${e.message}`)), { once: true });
      });
      
      // Start loading
      audio.src = soundUrl;
      
      // Wait for loading
      return await loadPromise;
    } catch (error) {
      // If we haven't exceeded max retries, try again
      if (retries < maxRetries) {
        retries++;
        
        // Log retry attempt
        console.warn(`Retry ${retries}/${maxRetries} loading sound: ${soundUrl}`);
        
        // Wait with exponential backoff
        await new Promise(resolve => setTimeout(resolve, backoff(retries)));
        
        // Try again
        return tryLoad();
      }
      
      // If we've exceeded retries, report and throw
      this.reportError('Failed to load sound after retries', {
        url: soundUrl,
        retries,
        error: error.message
      });
      
      throw error;
    }
  };
  
  return tryLoad();
}
```

### Fallback Options

Implement fallbacks for when primary approaches fail:

```javascript
/**
 * Play a sound with fallbacks
 * @param {string} category - Sound category
 * @param {string} soundId - Sound identifier
 * @returns {Promise<boolean>} Whether the sound was played
 */
async playSound(category, soundId) {
  try {
    // Try to get the sound data
    const soundData = this.state.sounds[category]?.[soundId];
    
    // If sound data doesn't exist, try fallback
    if (!soundData) {
      return this.playFallbackSound();
    }
    
    // Try primary source
    if (soundData.src) {
      try {
        const audio = new Audio(soundData.src);
        audio.volume = this.state.muted ? 0 : this.state.volume;
        await audio.play();
        return true;
      } catch (primaryError) {
        console.warn(`Primary sound source failed, trying fallback: ${primaryError.message}`);
        
        // Try fallback source if available
        if (soundData.fallbackSrc) {
          const fallbackAudio = new Audio(soundData.fallbackSrc);
          fallbackAudio.volume = this.state.muted ? 0 : this.state.volume;
          await fallbackAudio.play();
          return true;
        }
        
        // If no fallback source, try generic fallback
        return this.playFallbackSound();
      }
    } else {
      // No primary source, try fallback
      return this.playFallbackSound();
    }
  } catch (error) {
    // Log error but don't crash
    this.reportError('Sound playback failed', {
      category,
      soundId,
      error: error.message
    });
    
    // Show visual feedback instead
    this.showSoundFeedback(category, soundId);
    return false;
  }
}

/**
 * Play a generic fallback sound
 * @returns {Promise<boolean>} Whether fallback played successfully
 */
async playFallbackSound() {
  try {
    // Use a simple beep sound as fallback
    const beep = () => {
      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create oscillator
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Configure oscillator
      oscillator.type = 'sine';
      oscillator.frequency.value = 440; // A4 note
      
      // Configure gain (volume)
      gainNode.gain.value = this.state.muted ? 0 : this.state.volume;
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Play sound
      oscillator.start();
      setTimeout(() => oscillator.stop(), 200); // 200ms beep
    };
    
    beep();
    return true;
  } catch (fallbackError) {
    console.error('Even fallback sound failed:', fallbackError);
    return false;
  }
}
```

### Graceful UI Degradation

Implement graceful UI degradation for when components fail:

```javascript
/**
 * Render error state in the component
 */
renderErrorState() {
  if (!this.container) return;
  
  // Create error UI
  this.container.innerHTML = `
    <div class="component-error">
      <div class="error-icon">⚠️</div>
      <div class="error-message">
        <h3>${this.constructor.name} Error</h3>
        <p>${this.state.initializationError?.code || 'An error occurred'}</p>
      </div>
      <button class="retry-button">Retry</button>
    </div>
  `;
  
  // Add retry handler
  const retryButton = this.container.querySelector('.retry-button');
  if (retryButton) {
    this.addListener(retryButton, 'click', this.handleRetry);
  }
  
  // Apply error styles
  this.container.classList.add('component-error-state');
}

/**
 * Handle retry button click
 */
handleRetry() {
  // Remove error state
  this.container.classList.remove('component-error-state');
  
  // Reset initialization error
  this.state.initializationError = null;
  
  // Clear container
  this.container.innerHTML = '';
  
  // Try to initialize again
  this.init();
}
```

## Error Boundaries and Isolation

### Component Error Boundaries

Wrap risky operations in error boundaries to isolate failures:

```javascript
/**
 * Safe render method with error boundary
 */
safeRender() {
  try {
    // Call the actual render method
    this.render();
  } catch (error) {
    // Report error
    this.reportRenderError(error);
    
    // Render error state
    this.renderErrorState();
  }
}

/**
 * Execute a function safely within a component
 * @param {Function} fn - Function to execute
 * @param {Object} options - Options
 * @returns {any} Function result or fallback value
 */
safeExecute(fn, options = {}) {
  const {
    fallbackValue = null,
    rethrow = false,
    context = this,
    args = [],
    errorHandler = null
  } = options;
  
  try {
    // Execute function in provided context with args
    return fn.apply(context, args);
  } catch (error) {
    // Report error
    this.reportError('Error in component method', {
      method: fn.name,
      error: error.message,
      stack: error.stack
    });
    
    // Call custom error handler if provided
    if (errorHandler && typeof errorHandler === 'function') {
      errorHandler(error);
    }
    
    // Rethrow if specified
    if (rethrow) {
      throw error;
    }
    
    // Return fallback value
    return fallbackValue;
  }
}
```

### Event Error Handling

Ensure event handling doesn't break with errors:

```javascript
/**
 * Enhanced event subscription with error handling
 * @param {string} eventName - Event to subscribe to
 * @param {Function} handler - Event handler
 * @returns {Function} Unsubscribe function
 */
on(eventName, handler) {
  if (!this.eventBus) {
    console.warn(`EventBus not available in ${this.constructor.name}`);
    return () => {};
  }
  
  // Create wrapped handler with error boundary
  const safeHandler = (data) => {
    try {
      handler.call(this, data);
    } catch (error) {
      this.reportError(`Error handling event ${eventName}`, {
        data,
        error: error.message,
        stack: error.stack
      });
    }
  };
  
  // Subscribe with safe handler
  const unsubscribe = this.eventBus.subscribe(eventName, safeHandler);
  
  // Track subscription for cleanup
  this.eventListeners.push({
    eventName,
    originalHandler: handler,
    safeHandler,
    unsubscribe
  });
  
  return unsubscribe;
}
```

## Error Recovery and Self-Healing

### Component Resurrection

Implement resurrection logic to recover crashed components:

```javascript
/**
 * Global function to resurrect crashed components
 */
function resurrectComponents() {
  // Find all component containers
  const componentContainers = document.querySelectorAll('[id$="-container"]');
  
  componentContainers.forEach(container => {
    // Check if container has content
    const isEmpty = container.innerHTML.trim() === '';
    
    // Check if container has error state
    const hasError = container.classList.contains('component-error-state');
    
    if (isEmpty || hasError) {
      // Extract component type from container ID
      const id = container.id;
      const componentType = id
        .replace('-container', '')
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
      
      // Check if component constructor exists
      if (window[componentType]) {
        try {
          console.log(`Attempting to resurrect ${componentType} component...`);
          
          // Clean container
          container.innerHTML = '';
          container.classList.remove('component-error-state');
          
          // Recreate component
          const component = new window[componentType](id, {});
          
          // Store in global components registry if it exists
          if (window.appComponents) {
            const key = componentType.charAt(0).toLowerCase() + componentType.slice(1);
            window.appComponents[key] = component;
          }
          
          console.log(`Successfully resurrected ${componentType} component`);
        } catch (error) {
          console.error(`Failed to resurrect ${componentType} component:`, error);
        }
      }
    }
  });
}

// Add as a global utility
window.resurrectComponents = resurrectComponents;

// Auto-run after a delay to fix initial loading issues
setTimeout(resurrectComponents, 5000);
```

### Automatic Health Checks

Implement automatic health checks to detect and fix issues:

```javascript
/**
 * Add health check method to ComponentBase
 */
checkHealth() {
  const health = {
    status: 'healthy', // 'healthy', 'degraded', 'failed'
    issues: [],
    containerExists: !!this.container,
    isRendered: this.rendered,
    hasEventBus: !!this.eventBus,
    errorCount: this.errors?.length || 0
  };
  
  // Check if container exists
  if (!this.container) {
    health.status = 'failed';
    health.issues.push('container_missing');
  } else if (this.container.innerHTML.trim() === '') {
    health.status = 'failed';
    health.issues.push('container_empty');
  }
  
  // Check for initialization errors
  if (this.state?.initializationError) {
    health.status = 'failed';
    health.issues.push('initialization_error');
  }
  
  // Check if essential DOM elements exist after rendering
  if (this.rendered && this.requiredElements) {
    const missingElements = this.requiredElements.filter(selector => 
      !this.container.querySelector(selector)
    );
    
    if (missingElements.length > 0) {
      health.status = health.status === 'failed' ? 'failed' : 'degraded';
      health.issues.push('missing_required_elements');
      health.missingElements = missingElements;
    }
  }
  
  // Check for excessive errors
  if (health.errorCount > 10) {
    health.status = health.status === 'failed' ? 'failed' : 'degraded';
    health.issues.push('excessive_errors');
  }
  
  return health;
}

/**
 * Fix health issues automatically
 * @returns {boolean} Whether fixing was successful
 */
fixHealthIssues() {
  const health = this.checkHealth();
  
  // If healthy, nothing to do
  if (health.status === 'healthy') {
    return true;
  }
  
  console.log(`Attempting to fix ${this.constructor.name} health issues:`, health.issues);
  
  try {
    // Handle container issues
    if (health.issues.includes('container_missing')) {
      // Try to find container again
      this.container = document.getElementById(this.containerId);
      
      if (!this.container) {
        console.error('Cannot fix missing container');
        return false;
      }
    }
    
    // Handle initialization issues
    if (health.issues.includes('initialization_error') || 
        health.issues.includes('container_empty')) {
      // Reset state
      this.state.initializationError = null;
      
      // Clear container
      if (this.container) {
        this.container.innerHTML = '';
        this.container.classList.remove('component-error-state');
      }
      
      // Re-initialize
      this.init();
    }
    
    // Handle missing elements
    if (health.issues.includes('missing_required_elements')) {
      // Re-render the component
      this.render();
    }
    
    // Check health again
    const newHealth = this.checkHealth();
    return newHealth.status !== 'failed';
    
  } catch (error) {
    console.error(`Failed to fix ${this.constructor.name} health issues:`, error);
    return false;
  }
}

/**
 * Global function to check and fix component health
 */
function performHealthChecks() {
  // Skip if no app components
  if (!window.appComponents) return;
  
  // Check health of all components
  Object.entries(window.appComponents).forEach(([name, component]) => {
    if (component && typeof component.checkHealth === 'function') {
      const health = component.checkHealth();
      
      if (health.status !== 'healthy') {
        console.warn(`Component ${name} health issues:`, health);
        
        // Try to fix issues
        if (typeof component.fixHealthIssues === 'function') {
          const fixed = component.fixHealthIssues();
          console.log(`Component ${name} health fix ${fixed ? 'succeeded' : 'failed'}`);
        }
      }
    }
  });
}

// Add as global utility
window.performHealthChecks = performHealthChecks;

// Run health checks periodically
setInterval(performHealthChecks, 60000); // Check every minute
```

## Error Logging and Analytics

### Structured Error Logging

Implement structured error logging for better analysis:

```javascript
/**
 * Enhanced error reporting with structured data
 * @param {string} code - Error code
 * @param {Object} data - Error data
 * @param {Object} options - Reporting options
 */
reportStructuredError(code, data = {}, options = {}) {
  const {
    level = 'error', // 'error', 'warning', 'info'
    isFatal = false,
    shouldDisplay = false
  } = options;
  
  // Build structured error object
  const error = {
    code,
    component: this.constructor.name,
    containerId: this.containerId,
    level,
    data,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    location: window.location.href,
    isFatal
  };
  
  // Log to console with appropriate level
  switch (level) {
    case 'warning':
      console.warn(`${this.constructor.name} Warning [${code}]:`, data);
      break;
    case 'info':
      console.info(`${this.constructor.name} Info [${code}]:`, data);
      break;
    default:
      console.error(`${this.constructor.name} Error [${code}]:`, data);
  }
  
  // Store in component
  this.errors = this.errors || [];
  this.errors.push(error);
  
  // Emit event
  if (this.eventBus) {
    this.emit('error', error);
  }
  
  // Display in UI if requested
  if (shouldDisplay && this.container) {
    this.displayError(code, data, level);
  }
  
  // Send to analytics
  this.sendErrorToAnalytics(error);
  
  return error;
}

/**
 * Send error to analytics service
 * @param {Object} error - Structured error object
 */
sendErrorToAnalytics(error) {
  // Skip if no analytics service
  if (!window.analyticsService) return;
  
  try {
    window.analyticsService.trackError({
      category: 'component_error',
      action: error.code,
      label: error.component,
      value: error.isFatal ? 1 : 0,
      nonInteraction: true,
      dimensions: {
        component: error.component,
        errorCode: error.code,
        errorLevel: error.level
      }
    });
  } catch (e) {
    // Don't let analytics errors cause more problems
    console.warn('Failed to send error to analytics:', e);
  }
}

/**
 * Display error message in component UI
 * @param {string} code - Error code
 * @param {Object} data - Error data
 * @param {string} level - Error level
 */
displayError(code, data, level = 'error') {
  // Create error container if needed
  let errorContainer = this.container.querySelector('.component-error-messages');
  
  if (!errorContainer) {
    errorContainer = document.createElement('div');
    errorContainer.className = 'component-error-messages';
    this.container.appendChild(errorContainer);
  }
  
  // Create error message
  const errorElement = document.createElement('div');
  errorElement.className = `component-error-message error-level-${level}`;
  errorElement.innerHTML = `
    <div class="error-content">
      <span class="error-icon">${level === 'error' ? '❌' : level === 'warning' ? '⚠️' : 'ℹ️'}</span>
      <span class="error-text">${this.getErrorMessage(code, data)}</span>
    </div>
    <button class="error-dismiss" aria-label="Dismiss">&times;</button>
  `;
  
  // Add dismiss handler
  const dismissButton = errorElement.querySelector('.error-dismiss');
  dismissButton.addEventListener('click', () => {
    errorElement.classList.add('error-dismissing');
    setTimeout(() => errorElement.remove(), 300);
  });
  
  // Auto-dismiss after delay for non-errors
  if (level !== 'error') {
    setTimeout(() => {
      errorElement.classList.add('error-dismissing');
      setTimeout(() => errorElement.remove(), 300);
    }, 5000);
  }
  
  // Add to container
  errorContainer.appendChild(errorElement);
}

/**
 * Get user-friendly error message for code
 * @param {string} code - Error code
 * @param {Object} data - Error data
 * @returns {string} User-friendly error message
 */
getErrorMessage(code, data) {
  const messages = {
    'init_failed': 'Failed to initialize component',
    'api_error': `API request failed: ${data.status || 'Unknown error'}`,
    'render_error': 'Failed to render component',
    'resource_missing': `Required resource not found: ${data.resource || 'unknown'}`,
    'permission_denied': 'You don\'t have permission to perform this action',
    'network_error': 'Network connection issue. Please check your internet connection.'
  };
  
  return messages[code] || `Error: ${code}`;
}
```

## Custom Error Types

### Defining Component-Specific Errors

Create custom error types for better categorization:

```javascript
/**
 * Base error class for components
 */
class ComponentError extends Error {
  constructor(message, component, code, data = {}) {
    super(message);
    this.name = 'ComponentError';
    this.component = component;
    this.code = code;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
  
  /**
   * Get structured error data
   * @returns {Object} Structured error
   */
  toStructured() {
    return {
      name: this.name,
      message: this.message,
      component: this.component,
      code: this.code,
      data: this.data,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

/**
 * Error for initialization failures
 */
class InitializationError extends ComponentError {
  constructor(message, component, data = {}) {
    super(message, component, 'initialization_failed', data);
    this.name = 'InitializationError';
  }
}

/**
 * Error for rendering failures
 */
class RenderError extends ComponentError {
  constructor(message, component, data = {}) {
    super(message, component, 'render_failed', data);
    this.name = 'RenderError';
  }
}

/**
 * Error for resource loading failures
 */
class ResourceError extends ComponentError {
  constructor(message, component, resource, data = {}) {
    super(message, component, 'resource_failed', { resource, ...data });
    this.name = 'ResourceError';
    this.resource = resource;
  }
}

/**
 * Error for state mutation failures
 */
class StateError extends ComponentError {
  constructor(message, component, state, data = {}) {
    super(message, component, 'state_error', { state, ...data });
    this.name = 'StateError';
    this.state = state;
  }
}

// Make available globally
window.ComponentError = ComponentError;
window.InitializationError = InitializationError;
window.RenderError = RenderError;
window.ResourceError = ResourceError;
window.StateError = StateError;
```

### Using Custom Errors in Components

Use custom error types in component code:

```javascript
/**
 * Initialize component with custom error handling
 */
init() {
  try {
    // Check for container
    if (!this.container) {
      throw new InitializationError(
        'Container not found', 
        this.constructor.name, 
        { containerId: this.containerId }
      );
    }
    
    // Initialize component...
    this.setupEventListeners();
    this.render();
    
  } catch (error) {
    // Handle different error types
    if (error instanceof InitializationError) {
      // Handle initialization error
      console.error(`Initialization Error:`, error.toStructured());
      this.renderErrorState(error);
    } else if (error instanceof RenderError) {
      // Handle render error
      console.error(`Render Error:`, error.toStructured());
      this.renderErrorState(error);
    } else {
      // Handle unknown error
      console.error(`Unknown Error:`, error);
      
      // Wrap in component error
      const componentError = new ComponentError(
        error.message || 'Unknown error',
        this.constructor.name,
        'unknown_error',
        { originalError: error.toString() }
      );
      
      this.renderErrorState(componentError);
    }
    
    // Rethrow for global handling
    throw error;
  }
}

/**
 * Render with custom error handling
 */
render() {
  try {
    // Rendering logic...
    
  } catch (error) {
    // Wrap in RenderError if not already
    if (!(error instanceof ComponentError)) {
      throw new RenderError(
        `Failed to render ${this.constructor.name}`, 
        this.constructor.name,
        { originalError: error.toString(), state: this.state }
      );
    }
    
    // Rethrow component errors
    throw error;
  }
}
```

## Best Practices for Error Handling

1. **Be Proactive**: Validate inputs and state before operations
2. **Use Error Boundaries**: Isolate errors to prevent cascading failures
3. **Provide Clear Feedback**: Make error messages understandable for users
4. **Implement Recovery Mechanisms**: Allow components to recover from failures
5. **Log Structured Data**: Include useful information for debugging
6. **Monitor Error Rates**: Track error frequency to identify patterns
7. **Test Error Cases**: Explicitly test how components handle errors
8. **Document Error Codes**: Maintain documentation of error codes and their meaning

By implementing these error handling strategies, you'll create robust components that can handle unexpected conditions gracefully, provide clear feedback to users, and help developers diagnose and fix issues more efficiently. 