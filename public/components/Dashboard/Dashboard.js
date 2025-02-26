/**
 * Dashboard.js
 * 
 * Main dashboard component for DEGEN ROAST 3000
 * Handles roast level, theme selection, and other settings
 */

class Dashboard extends ComponentBase {
  /**
   * Create a new Dashboard component
   * @param {string} containerId - ID of the container element
   * @param {Object} options - Component options
   */
  constructor(containerId, options = {}) {
    // Default options
    const defaultOptions = {
      initialLevel: 1,              // Initial roast level (1-5)
      maxLevel: 5,                  // Maximum roast level
      themes: [
        { id: 'crypto', name: 'Crypto' },
        { id: 'hacker', name: 'Hacker' },
        { id: 'gamer', name: 'Gamer' },
        { id: 'meme', name: 'Meme' }
      ],
      showVolumeControls: true,     // Show volume controls
      showResetButton: true,        // Show reset button
      showMemeGallery: false        // Meme gallery moved to separate component
    };
    
    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Initialize base component
    super(containerId, {
      currentLevel: mergedOptions.initialLevel,
      currentTheme: typeof ThemeManager !== 'undefined' ? ThemeManager.getCurrentTheme() : 'crypto',
      volume: localStorage.getItem('soundVolume') ? parseFloat(localStorage.getItem('soundVolume')) : 0.5,
      muted: localStorage.getItem('soundMuted') === 'true',
      options: mergedOptions
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
      
      // Listen for level changes
      this.on('levelChanged', (data) => {
        this.setState({ currentLevel: data.level });
      });
    }
  }
  
  /**
   * Render the component
   */
  render() {
    const { currentLevel, currentTheme, volume, muted } = this.state;
    const { maxLevel, themes, showVolumeControls, showResetButton } = this.state.options;
    
    // Generate HTML
    this.container.innerHTML = `
      <div class="dashboard-component theme-${currentTheme}">
        <div class="dashboard-section roast-section">
          <h3 class="section-title">ROAST LEVEL</h3>
          <div class="roast-meter">
            <div class="roast-meter-bar">
              <div class="roast-meter-fill" style="width: ${(currentLevel / maxLevel) * 100}%"></div>
              <div class="roast-level-indicators">
                ${this.generateLevelIndicators()}
              </div>
            </div>
            <div class="roast-level-text">
              Current Level: <span class="current-level">${currentLevel}</span>
            </div>
          </div>
        </div>
        
        <div class="dashboard-section settings-section">
          <h3 class="section-title">SETTINGS</h3>
          
          <div class="setting-group theme-selection">
            <label>Theme:</label>
            <div class="theme-buttons">
              ${themes.map(theme => `
                <button class="theme-button ${theme.id === currentTheme ? 'active' : ''}" 
                  data-theme="${theme.id}">
                  ${theme.name}
                </button>
              `).join('')}
            </div>
          </div>
          
          ${showVolumeControls ? `
            <div class="setting-group volume-control">
              <label>Volume:</label>
              <input type="range" class="volume-slider" min="0" max="1" step="0.1" value="${volume}">
              <button class="mute-toggle ${muted ? 'muted' : ''}">
                ${muted ? '🔇' : '🔊'}
              </button>
            </div>
          ` : ''}
          
          ${showResetButton ? `
            <div class="setting-group">
              <button class="reset-button">Reset Progress</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
    
    // Cache DOM elements
    this.dashboardElement = this.container.querySelector('.dashboard-component');
    this.levelIndicators = this.container.querySelectorAll('.level-indicator');
    this.currentLevelText = this.container.querySelector('.current-level');
    this.roastMeterFill = this.container.querySelector('.roast-meter-fill');
    this.themeButtons = this.container.querySelectorAll('.theme-button');
    this.volumeSlider = this.container.querySelector('.volume-slider');
    this.muteToggle = this.container.querySelector('.mute-toggle');
    this.resetButton = this.container.querySelector('.reset-button');
    
    // Set up DOM event listeners
    this.setupDomListeners();
    
    // Mark as rendered
    this.rendered = true;
  }
  
  /**
   * Set up DOM event listeners
   */
  setupDomListeners() {
    // Add listeners for level indicators
    if (this.levelIndicators) {
      this.levelIndicators.forEach(indicator => {
        this.addListener(indicator, 'click', () => {
          const level = parseInt(indicator.dataset.level, 10);
          this.setLevel(level);
        });
      });
    }
    
    // Add listeners for theme buttons
    if (this.themeButtons) {
      this.themeButtons.forEach(button => {
        this.addListener(button, 'click', () => {
          const theme = button.dataset.theme;
          this.setTheme(theme);
        });
      });
    }
    
    // Add listeners for volume controls
    if (this.volumeSlider) {
      this.addListener(this.volumeSlider, 'input', (event) => {
        const volume = parseFloat(event.target.value);
        this.setVolume(volume);
      });
    }
    
    if (this.muteToggle) {
      this.addListener(this.muteToggle, 'click', () => {
        this.toggleMute();
      });
    }
    
    // Add listener for reset button
    if (this.resetButton) {
      this.addListener(this.resetButton, 'click', () => {
        this.resetSession();
      });
    }
  }
  
  /**
   * Handle theme change
   * @param {Event} event - Click event
   */
  handleThemeChange(event) {
    const theme = event.target.dataset.theme;
    if (!theme) return;
    
    // Update theme if ThemeManager is available
    if (typeof ThemeManager !== 'undefined') {
      ThemeManager.applyTheme(theme);
    }
    
    // Update active state of buttons
    const buttons = this.container.querySelectorAll('.theme-button');
    buttons.forEach(btn => {
      btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    // Play sound if available
    if (typeof playSound === 'function') {
      playSound('themeChange');
    }
  }
  
  /**
   * Handle level change
   * @param {Event} event - Click event
   */
  handleLevelChange(event) {
    const level = parseInt(event.target.dataset.level, 10);
    if (isNaN(level) || level < 1 || level > this.state.options.maxLevel) return;
    
    // Update state
    this.setState({ currentLevel: level });
    
    // Emit level change event
    this.emit('levelChanged', { level });
    
    // Play sound if available
    if (typeof playSound === 'function') {
      playSound('click');
    }
  }
  
  /**
   * Handle reset button click
   */
  handleReset() {
    // Reset to level 1
    this.setState({ currentLevel: 1 });
    
    // Emit events for app to handle
    this.emit('levelChanged', { level: 1 });
    this.emit('clearChat', {});
    
    // Play sound if available
    if (typeof playSound === 'function') {
      playSound('reset');
    }
  }
  
  /**
   * Handle volume slider change
   * @param {Event} event - Input event
   */
  handleVolumeChange(event) {
    const volume = parseFloat(event.target.value);
    
    // Update state
    this.setState({ volume });
    
    // Save to localStorage
    localStorage.setItem('soundVolume', volume.toString());
    
    // Update global volume if soundboard is available
    if (window.soundboard && typeof window.soundboard.setVolume === 'function') {
      window.soundboard.setVolume(volume);
    }
  }
  
  /**
   * Handle mute toggle
   */
  handleMuteToggle() {
    // Toggle mute state
    const newMutedState = !this.state.muted;
    
    // Update state
    this.setState({ muted: newMutedState });
    
    // Save to localStorage
    localStorage.setItem('soundMuted', newMutedState.toString());
    
    // Update mute button styles
    if (this.muteToggle) {
      this.muteToggle.classList.toggle('muted', newMutedState);
      this.muteToggle.textContent = newMutedState ? '🔇' : '🔊';
    }
    
    // Update global mute if soundboard is available
    if (window.soundboard && typeof window.soundboard.toggleMute === 'function') {
      window.soundboard.toggleMute();
    }
  }
  
  /**
   * Handle meme icon click
   * @param {Event} event - Click event
   */
  handleMemeClick(event) {
    const memeType = event.target.dataset.meme;
    if (!memeType) return;
    
    // Emit meme selected event
    this.emit('memeSelected', { meme: memeType });
    
    // Add visual feedback
    event.target.classList.add('selected');
    setTimeout(() => {
      event.target.classList.remove('selected');
    }, 500);
    
    // Play sound if available
    if (typeof playSound === 'function') {
      playSound('click');
    }
  }
  
  /**
   * Render level indicators
   * @returns {string} - HTML for level indicators
   */
  generateLevelIndicators() {
    let html = '';
    
    for (let i = 1; i <= this.state.options.maxLevel; i++) {
      const isActive = i <= this.state.currentLevel;
      html += `
        <div class="level-indicator ${isActive ? 'active' : ''}" data-level="${i}">
          ${i}
        </div>
      `;
    }
    
    return html;
  }
  
  /**
   * Set the roast level
   * @param {number} level - New roast level (1-5)
   */
  setLevel(level) {
    if (level < 1 || level > this.state.options.maxLevel) return;
    
    // Update state
    this.setState({ currentLevel: level });
    
    // Update UI directly for smoother transitions
    if (this.currentLevelText) {
      this.currentLevelText.textContent = level;
    }
    
    if (this.roastMeterFill) {
      this.roastMeterFill.style.width = `${level * 20}%`;
    }
    
    // Update active class on level indicators
    const indicators = this.container.querySelectorAll('.level-indicator');
    indicators.forEach(indicator => {
      const indicatorLevel = parseInt(indicator.dataset.level, 10);
      indicator.classList.toggle('active', indicatorLevel <= level);
    });
  }
  
  /**
   * Get current roast level
   * @returns {number} - Current roast level
   */
  getLevel() {
    return this.state.currentLevel;
  }
  
  /**
   * Update component after state changes
   */
  update() {
    // If we have the level elements, update them directly
    if (this.currentLevelText && this.roastMeterFill) {
      this.currentLevelText.textContent = this.state.currentLevel;
      this.roastMeterFill.style.width = `${this.state.currentLevel * 20}%`;
      
      // Update active class on level indicators
      const indicators = this.container.querySelectorAll('.level-indicator');
      indicators.forEach(indicator => {
        const level = parseInt(indicator.dataset.level, 10);
        indicator.classList.toggle('active', level <= this.state.currentLevel);
      });
      
      // Update theme on container
      if (this.dashboardElement) {
        // Remove all theme classes
        this.state.options.themes.forEach(theme => {
          this.dashboardElement.classList.remove(`theme-${theme.id}`);
        });
        
        // Add current theme class
        this.dashboardElement.classList.add(`theme-${this.state.currentTheme}`);
      }
      
      // Update active state on theme buttons
      const themeButtons = this.container.querySelectorAll('.theme-button');
      themeButtons.forEach(button => {
        button.classList.toggle('active', button.dataset.theme === this.state.currentTheme);
      });
    } else {
      // If elements don't exist, re-render
      this.render();
    }
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Dashboard;
} 