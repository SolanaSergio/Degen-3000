# Component Troubleshooting Guide

This guide provides strategies and solutions for troubleshooting components in the DEGEN ROAST 3000 application. It covers common issues, debugging techniques, and best practices for resolving component problems.

## Common Component Issues

### 1. Component Not Rendering

#### Symptoms:
- Empty container where a component should be displayed
- JavaScript console errors related to rendering
- Component container exists but has no content

#### Possible Causes:
- Container element doesn't exist in the DOM
- Component JavaScript file failed to load
- CSS missing or conflicting
- JavaScript errors during initialization
- EventBus or ComponentBase not loaded first

#### Solutions:
1. **Check Container Element:**
   ```javascript
   // Verify container exists in DOM
   console.log(document.getElementById('component-container-id'));
   ```

2. **Verify Script Loading:**
   - Check for 404 errors in the Network tab of browser DevTools
   - Ensure scripts are loaded in the correct order (dependencies first)
   - Check if there are any syntax errors in the component code

3. **Force Component Visibility:**
   ```javascript
   // Force component container to be visible
   document.getElementById('component-container-id').style.display = 'block';
   document.getElementById('component-container-id').style.visibility = 'visible';
   document.getElementById('component-container-id').style.opacity = '1';
   ```

4. **Manually Initialize Component:**
   ```javascript
   // Try manual initialization if auto-initialization failed
   if (typeof ComponentName !== 'undefined') {
     new ComponentName('component-container-id', {});
   }
   ```

### 2. Component Styling Issues

#### Symptoms:
- Component appears but with incorrect styling
- Missing visual elements
- Layout breaks at certain screen sizes

#### Possible Causes:
- CSS file not loaded
- CSS specificity issues (other styles overriding component styles)
- Missing CSS variables
- Theme-specific styling not applied
- Cross-browser compatibility issues

#### Solutions:
1. **Check CSS Loading:**
   - Verify the component's CSS file is loaded in the Network tab
   - Check for CSS errors in the console

2. **Inspect CSS Variables:**
   ```javascript
   // Check if CSS variables are defined
   console.log(getComputedStyle(document.documentElement).getPropertyValue('--variable-name'));
   ```

3. **Force Theme Application:**
   ```javascript
   // Manually apply theme class to component
   document.getElementById('component-container-id').classList.add('theme-crypto');
   ```

4. **Add Component-Specific Styling:**
   - Create a specialized CSS file with high-specificity selectors
   - Use !important for critical styling when necessary (sparingly)

### 3. Component Communication Issues

#### Symptoms:
- Components don't respond to events
- Some components update but others don't
- Inconsistent behavior when interacting with components

#### Possible Causes:
- EventBus not initialized
- Incorrect event names
- Components subscribing to events after they're published
- Event data structure mismatch
- Event unsubscription issues

#### Solutions:
1. **Check EventBus:**
   ```javascript
   // Verify EventBus is initialized and working
   console.log(window.EventBus);
   
   // Debug EventBus events
   window.EventBus.setDebugMode(true);
   ```

2. **Test Event Publishing:**
   ```javascript
   // Manually publish an event to test component response
   window.EventBus.publish('themeChanged', { theme: 'crypto' });
   ```

3. **Monitor Event Listeners:**
   ```javascript
   // Check if the component is subscribed to the event
   console.log(window.EventBus.subscriberCount('themeChanged'));
   ```

## Debugging Tools and Techniques

### 1. Component Inspection

The application includes built-in tools for component inspection:

1. **Debug Button:** Located in the top-right corner of the application, this button reveals component information

2. **Manual Inspection via Console:**
   ```javascript
   // Access all application components
   console.log(window.appComponents);
   
   // Inspect a specific component
   console.log(window.appComponents.soundboard);
   
   // Check component state
   console.log(window.appComponents.soundboard.state);
   ```

3. **DOM Structure Verification:**
   ```javascript
   // Check component DOM structure
   console.log(document.getElementById('soundboard-container').innerHTML);
   ```

### 2. Self-Healing Mechanisms

The application includes several self-healing mechanisms that can be manually triggered:

1. **Force Component Reinitialization:**
   ```javascript
   // Reinitialize a specific component
   if (typeof reinitializeComponentsIfNeeded === 'function') {
     reinitializeComponentsIfNeeded();
   }
   ```

2. **Apply Layout Fixes:**
   ```javascript
   // Force desktop layout application
   if (typeof applyDesktopLayout === 'function') {
     applyDesktopLayout();
   }
   ```

3. **Repair Event Connections:**
   ```javascript
   // Clear and re-establish event connections
   window.appComponents.soundboard.setupEventListeners();
   ```

### 3. Testing Components in Isolation

Each component can be tested in isolation using dedicated test pages:

1. **Component Test Pages:**
   - `/tests/soundboard_test.html`
   - `/tests/controlpanel_test.html`
   - etc.

2. **Create Custom Test Environments:**
   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <link rel="stylesheet" href="../public/css/reset.css">
     <link rel="stylesheet" href="../public/css/variables.css">
     <link rel="stylesheet" href="../public/css/base.css">
     <link rel="stylesheet" href="../public/components/MyComponent/MyComponent.css">
     <script src="../public/components/common/EventBus.js"></script>
     <script src="../public/components/common/ComponentBase.js"></script>
     <script src="../public/components/MyComponent/MyComponent.js"></script>
   </head>
   <body>
     <div id="component-container"></div>
     <script>
       // Initialize component
       document.addEventListener('DOMContentLoaded', function() {
         window.myComponent = new MyComponent('component-container', {});
       });
     </script>
   </body>
   </html>
   ```

## Common Component-Specific Issues

### Soundboard Component

1. **Issue:** Sound buttons not appearing
   - **Solution:** Check if sound categories are correctly set in the state
   - **Fix:** Force rendering of the active category:
     ```javascript
     soundboardComponent.renderSoundButtons(soundboardComponent.state.activeCategory);
     ```

2. **Issue:** Sound not playing
   - **Solution:** Check if audio elements are being created and volume settings
   - **Fix:** Verify the audio paths are correct and test playback:
     ```javascript
     soundboardComponent.playSound('meme', 'stonks');
     ```

3. **Issue:** Volume controls not working
   - **Solution:** Inspect volume state and DOM elements
   - **Fix:** Manually update volume:
     ```javascript
     soundboardComponent.setState({ volume: 0.7, muted: false });
     ```

### ControlPanel Component

1. **Issue:** Theme selection not working
   - **Solution:** Check ThemeManager integration
   - **Fix:** Manually test theme application:
     ```javascript
     controlPanelComponent.setTheme('crypto');
     ```

2. **Issue:** Controls not responsive
   - **Solution:** Verify DOM event listeners are attached
   - **Fix:** Manually reinitialize event listeners:
     ```javascript
     controlPanelComponent.setupDomEventListeners();
     ```

## Enhancing Component Resilience

### 1. Add Self-Healing Code

When modifying components, consider adding self-healing capabilities:

```javascript
render() {
  try {
    // Normal rendering code...
    this.container.innerHTML = `...`;
    this.setupDomEventListeners();
  } catch (error) {
    console.error(`Render error in ${this.constructor.name}:`, error);
    
    // Fallback rendering
    this.container.innerHTML = `
      <div class="component-error">
        <p>Component Error</p>
        <button class="reload-btn">Reload</button>
      </div>
    `;
    
    // Add recovery action
    const reloadBtn = this.container.querySelector('.reload-btn');
    if (reloadBtn) {
      reloadBtn.addEventListener('click', () => this.render());
    }
  }
}
```

### 2. Add Timeout-Based Rendering

For components that depend on DOM elements being ready:

```javascript
init() {
  // Immediate rendering attempt
  this.render();
  
  // Fallback rendering with delay in case DOM isn't ready
  setTimeout(() => {
    if (!this.rendered || this.container.innerHTML.trim() === '') {
      console.log(`Delayed rendering for ${this.constructor.name}`);
      this.render();
    }
  }, 100);
}
```

### 3. Implement Graceful Degradation

Design components to work even when some features are unavailable:

```javascript
playSound(category, sound) {
  try {
    // Normal sound playing code...
  } catch (error) {
    console.warn(`Sound playback failed: ${category}/${sound}`);
    
    // Fallback - at least show visual feedback
    const button = this.container.querySelector(`[data-sound="${sound}"]`);
    if (button) {
      button.classList.add('playing');
      setTimeout(() => button.classList.remove('playing'), 300);
    }
  }
}
```

## Best Practices for Component Maintenance

1. **Test Components Independently:** Always test a component in isolation before integration
2. **Check Browser Console:** Regularly monitor for JavaScript errors during development
3. **Document Component Dependencies:** Clearly specify what a component depends on
4. **Use Feature Detection:** Check for features before using them
5. **Implement Error Boundaries:** Catch and handle errors gracefully
6. **Add Logging:** Include meaningful log messages for debugging
7. **Maintain Event Documentation:** Keep the event reference up to date
8. **Test Across Browsers:** Verify components work in all target browsers

## When to Create a Test Page

Consider creating a component test page when:

1. Developing a new component
2. Debugging complex component issues
3. Testing component behavior in isolation
4. Verifying component styling across themes
5. Demonstrating component functionality to the team 