/**
 * Disclaimer.js
 * 
 * Disclaimer component for DEGEN ROAST 3000
 * Manages the footer disclaimer content
 */
class Disclaimer extends ComponentBase {
  /**
   * Create a new Disclaimer component
   * @param {string} containerId - ID of the container element
   * @param {Object} options - Component options
   */
  constructor(containerId, options = {}) {
    // Default options
    const defaultOptions = {
      disclaimerText: "🤖 AI-generated roasts are meant to be humorous and not taken seriously. If your self-esteem drops below zero, that's on you fam! 😅",
      showEmoji: true,
      animateOnStonksMode: true,
      showTermsLink: false,
      termsLinkText: "Terms of Use",
      termsUrl: "#"
    };
    
    // Initialize base component with merged options and initial state
    super(containerId, {
      options: { ...defaultOptions, ...options },
      currentTheme: typeof ThemeManager !== 'undefined' ? 
        ThemeManager.getCurrentTheme() : 'crypto',
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
    if (typeof EventBus !== 'undefined') {
      this.on('themeChanged', (data) => {
        this.setState({ currentTheme: data.theme });
      });
      
      // Listen for stonks mode changes
      this.on('stonksModeToggled', (data) => {
        this.setState({ isStonksModeActive: data.enabled });
      });
    }
  }
  
  /**
   * Render the component
   */
  render() {
    const { currentTheme, isStonksModeActive } = this.state;
    const { disclaimerText, showEmoji, showTermsLink, termsLinkText, termsUrl } = this.state.options;
    
    // Generate HTML
    this.container.innerHTML = `
      <div class="disclaimer-component theme-${currentTheme} ${isStonksModeActive ? 'stonks-mode' : ''}">
        <p>
          ${showEmoji ? '<span class="disclaimer-emoji">🤖</span>' : ''}
          ${disclaimerText}
        </p>
        ${showTermsLink ? `<a href="${termsUrl}" class="terms-link">${termsLinkText}</a>` : ''}
      </div>
    `;
    
    // Get references to key elements
    this.disclaimerElement = this.container.querySelector('.disclaimer-component');
    this.disclaimerText = this.container.querySelector('p');
    
    // Mark as rendered
    this.rendered = true;
  }
  
  /**
   * Update the disclaimer text
   * @param {string} text - New disclaimer text
   */
  setDisclaimerText(text) {
    this.state.options.disclaimerText = text;
    
    if (this.disclaimerText) {
      const emoji = this.state.options.showEmoji ? 
        '<span class="disclaimer-emoji">🤖</span>' : '';
      this.disclaimerText.innerHTML = `${emoji} ${text}`;
    } else {
      this.render();
    }
  }
  
  /**
   * Toggle emoji visibility
   * @param {boolean} [show] - Whether to show the emoji
   * @returns {boolean} New state
   */
  toggleEmoji(show = null) {
    // If show is provided, use it, otherwise toggle current state
    const showEmoji = show !== null ? show : !this.state.options.showEmoji;
    
    // Update state
    this.state.options.showEmoji = showEmoji;
    
    // Update disclaimer text
    if (this.disclaimerText) {
      const emoji = showEmoji ? '<span class="disclaimer-emoji">🤖</span>' : '';
      const currentText = this.state.options.disclaimerText;
      this.disclaimerText.innerHTML = `${emoji} ${currentText}`;
    }
    
    return showEmoji;
  }
  
  /**
   * Toggle terms link visibility
   * @param {boolean} [show] - Whether to show the terms link
   * @returns {boolean} New state
   */
  toggleTermsLink(show = null) {
    // If show is provided, use it, otherwise toggle current state
    const showTermsLink = show !== null ? show : !this.state.options.showTermsLink;
    
    // Update state
    this.state.options.showTermsLink = showTermsLink;
    
    // Re-render to update the terms link
    this.render();
    
    return showTermsLink;
  }
  
  /**
   * Update component after state changes
   */
  update() {
    if (this.disclaimerElement) {
      // Update theme class
      this.disclaimerElement.className = `disclaimer-component theme-${this.state.currentTheme}`;
      
      // Update stonks mode class
      if (this.state.isStonksModeActive && this.state.options.animateOnStonksMode) {
        this.disclaimerElement.classList.add('stonks-mode');
      } else {
        this.disclaimerElement.classList.remove('stonks-mode');
      }
    } else {
      // If critical elements don't exist, re-render
      this.render();
    }
  }
}

// Make sure the component is available globally
if (typeof window !== 'undefined') {
  window.Disclaimer = Disclaimer;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Disclaimer;
} 