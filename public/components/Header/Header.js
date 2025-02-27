/**
 * Header.js
 * 
 * Header component for DEGEN ROAST 3000
 * Manages title, subtitle, and warning banner
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
      showWarningBanner: true,        // Show the warning banner
      warningText: "⚠️ WARNING: BRUTAL ROASTS AHEAD - NOT FOR THE EASILY OFFENDED ⚠️",
      title: "DEGEN ROAST",
      titleBadge: "3000",
      subtitle: "The most savage AI roast generator on the internet",
      animateTitle: true,             // Whether to animate the title on hover
      titleAnimation: "wiggle"        // Animation type: "wiggle", "pulse", "shake"
    };
    
    // Initialize base component with merged options and initial state
    super(containerId, {
      options: { ...defaultOptions, ...options },
      currentTheme: typeof ThemeManager !== 'undefined' ? 
        ThemeManager.getCurrentTheme() : 'crypto',
      isWarningVisible: true
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
    if (typeof EventBus !== 'undefined') {
      this.on('themeChanged', (data) => {
        this.setState({ currentTheme: data.theme });
      });
    }
  }
  
  /**
   * Render the component
   */
  render() {
    const { currentTheme, isWarningVisible } = this.state;
    const { 
      showWarningBanner, 
      warningText, 
      title, 
      titleBadge, 
      subtitle,
      animateTitle
    } = this.state.options;
    
    // Generate HTML
    this.container.innerHTML = `
      <div class="header-component theme-${currentTheme}">
        ${showWarningBanner ? `
          <div id="warning-banner" class="warning-banner ${isWarningVisible ? '' : 'hidden'}">
            <span>${warningText}</span>
            <button class="close-warning" aria-label="Close warning">×</button>
          </div>
        ` : ''}
        
        <header class="header-area">
          <h1 class="title ${animateTitle ? 'animated' : ''}">
            ${title} <span class="title-badge">${titleBadge}</span>
          </h1>
          <p class="subtitle">${subtitle}</p>
        </header>
      </div>
    `;
    
    // Get references to key elements
    this.headerElement = this.container.querySelector('.header-component');
    this.warningBanner = this.container.querySelector('#warning-banner');
    this.closeWarningButton = this.container.querySelector('.close-warning');
    
    // Set up DOM event listeners
    this.setupDomEventListeners();
    
    // Mark as rendered
    this.rendered = true;
  }
  
  /**
   * Set up DOM event listeners
   */
  setupDomEventListeners() {
    // Add listener for closing warning banner
    if (this.closeWarningButton) {
      this.addListener(this.closeWarningButton, 'click', this.hideWarningBanner);
    }
  }
  
  /**
   * Hide the warning banner
   * @param {Event} event - Click event
   */
  hideWarningBanner(event) {
    this.setState({ isWarningVisible: false });
    
    // Store preference in localStorage to keep it hidden on refresh
    localStorage.setItem('warningBannerHidden', 'true');
    
    // Emit event for other components to adjust layout
    this.emit('warningBannerHidden', {});
  }
  
  /**
   * Show the warning banner
   */
  showWarningBanner() {
    this.setState({ isWarningVisible: true });
    
    // Update localStorage
    localStorage.removeItem('warningBannerHidden');
    
    // Emit event for other components to adjust layout
    this.emit('warningBannerShown', {});
  }
  
  /**
   * Update component after state changes
   */
  update() {
    if (this.headerElement) {
      // Update theme class
      this.headerElement.className = `header-component theme-${this.state.currentTheme}`;
      
      // Update warning banner visibility
      if (this.warningBanner) {
        if (this.state.isWarningVisible) {
          this.warningBanner.classList.remove('hidden');
        } else {
          this.warningBanner.classList.add('hidden');
        }
      }
    } else {
      // If critical elements don't exist, re-render
      this.render();
    }
  }
  
  /**
   * Set a new title
   * @param {string} title - New title text
   */
  setTitle(title) {
    this.state.options.title = title;
    const titleElement = this.container.querySelector('.title');
    if (titleElement) {
      // Update just the text, preserving the badge
      const badge = titleElement.querySelector('.title-badge');
      if (badge) {
        titleElement.innerHTML = `${title} `;
        titleElement.appendChild(badge);
      } else {
        titleElement.textContent = title;
      }
    } else {
      // Re-render if title element doesn't exist
      this.render();
    }
  }
  
  /**
   * Set a new subtitle
   * @param {string} subtitle - New subtitle text
   */
  setSubtitle(subtitle) {
    this.state.options.subtitle = subtitle;
    const subtitleElement = this.container.querySelector('.subtitle');
    if (subtitleElement) {
      subtitleElement.textContent = subtitle;
    } else {
      this.render();
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