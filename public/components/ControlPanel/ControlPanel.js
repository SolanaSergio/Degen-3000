/**
 * ControlPanel.js
 * 
 * Control panel component for DEGEN ROAST 3000
 * Manages theme selection, stonks mode, and various app settings
 */
class ControlPanel extends ComponentBase {
  /**
   * Create a new ControlPanel component
   * @param {string} containerId - ID of the container element
   * @param {Object} options - Component options
   */
  constructor(containerId, options = {}) {
    // Default options
    const defaultOptions = {
      showThemeSelector: true,
      showStonksMode: true,
      showAiMode: true,
      showSettingsSection: true,
      defaultTheme: 'crypto',
      availableThemes: ['crypto', 'hacker', 'gamer', 'meme'],
      themeLabels: {
        crypto: 'Crypto Bro',
        hacker: 'l33t h4x0r',
        gamer: 'Pro Gamer',
        meme: 'Meme Lord'
      }
    };
    
    // Initialize base component with merged options and initial state
    super(containerId, {
      options: { ...defaultOptions, ...options },
      currentTheme: typeof ThemeManager !== 'undefined' ? 
        ThemeManager.getCurrentTheme() : options.defaultTheme || defaultOptions.defaultTheme,
      isStonksModeActive: false,
      isAiModeAdvanced: false,
      settingsExpanded: false,
      showDebugInfo: false,
      soundEnabled: true,
      notificationsEnabled: true,
      animationsEnabled: true
    });
    
    // Initialize component
    this.init();
  }
  
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
  }
  
  /**
   * Load saved preferences from localStorage
   */
  loadSavedPreferences() {
    // Load saved theme
    if (localStorage.getItem('theme')) {
      this.setState({ currentTheme: localStorage.getItem('theme') });
    }
    
    // Load stonks mode state
    if (localStorage.getItem('stonksMode') === 'true') {
      this.setState({ isStonksModeActive: true });
    }
    
    // Load AI mode state
    if (localStorage.getItem('aiModeAdvanced') === 'true') {
      this.setState({ isAiModeAdvanced: true });
    }
    
    // Load sound state
    if (localStorage.getItem('soundEnabled') === 'false') {
      this.setState({ soundEnabled: false });
    }
    
    // Load notifications state
    if (localStorage.getItem('notificationsEnabled') === 'false') {
      this.setState({ notificationsEnabled: false });
    }
    
    // Load animations state
    if (localStorage.getItem('animationsEnabled') === 'false') {
      this.setState({ animationsEnabled: false });
    }
    
    // Load debug state
    if (localStorage.getItem('showDebugInfo') === 'true') {
      this.setState({ showDebugInfo: true });
    }
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for external theme changes
    if (typeof EventBus !== 'undefined') {
      this.on('themeChanged', (data) => {
        if (data.source !== 'controlPanel') {
          this.setState({ currentTheme: data.theme });
        }
      });
      
      // Listen for external stonks mode changes
      this.on('stonksModeToggled', (data) => {
        if (data.source !== 'controlPanel') {
          this.setState({ isStonksModeActive: data.enabled });
        }
      });
      
      // Listen for external AI mode changes
      this.on('aiModeChanged', (data) => {
        if (data.source !== 'controlPanel') {
          this.setState({ isAiModeAdvanced: data.advanced });
        }
      });
    }
  }
  
  /**
   * Render the component
   */
  render() {
    const {
      currentTheme,
      isStonksModeActive,
      isAiModeAdvanced,
      settingsExpanded,
      showDebugInfo,
      soundEnabled,
      notificationsEnabled,
      animationsEnabled
    } = this.state;
    
    const {
      showThemeSelector,
      showStonksMode,
      showAiMode,
      showSettingsSection,
      availableThemes,
      themeLabels
    } = this.state.options;
    
    // Generate HTML
    this.container.innerHTML = `
      <div class="control-panel-component theme-${currentTheme} ${isStonksModeActive ? 'stonks-mode' : ''}">
        <div class="control-panel-header">
          <h3 class="control-panel-title">Control Panel</h3>
          <div class="control-panel-actions">
            ${showSettingsSection ? `
              <button class="settings-toggle-button" id="settings-toggle">
                ⚙️ ${settingsExpanded ? 'Hide Settings' : 'Settings'}
              </button>
            ` : ''}
          </div>
        </div>
        
        <div class="control-panel-content">
          ${showThemeSelector ? `
            <div class="control-section theme-section">
              <h4 class="section-title">Theme</h4>
              <div class="theme-options">
                ${availableThemes.map(theme => `
                  <button class="theme-button ${theme === currentTheme ? 'active' : ''}" 
                    data-theme="${theme}" title="${themeLabels[theme] || theme}">
                    <span class="theme-icon">${this.getThemeIcon(theme)}</span>
                    <span class="theme-name">${themeLabels[theme] || theme}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          <div class="control-section mode-section">
            ${showStonksMode ? `
              <div class="mode-toggle">
                <label class="switch">
                  <input type="checkbox" id="stonks-mode-toggle" ${isStonksModeActive ? 'checked' : ''}>
                  <span class="slider"></span>
                </label>
                <span class="mode-label">Stonks Mode ${isStonksModeActive ? '📈' : '📉'}</span>
              </div>
            ` : ''}
            
            ${showAiMode ? `
              <div class="mode-toggle">
                <label class="switch">
                  <input type="checkbox" id="ai-mode-toggle" ${isAiModeAdvanced ? 'checked' : ''}>
                  <span class="slider"></span>
                </label>
                <span class="mode-label">Advanced AI Mode ${isAiModeAdvanced ? '🧠' : '🤖'}</span>
              </div>
            ` : ''}
          </div>
          
          ${showSettingsSection ? `
            <div class="control-section settings-section ${settingsExpanded ? 'expanded' : 'collapsed'}">
              <h4 class="section-title">Settings</h4>
              
              <div class="setting-toggle">
                <label class="switch">
                  <input type="checkbox" id="sound-toggle" ${soundEnabled ? 'checked' : ''}>
                  <span class="slider"></span>
                </label>
                <span class="setting-label">Sound Effects ${soundEnabled ? '🔊' : '🔇'}</span>
              </div>
              
              <div class="setting-toggle">
                <label class="switch">
                  <input type="checkbox" id="notifications-toggle" ${notificationsEnabled ? 'checked' : ''}>
                  <span class="slider"></span>
                </label>
                <span class="setting-label">Notifications ${notificationsEnabled ? '🔔' : '🔕'}</span>
              </div>
              
              <div class="setting-toggle">
                <label class="switch">
                  <input type="checkbox" id="animations-toggle" ${animationsEnabled ? 'checked' : ''}>
                  <span class="slider"></span>
                </label>
                <span class="setting-label">Animations ${animationsEnabled ? '✨' : '❌'}</span>
              </div>
              
              <div class="setting-toggle">
                <label class="switch">
                  <input type="checkbox" id="debug-toggle" ${showDebugInfo ? 'checked' : ''}>
                  <span class="slider"></span>
                </label>
                <span class="setting-label">Debug Info ${showDebugInfo ? '🐞' : '👁️‍🗨️'}</span>
              </div>
              
              <div class="setting-actions">
                <button class="reset-button" id="reset-settings">
                  🔄 Reset Settings
                </button>
              </div>
            </div>
          ` : ''}
        </div>
        
        ${showDebugInfo ? `
          <div class="debug-info">
            <div class="debug-title">Debug Information</div>
            <div class="debug-item">Theme: ${currentTheme}</div>
            <div class="debug-item">Stonks Mode: ${isStonksModeActive}</div>
            <div class="debug-item">AI Mode: ${isAiModeAdvanced ? 'Advanced' : 'Basic'}</div>
            <div class="debug-item">Settings Expanded: ${settingsExpanded}</div>
            <div class="debug-item">localStorage items: ${Object.keys(localStorage).length}</div>
          </div>
        ` : ''}
      </div>
    `;
    
    // Set up DOM event listeners
    this.setupDomEventListeners();
    
    // Mark as rendered
    this.rendered = true;
  }
  
  /**
   * Set up DOM event listeners
   */
  setupDomEventListeners() {
    // Theme buttons
    const themeButtons = this.container.querySelectorAll('.theme-button');
    themeButtons.forEach(button => {
      this.addListener(button, 'click', () => {
        const theme = button.getAttribute('data-theme');
        this.setTheme(theme);
      });
    });
    
    // Stonks mode toggle
    const stonksModeToggle = this.container.querySelector('#stonks-mode-toggle');
    if (stonksModeToggle) {
      this.addListener(stonksModeToggle, 'change', () => {
        this.toggleStonksMode(stonksModeToggle.checked);
      });
    }
    
    // AI mode toggle
    const aiModeToggle = this.container.querySelector('#ai-mode-toggle');
    if (aiModeToggle) {
      this.addListener(aiModeToggle, 'change', () => {
        this.toggleAiMode(aiModeToggle.checked);
      });
    }
    
    // Settings toggle button
    const settingsToggle = this.container.querySelector('#settings-toggle');
    if (settingsToggle) {
      this.addListener(settingsToggle, 'click', () => {
        this.toggleSettings();
      });
    }
    
    // Sound toggle
    const soundToggle = this.container.querySelector('#sound-toggle');
    if (soundToggle) {
      this.addListener(soundToggle, 'change', () => {
        this.toggleSound(soundToggle.checked);
      });
    }
    
    // Notifications toggle
    const notificationsToggle = this.container.querySelector('#notifications-toggle');
    if (notificationsToggle) {
      this.addListener(notificationsToggle, 'change', () => {
        this.toggleNotifications(notificationsToggle.checked);
      });
    }
    
    // Animations toggle
    const animationsToggle = this.container.querySelector('#animations-toggle');
    if (animationsToggle) {
      this.addListener(animationsToggle, 'change', () => {
        this.toggleAnimations(animationsToggle.checked);
      });
    }
    
    // Debug toggle
    const debugToggle = this.container.querySelector('#debug-toggle');
    if (debugToggle) {
      this.addListener(debugToggle, 'change', () => {
        this.toggleDebug(debugToggle.checked);
      });
    }
    
    // Reset settings button
    const resetButton = this.container.querySelector('#reset-settings');
    if (resetButton) {
      this.addListener(resetButton, 'click', () => {
        this.resetSettings();
      });
    }
  }
  
  /**
   * Get icon for a theme
   * @param {string} theme - Theme name
   * @returns {string} - Emoji icon for theme
   */
  getThemeIcon(theme) {
    const icons = {
      crypto: '💰',
      hacker: '👨‍💻',
      gamer: '🎮',
      meme: '🤣'
    };
    
    return icons[theme] || '🎨';
  }
  
  /**
   * Set active theme
   * @param {string} theme - Theme name
   */
  setTheme(theme) {
    if (this.state.options.availableThemes.includes(theme)) {
      // Update state
      this.setState({ currentTheme: theme });
      
      // Save preference
      localStorage.setItem('theme', theme);
      
      // Emit theme changed event
      this.emit('themeChanged', { theme, source: 'controlPanel' });
      
      // Play sound
      this.playSound('select');
    }
  }
  
  /**
   * Toggle stonks mode
   * @param {boolean} enabled - Whether stonks mode is enabled
   */
  toggleStonksMode(enabled) {
    // Update state
    this.setState({ isStonksModeActive: enabled });
    
    // Save preference
    localStorage.setItem('stonksMode', enabled);
    
    // Emit event
    this.emit('stonksModeToggled', { enabled, source: 'controlPanel' });
    
    // Play sound
    this.playSound(enabled ? 'stonks' : 'notStonks');
  }
  
  /**
   * Toggle AI mode
   * @param {boolean} advanced - Whether advanced AI mode is enabled
   */
  toggleAiMode(advanced) {
    // Update state
    this.setState({ isAiModeAdvanced: advanced });
    
    // Save preference
    localStorage.setItem('aiModeAdvanced', advanced);
    
    // Emit event
    this.emit('aiModeChanged', { advanced, source: 'controlPanel' });
    
    // Play sound
    this.playSound('select');
  }
  
  /**
   * Toggle settings section visibility
   */
  toggleSettings() {
    this.setState({ settingsExpanded: !this.state.settingsExpanded });
    this.playSound('select');
  }
  
  /**
   * Toggle sound effects
   * @param {boolean} enabled - Whether sound is enabled
   */
  toggleSound(enabled) {
    // Update state
    this.setState({ soundEnabled: enabled });
    
    // Save preference
    localStorage.setItem('soundEnabled', enabled);
    
    // Emit event
    this.emit('soundEnabledChanged', { enabled, source: 'controlPanel' });
    
    // Play sound
    if (enabled) {
      this.playSound('select');
    }
  }
  
  /**
   * Toggle notifications
   * @param {boolean} enabled - Whether notifications are enabled
   */
  toggleNotifications(enabled) {
    // Update state
    this.setState({ notificationsEnabled: enabled });
    
    // Save preference
    localStorage.setItem('notificationsEnabled', enabled);
    
    // Emit event
    this.emit('notificationsEnabledChanged', { enabled, source: 'controlPanel' });
    
    // Play sound
    this.playSound('select');
  }
  
  /**
   * Toggle animations
   * @param {boolean} enabled - Whether animations are enabled
   */
  toggleAnimations(enabled) {
    // Update state
    this.setState({ animationsEnabled: enabled });
    
    // Save preference
    localStorage.setItem('animationsEnabled', enabled);
    
    // Emit event
    this.emit('animationsEnabledChanged', { enabled, source: 'controlPanel' });
    
    // Add or remove no-animations class from body
    if (enabled) {
      document.body.classList.remove('no-animations');
    } else {
      document.body.classList.add('no-animations');
    }
    
    // Play sound
    this.playSound('select');
  }
  
  /**
   * Toggle debug info
   * @param {boolean} enabled - Whether debug info is shown
   */
  toggleDebug(enabled) {
    // Update state
    this.setState({ showDebugInfo: enabled });
    
    // Save preference
    localStorage.setItem('showDebugInfo', enabled);
    
    // Emit event
    this.emit('debugInfoToggled', { enabled, source: 'controlPanel' });
    
    // Play sound
    this.playSound('select');
  }
  
  /**
   * Reset all settings to defaults
   */
  resetSettings() {
    // Confirm reset
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      // Clear localStorage except for critical items
      const criticalItems = [];
      const itemsToKeep = {};
      
      // Save critical items
      criticalItems.forEach(key => {
        if (localStorage.getItem(key)) {
          itemsToKeep[key] = localStorage.getItem(key);
        }
      });
      
      // Clear localStorage
      localStorage.clear();
      
      // Restore critical items
      Object.keys(itemsToKeep).forEach(key => {
        localStorage.setItem(key, itemsToKeep[key]);
      });
      
      // Reset state to defaults
      this.setState({
        currentTheme: this.state.options.defaultTheme,
        isStonksModeActive: false,
        isAiModeAdvanced: false,
        soundEnabled: true,
        notificationsEnabled: true,
        animationsEnabled: true,
        showDebugInfo: false
      });
      
      // Update UI
      this.render();
      
      // Emit reset event
      this.emit('settingsReset', { source: 'controlPanel' });
      
      // Emit individual events for each setting
      this.emit('themeChanged', { theme: this.state.options.defaultTheme, source: 'controlPanel' });
      this.emit('stonksModeToggled', { enabled: false, source: 'controlPanel' });
      this.emit('aiModeChanged', { advanced: false, source: 'controlPanel' });
      this.emit('soundEnabledChanged', { enabled: true, source: 'controlPanel' });
      this.emit('notificationsEnabledChanged', { enabled: true, source: 'controlPanel' });
      this.emit('animationsEnabledChanged', { enabled: true, source: 'controlPanel' });
      
      // Remove no-animations class
      document.body.classList.remove('no-animations');
      
      // Play sound
      this.playSound('levelUp');
    }
  }
  
  /**
   * Play a sound
   * @param {string} soundId - ID of sound to play
   */
  playSound(soundId) {
    if (this.state.soundEnabled) {
      this.emit('playSound', { sound: soundId });
    }
  }
  
  /**
   * Update component after state changes
   */
  update() {
    if (this.rendered) {
      this.render();
    }
  }
}

// Make sure the component is available globally
if (typeof window !== 'undefined') {
  window.ControlPanel = ControlPanel;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ControlPanel;
} 