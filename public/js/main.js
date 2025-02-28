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
  
  // Add desktop detection - Fix for layout issues
  const isDesktop = window.innerWidth > 1024;
  if (isDesktop) {
    document.documentElement.classList.add('desktop-view');
    document.body.classList.add('desktop-view');
    document.documentElement.setAttribute('data-device', 'desktop');
    document.body.setAttribute('data-device', 'desktop');
    
    // Make sure fallback content is hidden on desktop 
    const fallbackContent = document.getElementById('fallback-content');
    if (fallbackContent) fallbackContent.style.display = 'none';
    
    // Force desktop layout application
    applyDesktopLayout();
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
 * Apply desktop-specific layout fixes
 */
function applyDesktopLayout() {
  console.log('📱 Applying desktop layout fixes');
  
  // Get key elements
  const container = document.querySelector('.container.enhanced-ui');
  const contentGrid = document.querySelector('.content-grid');
  const chatSection = document.querySelector('.chat-section');
  const leftSidebar = document.querySelector('.left-sidebar-wrapper');
  const rightSidebar = document.querySelector('.right-sidebar-wrapper');
  const fallbackContent = document.getElementById('fallback-content');
  
  // Ensure container has enhanced-ui class
  if (container && !container.classList.contains('enhanced-ui')) {
    container.classList.add('enhanced-ui');
  }
  
  // Force desktop classes
  document.documentElement.classList.add('desktop-view');
  document.body.classList.add('desktop-view');
  document.documentElement.setAttribute('data-device', 'desktop');
  document.body.setAttribute('data-device', 'desktop');
  
  // Remove any mobile classes
  document.documentElement.classList.remove('mobile-view', 'tablet-view', 'ipad-view', 'ipad-mini-view');
  document.body.classList.remove('mobile-view', 'tablet-view', 'ipad-view', 'ipad-mini-view');
  
  // Set correct grid layout for desktop
  if (contentGrid) {
    contentGrid.style.display = 'grid';
    contentGrid.style.gridTemplateColumns = '280px minmax(600px, 1fr) 280px';
    contentGrid.style.gap = '1.5rem';
    contentGrid.style.width = '100%';
    contentGrid.style.maxWidth = '1600px';
    contentGrid.style.margin = '0 auto';
    contentGrid.style.height = 'calc(100vh - 180px)';
    contentGrid.style.minHeight = '500px';
  }
  
  // Ensure all component containers are visible
  const componentContainers = [
    'header-container', 
    'stonks-ticker', 
    'control-panel-container', 
    'soundboard-container', 
    'chat-messages-container', 
    'message-input-container', 
    'meme-gallery-container',
    'disclaimer-container'
  ];
  
  componentContainers.forEach(id => {
    const container = document.getElementById(id);
    if (container) {
      container.style.display = 'block';
      container.style.visibility = 'visible';
      container.style.opacity = '1';
    }
  });
  
  // Ensure chat section is correctly displayed
  if (chatSection) {
    chatSection.style.display = 'flex';
    chatSection.style.flexDirection = 'column';
    chatSection.style.gap = '1rem';
    chatSection.style.height = '100%';
    chatSection.style.maxHeight = 'calc(100vh - 220px)';
    chatSection.style.order = '';
    
    // Style chat window component if it exists inside
    const chatWindow = chatSection.querySelector('.chat-window-component');
    if (chatWindow) {
      chatWindow.style.display = 'flex';
      chatWindow.style.flexDirection = 'column';
      chatWindow.style.width = '100%';
      chatWindow.style.height = '100%';
      
      // Style messages container
      const messagesContainer = chatWindow.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.style.display = 'flex';
        messagesContainer.style.flexDirection = 'column';
        messagesContainer.style.flex = '1';
        messagesContainer.style.overflowY = 'auto';
        messagesContainer.style.padding = '1.5rem';
        messagesContainer.style.gap = '1rem';
      }
    }
  }
  
  // Ensure left sidebar is correctly displayed
  if (leftSidebar) {
    leftSidebar.style.display = 'flex';
    leftSidebar.style.flexDirection = 'column';
    leftSidebar.style.gap = '1rem';
    leftSidebar.style.maxWidth = '280px';
    leftSidebar.style.order = '';
    leftSidebar.style.height = '100%';
    leftSidebar.style.maxHeight = 'calc(100vh - 220px)';
    leftSidebar.style.overflowY = 'auto';
    
    // Style control panel if it exists
    const controlPanel = leftSidebar.querySelector('.control-panel-component');
    if (controlPanel) {
      controlPanel.style.padding = '1.5rem';
      controlPanel.style.borderRadius = '12px';
      controlPanel.style.background = 'linear-gradient(135deg, rgba(20, 30, 50, 0.8), rgba(10, 15, 25, 0.9))';
      controlPanel.style.backdropFilter = 'blur(10px)';
      controlPanel.style.border = '1px solid rgba(255, 255, 255, 0.1)';
      
      // Style theme options
      const themeOptions = controlPanel.querySelector('.theme-options');
      if (themeOptions) {
        themeOptions.style.display = 'grid';
        themeOptions.style.gridTemplateColumns = 'repeat(2, 1fr)';
        themeOptions.style.gap = '0.75rem';
        themeOptions.style.marginBottom = '1.5rem';
      }
      
      // Style level controls
      const levelControls = controlPanel.querySelector('.level-controls');
      if (levelControls) {
        levelControls.style.display = 'flex';
        levelControls.style.gap = '0.5rem';
        levelControls.style.marginBottom = '1.5rem';
      }
    }
  }
  
  // Ensure right sidebar is correctly displayed
  if (rightSidebar) {
    rightSidebar.style.display = 'flex';
    rightSidebar.style.flexDirection = 'column';
    rightSidebar.style.gap = '1rem';
    rightSidebar.style.maxWidth = '280px';
    rightSidebar.style.order = '';
    rightSidebar.style.height = '100%';
    rightSidebar.style.maxHeight = 'calc(100vh - 220px)';
    rightSidebar.style.overflowY = 'auto';
    
    // Style meme gallery if it exists
    const memeGallery = rightSidebar.querySelector('.meme-gallery-component');
    if (memeGallery) {
      memeGallery.style.borderRadius = '12px';
      memeGallery.style.background = 'linear-gradient(135deg, rgba(20, 30, 50, 0.8), rgba(10, 15, 25, 0.9))';
      memeGallery.style.backdropFilter = 'blur(10px)';
      memeGallery.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    }
  }
  
  // Hide fallback content if container has UI
  if (fallbackContent) {
    fallbackContent.style.display = 'none';
  }
  
  // If any components failed to initialize, try to reinitialize them
  setTimeout(reinitializeComponentsIfNeeded, 200);
  
  console.log('✅ Desktop layout fixes applied');
}

/**
 * Attempt to reinitialize any components that may have failed to load
 */
function reinitializeComponentsIfNeeded() {
  console.log('Checking for components that need reinitialization...');
  
  // Check each component container to see if it has content
  const componentChecks = [
    { id: 'header-container', component: 'Header' },
    { id: 'stonks-ticker', component: 'StonksTicker' },
    { id: 'control-panel-container', component: 'ControlPanel' },
    { id: 'soundboard-container', component: 'Soundboard' },
    { id: 'chat-messages-container', component: 'ChatWindow' },
    { id: 'message-input-container', component: 'MessageInput' },
    { id: 'meme-gallery-container', component: 'MemeGallery' },
    { id: 'disclaimer-container', component: 'Disclaimer' }
  ];
  
  let componentsReinitialized = 0;
  
  componentChecks.forEach(check => {
    const container = document.getElementById(check.id);
    
    // Check if container exists but is empty
    if (container && container.innerHTML.trim() === '') {
      console.warn(`Component container ${check.id} is empty, attempting to reinitialize...`);
      
      // Check if component constructor exists
      if (window[check.component]) {
        try {
          // Create new component instance with default options
          const componentInstance = new window[check.component](check.id, {});
          
          // Save to appComponents if it exists
          if (window.appComponents) {
            const key = check.component.charAt(0).toLowerCase() + check.component.slice(1);
            window.appComponents[key] = componentInstance;
          }
          
          console.log(`✅ Successfully reinitialized ${check.component} component`);
          componentsReinitialized++;
          
          // Set display to ensure visibility
          container.style.display = 'block';
          container.style.visibility = 'visible';
          container.style.opacity = '1';
        } catch (error) {
          console.error(`❌ Failed to reinitialize ${check.component} component:`, error);
        }
      } else {
        console.error(`❌ Component ${check.component} constructor not found`);
      }
    }
  });
  
  // If we reinitialized any components, apply layout fixes again
  if (componentsReinitialized > 0) {
    console.log(`Reinitialized ${componentsReinitialized} components, reapplying layout fixes...`);
    
    // Slight delay to allow components to render
    setTimeout(function() {
      // Apply styles from desktop-layout-fix again
      const style = document.getElementById('desktop-layout-fix');
      if (style) {
        // Force a reflow to reapply the styles
        style.disabled = true;
        style.disabled = false;
      }
    }, 100);
  }
  
  // Make sure we scroll chat to bottom if needed
  setTimeout(function() {
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, 300);
}

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