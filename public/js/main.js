/**
 * main.js
 * Main initialization script for DEGEN ROAST 3000
 */

// This function checks if an object exists and is not undefined
function ensureExists(obj, name) {
  if (typeof obj === 'undefined') {
    console.error(`${name} is not defined! Check script references in index.html`);
    return false;
  }
  return true;
}

document.addEventListener('DOMContentLoaded', () => {
  // Verify that all required components exist
  if (!ensureExists(window.EventBus, 'EventBus') || 
      !ensureExists(window.ComponentBase, 'ComponentBase') || 
      !ensureExists(window.ThemeManager, 'ThemeManager')) {
    return;
  }
  
  // Initialize ThemeManager (it's already instantiated in ThemeManager.js)
  if (!window.ThemeManager.initialized) {
    window.ThemeManager.init({
      defaultTheme: 'crypto',
      themes: ['crypto', 'hacker', 'gamer', 'meme']
    });
  }
  
  // Store all components in a global object for easier access after initialization
  window.appComponents = {};
  
  // Initialize components
  try {
    initializeComponents();
    
    // Set up global event handlers
    setupGlobalEvents();
    
    // Check if API service is available
    if (!window.apiService) {
      console.error('API service not found! API communication will not work correctly.');
      console.warn('Running in demo/local mode - API calls will be simulated.');
    } else {
      console.log('API service detected and ready');
      
      // Test the API connection
      window.apiService.testConnection()
        .then(result => {
          if (result.success) {
            console.log('✅ API connection test successful');
          } else {
            console.warn('⚠️ API connection test failed:', result.message);
            console.warn('Running in demo/local mode - API calls will be simulated.');
            
            // Show the fallback message in the chat window
            if (window.appComponents && window.appComponents.chatWindow) {
              setTimeout(() => {
                window.EventBus.publish('botResponse', {
                  text: "I'm running in demo mode! API endpoints aren't available, but local roasts will work just fine. Type something to get roasted!",
                  timestamp: Date.now(),
                  type: 'bot',
                  level: 1,
                  isInfo: true
                });
              }, 1000);
            }
          }
        })
        .catch(error => {
          console.error('❌ API connection test error:', error.message);
          console.warn('Running in demo/local mode - API calls will be simulated.');
        });
    }
    
    console.log('📣 DEGEN ROAST 3000 initialized! 🚀');
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
});

/**
 * Initialize all components in the correct order
 */
function initializeComponents() {
  console.log('Initializing components...');
  
  // 1. Initialize Header component
  if (typeof window.Header !== 'undefined' && document.getElementById('header-container')) {
    console.log('Initializing Header component...');
    window.headerComponent = new window.Header('header-container', {
      title: 'DEGEN ROAST 3000',
      subtitle: 'Ultimate AI-Powered Roast Generator',
      showWarningBanner: !localStorage.getItem('warningBannerClosed')
    });
  } else {
    console.warn('Header component or container not found');
  }
  
  // 2. Initialize StonksTicker component
  if (typeof window.StonksTicker !== 'undefined' && document.getElementById('stonks-ticker')) {
    console.log('Initializing StonksTicker component...');
    window.stonksTickerComponent = new window.StonksTicker('stonks-ticker', {
      tickers: [
        { symbol: 'BTC', price: '+5.24%', isUp: true },
        { symbol: 'ETH', price: '+3.87%', isUp: true },
        { symbol: 'DOGE', price: '-2.39%', isUp: false },
        { symbol: 'SHIB', price: '+12.67%', isUp: true }
      ],
      updateInterval: 5000,
      enableAnimations: true,
      enableRandomUpdates: true
    });
  } else {
    console.warn('StonksTicker component or container not found');
  }
  
  // 3. Initialize ControlPanel component
  if (typeof window.ControlPanel !== 'undefined' && document.getElementById('control-panel-container')) {
    console.log('Initializing ControlPanel component...');
    window.controlPanelComponent = new window.ControlPanel('control-panel-container', {
      initialLevel: 1,
      maxLevel: 5,
      showVolumeControls: true,
      showThemeSelector: true
    });
  } else {
    console.warn('ControlPanel component or container not found');
  }
  
  // 4. Initialize Soundboard component
  if (typeof window.Soundboard !== 'undefined' && document.getElementById('soundboard-container')) {
    console.log('Initializing Soundboard component...');
    window.soundboardComponent = new window.Soundboard('soundboard-container', {
      initialVolume: 0.7,
      initialMuted: false,
      showControls: true
    });
  } else {
    console.warn('Soundboard component or container not found');
  }
  
  // 5. Initialize ChatWindow component
  if (typeof window.ChatWindow !== 'undefined' && document.getElementById('chat-messages-container')) {
    console.log('Initializing ChatWindow component...');
    window.chatWindowComponent = new window.ChatWindow('chat-messages-container', {
      maxMessages: 50,
      animateMessages: true,
      typingSpeed: 20,
      showTimestamps: true
    });
  } else {
    console.warn('ChatWindow component or container not found');
  }
  
  // 6. Initialize MessageInput component
  if (typeof window.MessageInput !== 'undefined' && document.getElementById('message-input-container')) {
    console.log('Initializing MessageInput component...');
    window.messageInputComponent = new window.MessageInput('message-input-container', {
      maxLength: 280,
      placeholder: "Enter your message...",
      submitButtonText: "Send"
    });
  } else {
    console.warn('MessageInput component or container not found');
  }
  
  // 7. Initialize MemeGallery component
  if (typeof window.MemeGallery !== 'undefined' && document.getElementById('meme-gallery-container')) {
    console.log('Initializing MemeGallery component...');
    window.memeGalleryComponent = new window.MemeGallery('meme-gallery-container', {
      layout: 'grid',
      showLabels: true,
      collapsible: true,
      initialCollapsed: false,
      animateSelection: true
    });
  } else {
    console.warn('MemeGallery component or container not found');
  }
  
  // 8. Initialize Disclaimer component
  if (typeof window.Disclaimer !== 'undefined' && document.getElementById('disclaimer-container')) {
    console.log('Initializing Disclaimer component...');
    window.disclaimerComponent = new window.Disclaimer('disclaimer-container', {
      showClose: true,
      autoHide: false,
      storageKey: 'disclaimerClosed',
      content: 'DEGEN ROAST 3000 is entertainment only. Not financial advice. Investments may lose value.'
    });
  } else {
    console.warn('Disclaimer component or container not found');
  }
  
  // Store all components in a global object for easier access
  window.appComponents = {
    header: window.headerComponent,
    stonksTicker: window.stonksTickerComponent,
    controlPanel: window.controlPanelComponent,
    soundboard: window.soundboardComponent,
    chatWindow: window.chatWindowComponent,
    messageInput: window.messageInputComponent,
    memeGallery: window.memeGalleryComponent,
    disclaimer: window.disclaimerComponent
  };
}

/**
 * Setup global event handlers
 */
function setupGlobalEvents() {
  console.log('Setting up global events...');
  
  // Handle initial theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    window.EventBus.publish('themeChanged', { theme: savedTheme, source: 'main' });
  }
  
  // Handle initial stonks mode
  const stonksMode = localStorage.getItem('stonksMode') === 'true';
  if (stonksMode) {
    window.EventBus.publish('stonksModeToggled', { enabled: true, source: 'main' });
  }
  
  // Listen for user message events to trigger bot response
  window.EventBus.subscribe('messageSent', async (data) => {
    if (data.text.trim().length > 0) {
      // Show typing indicator
      window.EventBus.publish('typingStarted', { duration: 2000 });
      
      // Play sound
      window.EventBus.publish('playSound', { sound: 'send' });
      
      // Try to get current roast level
      let level = 3; // Default level
      if (window.appComponents && window.appComponents.controlPanel) {
        // If the component is in appComponents and has getCurrentLevel method
        if (typeof window.appComponents.controlPanel.getCurrentLevel === 'function') {
          level = window.appComponents.controlPanel.getCurrentLevel();
        } 
        // Fallback to directly accessing state
        else if (window.appComponents.controlPanel.state && window.appComponents.controlPanel.state.currentLevel) {
          level = window.appComponents.controlPanel.state.currentLevel;
        }
      } 
      // Try window.controlPanelComponent directly as fallback
      else if (window.controlPanelComponent) {
        if (typeof window.controlPanelComponent.getCurrentLevel === 'function') {
          level = window.controlPanelComponent.getCurrentLevel();
        } else if (window.controlPanelComponent.state && window.controlPanelComponent.state.currentLevel) {
          level = window.controlPanelComponent.state.currentLevel;
        }
      }
      
      try {
        if (window.debugLogger) {
          window.debugLogger.info('MESSAGE', `Sending message to API: "${data.text.substring(0, 30)}${data.text.length > 30 ? '...' : ''}" (level: ${level})`);
        } else {
          console.log(`🚀 Sending message to API: "${data.text.substring(0, 30)}${data.text.length > 30 ? '...' : ''}" (level: ${level})`);
        }
        
        // Call API to get roast
        const response = await window.apiService.generateRoast(data.text, level);
        
        // Display the bot's response
        window.EventBus.publish('botResponse', {
          text: response.message,
          timestamp: Date.now(),
          type: 'bot',
          level: response.roastLevel || level
        });
        
        // Play receive sound
        window.EventBus.publish('playSound', { sound: 'receive' });
        
        if (window.debugLogger) {
          window.debugLogger.info('RESPONSE', `Received API response: "${response.message.substring(0, 30)}${response.message.length > 30 ? '...' : ''}"`);
        } else {
          console.log(`✅ Received API response: "${response.message.substring(0, 30)}${response.message.length > 30 ? '...' : ''}"`);
        }
      } catch (error) {
        console.error('❌ API request failed:', error);
        
        // Log comprehensive error info
        if (window.debugLogger) {
          window.debugLogger.error('API', 'API request failed', error);
        } else {
          console.error('❌ API request failed:', error.message || 'Unknown error');
          console.error('Using fallback response generation since API is unavailable');
        }
        
        // First, show a message about using fallback
        if (error.message && error.message.includes('404')) {
          // Handle 404 nicely - the API endpoints don't exist at all
          window.EventBus.publish('botResponse', {
            text: "I'm running in demo mode! The API endpoints aren't available, so I'll generate a local roast for you...",
            timestamp: Date.now(),
            type: 'bot',
            level: 1,
            isInfo: true
          });
        } else {
          // General API error
          window.EventBus.publish('botResponse', {
            text: `Sorry, I couldn't connect to the API (${error.message || 'Unknown error'}). Using local roast generation instead...`,
            timestamp: Date.now(),
            type: 'bot',
            level: 1,
            isInfo: true
          });
        }
        
        // Then generate a local fallback response
        setTimeout(() => {
          // Play typing sound
          window.EventBus.publish('typingStarted', { duration: 1000 });
          
          // Fallback to local response generation
          setTimeout(() => {
            generateLocalRoast(data.text);
          }, 1000);
        }, 500);
      }
    }
  });
  
  // Add initial welcome message
  setTimeout(() => {
    window.EventBus.publish('botResponse', {
      text: "Welcome to DEGEN ROAST 3000! I'm here to absolutely destroy your crypto investments. Type something to get roasted! 🔥",
      timestamp: Date.now(),
      type: 'bot',
      level: 2
    });
  }, 500);
  
  // Debug event logging in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Debug event logging enabled');
    window.EventBus.subscribe('*', (eventName, data) => {
      console.debug(`Event: ${eventName}`, data);
    });
  }
}

/**
 * Generate a local fallback roast response
 * @param {string} userInput - User message
 */
function generateLocalRoast(userInput) {
  // Placeholder responses for demo
  const responses = [
    'Your investment strategy is like a game of pin the tail on the donkey, except the donkey is your retirement fund.',
    'I\'ve seen more promising returns from a Nigerian prince email scam than your trading history.',
    'Your crypto portfolio diversification is impressive... it\'s equally worthless across all blockchains!',
    'HODL? More like HODLing onto false hope with those coins you picked.',
    'Have you considered a career in financial advice? Because whatever you\'re doing now is basically a masterclass in what not to do.',
    'Your trading pattern looks like you\'re trying to draw a picture of your financial decline.',
    'Diamond hands? More like cubic zirconia fingers the way you panic sell at every dip.',
    'To the moon? The only thing mooning here is the market showing you its backside.',
    'I\'ve seen better returns from a broken vending machine than your DeFi yield farm.',
    'Your wallet address has received more dust attacks than actual profitable transactions.'
  ];
  
  // Pick a random response
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  // Determine response level (1-5)
  const level = Math.floor(Math.random() * 5) + 1;
  
  // Emit bot response event
  window.EventBus.publish('botResponse', {
    text: randomResponse,
    timestamp: Date.now(),
    type: 'bot',
    level: level
  });
  
  // Play receive sound
  window.EventBus.publish('playSound', { sound: 'receive' });
}

// Create global debugging tools
window.debugDegen = window.debugDegen || {};

// Check if all components exist
window.debugDegen.checkComponents = function() {
  const components = [
    'EventBus', 'ComponentBase', 'ThemeManager',
    'Header', 'StonksTicker', 'ControlPanel',
    'ChatWindow', 'MessageInput', 'Soundboard',
    'MemeGallery', 'Disclaimer'
  ];
  
  console.group('Component Check');
  components.forEach(comp => {
    const exists = typeof window[comp] !== 'undefined';
    console.log(`${comp}: ${exists ? '✅' : '❌'}`);
  });
  console.groupEnd();
  
  return components.every(comp => typeof window[comp] !== 'undefined');
};

// Test API connection
window.debugDegen.testApi = async function() {
  if (!window.apiService) {
    console.error('API service not initialized');
    return false;
  }
  
  console.group('API Connection Test');
  try {
    console.log('Testing API connection...');
    const result = await window.apiService.testConnection();
    
    if (result.success) {
      console.log('✅ API connection test PASSED');
      console.groupEnd();
      return true;
    } else {
      console.error('❌ API connection test FAILED:', result.message);
      console.groupEnd();
      return false;
    }
  } catch (error) {
    console.error('❌ API connection test FAILED:', error.message);
    console.groupEnd();
    return false;
  }
};

// Run full diagnostics
window.debugDegen.runDiagnostics = async function() {
  console.group('🔍 DEGEN ROAST 3000 Diagnostics');
  
  console.log('1. Checking scripts...');
  const scriptsOk = window.debugDegen.checkScripts();
  
  console.log('2. Checking components...');
  const componentsOk = window.debugDegen.checkComponents();
  
  console.log('3. Testing EventBus...');
  const eventBusOk = window.debugDegen.testEventBus();
  
  console.log('4. Testing API connection...');
  let apiOk = false;
  try {
    apiOk = await window.debugDegen.testApi();
  } catch (e) {
    console.error('API test error:', e);
  }
  
  console.log('----------------------------');
  console.log(`📊 Diagnostics Summary:`);
  console.log(`Scripts: ${scriptsOk ? '✅' : '❌'}`);
  console.log(`Components: ${componentsOk ? '✅' : '❌'}`);
  console.log(`EventBus: ${eventBusOk ? '✅' : '❌'}`);
  console.log(`API: ${apiOk ? '✅' : '❌'}`);
  console.log(`Overall: ${(scriptsOk && componentsOk && eventBusOk && apiOk) ? '✅ PASSED' : '❌ FAILED'}`);
  
  console.groupEnd();
  
  return {
    scriptsOk,
    componentsOk,
    eventBusOk,
    apiOk,
    overallOk: scriptsOk && componentsOk && eventBusOk && apiOk
  };
};

// Check if all scripts loaded
window.debugDegen.checkScripts = function() {
  const scripts = Array.from(document.getElementsByTagName('script'));
  const scriptPaths = scripts.map(s => s.src).filter(src => src);
  
  console.group('Script Loading Check');
  console.log(`${scripts.length} scripts found`);
  
  const criticalScripts = [
    'EventBus.js',
    'ComponentBase.js',
    'ThemeManager.js',
    'api-service.js',
    'main.js'
  ];
  
  criticalScripts.forEach(script => {
    const found = scriptPaths.some(path => path.includes(script));
    console.log(`${script}: ${found ? '✅' : '❌'}`);
  });
  
  console.groupEnd();
  return criticalScripts.every(script => scriptPaths.some(path => path.includes(script)));
};

// Test if EventBus is working
window.debugDegen.testEventBus = function() {
  if (!window.EventBus) {
    console.error('EventBus not found!');
    return false;
  }
  
  console.log('Testing EventBus...');
  
  const testEventName = '__test_event__';
  let received = false;
  
  const unsubscribe = window.EventBus.subscribe(testEventName, (data) => {
    received = true;
    console.log('Test event received:', data);
    unsubscribe(); // Clean up
  });
  
  window.EventBus.publish(testEventName, { test: true, timestamp: Date.now() });
  
  if (received) {
    console.log('✅ EventBus is working correctly!');
    return true;
  } else {
    console.error('❌ EventBus test failed - event was published but not received');
    return false;
  }
};

// Add button event listener for diagnostics
document.addEventListener('DOMContentLoaded', function() {
  const diagnosticsBtn = document.getElementById('run-diagnostics');
  if (diagnosticsBtn) {
    diagnosticsBtn.addEventListener('click', function() {
      window.debugDegen.runDiagnostics();
    });
  }
  
  // Also hook up the debug button
  const debugBtn = document.getElementById('debug-button');
  if (debugBtn) {
    debugBtn.addEventListener('click', function() {
      window.debugDegen.runDiagnostics();
    });
  }
}); 