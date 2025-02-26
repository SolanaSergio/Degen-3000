# Creating New Components

This guide explains how to create new components for the DEGEN ROAST 3000 application following the established component architecture patterns.

## Overview

The component system follows a consistent pattern where each component:

1. Extends the `ComponentBase` class
2. Resides in its own directory with JS and CSS files
3. Maintains its own state
4. Communicates with other components via the EventBus
5. Follows a standard lifecycle

## Component Creation Checklist

- [ ] Create component directory and files
- [ ] Extend ComponentBase class
- [ ] Implement required lifecycle methods
- [ ] Create component-specific styles
- [ ] Document events and API
- [ ] Test the component

## Step-by-Step Guide

### 1. Create Component Directory and Files

Create a new directory in `/public/components/` with your component name:

```
/public/components/MyComponent/
  MyComponent.js    # Component logic
  MyComponent.css   # Component styling
```

### 2. Create Component Class

In your `MyComponent.js` file, create a class that extends `ComponentBase`:

```javascript
/**
 * MyComponent.js
 * 
 * My component description
 * 
 * @class
 * @extends ComponentBase
 */
class MyComponent extends ComponentBase {
  /**
   * Create a new MyComponent
   * @param {string} containerId - ID of the container element
   * @param {Object} options - Component options
   */
  constructor(containerId, options = {}) {
    // Default options
    const defaultOptions = {
      option1: 'default',
      option2: true,
      // ... more options
    };
    
    // Initialize base component with merged options and initial state
    super(containerId, {
      options: { ...defaultOptions, ...options },
      // Initial state properties
      property1: null,
      property2: 0,
      currentTheme: typeof ThemeManager !== 'undefined' ? 
        ThemeManager.getCurrentTheme() : 'crypto'
    });
    
    // Additional initialization if needed
    
    // Initialize component
    this.init();
  }
  
  /**
   * Initialize the component
   */
  init() {
    // Set up event listeners
    this.setupEventListeners();
    
    // Render the component
    this.render();
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for relevant events from other components
    if (typeof EventBus !== 'undefined') {
      // Subscribe to events using this.on()
      this.on('themeChanged', (data) => {
        this.setState({ currentTheme: data.theme });
      });
      
      // Subscribe to other relevant events...
    }
  }
  
  /**
   * Render the component
   */
  render() {
    // Generate HTML and insert into container
    this.container.innerHTML = `
      <div class="my-component theme-${this.state.currentTheme}">
        <!-- Component HTML structure -->
        <div class="component-header">
          <h3>My Component</h3>
        </div>
        <div class="component-content">
          <!-- Component content -->
        </div>
      </div>
    `;
    
    // Get references to DOM elements
    this.componentElement = this.container.querySelector('.my-component');
    
    // Add DOM event listeners
    this.setupDomEventListeners();
    
    // Mark as rendered
    this.rendered = true;
  }
  
  /**
   * Set up DOM event listeners
   */
  setupDomEventListeners() {
    // Find elements
    const someButton = this.container.querySelector('.some-button');
    
    // Add listeners using this.addListener()
    if (someButton) {
      this.addListener(someButton, 'click', this.handleButtonClick);
    }
  }
  
  /**
   * Handle button click
   * @param {Event} event - Click event
   */
  handleButtonClick(event) {
    // Handle the event
    console.log('Button clicked!');
    
    // Update state
    this.setState({ 
      property1: 'new value'
    });
    
    // Emit an event for other components
    this.emit('myComponentAction', {
      actionType: 'buttonClicked',
      timestamp: Date.now()
    });
  }
  
  /**
   * Update component after state changes
   * Override if you need custom update logic
   */
  update() {
    // By default, will call render() again
    // You can optimize by updating only what changed
    
    if (this.componentElement) {
      // Update specific elements based on state changes
      this.componentElement.className = `my-component theme-${this.state.currentTheme}`;
      
      // Update other elements...
    } else {
      // If crucial elements don't exist, re-render
      this.render();
    }
  }
  
  /**
   * Public method example
   * @param {string} value - Some value
   * @returns {boolean} Success indicator
   */
  publicMethod(value) {
    // Implementation
    return true;
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MyComponent;
}
```

### 3. Create Component CSS

In your `MyComponent.css` file, create component-specific styles:

```css
/**
 * MyComponent.css
 * Component-specific styles for MyComponent
 */

/* Main component container */
.my-component {
  width: 100%;
  background: rgba(15, 15, 25, 0.7);
  backdrop-filter: blur(5px);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  padding: 1rem;
}

/* Component header */
.my-component .component-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.my-component .component-header h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--pro-accent, #8957ff);
}

/* Component content */
.my-component .component-content {
  /* Content styling */
}

/* Theme variations */
.my-component.theme-crypto .component-header h3 {
  color: var(--crypto-primary, #f7931a);
}

.my-component.theme-hacker .component-header h3 {
  color: var(--hacker-primary, #00ff66);
}

.my-component.theme-gamer .component-header h3 {
  color: var(--gamer-primary, #ff00d4);
}

.my-component.theme-meme .component-header h3 {
  background: linear-gradient(90deg, #8A2BE2, #FF69B4);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .my-component {
    padding: 0.8rem;
  }
}

@media (max-width: 480px) {
  .my-component {
    padding: 0.6rem;
  }
}
```

### 4. Add Component to HTML

Update the `index.html` file to include a container for your component:

```html
<!-- MyComponent will be mounted here -->
<div id="my-component-container" class="my-component-wrapper"></div>
```

### 5. Initialize Your Component in app.js

Update `app.js` to initialize your component:

```javascript
function initializeComponents() {
  try {
    // ... existing component initialization
    
    // Initialize your component
    const myComponent = new MyComponent('my-component-container', {
      option1: 'custom value',
      option2: false
    });
    
    // Store component reference
    window.appComponents.myComponent = myComponent;
    
    // ... rest of initialization
  } catch (error) {
    console.error('Error initializing components:', error);
  }
}
```

## Component Lifecycle

The DEGEN ROAST 3000 component system follows this lifecycle:

1. **Construction**: Component instance is created with container reference and initial state
2. **Initialization**: Component sets up event listeners and prepares for rendering
3. **Rendering**: Component generates HTML and adds it to the container
4. **Event Setup**: Component adds DOM event listeners
5. **Updates**: Component responds to state changes by updating DOM
6. **Destruction**: Component cleans up event listeners and DOM elements when removed

## Event Communication

Components should communicate via events rather than direct references to maintain loose coupling:

### Publishing Events

```javascript
// Emit an event for other components
this.emit('eventName', {
  // Event data
  property1: 'value',
  property2: 123
});
```

### Subscribing to Events

```javascript
// Subscribe to events from other components
this.on('eventName', (data) => {
  // Handle the event
  console.log('Event received:', data);
  
  // Update state based on event data
  this.setState({
    property1: data.property1
  });
});
```

## State Management

Components maintain their own state and provide methods to update it:

```javascript
// Update state
this.setState({
  property1: 'new value',
  property2: this.state.property2 + 1
}, true); // true = re-render after update
```

## Theme Support

Ensure your component supports all application themes:

1. Store the current theme in component state
2. Subscribe to `themeChanged` events
3. Apply theme-specific CSS classes
4. Use CSS variables for colors and styling

## Best Practices

1. **Single Responsibility**: Components should have a clear, focused purpose
2. **Encapsulation**: Keep internal state and methods private
3. **Loose Coupling**: Communicate via events, not direct references
4. **Consistent Naming**: Follow established naming conventions
5. **Documentation**: Document component API, events, and options
6. **Error Handling**: Gracefully handle edge cases and errors
7. **Accessibility**: Make components keyboard accessible and screen reader friendly
8. **Performance**: Optimize rendering and event handlers

## Example Components

Refer to these existing components for guidance:

- `ChatWindow`: Displays messages with animations
- `MessageInput`: Handles user input with validation
- `Dashboard`: Provides application controls
- `Soundboard`: Manages audio playback
- `MemeGallery`: Displays selectable memes

## Testing Your Component

Create a simple test HTML file to test your component in isolation:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Component Test</title>
  
  <!-- Load component dependencies -->
  <script src="../common/EventBus.js"></script>
  <script src="../common/ComponentBase.js"></script>
  <script src="../common/ThemeManager.js"></script>
  
  <!-- Load your component -->
  <script src="MyComponent.js"></script>
  <link rel="stylesheet" href="MyComponent.css">
  
  <style>
    body {
      background: #1a1a2e;
      color: white;
      font-family: Arial, sans-serif;
      padding: 20px;
    }
  </style>
</head>
<body>
  <h1>Component Test</h1>
  
  <!-- Component container -->
  <div id="test-container"></div>
  
  <script>
    // Initialize component
    const component = new MyComponent('test-container', {
      // Test options
    });
    
    // Optional: Add test controls
    const testControls = document.createElement('div');
    testControls.innerHTML = `
      <h2>Test Controls</h2>
      <button id="test-button">Test Method</button>
    `;
    document.body.appendChild(testControls);
    
    // Add test event handlers
    document.getElementById('test-button').addEventListener('click', () => {
      component.publicMethod('test');
    });
  </script>
</body>
</html>
```

## Component Documentation

Document your component in a markdown file:

```markdown
# MyComponent

## Purpose
Brief description of what this component does.

## Options
- `option1` (string): Description of option1. Default: "default"
- `option2` (boolean): Description of option2. Default: true

## Public Methods
- `publicMethod(value)`: Description of what this method does
  - Parameters:
    - `value` (string): Description of parameter
  - Returns: (boolean) Success indicator

## Events
### Published Events
- `myComponentAction`: Fired when the component performs an action
  - Data:
    - `actionType` (string): Type of action performed
    - `timestamp` (number): When the action occurred

### Subscribed Events
- `themeChanged`: Listens for theme changes
```

## Integration Checklist

Before integrating your component into the main application:

1. **Functionality**: Verify all features work as expected
2. **Theming**: Test with all application themes
3. **Responsive**: Test on different screen sizes
4. **Accessibility**: Verify keyboard navigation works
5. **Performance**: Check for any performance issues
6. **Error Handling**: Test edge cases and error scenarios
7. **Documentation**: Complete component documentation
8. **Code Quality**: Review for consistency with codebase

## Need Help?

Refer to these resources:
- `COMPONENT_ARCHITECTURE.md`: Overview of the component system
- `EVENT_REFERENCE.md`: Documentation of all system events
- `THEMING_SYSTEM.md`: Guide to the theming system 