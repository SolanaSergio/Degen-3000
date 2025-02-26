/**
 * DEGEN ROAST 3000 - Soundboard Component
 * This file manages sound effect playback and integration
 */

class SoundboardManager {
  constructor() {
    // Available sound effects
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
      levelup2: 'audio/levelup2.mp3',
      levelup3: 'audio/levelup3.mp3',
      
      // Meme sounds
      meme: 'audio/meme.mp3',
      ouch: 'audio/ouch.mp3',
      damn: 'audio/damn.mp3',
      laugh: 'audio/laugh.mp3',
      
      // Meme soundboard (placeholders - will replace with real files)
      oof: 'audio/memes/oof.mp3',
      stonks: 'audio/memes/stonks.mp3',
      airhorn: 'audio/memes/airhorn.mp3',
      sadviolin: 'audio/memes/sadviolin.mp3',
      emotional_damage: 'audio/memes/emotional_damage.mp3',
      hello_darkness: 'audio/memes/hello_darkness.mp3',
      to_be_continued: 'audio/memes/to_be_continued.mp3',
      nope: 'audio/memes/nope.mp3'
    };
    
    // Cache for preloaded audio
    this.audioCache = {};
    
    // Global volume
    this.volume = localStorage.getItem('soundVolume') ? 
      parseFloat(localStorage.getItem('soundVolume')) : 0.5;
    
    this.muted = localStorage.getItem('soundMuted') === 'true';
    
    // Initialize
    this.init();
  }
  
  /**
   * Initialize the soundboard
   */
  init() {
    // Preload common sounds
    this.preloadSounds(['click', 'notification', 'error', 'send', 'receive']);
    
    // Set up volume control
    const volumeSlider = document.getElementById('volume-slider');
    if (volumeSlider) {
      volumeSlider.value = this.volume;
      volumeSlider.addEventListener('input', (e) => {
        this.setVolume(parseFloat(e.target.value));
      });
    }
    
    // Setup mute toggle if it exists
    const muteButton = document.getElementById('mute-toggle');
    if (muteButton) {
      muteButton.classList.toggle('muted', this.muted);
      muteButton.addEventListener('click', () => {
        this.toggleMute();
        muteButton.classList.toggle('muted', this.muted);
      });
    }
    
    console.log('🔊 Soundboard initialized');
  }
  
  /**
   * Preload sounds for better performance
   * @param {Array} soundKeys - Array of sound keys to preload
   */
  preloadSounds(soundKeys) {
    soundKeys.forEach(key => {
      if (this.sounds[key]) {
        const audio = new Audio();
        audio.src = this.sounds[key];
        audio.volume = this.volume;
        this.audioCache[key] = audio;
      }
    });
  }
  
  /**
   * Play a sound effect
   * @param {string} soundKey - Key of the sound to play
   * @param {object} options - Options for playback
   */
  play(soundKey, options = {}) {
    if (this.muted) return;
    
    const soundPath = this.sounds[soundKey];
    if (!soundPath) {
      console.warn(`Sound not found: ${soundKey}`);
      return;
    }
    
    // Create options with defaults
    const opts = {
      volume: options.volume !== undefined ? options.volume : this.volume,
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
    
    return audio;
  }
  
  /**
   * Set global volume for all sounds
   * @param {number} value - Volume level (0.0 to 1.0)
   */
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    localStorage.setItem('soundVolume', this.volume.toString());
    
    // Update all cached audio
    Object.values(this.audioCache).forEach(audio => {
      audio.volume = this.volume;
    });
    
    return this.volume;
  }
  
  /**
   * Toggle mute state
   * @returns {boolean} New mute state
   */
  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('soundMuted', this.muted.toString());
    return this.muted;
  }
  
  /**
   * Create soundboard DOM elements
   * @param {string} targetSelector - Selector for container element
   */
  createSoundboard(targetSelector) {
    const container = document.querySelector(targetSelector);
    if (!container) {
      console.warn(`Container not found: ${targetSelector}`);
      return;
    }
    
    // Create soundboard UI
    const soundboardEl = document.createElement('div');
    soundboardEl.className = 'soundboard';
    soundboardEl.innerHTML = `
      <div class="soundboard-header">
        <h3>🔊 Meme Soundboard</h3>
        <button class="soundboard-toggle" id="collapse-soundboard">▲</button>
      </div>
      <div class="soundboard-grid" id="soundboard-buttons">
        <!-- Sound buttons will be inserted here -->
      </div>
    `;
    
    container.appendChild(soundboardEl);
    
    // Add toggle functionality
    const toggleBtn = soundboardEl.querySelector('#collapse-soundboard');
    const grid = soundboardEl.querySelector('.soundboard-grid');
    
    toggleBtn.addEventListener('click', () => {
      grid.classList.toggle('collapsed');
      toggleBtn.textContent = grid.classList.contains('collapsed') ? '▼' : '▲';
    });
    
    // Add sound buttons
    const buttonGrid = soundboardEl.querySelector('#soundboard-buttons');
    
    // Filter for only meme sounds
    const memeSounds = Object.keys(this.sounds).filter(key => 
      key === 'meme' || 
      key === 'oof' || 
      key === 'stonks' || 
      key === 'airhorn' || 
      key === 'sadviolin' ||
      key === 'emotional_damage' ||
      key === 'hello_darkness' ||
      key === 'to_be_continued' ||
      key === 'nope' ||
      key === 'laugh' ||
      key === 'damn'
    );
    
    // Create buttons for each meme sound
    memeSounds.forEach(key => {
      const button = document.createElement('button');
      button.className = 'sound-button';
      button.dataset.sound = key;
      
      // Format the display name
      const displayName = key.replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      button.innerHTML = `
        <span class="sound-icon">🔊</span>
        <span class="sound-name">${displayName}</span>
      `;
      
      button.addEventListener('click', () => {
        this.play(key);
        
        // Visual feedback
        button.classList.add('playing');
        setTimeout(() => button.classList.remove('playing'), 500);
      });
      
      buttonGrid.appendChild(button);
    });
    
    console.log('🎛️ Soundboard UI created');
  }
}

// Export as global
window.soundboard = new SoundboardManager(); 