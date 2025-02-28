# Component Initialization and Self-Healing

This document explains how components are initialized in the DEGEN ROAST 3000 application and the self-healing mechanisms that ensure components recover from initialization failures or DOM issues.

## Component Initialization Flow

The application follows a structured initialization process that ensures components are created in the right order and with proper dependencies:

### 1. Core Dependencies Loading

The critical dependencies are loaded first with `defer` attributes:

```html
<!-- Core Scripts - Load these first to ensure they're initialized before components -->
<script defer src="components/common/EventBus.js"></script>
<script defer src="components/common/ComponentBase.js"></script>
<script defer src="components/common/ThemeManager.js"></script>
<script defer src="js/utils.js"></script>
```

This ensures that the foundation classes are available before any components try to use them.

### 2. Component Script Loading

Component scripts are loaded with `defer` attributes after core dependencies:

```html
<!-- Component Scripts - load after the core components -->
<script defer src="components/Header/Header.js"></script>
<script defer src="components/StonksTicker/StonksTicker.js"></script>
<script defer src="components/ControlPanel/ControlPanel.js"></script>
<!-- Other component scripts... -->
```

The `defer` attribute ensures scripts are executed in order after the DOM is parsed.

### 3. Main Application Initialization

The main application script (`main.js`) is loaded last and initializes all components:

```html
<!-- Main application initialization -->
<script defer src="js/main.js"></script>
```

### 4. DOM Content Loaded Event

When the DOM is fully loaded, the initialization process begins:

```javascript
// In main.js
document.addEventListener('DOMContentLoaded', function() {
  // Verify dependencies are loaded
  if (!window.EventBus || !window.ComponentBase) {
    console.error('Critical dependencies missing!');
    return;
  }
  
  // Check for desktop layout
  const isDesktop = window.innerWidth > 1024;
  if (isDesktop) {
    applyDesktopLayout();
  }
  
  // Initialize components
  initializeComponents();
  
  // Set up global event handlers
  setupGlobalEventHandlers();
  
  // Initialize event tracking
  initializeEventTracking();
});
```

### 5. Component Initialization Function

The `initializeComponents()` function creates instances of all components:

```javascript
function initializeComponents() {
  console.log('Initializing components...');
  
  // Initialize global components container
  window.appComponents = {};
  
  // 1. Initialize Header component
  if (typeof window.Header !== 'undefined' && document.getElementById('header-container')) {
    console.log('Initializing Header component...');
    window.appComponents.header = new window.Header('header-container', {
      title: 'DEGEN ROAST 3000',
      subtitle: 'Ultimate AI-Powered Roast Generator',
      showWarningBanner: !localStorage.getItem('warningBannerClosed')
    });
  } else {
    console.warn('Header component or container not found');
  }
  
  // 2. Initialize StonksTicker component
  if (typeof window.StonksTicker !== 'undefined' && document.getElementById('stonks-ticker')) {
    console.log('Initializing StonksTicker component...');
    window.appComponents.stonksTicker = new window.StonksTicker('stonks-ticker', {
      tickers: [
        { symbol: 'BTC', price: '+5.24%', isUp: true },
        { symbol: 'ETH', price: '+3.87%', isUp: true },
        { symbol: 'DOGE', price: '-2.39%', isUp: false },
        { symbol: 'SHIB', price: '+12.67%', isUp: true }
      ],
      updateInterval: 5000,
      enableAnimations: true,
      enableRandomUpdates: true
    });
  }
  
  // Initialize other components...
}
```

### 6. Component Constructor

Each component's constructor follows a similar pattern:

```javascript
/**
 * Create a new Soundboard component
 * @param {string} containerId - ID of the container element
 * @param {Object} options - Component options
 */
constructor(containerId, options = {}) {
  // Default options
  const defaultOptions = {
    defaultVolume: 0.5,
    initialMuted: false,
    showCategories: true,
    // ...other default options
  };
  
  // Call parent constructor with container ID and initial state
  super(containerId, {
    ...defaultOptions,
    ...options
  });
  
  // Initialize state
  this.state = {
    volume: this.options.defaultVolume,
    muted: this.options.initialMuted,
    // ...other state properties
  };
  
  // Initialize the component
  this.init();
}
```

### 7. Component Initialization

Each component's `init()` method handles setup:

```javascript
/**
 * Initialize the component
 */
init() {
  // Load saved preferences
  this.loadSavedPreferences();
  
  // Set up event listeners
  this.setupEventListeners();
  
  // Render the component
  this.render();
  
  // Additional initialization if needed
}
```

## Self-Healing Mechanisms

The application includes several mechanisms to recover from initialization failures and DOM issues:

### 1. Delayed Initialization

For components with time-sensitive dependencies:

```javascript
// In Soundboard.js
init() {
  // Preload sounds
  this.preloadSounds();
  
  // Set up event listeners
  this.setupEventListeners();
  
  // Render the component
  this.render();
  
  // Force immediate visibility of the container
  this.container.style.display = 'block';
  
  // Force initial category to display with a slight delay
  // This ensures the DOM is ready
  setTimeout(() => {
    this.renderSoundButtons(this.state.activeCategory);
  }, 100);
}
```

### 2. Component Reinitialization

A global function attempts to reinitialize failed components:

```javascript
/**
 * Attempt to reinitialize any components that may have failed to load
 */
function reinitializeComponentsIfNeeded() {
  console.log('Checking for components that need reinitialization...');
  
  // Check each component container to see if it has content
  const componentChecks = [
    { id: 'header-container', component: 'Header' },
    { id: 'stonks-ticker', component: 'StonksTicker' },
    { id: 'control-panel-container', component: 'ControlPanel' },
    { id: 'soundboard-container', component: 'Soundboard' },
    // ...other components
  ];
  
  let componentsReinitialized = 0;
  
  componentChecks.forEach(check => {
    const container = document.getElementById(check.id);
    
    // Check if container exists but is empty
    if (container && container.innerHTML.trim() === '') {
      console.warn(`Component container ${check.id} is empty, attempting to reinitialize...`);
      
      // Check if component constructor exists
      if (window[check.component]) {
        try {
          // Create new component instance with default options
          const componentInstance = new window[check.component](check.id, {});
          
          // Save to appComponents if it exists
          if (window.appComponents) {
            const key = check.component.charAt(0).toLowerCase() + check.component.slice(1);
            window.appComponents[key] = componentInstance;
          }
          
          console.log(`✅ Successfully reinitialized ${check.component} component`);
          componentsReinitialized++;
          
          // Set display to ensure visibility
          container.style.display = 'block';
          container.style.visibility = 'visible';
          container.style.opacity = '1';
        } catch (error) {
          console.error(`Failed to reinitialize ${check.component}:`, error);
        }
      }
    }
  });
  
  return componentsReinitialized;
}
```

### 3. Layout Recovery

A function to fix layout issues when the desktop view fails to apply:

```javascript
/**
 * Apply desktop layout fixes
 */
function applyDesktopLayout() {
  console.log('Applying desktop layout fixes...');
  
  // Apply enhanced UI class to container
  const container = document.querySelector('.container');
  if (container) {
    container.classList.add('enhanced-ui');
  }
  
  // Hide fallback content
  const fallbackContent = document.getElementById('fallback-content');
  if (fallbackContent) {
    fallbackContent.style.display = 'none';
  }
  
  // Ensure header is visible
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    headerContainer.style.display = 'block';
    headerContainer.style.width = '100%';
    headerContainer.style.marginBottom = '1rem';
  }
  
  // Ensure stonks ticker is visible
  const stonksTicker = document.getElementById('stonks-ticker');
  if (stonksTicker) {
    stonksTicker.style.display = 'flex';
    stonksTicker.style.width = '100%';
    stonksTicker.style.marginBottom = '1rem';
  }
  
  // Ensure soundboard is correctly displayed
  const soundboardContainer = document.getElementById('soundboard-container');
  if (soundboardContainer) {
    soundboardContainer.style.display = 'flex';
    soundboardContainer.style.flexDirection = 'column';
    soundboardContainer.style.maxHeight = '300px';
    soundboardContainer.style.minHeight = '200px';
    
    // Style soundboard component if it exists
    const soundboardComponent = soundboardContainer.querySelector('.soundboard-component');
    if (soundboardComponent) {
      soundboardComponent.style.display = 'flex';
      soundboardComponent.style.flexDirection = 'column';
      soundboardComponent.style.height = '100%';
      soundboardComponent.style.width = '100%';
      
      // Style sound categories
      const soundCategories = soundboardComponent.querySelector('.sound-categories');
      if (soundCategories) {
        soundCategories.style.display = 'flex';
        soundCategories.style.flexWrap = 'wrap';
        soundCategories.style.marginBottom = '12px';
      }
      
      // Style sound buttons container
      const soundButtons = soundboardComponent.querySelector('.sound-buttons');
      if (soundButtons) {
        soundButtons.style.display = 'grid';
        soundButtons.style.gridTemplateColumns = 'repeat(auto-fill, minmax(80px, 1fr))';
        soundButtons.style.gap = '8px';
        soundButtons.style.overflowY = 'auto';
        soundButtons.style.flex = '1';
      }
    }
  }
}
```

### 4. Component-Level Self-Healing

Components implement their own recovery mechanisms:

```javascript
/**
 * Render sound buttons for the active category
 * @param {string} category - The category to render
 */
renderSoundButtons(category) {
  try {
    // Get the sound buttons container
    const soundButtonsContainer = this.container.querySelector('.sound-buttons');
    
    // Validate container exists
    if (!soundButtonsContainer) {
      console.error('Sound buttons container not found, attempting recovery...');
      
      // Try re-rendering the entire component
      this.render();
      return;
    }
    
    // Clear existing buttons
    soundButtonsContainer.innerHTML = '';
    
    // Get sounds for the category
    const categoryData = this.state.sounds[category];
    
    // Check if category exists
    if (!categoryData || Object.keys(categoryData).length === 0) {
      soundButtonsContainer.innerHTML = `
        <div class="no-sounds">
          <div class="no-sounds-icon">🔇</div>
          <div class="no-sounds-text">No sounds available in this category</div>
        </div>
      `;
      return;
    }
    
    // Render buttons for each sound
    Object.entries(categoryData).forEach(([soundId, soundData]) => {
      // Create button element and set properties
      // ...
    });
  } catch (error) {
    console.error('Error rendering sound buttons:', error);
    
    // Fallback rendering
    const soundButtonsContainer = this.container.querySelector('.sound-buttons');
    if (soundButtonsContainer) {
      soundButtonsContainer.innerHTML = `
        <div class="error-message">
          <p>Error loading sounds</p>
          <button class="retry-button">Retry</button>
        </div>
      `;
      
      // Add retry button handler
      const retryButton = soundButtonsContainer.querySelector('.retry-button');
      if (retryButton) {
        retryButton.addEventListener('click', () => {
          this.renderSoundButtons(category);
        });
      }
    }
  }
}
```

### 5. Loading Timeout

A fallback mechanism shows a message if components don't initialize:

```javascript
// Show fallback content if initialization fails
setTimeout(function() {
  if (document.getElementById('header-container').innerHTML === '') {
    document.getElementById('fallback-content').style.display = 'block';
    console.error('Components failed to initialize within timeout period.');
  }
}, 15000); // 15 second timeout
```

### 6. Error Boundary Script

A global error handler catches and logs JavaScript errors:

```javascript
// Catch and log all JavaScript errors
window.addEventListener('error', function(event) {
  // Create a timestamp
  const now = new Date();
  const timestamp = now.toLocaleTimeString();
  
  // Store all errors
  window.__allErrors = window.__allErrors || [];
  window.__allErrors.push({
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    timestamp: timestamp,
    error: event.error
  });
  
  // Log specific errors of interest
  if (event.message && event.message.includes('EventBus is not a constructor')) {
    console.error('ERROR: EventBus is not a constructor. Use window.EventBus directly.');
    event.preventDefault(); // Prevent the default error handling
  }
}, true);
```

## Component Loading Sequence Diagram

Below is a sequence diagram of the component loading process:

```
┌────────────┐   ┌───────────┐    ┌───────────┐     ┌───────────┐     ┌────────────┐
│ HTML Page  │   │ EventBus  │    │Component  │     │  main.js  │     │ Components │
│            │   │           │    │   Base    │     │           │     │            │
└─────┬──────┘   └─────┬─────┘    └────┬──────┘     └─────┬─────┘     └──────┬─────┘
      │                │               │                  │                  │
      │  Load core scripts             │                  │                  │
      ├─────────────►│                 │                  │                  │
      │                │               │                  │                  │
      │                │  Initialize   │                  │                  │
      │                │─────────────►│                  │                  │
      │                │               │                  │                  │
      │ Load component scripts         │                  │                  │
      ├─────────────────────────────────────────────────────────────────────►
      │                │               │                  │                  │
      │ Load main.js   │               │                  │                  │
      ├─────────────────────────────────────►            │                  │
      │                │               │                  │                  │
      │ DOMContentLoaded               │                  │                  │
      ├─────────────────────────────────────────────────►│                  │
      │                │               │                  │                  │
      │                │               │  initializeComponents               │
      │                │               │ ◄────────────── │                  │
      │                │               │                  │                  │
      │                │               │                  │   Create component 
      │                │               │                  │ ───────────────►│
      │                │               │                  │                  │
      │                │               │                  │  Self-healing check
      │                │               │                  │ ───────────────►│
      │                │               │                  │                  │
      │ setTimeout for │               │                  │                  │
      │ fallback check │               │                  │                  │
      ├─────────────────────────────────────────────────►│                  │
      │                │               │                  │                  │
      │                │               │  reinitializeComponentsIfNeeded     │
      │                │               │ ◄────────────── │                  │
      │                │               │                  │                  │
```

## Best Practices for Component Initialization

### 1. Ensure Proper Order

Components should be initialized in a specific order to handle dependencies:

1. Core infrastructure (EventBus, ComponentBase, ThemeManager)
2. UI container components (Header, Layout)
3. Feature components (Soundboard, ChatWindow)
4. Utility components (MessageInput, Disclaimer)

### 2. Use Default Options

Always provide sensible default options in component constructors:

```javascript
const defaultOptions = {
  initialVolume: 0.5,
  showControls: true,
  enableAnimations: true
};

super(containerId, {
  ...defaultOptions,
  ...options
});
```

### 3. Implement Progressive Enhancement

Components should work with minimal functionality first, then add advanced features:

```javascript
init() {
  // Basic initialization - must work
  this.render();
  
  // Enhanced functionality - can fail gracefully
  if (window.localStorage) {
    this.loadSavedPreferences();
  }
  
  // Advanced features - optional
  try {
    this.setupAdvancedFeatures();
  } catch (error) {
    console.warn('Advanced features not available:', error);
  }
}
```

### 4. Add Recovery Mechanisms

All components should include error handling and recovery mechanisms:

```javascript
render() {
  try {
    // Normal rendering code
    this.container.innerHTML = `...`;
    this.setupDomEventListeners();
  } catch (error) {
    console.error('Render error:', error);
    
    // Fallback rendering
    this.renderFallbackUI();
  }
}
```

### 5. Check Dependencies

Components should verify critical dependencies before using them:

```javascript
setupEventListeners() {
  // Check if EventBus is available
  if (!this.eventBus) {
    console.warn('EventBus not available, component will not respond to global events');
    return;
  }
  
  // Subscribe to events
  this.on('themeChanged', this.handleThemeChanged);
  this.on('soundEnabledChanged', this.handleSoundEnabledChanged);
}
```

### 6. Use Delayed Rendering

For components with complex rendering requirements, use delayed rendering:

```javascript
init() {
  // Initial render
  this.render();
  
  // Delayed rendering for complex elements
  setTimeout(() => {
    this.renderComplexElements();
  }, 100);
}
```

## Troubleshooting Component Initialization

When a component fails to initialize, follow these steps:

1. **Check Browser Console:** Look for JavaScript errors during initialization
2. **Verify Container Element:** Ensure the component's container exists in the DOM
3. **Check Script Loading:** Verify all required scripts are loaded in the correct order
4. **Test Component Dependencies:** Check if EventBus and ComponentBase are available
5. **Try Manual Initialization:** Attempt to create the component instance manually via console
6. **Force Container Visibility:** Set explicit display, visibility, and opacity styles
7. **Clear Local Storage:** Remove stored preferences that might be causing issues
8. **Test in Isolation:** Try the component in a dedicated test page

## Test Pages for Component Initialization

Each component should have a test page that demonstrates proper initialization:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Soundboard Component Test</title>
  <link rel="stylesheet" href="../css/reset.css">
  <link rel="stylesheet" href="../css/variables.css">
  <link rel="stylesheet" href="../css/base.css">
  <link rel="stylesheet" href="../components/Soundboard/Soundboard.css">
  <script src="../components/common/EventBus.js"></script>
  <script src="../components/common/ComponentBase.js"></script>
  <script src="../components/Soundboard/Soundboard.js"></script>
  <style>
    body {
      background: #121420;
      color: #fff;
      padding: 2rem;
    }
    
    .test-container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .component-container {
      min-height: 400px;
      border: 2px solid #3772ff;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 30px;
    }
    
    .debug-panel {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      padding: 16px;
      margin-top: 30px;
    }
    
    .debug-log {
      background: rgba(0, 0, 0, 0.5);
      padding: 12px;
      border-radius: 4px;
      font-family: monospace;
      height: 200px;
      overflow-y: auto;
    }
  </style>
</head>
<body>
  <div class="test-container">
    <h1>Soundboard Component Test</h1>
    <div id="component-container" class="component-container"></div>
    
    <div class="debug-panel">
      <h3>Debug Controls</h3>
      <button id="initialize-btn">Initialize Component</button>
      <button id="reinitialize-btn">Reinitialize Component</button>
      <button id="destroy-btn">Destroy Component</button>
      
      <h3>Debug Log</h3>
      <div id="debug-log" class="debug-log"></div>
    </div>
  </div>
  
  <script>
    // Debug log function
    function log(message) {
      const logElement = document.getElementById('debug-log');
      const timestamp = new Date().toLocaleTimeString();
      logElement.innerHTML += `<div>[${timestamp}] ${message}</div>`;
      console.log(`[${timestamp}] ${message}`);
    }
    
    // Initialize soundboard
    let componentInstance = null;
    
    function initialize() {
      try {
        log('Initializing component...');
        componentInstance = new Soundboard('component-container', {
          defaultVolume: 0.7,
          initialMuted: false,
          showCategories: true
        });
        log('Component initialized successfully');
      } catch (error) {
        log(`ERROR: ${error.message}`);
        console.error(error);
      }
    }
    
    function reinitialize() {
      if (componentInstance) {
        log('Destroying existing component...');
        componentInstance.destroy();
      }
      
      document.getElementById('component-container').innerHTML = '';
      
      setTimeout(() => {
        initialize();
      }, 100);
    }
    
    function destroy() {
      if (componentInstance) {
        log('Destroying component...');
        componentInstance.destroy();
        componentInstance = null;
      }
    }
    
    // Set up event listeners
    document.getElementById('initialize-btn').addEventListener('click', initialize);
    document.getElementById('reinitialize-btn').addEventListener('click', reinitialize);
    document.getElementById('destroy-btn').addEventListener('click', destroy);
    
    // Initialize component on page load
    document.addEventListener('DOMContentLoaded', () => {
      log('DOM loaded, ready to initialize component');
      
      // Check for dependencies
      if (typeof EventBus === 'undefined') {
        log('ERROR: EventBus not loaded');
      }
      
      if (typeof ComponentBase === 'undefined') {
        log('ERROR: ComponentBase not loaded');
      }
      
      if (typeof Soundboard === 'undefined') {
        log('ERROR: Soundboard component not loaded');
      }
      
      // Auto-initialize
      initialize();
    });
  </script>
</body>
</html> 