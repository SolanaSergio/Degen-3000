/**
 * app.js
 * Main application entry point for DEGEN ROAST 3000
 * Sets up the component system and handles application-level logic
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing DEGEN ROAST 3000 Component System');
  
  // Enable EventBus debug mode in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    if (typeof EventBus !== 'undefined') {
      EventBus.setDebugMode(true);
    }
  }
  
  // Initialize core components
  initializeComponents();
  
  // Set up global event handlers
  setupGlobalEvents();
  
  // Hide legacy UI elements now that components are active
  hideLegacyUI();
  
  // Create and initialize meme ticker element
  createMemeTicker();
  
  // Add "DEGEN CERTIFIED" badge
  addDegenCertifiedBadge();
  
  console.log('✅ DEGEN ROAST 3000 Component System Initialized');
});

/**
 * Initialize all application components
 */
function initializeComponents() {
  try {
    // Initialize chat window
    const chatWindow = new ChatWindow('chat-container', {
      maxMessages: 50,
      animateMessages: true,
      typingSpeed: 20,
      showTimestamps: true
    });
    
    // Initialize message input
    const messageInput = new MessageInput('message-input-container', {
      maxLength: 280,
      placeholder: "Enter your message...",
      submitButtonText: "Send"
    });
    
    // Initialize dashboard
    const dashboard = new Dashboard('dashboard-container', {
      initialLevel: 1,
      maxLevel: 5,
      showVolumeControls: true,
      showResetButton: true,
      showMemeGallery: false
    });
    
    // Initialize soundboard
    const soundboard = new Soundboard('soundboard-container', {
      initialVolume: 0.7,
      initialMuted: false,
      showControls: true
    });
    
    // Initialize meme gallery
    const memeGallery = new MemeGallery('meme-gallery-container', {
      layout: 'grid',
      showLabels: true,
      collapsible: true,
      initialCollapsed: false,
      animateSelection: true
    });
    
    // Store components in global namespace for debugging
    window.appComponents = {
      chatWindow,
      messageInput,
      dashboard,
      soundboard,
      memeGallery
    };
    
    // Set up event listener for message events
    setupMessageHandling();
    
    // Set up event listeners for meme selection
    setupMemeHandling();
    
    // Always add demo messages for better testing
    addDebugMessages(chatWindow);
    
    // Play initialization sound using the new Soundboard component
    if (window.appComponents.soundboard) {
      window.appComponents.soundboard.playSound('ui', 'init');
    }
    
  } catch (error) {
    console.error('Error initializing components:', error);
  }
}

/**
 * Hide legacy UI elements that have been replaced by components
 * We're keeping legacy code but hiding the UI elements to maintain functionality
 * during the transition.
 */
function hideLegacyUI() {
  // Legacy chat container
  const legacyChatContainer = document.querySelector('.chat-container.enhanced-ui');
  if (legacyChatContainer) {
    legacyChatContainer.style.display = 'none';
  }
  
  // If we have any temporary UI elements that were added for transition
  const tempMessageForm = document.querySelector('#message-form:not(.component)');
  if (tempMessageForm) {
    tempMessageForm.style.display = 'none';
  }
  
  // Hide the legacy dashboard
  const legacyDashboard = document.querySelector('.dashboard.enhanced-ui');
  if (legacyDashboard) {
    legacyDashboard.style.display = 'none';
  }
  
  // Log UI cleanup
  console.log('🧹 Legacy UI elements hidden - using component UI');
}

/**
 * Set up message handling using EventBus
 */
function setupMessageHandling() {
  // Listen for user message events from MessageInput component
  EventBus.subscribe('messageSent', (data) => {
    // Handle user message and generate bot response
    handleUserMessage(data.text);
    
    // Play send sound using the Soundboard component
    if (window.appComponents.soundboard) {
      window.appComponents.soundboard.playSound('ui', 'send');
    }
  });
  
  // Listen for level change events
  EventBus.subscribe('levelChanged', (data) => {
    // Update level in state
    const currentLevel = data.level;
    
    // Update UI if required
    if (window.appComponents.chatWindow) {
      window.appComponents.chatWindow.setState({ currentLevel });
    }
    
    // Update dashboard if required
    if (window.appComponents.dashboard) {
      window.appComponents.dashboard.setLevel(currentLevel);
    }
    
    // Play level change sound using the Soundboard component
    if (window.appComponents.soundboard && currentLevel > 1) {
      window.appComponents.soundboard.playSound('level', 'levelUp' + currentLevel);
    }
  });
  
  // Listen for clear chat events
  EventBus.subscribe('clearChat', () => {
    // Clear chat messages
    if (window.appComponents.chatWindow) {
      window.appComponents.chatWindow.clearMessages();
    }
    
    // Reset level to 1
    EventBus.publish('levelChanged', { level: 1 });
    
    // Play sound using the Soundboard component
    if (window.appComponents.soundboard) {
      window.appComponents.soundboard.playSound('ui', 'reset');
    }
  });
  
  // Listen for roast response events to play appropriate sounds
  EventBus.subscribe('botResponse', (data) => {
    // Don't play sound for loading messages
    if (data.classes && data.classes.includes('loading-message')) return;
    
    // If this is a roast message, play appropriate level sound
    if (data.type === 'bot' && window.appComponents.soundboard) {
      const level = window.appComponents.dashboard ? 
                    window.appComponents.dashboard.getCurrentLevel() : 1;
      
      // Play roast sound appropriate to the level
      window.appComponents.soundboard.playSound('roast', 'roast' + level);
    }
  });
  
  // Listen for volume change events
  EventBus.subscribe('volumeChanged', (data) => {
    if (window.appComponents.soundboard) {
      window.appComponents.soundboard.setVolume(data.volume);
    }
  });
  
  // Listen for mute toggle events
  EventBus.subscribe('muteToggled', (data) => {
    if (window.appComponents.soundboard) {
      window.appComponents.soundboard.setMuted(data.muted);
    }
  });
}

/**
 * Set up meme handling using EventBus
 */
function setupMemeHandling() {
  // Listen for meme selection events from MemeGallery component
  EventBus.subscribe('memeSelected', (data) => {
    // Get the selected meme
    const meme = data.meme;
    if (!meme) return;
    
    // Format meme tag
    const memeTag = `[${meme.toUpperCase()}]`;
    
    // Insert meme tag into message input if available
    if (window.appComponents.messageInput) {
      const currentMessage = window.appComponents.messageInput.getMessage();
      window.appComponents.messageInput.setMessage(currentMessage + ' ' + memeTag);
      
      // Emit memeInserted event for other components to reset selection
      EventBus.publish('memeInserted', { meme });
    }
    
    // Play meme sound using the Soundboard component
    if (window.appComponents.soundboard) {
      window.appComponents.soundboard.playSound('meme', meme);
    }
  });
}

/**
 * Set up global event handlers
 */
function setupGlobalEvents() {
  // We no longer need to listen for form submissions from the legacy system
  // since our MessageInput component handles this via the EventBus
  
  // Handle dark mode toggle via global event listener
  document.addEventListener('darkModeChanged', function(e) {
    // Update UI if needed
    const isDarkMode = e.detail && e.detail.isDark;
    document.body.classList.toggle('dark-mode', isDarkMode);
  });
  
  // Listen for dark mode toggle
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle && typeof ThemeManager !== 'undefined') {
    darkModeToggle.addEventListener('click', function() {
      const isDarkMode = ThemeManager.isDarkMode();
      ThemeManager.setDarkMode(!isDarkMode);
    });
  }
}

/**
 * Handle user message (legacy integration)
 * This integrates with the existing message handling system
 * Will be replaced with proper component communication later
 * @param {string} message - The user's message text
 */
function handleUserMessage(message) {
  // First try to use existing message handling if available
  if (typeof window.generateRoast === 'function') {
    window.generateRoast(message);
    return;
  }
  
  // If legacy function isn't available, create our own bot response flow
  setTimeout(() => {
    // Show loading/typing message
    EventBus.publish('botResponse', {
      text: '<div class="typing-indicator"><span></span><span></span><span></span></div>',
      sender: 'DEGEN ROAST 3000',
      type: 'bot',
      classes: ['loading-message']
    });
    
    // Simple mock roasts for testing
    const mockRoasts = [
      "Your code is so bad, even Stack Overflow would reject your questions.",
      "If stupidity was a currency, you'd be a fucking billionaire.",
      "I've seen better decision-making from a random number generator.",
      "Your life choices are like a masterclass in what not to do.",
      "You're the human equivalent of a participation trophy.",
      "Your crypto portfolio is like your love life: consistently disappointing.",
      "You call that a portfolio? I've seen more diversification in a single stock.",
      "Your trading strategy is basically 'buy high, sell low' but unironically."
    ];
    
    // Get current level from dashboard or default to 1
    let currentLevel = 1;
    if (window.appComponents.dashboard) {
      currentLevel = window.appComponents.dashboard.getLevel();
    } else {
      // Fall back to DOM if dashboard is not available
      const levelElement = document.getElementById('roast-level');
      if (levelElement) {
        currentLevel = parseInt(levelElement.textContent, 10) || 1;
      }
    }
    
    // Randomly increase level sometimes (25% chance)
    if (Math.random() < 0.25 && currentLevel < 5) {
      currentLevel += 1;
      
      // Publish level change event
      EventBus.publish('levelChanged', { level: currentLevel });
    }
    
    // Simulate API delay
    setTimeout(() => {
      // Remove loading message
      const messages = document.querySelectorAll('.loading-message');
      messages.forEach(msg => {
        const messageEl = msg.closest('.message');
        if (messageEl) {
          messageEl.remove();
        }
      });
      
      // Select random roast
      const randomRoast = mockRoasts[Math.floor(Math.random() * mockRoasts.length)];
      
      // Send bot response
      EventBus.publish('botResponse', {
        text: randomRoast,
        sender: 'DEGEN ROAST 3000',
        type: 'bot',
        level: currentLevel
      });
      
      // Play roast sound if available
      if (typeof playSound === 'function') {
        playSound('roast');
      }
    }, 1500);
  }, 500);
}

/**
 * Create and initialize meme ticker
 */
function createMemeTicker() {
  // Create ticker container
  const tickerContainer = document.createElement('div');
  tickerContainer.className = 'meme-ticker';
  
  // Create ticker title
  const tickerTitle = document.createElement('div');
  tickerTitle.className = 'ticker-title';
  tickerTitle.innerHTML = 'MEME STONKS <span>📈</span>';
  
  // Add title to container
  tickerContainer.appendChild(tickerTitle);
  
  // Meme assets with trending values
  const memeAssets = [
    { name: 'DOGE', price: '$0.12', change: '+4.20%', trend: 'up' },
    { name: 'WOJAK', price: '$0.01', change: '-6.9%', trend: 'down' },
    { name: 'PEPE', price: '$0.002', change: '+7.5%', trend: 'up' },
    { name: 'STONKS', price: '$420.69', change: '+42%', trend: 'up' },
    { name: 'CHAD', price: '$69.42', change: '+2.8%', trend: 'up' },
    { name: 'MOON', price: '$1337', change: '-3.3%', trend: 'down' }
  ];
  
  // Create ticker items
  memeAssets.forEach(asset => {
    const tickerItem = document.createElement('div');
    tickerItem.className = 'ticker-item';
    
    const nameEl = document.createElement('span');
    nameEl.className = 'ticker-name';
    nameEl.textContent = asset.name;
    
    const priceEl = document.createElement('span');
    priceEl.className = 'ticker-price';
    priceEl.textContent = asset.price;
    
    const changeEl = document.createElement('span');
    changeEl.className = `ticker-change ticker-${asset.trend}`;
    changeEl.textContent = asset.change;
    
    tickerItem.appendChild(nameEl);
    tickerItem.appendChild(priceEl);
    tickerItem.appendChild(changeEl);
    
    tickerContainer.appendChild(tickerItem);
  });
  
  // Add ticker to the main container
  const container = document.querySelector('.container');
  if (container) {
    container.appendChild(tickerContainer);
  }
  
  // Animate ticker prices periodically
  setInterval(() => {
    const changes = document.querySelectorAll('.ticker-change');
    changes.forEach(change => {
      // Random price movement
      const movement = (Math.random() * 2 - 1) * 3; // Random value between -3% and +3%
      const currentValue = parseFloat(change.textContent);
      const newValue = currentValue + movement;
      
      // Update value and class
      change.textContent = newValue > 0 ? `+${newValue.toFixed(2)}%` : `${newValue.toFixed(2)}%`;
      
      if (newValue > 0) {
        change.className = 'ticker-change ticker-up';
      } else {
        change.className = 'ticker-change ticker-down';
      }
    });
  }, 10000); // Update every 10 seconds
}

/**
 * Add DEGEN CERTIFIED badge
 */
function addDegenCertifiedBadge() {
  const badge = document.createElement('div');
  badge.className = 'degen-certified';
  badge.textContent = 'DEGEN CERTIFIED';
  
  const container = document.querySelector('.container');
  if (container) {
    container.appendChild(badge);
  }
}

/**
 * Add debug messages for testing
 * @param {ChatWindow} chatWindow - The chat window component
 */
function addDebugMessages(chatWindow) {
  // Example messages
  const debugMessages = [
    {
      text: "Welcome to DEGEN ROAST 3000! The most savage meme-powered AI roast generator on the internet. Type a message to get roasted or try using the meme gallery.",
      sender: "System",
      type: "bot",
      level: 1,
      timestamp: Date.now() - 10000,
      skipAnimation: true
    },
    {
      text: "Hi there, roast me!",
      sender: "You",
      type: "user",
      timestamp: Date.now() - 5000
    },
    {
      text: "You're so desperate for attention you're asking an AI to roast you. That's a new level of sad, even for someone with your post history.",
      sender: "DEGEN ROAST 3000",
      type: "bot",
      level: 1,
      timestamp: Date.now() - 4000,
      skipAnimation: true
    },
    {
      text: "Do another one, but make it more brutal!",
      sender: "You",
      type: "user",
      timestamp: Date.now() - 3000
    },
    {
      text: "Your social skills are so underdeveloped that you're begging for abuse from a computer program. Your parents must be so fucking proud. I bet you think your NFT collection is going to make you rich too.",
      sender: "DEGEN ROAST 3000",
      type: "bot",
      level: 3,
      timestamp: Date.now() - 2000,
      skipAnimation: true,
      classes: ['has-meme']
    }
  ];
  
  // Add the debug messages
  debugMessages.forEach(message => {
    chatWindow.addMessage(message);
  });
} 