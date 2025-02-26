/**
 * DEGEN ROAST 3000 - Dashboard Functionality
 * Handles UI interactions for the dashboard
 */

// Dashboard state
let dashboardState = {
  theme: localStorage.getItem('degenTheme') || 'crypto',
  volume: parseFloat(localStorage.getItem('degenVolume') || '0.5'),
  soundsEnabled: localStorage.getItem('degenSounds') !== 'false',
  roastLevel: 1,
  lastRoastLevel: 1,
  notifications: {
    levelUp: true,
    events: true,
    errors: true
  }
};

// Sound effect preloading and management with base64 fallbacks
const SOUNDS = {
  // UI Sounds
  send: { 
    src: '/audio/send.mp3', 
    volume: 0.5, 
    preload: true,
    fallback: true // Has inline fallback
  },
  receive: { 
    src: '/audio/receive.mp3', 
    volume: 0.6, 
    preload: true,
    fallback: true
  },
  click: { 
    src: '/audio/click.mp3', 
    volume: 0.4, 
    preload: true,
    fallback: true
  },
  notification: { 
    src: '/audio/notification.mp3', 
    volume: 0.5, 
    preload: true,
    fallback: true
  },
  
  // Level-up Sounds
  levelUp: { 
    src: '/audio/levelup.mp3', 
    volume: 0.7, 
    preload: true,
    fallback: true
  },
  levelUp2: { 
    src: '/audio/levelup2.mp3', 
    volume: 0.7, 
    preload: false,
    fallback: true
  },
  levelUp3: { 
    src: '/audio/levelup3.mp3', 
    volume: 0.8, 
    preload: false,
    fallback: true
  },
  
  // Reaction Sounds
  laugh: { 
    src: '/audio/laugh.mp3', 
    volume: 0.6, 
    preload: false,
    fallback: true
  },
  shock: { 
    src: '/audio/shock.mp3', 
    volume: 0.6, 
    preload: false,
    fallback: true
  },
  ouch: { 
    src: '/audio/ouch.mp3', 
    volume: 0.7, 
    preload: false,
    fallback: true
  },
  damn: { 
    src: '/audio/damn.mp3', 
    volume: 0.7, 
    preload: false,
    fallback: true
  },
  
  // Special Events
  reset: { 
    src: '/audio/reset.mp3', 
    volume: 0.7, 
    preload: false,
    fallback: true
  },
  themeChange: { 
    src: '/audio/themeChange.mp3', 
    volume: 0.5, 
    preload: false,
    fallback: true
  },
  error: { 
    src: '/audio/error.mp3', 
    volume: 0.6, 
    preload: false,
    fallback: true
  },
  
  // Meme theme sound
  meme: { 
    src: '/audio/meme.mp3', 
    volume: 0.8, 
    preload: false,
    fallback: true
  }
};

// Base64-encoded minimal sound data for fallbacks
// These are extremely short, simple sounds that will work when real audio files are missing
const FALLBACK_SOUNDS = {
  send: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADmgD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAc0AAAAAAAAAABSAJAJAQgAAgAAAA5oZtqJnAAAAAAAAAAAAAAAAAAAA',
  receive: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADmgD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAc0AAAAAAAAAABSAJAJAQgAAgAAAA5oZY3KrAAAAAAAAAAAAAAAAAAAA',
  click: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADmgD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAc0AAAAAAAAAABSAJAJAQgAAgAAAA5oXkARmAAAAAAAAAAAAAAAAAAAA',
  notification: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADmgD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAc0AAAAAAAAAABSAJAJAQgAAgAAAA5oSJPXBAAAAAAAAAAAAAAAAAAAA',
  levelUp: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADmgD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAc0AAAAAAAAAABSAJAJAQgAAgAAAA5of5KObAAAAAAAAAAAAAAAAAAAA',
  error: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADmgD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAc0AAAAAAAAAABSAJAJAQgAAgAAAA5oTBm5EAAAAAAAAAAAAAAAAAAAAA'
};

// Map to share fallbacks across similar sound types
const FALLBACK_MAP = {
  levelUp2: 'levelUp',
  levelUp3: 'levelUp',
  laugh: 'notification',
  shock: 'notification',
  ouch: 'error',
  damn: 'error',
  reset: 'notification',
  themeChange: 'click'
};

// Preload important sounds
const audioElements = {};
let audioLoadFailed = false;

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);

/**
 * Initialize the dashboard
 */
function initDashboard() {
  console.log('Initializing DEGEN ROAST 3000 Dashboard...');
  
  // Preload critical sounds
  preloadSounds();
  
  // Initialize theme
  initializeTheme();
  
  // Initialize volume control
  initializeVolumeControl();
  
  // Initialize reset button
  initializeResetButton();
  
  // Initialize roast meter
  updateRoastMeter(dashboardState.roastLevel);
  
  // Export functions to global scope for access from script.js
  window.dashboardFunctions = {
    updateRoastMeter,
    playSound,
    applyTheme: (theme) => {
      dashboardState.theme = theme;
      applyTheme(theme);
      localStorage.setItem('degenTheme', theme);
    },
    updateVolume: (volume) => {
      dashboardState.volume = volume;
      updateVolume(volume);
      localStorage.setItem('degenVolume', volume);
    },
    resetSession
  };
  
  // Add event listeners for quick phrases
  initializeQuickPhrases();
  
  // Add reaction buttons if enabled
  initializeReactionButtons();
}

/**
 * Initialize reaction buttons for additional interaction
 */
function initializeReactionButtons() {
  if (!document.querySelector('.reaction-buttons')) {
    // Create reaction buttons container
    const reactionsContainer = document.createElement('div');
    reactionsContainer.className = 'reaction-buttons';
    
    // Define reactions
    const reactions = [
      { emoji: '😂', sound: 'laugh', tooltip: 'Laugh' },
      { emoji: '😱', sound: 'shock', tooltip: 'Shock' },
      { emoji: '😬', sound: 'ouch', tooltip: 'Ouch' },
      { emoji: '💀', sound: 'damn', tooltip: 'Damn' }
    ];
    
    // Create buttons
    reactions.forEach(reaction => {
      const button = document.createElement('button');
      button.className = 'reaction-button button-hover';
      button.innerHTML = reaction.emoji;
      button.title = reaction.tooltip;
      button.dataset.sound = reaction.sound;
      
      button.addEventListener('click', () => {
        // Play sound
        playSound(reaction.sound);
        
        // Add animation
        button.classList.add('pulse');
        setTimeout(() => {
          button.classList.remove('pulse');
        }, 500);
        
        // Show toast
        showToast(`You reacted with ${reaction.tooltip}!`, 'info', 1500);
      });
      
      reactionsContainer.appendChild(button);
    });
    
    // Add to dashboard
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
      chatContainer.appendChild(reactionsContainer);
    }
  }
}

/**
 * Preload important sounds with fallbacks
 */
function preloadSounds() {
  let loadAttemptCount = 0;
  let failedLoads = 0;
  
  Object.entries(SOUNDS).forEach(([name, config]) => {
    if (config.preload) {
      loadAttemptCount++;
      
      // Create audio element
      const audio = new Audio();
      
      // Set error handler to use fallback
      audio.onerror = () => {
        failedLoads++;
        console.warn(`Failed to load sound: ${name}`);
        
        // If we have a fallback for this sound, use it
        if (config.fallback) {
          const fallbackSource = FALLBACK_SOUNDS[name] || FALLBACK_SOUNDS[FALLBACK_MAP[name] || name];
          if (fallbackSource) {
            console.log(`Using fallback for ${name}`);
            audio.src = fallbackSource;
            audio.volume = config.volume * dashboardState.volume;
            audioElements[name] = audio;
          }
        }
        
        // Check if all critical sounds failed - only show warning once
        if (failedLoads === loadAttemptCount && !audioLoadFailed) {
          audioLoadFailed = true;
          setTimeout(() => {
            showToast('Audio files not found. Using basic fallback sounds.', 'warning', 5000);
          }, 1000);
        }
      };
      
      // Set up the audio
      audio.volume = config.volume * dashboardState.volume;
      audio.src = config.src;
      audioElements[name] = audio;
      
      // Start loading
      audio.load();
    }
  });
}

/**
 * Initialize theme
 */
function initializeTheme() {
  // Set up theme toggles
  const themeToggles = document.querySelectorAll('.theme-toggle');
  themeToggles.forEach(toggle => {
    // Set active state based on current theme
    if (toggle.dataset.theme === dashboardState.theme) {
      toggle.classList.add('active');
    }
    
    // Add event listener
    toggle.addEventListener('click', () => {
      // Update active class
      themeToggles.forEach(t => t.classList.remove('active'));
      toggle.classList.add('active');
      
      // Set theme
      const newTheme = toggle.dataset.theme;
      dashboardState.theme = newTheme;
      localStorage.setItem('degenTheme', newTheme);
      
      // Apply theme changes
      applyTheme(newTheme);
      
      // Play sound
      playSound('themeChange');
      
      // Show notification
      showToast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme activated!`, 'success');
      
      // Update quick phrases
      updateQuickPhrases(newTheme);
    });
  });
  
  // Apply initial theme
  applyTheme(dashboardState.theme);
}

/**
 * Initialize volume control
 */
function initializeVolumeControl() {
  const volumeSlider = document.getElementById('volume-slider');
  if (volumeSlider) {
    // Set initial value
    volumeSlider.value = dashboardState.volume;
    
    // Add event listener
    volumeSlider.addEventListener('input', (e) => {
      const newVolume = parseFloat(e.target.value);
      updateVolume(newVolume);
      localStorage.setItem('degenVolume', newVolume);
      
      // Play sample sound at higher volumes
      if (newVolume > 0.1) {
        playSound('click');
      }
    });
  }
}

/**
 * Initialize reset button
 */
function initializeResetButton() {
  const resetButton = document.getElementById('reset-session');
  if (resetButton) {
    resetButton.addEventListener('click', resetSession);
  }
}

/**
 * Initialize quick phrases
 */
function initializeQuickPhrases() {
  const quickPhrases = document.querySelectorAll('#quick-phrases button');
  if (quickPhrases.length > 0) {
    quickPhrases.forEach(button => {
      button.addEventListener('click', () => {
        const phrase = button.dataset.phrase;
        const userInput = document.getElementById('user-input');
        if (userInput && phrase) {
          userInput.value = phrase;
          userInput.focus();
          
          // Trigger input event to update character counter
          const inputEvent = new Event('input', { bubbles: true });
          userInput.dispatchEvent(inputEvent);
          
          // Play sound
          playSound('click');
          
          // Add pulse effect
          button.classList.add('pulse');
          setTimeout(() => {
            button.classList.remove('pulse');
          }, 800);
        }
      });
    });
  }
}

/**
 * Play a sound effect
 * @param {string} soundName - Name of the sound to play
 */
function playSound(soundName) {
  // Don't play if sounds are disabled or volume is 0
  if (!dashboardState.soundsEnabled || dashboardState.volume <= 0 || !SOUNDS[soundName]) {
    return;
  }
  
  try {
    // Lazy-load sounds that weren't preloaded
    if (!audioElements[soundName]) {
      // Check if we need to create this audio
      const config = SOUNDS[soundName];
      
      // Try to create the audio element with the actual file
      const audio = new Audio();
      audio.volume = config.volume * dashboardState.volume;
      
      // Set up error handling for fallback
      audio.onerror = () => {
        // Use fallback if available
        if (config.fallback) {
          const fallbackSource = FALLBACK_SOUNDS[soundName] || FALLBACK_SOUNDS[FALLBACK_MAP[soundName] || 'click'];
          if (fallbackSource) {
            audio.src = fallbackSource;
          }
        }
      };
      
      // Set the src and save the element
      audio.src = config.src;
      audioElements[soundName] = audio;
    }
    
    // Reset and play
    const audio = audioElements[soundName];
    audio.pause();
    audio.currentTime = 0;
    
    // Play sound with error handling
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(error => {
        console.warn(`Error playing sound ${soundName}:`, error);
      });
    }
  } catch (error) {
    console.warn(`Error with sound ${soundName}:`, error);
  }
}

/**
 * Update the roast meter UI
 * @param {number} level - Roast level (1-5)
 */
function updateRoastMeter(level) {
  // Clamp level between 1-5
  const clampedLevel = Math.min(5, Math.max(1, parseFloat(level)));
  
  // Get elements
  const meterFill = document.getElementById('roast-meter-fill');
  const levelIndicator = document.getElementById('roast-level');
  
  // Update meter fill (inverted - we're filling from right to left)
  if (meterFill) {
    const fillPercentage = 100 - ((clampedLevel - 1) / 4) * 100;
    meterFill.style.width = `${fillPercentage}%`;
  }
  
  // Update level indicator
  if (levelIndicator) {
    levelIndicator.textContent = clampedLevel;
  }
  
  // Check if we leveled up
  const previousLevel = dashboardState.lastRoastLevel;
  if (clampedLevel > previousLevel) {
    // Level up animation and sound
    levelUpEffects(clampedLevel);
  }
  
  // Update markers
  updateLevelMarkers(clampedLevel);
  
  // Store current level
  dashboardState.roastLevel = clampedLevel;
  dashboardState.lastRoastLevel = clampedLevel;
}

/**
 * Play level up effects
 * @param {number} newLevel - New roast level
 */
function levelUpEffects(newLevel) {
  // Add level-up class to the indicator
  const levelIndicator = document.getElementById('roast-level');
  if (levelIndicator) {
    levelIndicator.classList.add('level-up');
    setTimeout(() => {
      levelIndicator.classList.remove('level-up');
    }, 600);
  }
  
  // Play appropriate level-up sound based on level
  if (newLevel >= 4) {
    playSound('levelUp3');
  } else if (newLevel >= 3) {
    playSound('levelUp2');
  } else {
    playSound('levelUp');
  }
  
  // Show toast notification
  const messages = [
    "Roast level increased! Getting warmer...",
    "Roast level up! Now we're cooking!",
    "Level up! Gloves are coming off!",
    "WARNING: Maximum roast level reached! No mercy mode activated!",
    "DANGER! Ultimate roast level achieved! Total annihilation imminent!"
  ];
  
  showToast(messages[newLevel - 1], 'warning');
  
  // Add card shake effect for dramatic impact
  const roastCard = document.getElementById('roast-level-card');
  if (roastCard) {
    roastCard.classList.add('shake');
    setTimeout(() => {
      roastCard.classList.remove('shake');
    }, 800);
  }
}

/**
 * Update the level markers
 * @param {number} currentLevel - Current roast level
 */
function updateLevelMarkers(currentLevel) {
  const markers = document.querySelectorAll('.marker');
  markers.forEach(marker => {
    const markerLevel = parseInt(marker.dataset.level);
    
    // Reset classes
    marker.classList.remove('active', 'completed');
    
    // Add appropriate class
    if (markerLevel === Math.floor(currentLevel)) {
      marker.classList.add('active');
    } else if (markerLevel < currentLevel) {
      marker.classList.add('completed');
    }
  });
}

/**
 * Apply theme changes
 * @param {string} theme - Theme name
 */
function applyTheme(theme) {
  // Get elements
  const container = document.querySelector('.container');
  const messageInput = document.getElementById('user-input');
  
  // Remove all theme classes
  document.body.classList.remove('theme-crypto', 'theme-hacker', 'theme-gamer');
  
  // Add the selected theme class
  document.body.classList.add(`theme-${theme}`);
  
  // Update container styles
  if (container) {
    // Remove all theme-specific classes
    container.classList.remove('theme-crypto-container', 'theme-hacker-container', 'theme-gamer-container');
    container.classList.add(`theme-${theme}-container`);
  }
  
  // Update input placeholder
  if (messageInput) {
    const placeholders = {
      crypto: "Type something, paper hands...",
      hacker: "Input command, n00b...",
      gamer: "Say something, filthy casual..."
    };
    
    messageInput.placeholder = placeholders[theme] || "Enter your message...";
  }
  
  // Update dashboard card styling
  const dashboardCards = document.querySelectorAll('.dashboard-card');
  dashboardCards.forEach(card => {
    card.classList.remove('crypto-card', 'hacker-card', 'gamer-card');
    card.classList.add(`${theme}-card`);
  });
  
  // Add theme-specific animations
  const title = document.querySelector('.title');
  if (title) {
    title.classList.remove('crypto-pulse', 'hacker-text', 'rgb-border');
    
    switch(theme) {
      case 'crypto':
        title.classList.add('crypto-pulse');
        break;
      case 'hacker':
        title.classList.add('hacker-text');
        break;
      case 'gamer':
        title.classList.add('rgb-border');
        break;
    }
  }
}

/**
 * Update volume for sound effects
 * @param {number} volume - Volume level (0-1)
 */
function updateVolume(volume) {
  // Update state
  dashboardState.volume = volume;
  dashboardState.soundsEnabled = volume > 0;
  
  // Update all loaded audio elements
  Object.entries(audioElements).forEach(([name, audio]) => {
    if (audio && SOUNDS[name]) {
      audio.volume = SOUNDS[name].volume * volume;
    }
  });
}

/**
 * Reset user session
 */
function resetSession() {
  if (confirm('Are you sure you want to reset your progress? This will start a new session with level 1 roasts.')) {
    // Show confirmation toast
    showToast('Session reset! Starting fresh with level 1 roasts.', 'info');
    
    // Play reset sound
    playSound('reset');
    
    // Reset roast level
    dashboardState.roastLevel = 1;
    dashboardState.lastRoastLevel = 1;
    updateRoastMeter(1);
    
    // Call API to reset session
    fetch('/api/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log('Session reset:', data);
      
      // Clear messages on the page
      const messagesContainer = document.getElementById('messages');
      if (messagesContainer) {
        // Fade out
        messagesContainer.style.opacity = '0';
        
        // Clear and fade back in
        setTimeout(() => {
          messagesContainer.innerHTML = '';
          
          // Add welcome message
          const welcomeDiv = document.createElement('div');
          welcomeDiv.className = 'message bot-message slide-in';
          welcomeDiv.innerHTML = `
            <div class="message-icon">🔥</div>
            <div class="message-content">
                Fresh session! Ready to destroy your self-esteem all over again! Send me a message if you dare...
                <div class="message-timestamp">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
          `;
          messagesContainer.appendChild(welcomeDiv);
          
          // Fade back in
          setTimeout(() => {
            messagesContainer.style.opacity = '1';
          }, 50);
        }, 300);
      }
    })
    .catch(error => {
      console.error('Error resetting session:', error);
      showToast('Error resetting session. Try again later.', 'error');
    });
  }
}

/**
 * Update quick phrases based on the selected theme
 * @param {string} theme - Current theme
 */
function updateQuickPhrases(theme) {
  const phrasesContainer = document.getElementById('quick-phrases');
  if (!phrasesContainer) return;
  
  // Define phrases for each theme
  const themesPhrases = {
    crypto: [
      { text: "Roast my crypto portfolio", emoji: "📉", label: "My Portfolio" },
      { text: "Roast my trading strategy", emoji: "📊", label: "My Trades" },
      { text: "Roast my NFT collection", emoji: "🖼️", label: "My NFTs" }
    ],
    hacker: [
      { text: "Roast my coding skills", emoji: "💻", label: "My Code" },
      { text: "Roast my GitHub profile", emoji: "🐙", label: "My GitHub" },
      { text: "Roast my tech setup", emoji: "🖥️", label: "My Setup" }
    ],
    gamer: [
      { text: "Roast my gaming skills", emoji: "🎮", label: "My Skills" },
      { text: "Roast my Twitch stream", emoji: "📺", label: "My Stream" },
      { text: "Roast my K/D ratio", emoji: "💀", label: "My K/D" }
    ]
  };
  
  // Get phrases for current theme
  const phrases = themesPhrases[theme] || themesPhrases.crypto;
  
  // Add shared phrases
  const sharedPhrases = [
    { text: "Roast my life choices", emoji: "🤔", label: "Life Choices" },
    { text: "Roast my appearance", emoji: "👤", label: "Appearance" },
    { text: "Roast my personality", emoji: "😎", label: "Personality" }
  ];
  
  const allPhrases = [...phrases, ...sharedPhrases];
  
  // Clear existing phrases
  phrasesContainer.innerHTML = '';
  
  // Add new phrases
  allPhrases.forEach(phrase => {
    const button = document.createElement('button');
    button.dataset.phrase = phrase.text;
    button.className = 'button-hover';
    button.innerHTML = `${phrase.emoji} ${phrase.label}`;
    
    phrasesContainer.appendChild(button);
  });
  
  // Re-initialize event listeners
  initializeQuickPhrases();
}

/**
 * Show a toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type (info, success, warning, error)
 * @param {number} duration - Duration in ms
 */
function showToast(message, type = 'info', duration = 3000) {
  // Check if showToast exists in window (from script.js)
  if (window.showToast && typeof window.showToast === 'function') {
    return window.showToast(message, type, duration);
  }
  
  // Fallback implementation
  const toastContainer = document.getElementById('toast-container') || (() => {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    return container;
  })();
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Add icon based on type
  let icon = '';
  switch (type) {
    case 'success':
      icon = '✅';
      break;
    case 'error':
      icon = '❌';
      break;
    case 'warning':
      icon = '⚠️';
      break;
    default:
      icon = 'ℹ️';
  }
  
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-message">${message}</span>`;
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
} 