/**
 * debug-helper.js
 * A utility for capturing and displaying JavaScript errors
 */

(function() {
    // Create error container
    function createErrorContainer() {
        const container = document.createElement('div');
        container.id = 'debug-error-container';
        container.style.position = 'fixed';
        container.style.top = '70px'; // Moved down to avoid overlap with header
        container.style.right = '20px'; // Aligned with DevTools
        container.style.width = '80vw';
        container.style.maxWidth = '1200px';
        container.style.maxHeight = '80vh';
        container.style.overflow = 'auto';
        container.style.backgroundColor = 'rgba(26, 26, 26, 0.95)';
        container.style.color = 'white';
        container.style.padding = '16px';
        container.style.borderRadius = '12px';
        container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        container.style.fontSize = '14px';
        container.style.zIndex = '9997'; // Below DevTools
        container.style.display = 'none';
        container.style.border = '1px solid #333';
        container.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        
        const heading = document.createElement('h2');
        heading.textContent = '🔧 Debug Console';
        heading.style.margin = '0 0 16px 0';
        heading.style.fontSize = '16px';
        heading.style.fontWeight = '600';
        heading.style.display = 'flex';
        heading.style.alignItems = 'center';
        heading.style.gap = '8px';
        
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '16px';
        closeButton.style.right = '16px';
        closeButton.style.width = '24px';
        closeButton.style.height = '24px';
        closeButton.style.display = 'flex';
        closeButton.style.alignItems = 'center';
        closeButton.style.justifyContent = 'center';
        closeButton.style.backgroundColor = '#2d2d2d';
        closeButton.style.color = '#fff';
        closeButton.style.border = '1px solid #333';
        closeButton.style.borderRadius = '6px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '18px';
        closeButton.style.transition = 'all 0.2s ease';
        
        closeButton.addEventListener('mouseover', function() {
            closeButton.style.backgroundColor = '#3d3d3d';
            closeButton.style.transform = 'translateY(-1px)';
        });
        
        closeButton.addEventListener('mouseout', function() {
            closeButton.style.backgroundColor = '#2d2d2d';
            closeButton.style.transform = 'none';
        });
        
        closeButton.addEventListener('click', function() {
            container.style.display = 'none';
            // Update DevTools button state
            const debugButton = document.querySelector('.tool-button[data-tool="debug"]');
            if (debugButton) {
                debugButton.classList.remove('active');
            }
        });
        
        const errorList = document.createElement('div');
        errorList.id = 'error-list';
        errorList.style.backgroundColor = '#1a1a1a';
        errorList.style.padding = '12px';
        errorList.style.borderRadius = '8px';
        errorList.style.border = '1px solid #333';
        
        container.appendChild(heading);
        container.appendChild(closeButton);
        container.appendChild(errorList);
        document.body.appendChild(container);
        
        return container;
    }
    
    // Remove any existing debug components in header
    const debugHeader = document.querySelector('.debug-component, .debug-button, #debug-button');
    if (debugHeader) {
        debugHeader.remove();
    }
    
    // Add error to the container
    function logError(error) {
        const container = document.getElementById('debug-error-container') || createErrorContainer();
        if (!document.body.contains(container)) {
            document.body.appendChild(container);
        }
        
        container.style.display = 'block';
        
        const errorList = document.getElementById('error-list');
        const errorItem = document.createElement('div');
        errorItem.style.marginBottom = '10px';
        errorItem.style.padding = '10px';
        errorItem.style.borderBottom = '1px solid rgba(255, 255, 255, 0.3)';
        
        // Format error message
        const errorMessage = document.createElement('div');
        errorMessage.innerHTML = `<strong>${error.message || 'Unknown error'}</strong>`;
        errorItem.appendChild(errorMessage);
        
        // Format stack trace if available
        if (error.stack) {
            const stack = document.createElement('pre');
            stack.style.marginTop = '5px';
            stack.style.fontSize = '12px';
            stack.style.whiteSpace = 'pre-wrap';
            stack.style.color = 'rgba(255, 255, 255, 0.8)';
            stack.textContent = error.stack;
            errorItem.appendChild(stack);
        }
        
        // Add timestamp
        const timestamp = document.createElement('div');
        timestamp.style.fontSize = '12px';
        timestamp.style.marginTop = '5px';
        timestamp.style.color = 'rgba(255, 255, 255, 0.6)';
        timestamp.textContent = new Date().toLocaleTimeString();
        errorItem.appendChild(timestamp);
        
        errorList.appendChild(errorItem);
    }
    
    // Capture global errors
    window.addEventListener('error', function(event) {
        logError(event.error || new Error(event.message));
        // Don't prevent default so errors still show in console
    });
    
    // Capture promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        logError(event.reason || new Error('Unhandled Promise rejection'));
    });
    
    // Log initialization issues
    window.addEventListener('DOMContentLoaded', function() {
        // Check for Core Components
        if (typeof window.EventBus === 'undefined') {
            logError(new Error('EventBus is not defined - check if components/common/EventBus.js is loaded'));
        }
        
        if (typeof window.ComponentBase === 'undefined') {
            logError(new Error('ComponentBase is not defined - check if components/common/ComponentBase.js is loaded'));
        }
        
        if (typeof window.ThemeManager === 'undefined') {
            logError(new Error('ThemeManager is not defined - check if components/common/ThemeManager.js is loaded'));
        }
        
        // Log a success message when debug is loaded
        console.log('Debug helper initialized!');
    });
    
    // Expose helper functions to global scope
    window.debugHelper = {
        logError: logError,
        checkComponents: function() {
            const componentList = [
                'Header', 
                'StonksTicker', 
                'ControlPanel', 
                'ChatWindow', 
                'MessageInput', 
                'Soundboard', 
                'MemeGallery', 
                'Disclaimer'
            ];
            
            console.log('Checking components...');
            componentList.forEach(function(comp) {
                if (typeof window[comp] === 'undefined') {
                    console.error(`Component ${comp} is not defined!`);
                    logError(new Error(`Component ${comp} is not defined - check if components/${comp}/${comp}.js is loaded`));
                } else {
                    console.log(`Component ${comp} is loaded.`);
                }
            });
        }
    };
})(); 

// debug-helper.js - Enhanced debugging utilities for DEGEN ROAST 3000

// Initialize debug logger
window.debugLogger = {
  // Enable/disable logging
  enabled: true,
  
  // Log levels
  levels: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug',
    API: 'api',
    EVENT: 'event',
    COMPONENT: 'component'
  },
  
  // Colorized console output
  colors: {
    error: 'color: #ff3366; font-weight: bold;',
    warn: 'color: #ffcc00; font-weight: bold;',
    info: 'color: #37acff; font-weight: normal;',
    debug: 'color: #888888; font-weight: normal;',
    api: 'color: #00ff66; font-weight: bold;',
    event: 'color: #ff00ff; font-weight: normal;',
    component: 'color: #ff9933; font-weight: normal;'
  },
  
  // Current active log levels
  activeLogLevels: ['error', 'warn', 'info', 'api', 'event'],
  
  // Timestamp formatter
  getTimestamp() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
  },
  
  // Log a message with level
  log(level, tag, message, data = null) {
    if (!this.enabled || !this.activeLogLevels.includes(level)) return;
    
    const timestamp = this.getTimestamp();
    const color = this.colors[level] || '';
    
    if (data) {
      console.groupCollapsed(`%c[${timestamp}] [${level.toUpperCase()}] [${tag}] ${message}`, color);
      console.log('Details:', data);
      console.groupEnd();
    } else {
      console.log(`%c[${timestamp}] [${level.toUpperCase()}] [${tag}] ${message}`, color);
    }
  },
  
  // Shorthand methods for each log level
  error(tag, message, data = null) {
    this.log(this.levels.ERROR, tag, message, data);
  },
  
  warn(tag, message, data = null) {
    this.log(this.levels.WARN, tag, message, data);
  },
  
  info(tag, message, data = null) {
    this.log(this.levels.INFO, tag, message, data);
  },
  
  debug(tag, message, data = null) {
    this.log(this.levels.DEBUG, tag, message, data);
  },
  
  api(tag, message, data = null) {
    this.log(this.levels.API, tag, message, data);
  },
  
  event(tag, message, data = null) {
    this.log(this.levels.EVENT, tag, message, data);
  },
  
  component(tag, message, data = null) {
    this.log(this.levels.COMPONENT, tag, message, data);
  },
  
  // Enable specific log levels
  enableLevels(...levels) {
    levels.forEach(level => {
      if (!this.activeLogLevels.includes(level)) {
        this.activeLogLevels.push(level);
      }
    });
  },
  
  // Disable specific log levels
  disableLevels(...levels) {
    this.activeLogLevels = this.activeLogLevels.filter(level => !levels.includes(level));
  },
  
  // Enable all log levels
  enableAll() {
    this.activeLogLevels = Object.values(this.levels);
  },
  
  // Disable all except error logs
  disableAll() {
    this.activeLogLevels = [this.levels.ERROR];
  }
};

// Create a monitor to track API requests in the UI
window.apiMonitor = {
  // Container for API monitor UI
  container: null,
  
  // Recent API calls
  recentCalls: [],
  
  // Maximum number of calls to keep
  maxCalls: 10,
  
  // Initialize the monitor
  init() {
    // Create container if it doesn't exist
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'api-monitor';
      this.container.className = 'api-monitor';
      this.container.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        max-height: 200px;
        overflow-y: auto;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        font-family: monospace;
        font-size: 12px;
        z-index: 9999;
        display: none;
        border-top: 2px solid #00ff66;
      `;
      
      // Add close button
      const closeButton = document.createElement('button');
      closeButton.textContent = 'Close';
      closeButton.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        padding: 3px 8px;
        background-color: #ff3366;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
      `;
      closeButton.addEventListener('click', () => this.hide());
      
      this.container.appendChild(closeButton);
      
      // Add calls container
      const callsContainer = document.createElement('div');
      callsContainer.id = 'api-monitor-calls';
      callsContainer.style.cssText = `
        padding: 10px;
        margin-top: 20px;
      `;
      
      this.container.appendChild(callsContainer);
      
      // Add to body
      document.body.appendChild(this.container);
    }
    
    // Hook into window.fetch to monitor requests
    this.monkeyPatchFetch();
  },
  
  // Show the monitor
  show() {
    if (this.container) {
      this.container.style.display = 'block';
    }
  },
  
  // Hide the monitor
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  },
  
  // Toggle visibility
  toggle() {
    if (!this.container) {
      this.init();
    }
    
    if (this.container.style.display === 'none') {
      this.show();
    } else {
      this.hide();
    }
  },
  
  // Add a call to the monitor
  addCall(method, url, requestData, responseData, status, duration) {
    const now = new Date();
    
    // Create call object
    const call = {
      id: Date.now(),
      timestamp: now.toISOString(),
      method,
      url,
      requestData,
      responseData,
      status,
      duration,
      humanTime: window.debugLogger.getTimestamp()
    };
    
    // Add to recent calls
    this.recentCalls.unshift(call);
    
    // Limit array size
    if (this.recentCalls.length > this.maxCalls) {
      this.recentCalls.pop();
    }
    
    // Update UI if visible
    this.updateUI();
    
    // Log to console
    window.debugLogger.api('FETCH', `${method} ${url} - ${status} (${duration}ms)`, {
      request: requestData,
      response: responseData
    });
    
    return call;
  },
  
  // Update the UI with current calls
  updateUI() {
    if (!this.container) return;
    
    const callsContainer = document.getElementById('api-monitor-calls');
    if (!callsContainer) return;
    
    // Clear existing content
    callsContainer.innerHTML = '';
    
    // Add header
    const header = document.createElement('div');
    header.style.fontWeight = 'bold';
    header.style.marginBottom = '10px';
    header.innerHTML = `<span>API Monitor - Recent Calls (${this.recentCalls.length})</span>`;
    callsContainer.appendChild(header);
    
    // Add each call
    this.recentCalls.forEach(call => {
      // Create call element
      const callElement = document.createElement('div');
      callElement.className = 'api-call';
      callElement.style.cssText = `
        margin-bottom: 5px;
        padding: 5px;
        border-left: 3px solid ${call.status >= 200 && call.status < 300 ? '#00ff66' : '#ff3366'};
        background-color: rgba(30, 30, 30, 0.7);
      `;
      
      // Create call content
      callElement.innerHTML = `
        <div>
          <span style="color: #ffcc00;">[${call.humanTime}]</span>
          <span style="color: ${call.status >= 200 && call.status < 300 ? '#00ff66' : '#ff3366'};">${call.status}</span>
          <span style="color: #37acff;">${call.method}</span>
          <span>${call.url}</span>
          <span style="float: right;">${call.duration}ms</span>
        </div>
      `;
      
      // Add expanding details
      callElement.addEventListener('click', () => {
        console.group(`API Call: ${call.method} ${call.url}`);
        console.log('Request:', call.requestData);
        console.log('Response:', call.responseData);
        console.log('Status:', call.status);
        console.log('Duration:', call.duration, 'ms');
        console.log('Timestamp:', call.timestamp);
        console.groupEnd();
      });
      
      callsContainer.appendChild(callElement);
    });
  },
  
  // Monkey patch fetch to monitor requests
  monkeyPatchFetch() {
    const originalFetch = window.fetch;
    const self = this;
    
    window.fetch = async function(...args) {
      // Get request info
      const startTime = performance.now();
      const [url, options = {}] = args;
      const method = options.method || 'GET';
      
      let requestData = null;
      
      // Try to parse request data
      if (options.body) {
        try {
          requestData = JSON.parse(options.body);
        } catch (e) {
          requestData = options.body;
        }
      }
      
      // Call original fetch
      try {
        const response = await originalFetch.apply(this, args);
        const duration = Math.round(performance.now() - startTime);
        
        // Clone the response to avoid consuming the body
        const clonedResponse = response.clone();
        
        // Try to parse response data
        let responseData = null;
        try {
          if (response.headers.get('content-type')?.includes('application/json')) {
            responseData = await clonedResponse.json();
          } else {
            responseData = await clonedResponse.text();
          }
        } catch (e) {
          responseData = `Error parsing response: ${e.message}`;
        }
        
        // Add call to monitor
        self.addCall(method, url, requestData, responseData, response.status, duration);
        
        return response;
      } catch (error) {
        const duration = Math.round(performance.now() - startTime);
        
        // Add failed call to monitor
        self.addCall(method, url, requestData, { error: error.message }, 0, duration);
        
        throw error;
      }
    };
  }
};

// Add global hotkeys for debug features
document.addEventListener('keydown', function(event) {
  // Alt+D: Toggle API monitor
  if (event.altKey && event.key === 'd') {
    window.apiMonitor.toggle();
  }
  
  // Alt+L: Toggle verbose logging
  if (event.altKey && event.key === 'l') {
    if (window.debugLogger.activeLogLevels.includes('debug')) {
      window.debugLogger.disableLevels('debug');
      console.log('%c[DEBUG] Verbose logging disabled', 'color: #888888');
    } else {
      window.debugLogger.enableLevels('debug');
      console.log('%c[DEBUG] Verbose logging enabled', 'color: #888888');
    }
  }
});

// Wait for full DOMContentLoaded to check for existence of critical objects
document.addEventListener('DOMContentLoaded', function() {
  console.log('Debug helper loaded and initialized');
  
  // Initialize API monitor
  window.apiMonitor.init();
  
  // Check for critical components
  setTimeout(function checkComponents() {
    if (typeof window.EventBus === 'undefined') {
      console.error('EventBus is not defined! Application may not function correctly.');
    }
    
    if (typeof window.ComponentBase === 'undefined') {
      console.error('ComponentBase is not defined! Application may not function correctly.');
    }
    
    if (typeof window.ThemeManager === 'undefined') {
      console.error('ThemeManager is not defined! Application may not function correctly.');
    }
    
    // Hook into EventBus if it exists
    if (typeof window.EventBus !== 'undefined') {
      // Log all events through the debugLogger
      const originalSubscribe = window.EventBus.subscribe;
      const originalPublish = window.EventBus.publish;
      
      // Patch the publish method to log events
      window.EventBus.publish = function(eventName, data) {
        window.debugLogger.event('BUS', `Event published: ${eventName}`, data);
        return originalPublish.call(this, eventName, data);
      };
      
      window.debugLogger.info('DEBUG', 'EventBus hooked for debugging');
    }
    
    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
      window.debugLogger.error('PROMISE', 'Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise
      });
    });
    
    // Log initialization
    window.debugLogger.info('DEBUG', 'Debug helpers initialized successfully');
    
    // Add helpful message about debug tools
    console.log('%c🔍 Debug Tools Available:', 'color: #00ff66; font-weight: bold; font-size: 14px;');
    console.log('%c- window.debugLogger: Enhanced logging', 'color: #37acff');
    console.log('%c- window.apiMonitor: API request tracking', 'color: #37acff');
    console.log('%c- Alt+D: Toggle API monitor', 'color: #37acff');
    console.log('%c- Alt+L: Toggle verbose logging', 'color: #37acff');
    console.log('%c- window.debugDegen.runDiagnostics(): Run all diagnostics', 'color: #37acff');
  }, 500);
}); 