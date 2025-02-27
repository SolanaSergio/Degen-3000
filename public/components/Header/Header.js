/**
 * Header.js
 * 
 * Header component for DEGEN ROAST 3000
 * Manages title, subtitle, and banner
 */
class Header extends ComponentBase {
  /**
   * Create a new Header component
   * @param {string} containerId - ID of the container element
   * @param {Object} options - Component options
   */
  constructor(containerId, options = {}) {
    // Default options
    const defaultOptions = {
      title: 'DEGEN ROAST',
      titleBadge: '3000',
      subtitle: 'Ultimate AI-Powered Crypto Roast Generator',
      showWarningBanner: true,
      warningText: '⚠️ WARNING: BRUTAL ROASTS AHEAD - NOT FOR THE EASILY OFFENDED ⚠️',
      animateTitle: true,
      titleAnimation: 'pulse'  // pulse, wiggle, or shake
    };
    
    // Initialize base component with merged options
    super(containerId, {
      options: { ...defaultOptions, ...options },
      currentTheme: typeof window.ThemeManager !== 'undefined' ? 
        window.ThemeManager.getCurrentTheme() : 'crypto',
      isStonksModeActive: false
    });
    
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
    // Listen for theme changes
    this.on('themeChanged', (data) => {
      this.setState({ currentTheme: data.theme });
    });
    
    // Listen for stonks mode changes
    this.on('stonksModeToggled', (data) => {
      this.setState({ isStonksModeActive: data.enabled });
    });
  }
  
  /**
   * Render the component
   */
  render() {
    const { currentTheme, isStonksModeActive } = this.state;
    const { 
      title, 
      titleBadge, 
      subtitle, 
      showWarningBanner, 
      warningText,
      animateTitle,
      titleAnimation 
    } = this.state.options;
    
    // Generate HTML
    this.container.innerHTML = `
      <div class="header-component theme-${currentTheme} ${isStonksModeActive ? 'stonks-mode' : ''}">
        ${showWarningBanner ? `
          <div class="warning-banner">
            <span>${warningText}</span>
            <button class="close-banner" aria-label="Close warning">×</button>
          </div>
        ` : ''}
        
        <div class="header-content">
          <h1 class="title ${animateTitle ? `animate-${titleAnimation}` : ''}">
            ${title} <span class="title-badge">${titleBadge}</span>
          </h1>
          <p class="subtitle">${subtitle}</p>
        </div>
      </div>
    `;
    
    // Add event listeners to elements
    this.addListeners();
    
    // Mark as rendered
    this.rendered = true;
  }
  
  /**
   * Add event listeners to DOM elements
   */
  addListeners() {
    const closeButton = this.container.querySelector('.close-banner');
    if (closeButton) {
      this.addListener(closeButton, 'click', this.hideWarningBanner);
    }
  }
  
  /**
   * Hide the warning banner
   */
  hideWarningBanner() {
    const banner = this.container.querySelector('.warning-banner');
    if (banner) {
      banner.style.display = 'none';
      
      // Store in localStorage to remember user preference
      localStorage.setItem('warningBannerClosed', 'true');
      
      // Emit event so other components know the banner is hidden
      this.emit('warningBannerHidden', {});
    }
  }
  
  /**
   * Update title text
   * @param {string} newTitle - New title text
   */
  setTitle(newTitle) {
    this.state.options.title = newTitle;
    
    // Update DOM if rendered
    if (this.rendered) {
      const titleElement = this.container.querySelector('.title');
      if (titleElement) {
        // Keep the badge, just update the title text
        const badge = titleElement.querySelector('.title-badge');
        titleElement.textContent = newTitle + ' ';
        if (badge) {
          titleElement.appendChild(badge);
        }
      } else {
        this.render();
      }
    }
  }
  
  /**
   * Update subtitle text
   * @param {string} newSubtitle - New subtitle text
   */
  setSubtitle(newSubtitle) {
    this.state.options.subtitle = newSubtitle;
    
    // Update DOM if rendered
    if (this.rendered) {
      const subtitleElement = this.container.querySelector('.subtitle');
      if (subtitleElement) {
        subtitleElement.textContent = newSubtitle;
      } else {
        this.render();
      }
    }
  }
  
  /**
   * Update component when state changes
   */
  update() {
    if (this.rendered) {
      const header = this.container.querySelector('.header-component');
      if (header) {
        // Update theme and stonks mode classes
        header.className = `header-component theme-${this.state.currentTheme} ${this.state.isStonksModeActive ? 'stonks-mode' : ''}`;
      } else {
        // If header element doesn't exist, re-render
        this.render();
      }
    }
  }
}

// Make sure the component is available globally
if (typeof window !== 'undefined') {
  window.Header = Header;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Header;
} 