/**
 * Soundboard.js
 * 
 * Soundboard component for DEGEN ROAST 3000
 * Manages sound effects, playback, and volume controls
 */

class Soundboard extends ComponentBase {
  /**
   * Create a new Soundboard component
   * @param {string} containerId - ID of the container element
   * @param {Object} options - Component options
   */
  constructor(containerId, options = {}) {
    // Default options
    const defaultOptions = {
      initialVolume: 0.5,          // Initial volume (0-1)
      initialMuted: false,         // Initial muted state
      showControls: true,          // Show soundboard controls
      collapsible: true,           // Allow collapsing the soundboard
      autoPreload: ['click', 'send', 'receive', 'notification'] // Sounds to preload automatically
    };
    
    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Get stored volume and muted state
    const storedVolume = localStorage.getItem('soundVolume');
    const storedMuted = localStorage.getItem('soundMuted');
    
    // Initialize base component
    super(containerId, {
      volume: storedVolume ? parseFloat(storedVolume) : mergedOptions.initialVolume,
      muted: storedMuted ? storedMuted === 'true' : mergedOptions.initialMuted,
      collapsed: false,            // Whether the soundboard is collapsed
      currentTheme: typeof ThemeManager !== 'undefined' ? ThemeManager.getCurrentTheme() : 'crypto',
      options: mergedOptions,
      playingSound: null           // Currently playing sound effect
    });
    
    // Sound effects library
    this.sounds = {
      // UI sounds
      click: 'audio/click.mp3',
      notification: 'audio/notification.mp3',
      error: 'audio/error.mp3',
      send: 'audio/send.mp3',
      receive: 'audio/receive.mp3',
      themeChange: 'audio/themeChange.mp3',
      reset: 'audio/reset.mp3',
      
      // Level-up sounds
      levelup: 'audio/levelup.mp3',
      levelUp2: 'audio/levelup2.mp3',
      levelUp3: 'audio/levelup3.mp3',
      
      // Roast sounds
      roast: 'audio/roast.mp3',
      ouch: 'audio/ouch.mp3',
      damn: 'audio/damn.mp3',
      laugh: 'audio/laugh.mp3',
      
      // Meme soundboard (with suggested free sources)
      oof: 'audio/memes/oof.mp3',                     // Free from Freesound.org
      stonks: 'audio/memes/stonks.mp3',               // Free from Pixabay
      airhorn: 'audio/memes/airhorn.mp3',             // Free from Zapsplat
      sadviolin: 'audio/memes/sadviolin.mp3',         // Free from Freesound.org
      emotionalDamage: 'audio/memes/emotional_damage.mp3',  // Free from Pixabay
      helloDarkness: 'audio/memes/hello_darkness.mp3',      // Free from Freesound.org
      toBeContinued: 'audio/memes/to_be_continued.mp3',     // Free from Pixabay
      nope: 'audio/memes/nope.mp3'                    // Free from Zapsplat
    };
    
    // Audio cache for preloaded sounds
    this.audioCache = {};
    
    // Initialize component
    this.init();
    
    // Expose global play method
    window.playSound = this.play.bind(this);
  }
  
  /**
   * Initialize the component
   */
  init() {
    // Preload common sounds
    if (this.state.options.autoPreload && this.state.options.autoPreload.length > 0) {
      this.preloadSounds(this.state.options.autoPreload);
    }
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Render the component
    this.render();
    
    console.log('🔊 Soundboard component initialized');
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for theme changes
    if (typeof EventBus !== 'undefined') {
      this.on('themeChanged', (data) => {
        this.setState({ currentTheme: data.theme });
        this.play('themeChange');
      });
      
      // Listen for level changes
      this.on('levelChanged', (data) => {
        const newLevel = data.level;
        const oldLevel = data.oldLevel || 0;
        
        if (newLevel > oldLevel) {
          this.play('levelUp');
        }
      });
      
      // Listen for message events
      this.on('messageSent', () => {
        this.play('send');
      });
      
      this.on('botResponse', () => {
        this.play('receive');
      });
      
      // Listen for meme selection
      this.on('memeSelected', () => {
        this.play('click');
      });
      
      // Listen for clear chat
      this.on('clearChat', () => {
        this.play('reset');
      });
    }
  }
  
  /**
   * Render the component
   */
  render() {
    // Create the soundboard HTML
    this.container.innerHTML = `
      <div class="soundboard-component theme-${this.state.currentTheme}">
        <div class="soundboard-header">
          <h3 class="soundboard-title">
            <span class="soundboard-icon">🔊</span>
            Meme Soundboard
          </h3>
          ${this.state.options.collapsible ? `
            <button class="soundboard-toggle" type="button">
              ${this.state.collapsed ? '▼' : '▲'}
            </button>
          ` : ''}
        </div>
        
        <div class="soundboard-content ${this.state.collapsed ? 'collapsed' : ''}">
          <div class="soundboard-grid">
            ${this.renderSoundButtons()}
          </div>
          
          ${this.state.options.showControls ? `
            <div class="soundboard-controls">
              <div class="volume-control">
                <label for="${this.id}-volume">Volume:</label>
                <input 
                  type="range" 
                  id="${this.id}-volume" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value="${this.state.volume}"
                >
                <button class="mute-toggle ${this.state.muted ? 'muted' : ''}" type="button">
                  ${this.state.muted ? '🔇' : '🔊'}
                </button>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
    
    // Get important elements
    this.soundboardElement = this.container.querySelector('.soundboard-component');
    this.contentElement = this.container.querySelector('.soundboard-content');
    this.toggleButton = this.container.querySelector('.soundboard-toggle');
    this.volumeSlider = this.container.querySelector(`#${this.id}-volume`);
    this.muteButton = this.container.querySelector('.mute-toggle');
    
    // Set up element event handlers
    this.setupSoundboardEventListeners();
    
    // Mark as rendered
    this.rendered = true;
  }
  
  /**
   * Set up event handlers for soundboard elements
   */
  setupSoundboardEventListeners() {
    // Toggle button for collapsing/expanding
    if (this.toggleButton) {
      this.addListener(this.toggleButton, 'click', this.handleToggleCollapse);
    }
    
    // Volume controls
    if (this.volumeSlider) {
      this.addListener(this.volumeSlider, 'input', this.handleVolumeChange);
    }
    
    if (this.muteButton) {
      this.addListener(this.muteButton, 'click', this.handleMuteToggle);
    }
    
    // Sound buttons
    const soundButtons = this.container.querySelectorAll('.sound-button');
    soundButtons.forEach(button => {
      this.addListener(button, 'click', this.handleSoundButtonClick);
    });
  }
  
  /**
   * Render sound buttons
   * @returns {string} - HTML for sound buttons
   */
  renderSoundButtons() {
    // Filter for meme sounds only
    const memeSounds = [
      { key: 'oof', name: 'Oof' },
      { key: 'stonks', name: 'Stonks' },
      { key: 'airhorn', name: 'Airhorn' },
      { key: 'sadviolin', name: 'Sad Violin' },
      { key: 'emotionalDamage', name: 'Emotional Damage' },
      { key: 'helloDarkness', name: 'Hello Darkness' },
      { key: 'toBeContinued', name: 'To Be Continued' },
      { key: 'nope', name: 'Nope' },
      { key: 'laugh', name: 'Laugh' },
      { key: 'damn', name: 'Damn' }
    ];
    
    // Generate HTML for each sound button
    return memeSounds.map(sound => `
      <button 
        class="sound-button" 
        data-sound="${sound.key}" 
        type="button"
      >
        <span class="sound-icon">🔊</span>
        <span class="sound-name">${sound.name}</span>
      </button>
    `).join('');
  }
  
  /**
   * Handle collapse toggle
   */
  handleToggleCollapse() {
    // Toggle collapsed state
    this.setState({ collapsed: !this.state.collapsed });
    
    // Update toggle button text
    if (this.toggleButton) {
      this.toggleButton.textContent = this.state.collapsed ? '▼' : '▲';
    }
    
    // Update content class
    if (this.contentElement) {
      this.contentElement.classList.toggle('collapsed', this.state.collapsed);
    }
    
    // Play sound
    this.play('click');
  }
  
  /**
   * Handle volume change
   * @param {Event} event - Input event
   */
  handleVolumeChange(event) {
    const volume = parseFloat(event.target.value);
    
    // Update state
    this.setState({ volume });
    
    // Save to localStorage
    localStorage.setItem('soundVolume', volume.toString());
    
    // Play test sound if not muted
    if (!this.state.muted) {
      this.play('click');
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
    
    // Update button text
    if (this.muteButton) {
      this.muteButton.textContent = newMutedState ? '🔇' : '🔊';
      this.muteButton.classList.toggle('muted', newMutedState);
    }
    
    // Play test sound if unmuting
    if (!newMutedState) {
      this.play('click');
    }
    
    // Emit event for other components
    this.emit('soundMuteChanged', { muted: newMutedState });
  }
  
  /**
   * Handle sound button click
   * @param {Event} event - Click event
   */
  handleSoundButtonClick(event) {
    const button = event.currentTarget;
    const soundKey = button.dataset.sound;
    
    if (soundKey) {
      // Add playing class for animation
      button.classList.add('playing');
      
      // Remove class after animation completes
      setTimeout(() => {
        button.classList.remove('playing');
      }, 500);
      
      // Play the sound
      this.play(soundKey);
    }
  }
  
  /**
   * Preload sounds for better performance
   * @param {Array<string>} soundKeys - Array of sound keys to preload
   */
  preloadSounds(soundKeys) {
    soundKeys.forEach(key => {
      if (this.sounds[key]) {
        const audio = new Audio();
        audio.src = this.sounds[key];
        audio.volume = this.state.volume;
        this.audioCache[key] = audio;
      }
    });
  }
  
  /**
   * Play a sound effect
   * @param {string} soundKey - Key of the sound to play
   * @param {Object} options - Options for playback
   * @returns {HTMLAudioElement|null} - Audio element or null if muted/error
   */
  play(soundKey, options = {}) {
    // Don't play if muted
    if (this.state.muted) return null;
    
    // Get sound path
    const soundPath = this.sounds[soundKey];
    if (!soundPath) {
      console.warn(`Sound not found: ${soundKey}`);
      return null;
    }
    
    // Create options with defaults
    const opts = {
      volume: options.volume !== undefined ? options.volume : this.state.volume,
      loop: options.loop || false,
      rate: options.rate || 1.0
    };
    
    // Use cached audio or create new one
    let audio = this.audioCache[soundKey];
    if (!audio) {
      audio = new Audio(soundPath);
      
      // Store non-meme sounds in cache
      if (!soundKey.startsWith('meme_')) {
        this.audioCache[soundKey] = audio;
      }
    } else {
      // Reset cached audio
      audio.currentTime = 0;
    }
    
    // Apply options
    audio.volume = opts.volume;
    audio.loop = opts.loop;
    audio.playbackRate = opts.rate;
    
    // Play the sound
    audio.play().catch(error => {
      console.warn(`Error playing sound ${soundKey}:`, error.message);
    });
    
    // Store as currently playing for reference
    this.state.playingSound = audio;
    
    return audio;
  }
  
  /**
   * Set volume for all sounds
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  setVolume(volume) {
    // Validate and constrain volume
    const validVolume = Math.max(0, Math.min(1, volume));
    
    // Update state
    this.setState({ volume: validVolume });
    
    // Save to localStorage
    localStorage.setItem('soundVolume', validVolume.toString());
    
    // Update volume slider
    if (this.volumeSlider) {
      this.volumeSlider.value = validVolume;
    }
    
    // Update all cached audio
    Object.values(this.audioCache).forEach(audio => {
      audio.volume = validVolume;
    });
    
    // Return the set volume
    return validVolume;
  }
  
  /**
   * Toggle muted state
   * @returns {boolean} - New muted state
   */
  toggleMute() {
    // Call the handler
    this.handleMuteToggle();
    
    // Return new state
    return this.state.muted;
  }
  
  /**
   * Get the currently playing sound
   * @returns {HTMLAudioElement|null} - Currently playing audio element or null
   */
  getPlayingSound() {
    return this.state.playingSound;
  }
  
  /**
   * Stop all playing sounds
   */
  stopAllSounds() {
    Object.values(this.audioCache).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    
    this.state.playingSound = null;
  }
  
  /**
   * Update component after state changes
   */
  update() {
    // Update theme class
    if (this.soundboardElement) {
      // Remove all theme classes and add current one
      this.soundboardElement.className = `soundboard-component theme-${this.state.currentTheme}`;
    }
    
    // Update collapsed state
    if (this.contentElement) {
      this.contentElement.classList.toggle('collapsed', this.state.collapsed);
    }
    
    // Update toggle button
    if (this.toggleButton) {
      this.toggleButton.textContent = this.state.collapsed ? '▼' : '▲';
    }
    
    // Update volume slider
    if (this.volumeSlider) {
      this.volumeSlider.value = this.state.volume;
    }
    
    // Update mute button
    if (this.muteButton) {
      this.muteButton.textContent = this.state.muted ? '🔇' : '🔊';
      this.muteButton.classList.toggle('muted', this.state.muted);
    }
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Soundboard;
} 