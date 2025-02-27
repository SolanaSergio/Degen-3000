/**
 * ThemeManager.js
 * 
 * A utility for managing themes in the application.
 * Provides methods for changing and persisting theme settings.
 */

class ThemeManagerClass {
  constructor() {
    this.currentTheme = 'crypto'; // Default theme
    this.availableThemes = ['crypto', 'hacker', 'gamer', 'meme'];
    this.initialized = false;
    
    console.log('ThemeManager created');
  }
  
  /**
   * Initialize the ThemeManager
   * @param {Object} options - Configuration options
   * @param {string} options.defaultTheme - Default theme to use
   * @param {Array<string>} options.themes - Available themes
   */
  init(options = {}) {
    // Set available themes
    if (options.themes && Array.isArray(options.themes)) {
      this.availableThemes = options.themes;
    }
    
    // Set default theme
    if (options.defaultTheme && this.availableThemes.includes(options.defaultTheme)) {
      this.currentTheme = options.defaultTheme;
    }
    
    // Try to load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && this.availableThemes.includes(savedTheme)) {
      this.currentTheme = savedTheme;
    }
    
    // Apply current theme to document
    this.applyTheme(this.currentTheme);
    
    // Mark as initialized
    this.initialized = true;
    
    console.log(`ThemeManager initialized with theme: ${this.currentTheme}`);
    
    return this;
  }
  
  /**
   * Get current theme
   * @returns {string} Current theme name
   */
  getCurrentTheme() {
    return this.currentTheme;
  }
  
  /**
   * Get all available themes
   * @returns {Array<string>} Available themes
   */
  getAvailableThemes() {
    return [...this.availableThemes];
  }
  
  /**
   * Apply a theme
   * @param {string} theme - Theme to apply
   * @returns {boolean} Whether the theme was applied successfully
   */
  applyTheme(theme) {
    // Validate theme
    if (!this.availableThemes.includes(theme)) {
      console.error(`Theme "${theme}" is not available. Available themes: ${this.availableThemes.join(', ')}`);
      return false;
    }
    
    // Remove all theme classes from body
    document.body.classList.remove(...this.availableThemes.map(t => `theme-${t}`));
    
    // Add the new theme class
    document.body.classList.add(`theme-${theme}`);
    
    // Update current theme
    this.currentTheme = theme;
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    
    // Publish theme change event
    if (typeof EventBus !== 'undefined') {
      EventBus.publish('themeChanged', {
        theme,
        source: 'ThemeManager'
      });
    }
    
    console.log(`Theme changed to: ${theme}`);
    
    return true;
  }
  
  /**
   * Toggle between light and dark mode
   * @returns {string} New theme name
   */
  toggleLightDark() {
    // Define light/dark pairs
    const themePairs = {
      'crypto': 'crypto-dark',
      'crypto-dark': 'crypto',
      'hacker': 'hacker-dark',
      'hacker-dark': 'hacker',
      'gamer': 'gamer-dark',
      'gamer-dark': 'gamer',
      'meme': 'meme-dark',
      'meme-dark': 'meme'
    };
    
    // Get the paired theme or default to current
    const newTheme = themePairs[this.currentTheme] || this.currentTheme;
    
    // Apply the new theme
    this.applyTheme(newTheme);
    
    return newTheme;
  }
  
  /**
   * Reset theme to default
   * @returns {string} Default theme name
   */
  resetToDefault() {
    const defaultTheme = 'crypto';
    this.applyTheme(defaultTheme);
    return defaultTheme;
  }
}

// Create a global ThemeManager instance
const ThemeManager = new ThemeManagerClass();

// Make sure it's available globally
if (typeof window !== 'undefined') {
  window.ThemeManager = ThemeManager;
}

// Auto-initialize on load if EventBus is available
document.addEventListener('DOMContentLoaded', () => {
  if (!ThemeManager.initialized) {
    ThemeManager.init();
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
} 