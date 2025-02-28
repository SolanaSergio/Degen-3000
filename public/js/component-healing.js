/**
 * component-healing.js
 * 
 * Utility for detecting and healing components that fail to initialize
 * or display correctly in the DEGEN ROAST 3000 application.
 */

class ComponentHealer {
  constructor() {
    this.healingAttempts = {};
    this.maxHealingAttempts = 3;
    this.initialized = false;
    
    console.log('ComponentHealer created');
  }
  
  /**
   * Initialize the component healer
   */
  init() {
    if (this.initialized) return;
    
    // Add global error handler for component errors
    this.addGlobalErrorHandler();
    
    // Run an initial check after the page loads
    setTimeout(() => {
      this.checkAllComponents();
    }, 2000);
    
    // Set up periodic health checks
    setInterval(() => {
      this.checkAllComponents();
    }, 30000); // Check every 30 seconds
    
    this.initialized = true;
    console.log('ComponentHealer initialized');
  }
  
  /**
   * Add global error handler to catch component errors
   */
  addGlobalErrorHandler() {
    // Track in case already listening
    if (this._errorHandlerInstalled) return;
    
    // Add global error handler
    window.addEventListener('error', (event) => {
      // Check if it's a component error
      if (event.message && (
          event.message.includes('ComponentBase is not defined') ||
          event.message.includes('is not a constructor') ||
          event.message.includes('properties of undefined (reading \'defaultVolume\')')
      )) {
        console.error('🚨 COMPONENT ERROR DETECTED:', event.message);
        console.error('File:', event.filename);
        console.error('Line:', event.lineno, 'Column:', event.colno);
        
        // Try to determine which component failed
        const componentMatch = event.filename.match(/\/components\/([^\/]+)\//);
        const componentName = componentMatch ? componentMatch[1] : 'Unknown';
        
        console.error(`Component "${componentName}" failed to initialize properly.`);
        
        // If it's the defaultVolume error, try to force-fix the Soundboard
        if (event.message.includes('defaultVolume')) {
          console.log('Detected defaultVolume error, attempting to heal Soundboard...');
          setTimeout(() => {
            const soundboardContainer = document.getElementById('soundboard-container');
            if (soundboardContainer) {
              this.healComponent(soundboardContainer, 'Soundboard');
            }
          }, 1000);
        } else {
          console.error('This is likely due to ComponentBase not being loaded before the component script.');
          console.log('Attempting auto-recovery in 3 seconds...');
          
          // Attempt recovery after a delay
          setTimeout(() => this.checkAllComponents(), 3000);
        }
      }
    });
    
    this._errorHandlerInstalled = true;
  }
  
  /**
   * Check the health of all known components
   */
  checkAllComponents() {
    console.log('Checking component health...');
    
    // List of component container IDs and their expected component constructors
    const componentChecks = [
      { id: 'header-container', component: 'Header' },
      { id: 'stonks-ticker', component: 'StonksTicker' },
      { id: 'control-panel-container', component: 'ControlPanel' },
      { id: 'soundboard-container', component: 'Soundboard' },
      { id: 'chat-messages-container', component: 'ChatWindow' },
      { id: 'message-input-container', component: 'MessageInput' },
      { id: 'meme-gallery-container', component: 'MemeGallery' }
    ];
    
    let healedComponents = 0;
    
    // Check each component
    componentChecks.forEach(check => {
      const container = document.getElementById(check.id);
      
      // Skip if container doesn't exist
      if (!container) {
        console.warn(`Container ${check.id} not found, skipping health check`);
        return;
      }
      
      const needsHealing = this.checkComponentHealth(container, check.component);
      
      if (needsHealing) {
        const healed = this.healComponent(container, check.component);
        if (healed) {
          healedComponents++;
        }
      }
    });
    
    if (healedComponents > 0) {
      console.log(`Healed ${healedComponents} components`);
    } else {
      console.log('All components are healthy');
    }
  }
  
  /**
   * Check if a component is healthy
   * @param {HTMLElement} container - The component container
   * @param {string} componentName - The component constructor name
   * @returns {boolean} Whether the component needs healing
   */
  checkComponentHealth(container, componentName) {
    // Check if container is empty (blank component)
    if (container.innerHTML.trim() === '') {
      console.warn(`Component ${componentName} has blank container`);
      return true;
    }
    
    // Check if container has error state
    if (container.classList.contains('component-error-state')) {
      console.warn(`Component ${componentName} is in error state`);
      return true;
    }
    
    // Check for specific component issues
    switch (componentName) {
      case 'Soundboard':
        // Check if sound buttons are rendered
        if (!container.querySelector('.sound-buttons')) {
          console.warn('Soundboard missing sound-buttons element');
          return true;
        }
        break;
        
      case 'ChatWindow':
        // Check if messages container is rendered
        if (!container.querySelector('.messages-container')) {
          console.warn('ChatWindow missing messages-container element');
          return true;
        }
        break;
    }
    
    return false;
  }
  
  /**
   * Heal a component by reinitializing it
   * @param {HTMLElement} container - The component container
   * @param {string} componentName - The component constructor name
   * @returns {boolean} Whether healing was successful
   */
  healComponent(container, componentName) {
    const containerId = container.id;
    
    // Track healing attempts
    this.healingAttempts[containerId] = (this.healingAttempts[containerId] || 0) + 1;
    
    // Don't exceed max attempts
    if (this.healingAttempts[containerId] > this.maxHealingAttempts) {
      console.error(`Exceeded maximum healing attempts for ${componentName}`);
      
      // Display error UI in container
      this.renderErrorUI(container, componentName, 'Too many healing attempts');
      return false;
    }
    
    console.log(`Attempting to heal ${componentName} (attempt ${this.healingAttempts[containerId]}/${this.maxHealingAttempts})`);
    
    try {
      // Clear container
      container.innerHTML = '';
      container.classList.remove('component-error-state');
      
      // Get component constructor
      const ComponentConstructor = window[componentName];
      
      // Check if constructor exists
      if (!ComponentConstructor) {
        console.error(`Component constructor ${componentName} not found`);
        this.renderErrorUI(container, componentName, 'Constructor not found');
        return false;
      }
      
      // Get default options based on component type
      const options = this.getDefaultOptions(componentName);
      
      // Special handling for Soundboard to prevent its common error
      if (componentName === 'Soundboard') {
        const originalCreate = ComponentConstructor.prototype.init;
        
        // Temporarily patch the Soundboard init method to ensure options exists
        ComponentConstructor.prototype.init = function patchedInit() {
          // Make sure options exists
          if (!this.options) {
            console.log('Healing Soundboard: Creating missing options object');
            this.options = options;
          }
          
          // If state exists but volume is undefined, fix it
          if (this.state && (typeof this.state.volume === 'undefined')) {
            console.log('Healing Soundboard: Fixing missing volume state');
            this.state.volume = options.defaultVolume || 0.5;
            this.state.muted = options.initialMuted || false;
          }
          
          // Call the original method
          return originalCreate.apply(this, arguments);
        };
        
        // Create component
        const component = new ComponentConstructor(containerId, options);
        
        // Restore original init method
        ComponentConstructor.prototype.init = originalCreate;
        
        // Store in global app components if available
        if (window.appComponents) {
          // Convert component name to camelCase for storing
          const componentKey = componentName.charAt(0).toLowerCase() + componentName.slice(1);
          window.appComponents[componentKey] = component;
        }
      } else {
        // Create component normally for other component types
        const component = new ComponentConstructor(containerId, options);
        
        // Store in global app components if available
        if (window.appComponents) {
          // Convert component name to camelCase for storing
          const componentKey = componentName.charAt(0).toLowerCase() + componentName.slice(1);
          window.appComponents[componentKey] = component;
        }
      }
      
      console.log(`Successfully healed ${componentName}`);
      return true;
      
    } catch (error) {
      console.error(`Failed to heal ${componentName}:`, error);
      this.renderErrorUI(container, componentName, error.message);
      return false;
    }
  }
  
  /**
   * Get default options for a component
   * @param {string} componentName - The component name
   * @returns {Object} Default options for the component
   */
  getDefaultOptions(componentName) {
    switch (componentName) {
      case 'Header':
        return {
          title: 'DEGEN ROAST 3000',
          subtitle: 'Ultimate AI-Powered Roast Generator',
          showWarningBanner: !localStorage.getItem('warningBannerClosed')
        };
        
      case 'StonksTicker':
        return {
          tickers: [
            { symbol: 'BTC', price: '+5.24%', isUp: true },
            { symbol: 'ETH', price: '+3.87%', isUp: true },
            { symbol: 'DOGE', price: '-2.39%', isUp: false },
            { symbol: 'SHIB', price: '+12.67%', isUp: true }
          ],
          updateInterval: 5000,
          enableAnimations: true,
          enableRandomUpdates: true
        };
        
      case 'ControlPanel':
        return {
          initialLevel: 1,
          maxLevel: 5,
          showVolumeControls: true,
          showThemeSelector: true
        };
        
      case 'Soundboard':
        return {
          defaultVolume: 0.7,
          initialMuted: false,
          showControls: true,
          showCategories: true
        };
        
      case 'ChatWindow':
        return {
          maxMessages: 50,
          animateMessages: true,
          showTimestamps: true
        };
        
      case 'MessageInput':
        return {
          maxLength: 500,
          placeholder: 'Type something to get absolutely roasted...'
        };
        
      case 'MemeGallery':
        return {
          layout: 'grid',
          animateEntrance: true
        };
        
      default:
        return {};
    }
  }
  
  /**
   * Render an error UI in a component container
   * @param {HTMLElement} container - The component container
   * @param {string} componentName - The component name
   * @param {string} errorMessage - The error message
   */
  renderErrorUI(container, componentName, errorMessage) {
    container.innerHTML = `
      <div class="component-error-state">
        <div class="error-icon">⚠️</div>
        <div class="error-message">
          <h3>${componentName} Error</h3>
          <p>${errorMessage}</p>
        </div>
        <button class="retry-button" onclick="window.componentHealer.healComponent(this.closest('.component-error-state').parentElement, '${componentName}')">
          Retry
        </button>
      </div>
    `;
    
    container.classList.add('component-error-state');
  }
}

// Create a global instance
window.componentHealer = new ComponentHealer();

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  window.componentHealer.init();
}); 