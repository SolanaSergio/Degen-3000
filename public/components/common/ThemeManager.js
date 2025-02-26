/**
 * ThemeManager.js
 * 
 * Handles theme switching and management for the DEGEN ROAST 3000 application.
 * Maintains theme state and applies theme-specific CSS variables and classes.
 */

class ThemeManagerClass {
  constructor() {
    // Available themes
    this.availableThemes = ['crypto', 'hacker', 'gamer', 'meme'];
    
    // Default theme
    this.defaultTheme = 'crypto';
    
    // Current theme
    this.currentTheme = this.defaultTheme;
    
    // Root element for applying theme class
    this.rootElement = document.body;
    
    // Initialize
    this.init();
    
    console.log('ThemeManager initialized');
  }
  
  /**
   * Initialize the theme manager
   */
  init() {
    // Load saved theme from localStorage if available
    const savedTheme = localStorage.getItem('degenTheme');
    if (savedTheme && this.availableThemes.includes(savedTheme)) {
      this.currentTheme = savedTheme;
    }
    
    // Apply the current theme
    this.applyTheme(this.currentTheme, false);
  }
  
  /**
   * Get the current theme
   * @returns {string} - Current theme name
   */
  getCurrentTheme() {
    return this.currentTheme;
  }
  
  /**
   * Get all available themes
   * @returns {Array<string>} - Array of theme names
   */
  getAvailableThemes() {
    return [...this.availableThemes];
  }
  
  /**
   * Set the root element for theme application
   * @param {HTMLElement} element - Root element (default: document.body)
   */
  setRootElement(element) {
    if (element instanceof HTMLElement) {
      this.rootElement = element;
      // Re-apply current theme to new root
      this.applyTheme(this.currentTheme, false);
    } else {
      console.error('ThemeManager: Invalid root element');
    }
  }
  
  /**
   * Apply a theme
   * @param {string} themeName - Name of the theme to apply
   * @param {boolean} savePreference - Whether to save the theme preference
   * @returns {boolean} - Whether the theme was successfully applied
   */
  applyTheme(themeName, savePreference = true) {
    // Validate theme name
    if (!this.availableThemes.includes(themeName)) {
      console.error(`ThemeManager: Unknown theme "${themeName}"`);
      return false;
    }
    
    // Remove any existing theme classes
    this.availableThemes.forEach(theme => {
      this.rootElement.classList.remove(`theme-${theme}`);
    });
    
    // Add the new theme class
    this.rootElement.classList.add(`theme-${themeName}`);
    
    // Update current theme
    this.currentTheme = themeName;
    
    // Save preference if requested
    if (savePreference) {
      localStorage.setItem('degenTheme', themeName);
    }
    
    // Notify any listeners if EventBus is available
    if (typeof EventBus !== 'undefined') {
      EventBus.publish('themeChanged', {
        theme: themeName,
        previousTheme: this.currentTheme
      });
    }
    
    console.log(`ThemeManager: Applied theme "${themeName}"`);
    return true;
  }
  
  /**
   * Get the CSS variable value for the current theme
   * @param {string} variableName - CSS variable name (without --) 
   * @returns {string} - CSS variable value or empty string if not found
   */
  getThemeVariable(variableName) {
    // Get computed styles
    const styles = getComputedStyle(this.rootElement);
    
    // Get variable value
    return styles.getPropertyValue(`--${variableName}`).trim();
  }
  
  /**
   * Set a CSS variable value
   * @param {string} variableName - CSS variable name (without --)
   * @param {string} value - Value to set
   */
  setThemeVariable(variableName, value) {
    this.rootElement.style.setProperty(`--${variableName}`, value);
  }
  
  /**
   * Toggle between dark and light mode
   * @param {boolean} isDark - Whether to set dark mode (true) or light mode (false)
   * @param {boolean} savePreference - Whether to save the preference
   */
  setDarkMode(isDark, savePreference = true) {
    // Toggle dark mode class
    if (isDark) {
      this.rootElement.classList.add('dark-mode');
    } else {
      this.rootElement.classList.remove('dark-mode');
    }
    
    // Save preference if requested
    if (savePreference) {
      localStorage.setItem('degenDarkMode', isDark ? 'true' : 'false');
    }
    
    // Notify any listeners if EventBus is available
    if (typeof EventBus !== 'undefined') {
      EventBus.publish('darkModeChanged', { isDark });
    }
  }
  
  /**
   * Check if dark mode is enabled
   * @returns {boolean} - Whether dark mode is enabled
   */
  isDarkMode() {
    return this.rootElement.classList.contains('dark-mode');
  }
  
  /**
   * Reset to default theme
   */
  resetToDefault() {
    this.applyTheme(this.defaultTheme, true);
  }
}

// Create a singleton instance
const ThemeManager = new ThemeManagerClass();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
} 