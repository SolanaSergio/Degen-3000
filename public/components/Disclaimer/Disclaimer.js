/**
 * Disclaimer.js
 * 
 * Disclaimer component for DEGEN ROAST 3000
 * Displays footer disclaimer and legal text
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
      text: "DEGEN ROAST 3000 is entertainment only. Not financial advice. Investments may lose value. Memes may appreciate.",
      showEmoji: true,
      emoji: "🚨",
      showLinks: true,
      links: [
        { text: "Terms of Service", url: "#" },
        { text: "Privacy Policy", url: "#" }
      ]
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
    const { text, showEmoji, emoji, showLinks, links } = this.state.options;
    
    // Generate HTML
    this.container.innerHTML = `
      <div class="disclaimer-component theme-${currentTheme} ${isStonksModeActive ? 'stonks-mode' : ''}">
        <div class="disclaimer-content">
          <p class="disclaimer-text">
            ${showEmoji ? `<span class="disclaimer-emoji">${emoji}</span>` : ''}
            ${text}
          </p>
          
          ${showLinks && links.length > 0 ? `
            <div class="disclaimer-links">
              ${links.map(link => `
                <a href="${link.url}" class="disclaimer-link">${link.text}</a>
              `).join(' | ')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
    
    // Mark as rendered
    this.rendered = true;
  }
  
  /**
   * Update disclaimer text
   * @param {string} newText - New disclaimer text
   */
  setText(newText) {
    this.state.options.text = newText;
    
    // Update DOM if rendered
    if (this.rendered) {
      const textElement = this.container.querySelector('.disclaimer-text');
      if (textElement) {
        const emojiSpan = showEmoji ? `<span class="disclaimer-emoji">${this.state.options.emoji}</span>` : '';
        textElement.innerHTML = `${emojiSpan} ${newText}`;
      } else {
        this.render();
      }
    }
  }
  
  /**
   * Toggle emoji visibility
   * @param {boolean} [show] - Force specific state
   * @returns {boolean} New state
   */
  toggleEmoji(show) {
    const newState = show !== undefined ? show : !this.state.options.showEmoji;
    this.state.options.showEmoji = newState;
    
    // Update DOM if rendered
    if (this.rendered) {
      const textElement = this.container.querySelector('.disclaimer-text');
      if (textElement) {
        if (newState) {
          textElement.innerHTML = `<span class="disclaimer-emoji">${this.state.options.emoji}</span> ${this.state.options.text}`;
        } else {
          textElement.textContent = this.state.options.text;
        }
      } else {
        this.render();
      }
    }
    
    return newState;
  }
  
  /**
   * Update component when state changes
   */
  update() {
    if (this.rendered) {
      const disclaimer = this.container.querySelector('.disclaimer-component');
      if (disclaimer) {
        disclaimer.className = `disclaimer-component theme-${this.state.currentTheme} ${this.state.isStonksModeActive ? 'stonks-mode' : ''}`;
      } else {
        this.render();
      }
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