/**
 * DEGEN ROAST 3000 - Enhanced UI
 * Adds professional styling with humorous meme elements
 */

// Animation timing constants - SLOWED DOWN
const ANIMATION_SPEEDS = {
  fast: 500,      // 500ms (from 200ms)
  normal: 1000,   // 1000ms (from 300ms)
  slow: 2000,     // 2000ms (from 500ms)
  verySlow: 4000  // 4000ms (from 1000ms)
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initEnhancedUI);

// Global state
const enhancedUIState = {
  stonksMode: false,
  rarityChance: 0.2, // 20% chance of a message being "rare"
  memeReferences: [
    "Sir, this is a Wendy's",
    "Wen Lambo?",
    "HODL my beer",
    "In it for the tech",
    "NGMI with that attitude",
    "This is the way",
    "Diamond hands required",
    "Survival requires a smooth brain",
    "Have you tried turning it off and on again?",
    "You wouldn't download a car"
  ],
  stonksTickers: [
    {symbol: "BTC", price: 43250.21},
    {symbol: "ETH", price: 2310.50},
    {symbol: "DOGE", price: 0.07},
    {symbol: "PEPE", price: 0.000012},
    {symbol: "MEME", price: 0.0214}
  ]
};

/**
 * Initialize enhanced UI
 */
function initEnhancedUI() {
  console.log('🚀 Initializing Enhanced UI for DEGEN ROAST 3000');
  
  // Fix missing elements first
  ensureRequiredElementsExist();
  
  // Apply enhanced UI classes
  applyEnhancedClasses();
  
  // Add meme elements
  addMemeElements();
  
  // Add stonks mode toggle
  addStonksModeToggle();
  
  // Random rarity for messages
  setupMessageRarity();
  
  // Replace existing emoji reactions with enhanced ones
  enhanceEmojiReactions();
  
  // Add meme ticker
  addMemeTicker();
  
  // Add theme selection enhancement
  enhanceThemeSelection();
  
  // Hook up to existing functionality
  hookIntoExistingFunctionality();
  
  // Apply fancy scroll effects
  applyScrollEffects();
  
  // Fix layout issues
  fixLayoutIssues();
}

/**
 * Ensure required elements exist in the DOM
 */
function ensureRequiredElementsExist() {
  // Fix for missing elements that might cause JS errors
  if (!document.querySelector('.messages')) {
    console.log('Creating missing .messages element');
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer && !chatContainer.querySelector('.messages')) {
      const messagesDiv = document.createElement('div');
      messagesDiv.className = 'messages';
      messagesDiv.id = 'messages';
      chatContainer.prepend(messagesDiv);
    }
  }
  
  // Fix for missing message form
  if (!document.querySelector('.message-form') && !document.querySelector('#message-form')) {
    console.log('Creating missing message form element');
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
      const form = document.createElement('form');
      form.className = 'message-form';
      form.id = 'message-form';
      form.innerHTML = `
        <div class="input-container">
          <input type="text" id="user-input" placeholder="Say something to get roasted..." maxlength="280">
          <button type="submit">Send</button>
        </div>
        <div class="char-counter">0/280</div>
        <div class="quick-phrases">
          <button type="button" data-phrase="Roast me hard">Roast me hard</button>
          <button type="button" data-phrase="Go easy on me">Go easy on me</button>
          <button type="button" data-phrase="I'm a crypto trader">I'm a crypto trader</button>
          <button type="button" data-phrase="Roast my portfolio">Roast my portfolio</button>
        </div>
      `;
      chatContainer.appendChild(form);
    }
  }
}

/**
 * Apply enhanced UI classes to existing elements
 */
function applyEnhancedClasses() {
  // Apply to body
  document.body.classList.add('enhanced-ui');
  
  // Apply to main container
  const container = document.querySelector('.container');
  if (container) container.classList.add('enhanced-ui');
  
  // Apply to header elements
  const title = document.querySelector('.title');
  if (title) title.classList.add('enhanced-ui');
  
  const subtitle = document.querySelector('.subtitle');
  if (subtitle) {
    subtitle.classList.add('enhanced-ui');
    // Add meme text to subtitle
    if (!subtitle.querySelector('.meme-text')) {
      subtitle.innerHTML += ' <span class="meme-text">much wow</span>';
    }
  }
  
  // Apply to dashboard
  const dashboard = document.querySelector('.dashboard');
  if (dashboard) dashboard.classList.add('enhanced-ui');
  
  // Apply to roast level indicator
  const roastLevelIndicator = document.querySelector('.roast-level-indicator');
  if (roastLevelIndicator) roastLevelIndicator.classList.add('enhanced-ui');
  
  // Apply to chat container
  const chatContainer = document.querySelector('.chat-container');
  if (chatContainer) chatContainer.classList.add('enhanced-ui');
  
  // Apply to message form
  const messageForm = document.querySelector('.message-form') || document.querySelector('#message-form');
  if (messageForm) {
    messageForm.classList.add('enhanced-ui');
    // Make sure it has the proper chat-controls class as well
    messageForm.classList.add('chat-controls');
  }
  
  // Apply to messages container
  const messages = document.querySelector('.messages');
  if (messages) messages.classList.add('enhanced-ui');
  
  // Apply to quick phrases
  const quickPhrases = document.querySelector('.quick-phrases');
  if (quickPhrases) quickPhrases.classList.add('enhanced-ui');
  
  // Apply to warning banner
  const warningBanner = document.getElementById('warning-banner');
  if (warningBanner) warningBanner.classList.add('enhanced-ui');
  
  // Apply to disclaimer
  const disclaimer = document.querySelector('.disclaimer');
  if (disclaimer) disclaimer.classList.add('enhanced-ui');
  
  // Make sure theme buttons have the right class
  const themeButtons = document.querySelectorAll('.theme-toggle, .theme-button');
  themeButtons.forEach(button => {
    button.classList.add('theme-button');
    // Remove old class if present
    button.classList.remove('theme-toggle');
  });
}

/**
 * Add meme elements to the UI
 */
function addMemeElements() {
  // Add meme badge to title
  const title = document.querySelector('.title');
  if (title && !title.querySelector('.meme-badge')) {
    // Replace title with meme logo on hover
    title.addEventListener('mouseenter', () => {
      title.style.backgroundImage = `url('images/meme-logo.svg')`;
      title.style.backgroundSize = 'contain';
      title.style.backgroundPosition = 'center';
      title.style.backgroundRepeat = 'no-repeat';
      title.style.color = 'transparent';
      title.style.transition = 'all 0.5s ease'; // Slowed down
    });
    
    title.addEventListener('mouseleave', () => {
      title.style.backgroundImage = '';
      title.style.color = '';
    });
    
    const memeBadge = document.createElement('span');
    memeBadge.className = 'meme-badge';
    memeBadge.textContent = 'MUCH DEGEN';
    title.appendChild(memeBadge);
  }
  
  // Add stonks chart (simplified)
  const dashboard = document.querySelector('.dashboard');
  if (dashboard && !dashboard.querySelector('.stonks-chart')) {
    const stonksChart = document.createElement('div');
    stonksChart.className = 'stonks-chart';
    stonksChart.innerHTML = `
      <div class="chart-title">MEME STONKS</div>
      <div class="chart-bars">
        <div class="chart-bar" style="height: 40%"></div>
        <div class="chart-bar" style="height: 60%"></div>
        <div class="chart-bar" style="height: 30%"></div>
        <div class="chart-bar" style="height: 80%"></div>
        <div class="chart-bar" style="height: 50%"></div>
      </div>
    `;
    stonksChart.style.position = 'absolute';
    stonksChart.style.right = '20px';
    stonksChart.style.top = '5px';
    stonksChart.style.width = '100px';
    stonksChart.style.height = '40px';
    stonksChart.style.opacity = '0.5';
    stonksChart.style.pointerEvents = 'none';
    dashboard.appendChild(stonksChart);
    
    // Style chart
    const chartBars = stonksChart.querySelectorAll('.chart-bar');
    chartBars.forEach(bar => {
      bar.style.width = '12px';
      bar.style.background = 'var(--pro-accent)';
      bar.style.borderRadius = '3px 3px 0 0';
      bar.style.margin = '0 2px';
      bar.style.transition = 'height 2s ease'; // Slowed from 1s to 2s
    });
    
    const chartBarsContainer = stonksChart.querySelector('.chart-bars');
    if (chartBarsContainer) {
      chartBarsContainer.style.display = 'flex';
      chartBarsContainer.style.alignItems = 'flex-end';
      chartBarsContainer.style.height = '30px';
    }
    
    const chartTitle = stonksChart.querySelector('.chart-title');
    if (chartTitle) {
      chartTitle.style.fontSize = '0.6rem';
      chartTitle.style.color = 'var(--text-secondary)';
      chartTitle.style.marginBottom = '3px';
    }
    
    // Animate bars more slowly
    setInterval(() => {
      chartBars.forEach(bar => {
        const newHeight = Math.floor(Math.random() * 100) + 10;
        bar.style.height = `${newHeight}%`;
        
        // Change color based on trend
        if (newHeight > 50) {
          bar.style.background = 'var(--stonks-green)';
        } else {
          bar.style.background = 'var(--hodl-red)';
        }
      });
    }, 6000); // Slowed from 3000ms to 6000ms
  }
  
  // Add meme disclaimer if not present
  const disclaimer = document.querySelector('.disclaimer');
  if (disclaimer && !disclaimer.querySelector('.meme-disclaimer')) {
    const memeDisclaimer = document.createElement('div');
    memeDisclaimer.className = 'meme-disclaimer';
    memeDisclaimer.innerHTML = 'Your self-esteem may never financially recover from this. <span class="stonks-text">Not stonks!</span> 📉';
    disclaimer.appendChild(memeDisclaimer);
    
    // Make it visible
    memeDisclaimer.style.display = 'block';
  }
}

/**
 * Add stonks mode toggle
 */
function addStonksModeToggle() {
  const container = document.querySelector('.container');
  if (!container || container.querySelector('.stonks-mode-toggle')) return;
  
  const toggle = document.createElement('div');
  toggle.className = 'stonks-mode-toggle';
  toggle.textContent = 'STONKS MODE';
  toggle.style.transition = 'all 0.5s ease'; // Slowed down
  
  toggle.addEventListener('click', () => {
    enhancedUIState.stonksMode = !enhancedUIState.stonksMode;
    
    if (enhancedUIState.stonksMode) {
      toggle.textContent = 'STONKS MODE: ON';
      toggle.style.background = 'var(--stonks-green)';
      document.body.classList.add('stonks-mode');
      
      // Play stonks sound if available
      if (window.dashboardFunctions && window.dashboardFunctions.playSound) {
        window.dashboardFunctions.playSound('themeChange');
      }
      
      // Show toast
      if (window.showToast) {
        window.showToast('STONKS MODE ACTIVATED! 📈', 'success', 3000);
      }
    } else {
      toggle.textContent = 'STONKS MODE';
      toggle.style.background = '';
      document.body.classList.remove('stonks-mode');
    }
  });
  
  container.appendChild(toggle);
}

/**
 * Set up randomized rarity for messages
 */
function setupMessageRarity() {
  // Override the appendMessage function if it exists
  if (window.appendMessage) {
    const originalAppendMessage = window.appendMessage;
    window.appendMessage = function(sender, message, className) {
      // Call original function
      const messageElement = originalAppendMessage(sender, message, className);
      
      // Add enhanced UI class to new message
      if (messageElement) {
        messageElement.classList.add('enhanced-ui');
        
        // If it's an AI message, determine if it's a roast and what level
        if (sender === 'DEGEN ROAST 3000') {
          const currentLevel = parseInt(document.getElementById('roast-level')?.textContent || '1');
          
          // Apply level-specific styling
          if (currentLevel >= 1) {
            // Extract message text
            const messageText = messageElement.querySelector('.message-text');
            if (messageText) {
              // Wrap in span with level class for specific styling
              messageText.innerHTML = `<span class="roast-text level-${currentLevel}">${messageText.innerHTML}</span>`;
              
              // Apply highlighting to certain words in higher level roasts
              if (currentLevel >= 3) {
                highlightRoastText(messageText, currentLevel);
              }
            }
            
            // Add visual effects for higher levels
            if (window.visualEffects && typeof window.visualEffects.showSavageEffects === 'function') {
              window.visualEffects.showSavageEffects(messageElement, currentLevel);
            }
          }
          
          // Random chance for message to be "rare" - reduced frequency for higher value
          const rarityChance = enhancedUIState.rarityChance / Math.max(1, currentLevel - 1);
          if (Math.random() < rarityChance) {
            messageElement.classList.add('nft-badge');
            messageElement.style.boxShadow = '0 0 15px var(--pro-accent)';
            
            // Trigger confetti for rare messages if effects are available
            if (window.visualEffects && typeof window.visualEffects.triggerConfetti === 'function') {
              const rect = messageElement.getBoundingClientRect();
              window.visualEffects.triggerConfetti({
                particleCount: 20,
                spread: 30,
                origin: { 
                  x: rect.right / window.innerWidth,
                  y: rect.top / window.innerHeight
                }
              });
            }
          }
          
          // Add random meme reference as tooltip on hover
          const reference = enhancedUIState.memeReferences[
            Math.floor(Math.random() * enhancedUIState.memeReferences.length)
          ];
          messageElement.title = reference;
        }
      }
      
      return messageElement;
    };
  }
  
  // Also style any existing messages
  const existingMessages = document.querySelectorAll('.message');
  existingMessages.forEach(msg => {
    if (!msg.classList.contains('enhanced-ui')) {
      msg.classList.add('enhanced-ui');
    }
  });
}

/**
 * Highlight specific words in roast text for emphasis
 * @param {Element} element - Text element to enhance
 * @param {number} level - Roast level (1-5)
 */
function highlightRoastText(element, level) {
  if (!element) return;
  
  // Lists of words to highlight by category
  const highlightWords = ['absolutely', 'completely', 'utterly', 'fucking', 'literally', 'actually', 'genuinely'];
  const brutalWords = ['pathetic', 'useless', 'worthless', 'disaster', 'failure', 'embarrassing', 'catastrophic', 'disgusting'];
  const memeWords = ['stonks', 'hodl', 'ngmi', 'fomo', 'rekt', 'moon', 'wen', 'degen', 'ape', 'diamond hands'];
  
  // Get the text content
  let html = element.innerHTML;
  
  // Replace highlight words (more likely at higher levels)
  if (Math.random() < 0.3 + (level * 0.1)) {
    highlightWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      html = html.replace(regex, `<span class="roast-highlight">${word}</span>`);
    });
  }
  
  // Replace brutal words (more likely at higher levels)
  if (Math.random() < 0.2 + (level * 0.15)) {
    brutalWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      html = html.replace(regex, `<span class="roast-brutal">${word}</span>`);
    });
  }
  
  // Replace meme words
  if (Math.random() < 0.25) {
    memeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      html = html.replace(regex, `<span class="roast-meme">${word}</span>`);
    });
  }
  
  // For high levels, add stonks down animation to certain phrases
  if (level >= 4 && Math.random() < 0.4) {
    const phrases = ['going down', 'bottomed out', 'plummeting', 'crashing', 'tanking', 'falling', 'dropping'];
    phrases.forEach(phrase => {
      const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
      html = html.replace(regex, `<span class="stonks-down">📉</span> ${phrase}`);
    });
  }
  
  // Add special formatting for [MEME] tags
  html = html.replace(/\[(WOJAK|PEPE|DOGE)\]/g, (match, meme) => {
    return `<img src="images/memes/${meme.toLowerCase()}.svg" alt="${meme}" class="inline-meme-icon" />`;
  });
  
  // Update the element's content
  element.innerHTML = html;
}

/**
 * Enhance emoji reactions
 */
function enhanceEmojiReactions() {
  const reactionsContainer = document.querySelector('.reaction-buttons');
  if (!reactionsContainer) {
    // Create reaction buttons if they don't exist
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer && !chatContainer.querySelector('.reaction-buttons')) {
      const newReactionsContainer = document.createElement('div');
      newReactionsContainer.className = 'reaction-buttons enhanced-ui';
      
      // Define reactions
      const reactions = [
        { emoji: '😂', title: 'Laugh' },
        { emoji: '😱', title: 'Shock' },
        { emoji: '💀', title: 'Dead' },
        { emoji: '🔥', title: 'Fire' },
        { emoji: '📈', title: 'Stonks' }
      ];
      
      // Create reaction buttons
      reactions.forEach(reaction => {
        const button = document.createElement('button');
        button.className = 'reaction-button enhanced-ui';
        button.innerHTML = reaction.emoji;
        button.title = reaction.title;
        
        button.addEventListener('mouseenter', () => {
          button.style.transform = 'scale(1.2) rotate(5deg)';
          button.style.transition = 'transform 0.5s ease'; // Slowed down
        });
        
        button.addEventListener('mouseleave', () => {
          button.style.transform = '';
        });
        
        button.addEventListener('click', () => {
          // Add animation
          button.classList.add('pulse');
          setTimeout(() => {
            button.classList.remove('pulse');
          }, 1000); // Slowed from 500ms to 1000ms
          
          // Show toast if available
          if (window.showToast) {
            window.showToast(`${reaction.title} reaction!`, 'info', 2000);
          }
        });
        
        newReactionsContainer.appendChild(button);
      });
      
      chatContainer.appendChild(newReactionsContainer);
      return;
    }
  }
  
  // If reactions container exists, enhance it
  if (reactionsContainer) {
    // Add enhanced UI class
    reactionsContainer.classList.add('enhanced-ui');
    
    // Style buttons
    const buttons = reactionsContainer.querySelectorAll('button');
    buttons.forEach(button => {
      button.classList.add('enhanced-ui');
      
      // Add enhanced hover animation
      button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.2) rotate(5deg)';
        button.style.transition = 'transform 0.5s ease'; // Slowed down
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.transform = '';
      });
    });
    
    // Add a new "stonks" reaction if it doesn't exist
    if (!reactionsContainer.querySelector('button[title="Stonks"]')) {
      const stonksButton = document.createElement('button');
      stonksButton.className = 'reaction-button button-hover enhanced-ui';
      stonksButton.innerHTML = '📈';
      stonksButton.title = 'Stonks';
      
      stonksButton.addEventListener('mouseenter', () => {
        stonksButton.style.transform = 'scale(1.2) rotate(5deg)';
        stonksButton.style.transition = 'transform 0.5s ease'; // Slowed down
      });
      
      stonksButton.addEventListener('mouseleave', () => {
        stonksButton.style.transform = '';
      });
      
      stonksButton.addEventListener('click', () => {
        // Add animation
        stonksButton.classList.add('pulse');
        setTimeout(() => {
          stonksButton.classList.remove('pulse');
        }, 1000); // Slowed from 500ms to 1000ms
        
        // Show toast if available
        if (window.showToast) {
          window.showToast('STONKS ONLY GO UP! 📈', 'success', 2000);
        }
      });
      
      reactionsContainer.appendChild(stonksButton);
    }
  }
}

/**
 * Add meme ticker at the bottom of chat
 */
function addMemeTicker() {
  const chatContainer = document.querySelector('.chat-container');
  if (!chatContainer || chatContainer.querySelector('.meme-ticker')) return;
  
  const ticker = document.createElement('div');
  ticker.className = 'meme-ticker';
  ticker.style.height = '30px';
  ticker.style.overflow = 'hidden';
  ticker.style.position = 'relative';
  ticker.style.background = 'rgba(0, 0, 0, 0.3)';
  ticker.style.borderTop = '1px solid rgba(255, 255, 255, 0.1)';
  ticker.style.fontSize = '0.8rem';
  ticker.style.lineHeight = '30px';
  ticker.style.color = 'var(--text-secondary)';
  ticker.style.whiteSpace = 'nowrap';
  
  // Create ticker content
  const tickerContent = document.createElement('div');
  tickerContent.className = 'ticker-content';
  tickerContent.style.position = 'absolute';
  tickerContent.style.left = '100%';
  tickerContent.style.top = '0';
  tickerContent.style.whiteSpace = 'nowrap';
  tickerContent.style.animation = 'ticker-slide 40s linear infinite'; // Slowed from 20s to 40s
  
  // Generate ticker items
  let tickerHtml = '';
  enhancedUIState.stonksTickers.forEach(item => {
    const isUp = Math.random() > 0.3; // 70% chance of going up
    const changePercent = (Math.random() * 5).toFixed(2);
    const priceFormatted = item.price.toLocaleString(undefined, {
      minimumFractionDigits: item.price < 1 ? 5 : 2,
      maximumFractionDigits: item.price < 1 ? 5 : 2
    });
    
    tickerHtml += `
      <span class="ticker-item" style="margin-right: 30px; color: ${isUp ? 'var(--stonks-green)' : 'var(--hodl-red)'}">
        ${item.symbol}: $${priceFormatted} 
        <span class="change">${isUp ? '+' : '-'}${changePercent}%</span>
      </span>
    `;
  });
  
  // Add meme tickers
  tickerHtml += `
    <span class="ticker-item" style="margin-right: 30px; color: var(--pro-highlight)">
      FOMO INDEX: EXTREME 🔥
    </span>
    <span class="ticker-item" style="margin-right: 30px; color: var(--text-secondary)">
      MOON MISSION: IMMINENT 🚀
    </span>
    <span class="ticker-item" style="margin-right: 30px; color: var(--stonks-green)">
      THIS IS FINANCIAL ADVICE (JUST KIDDING) 👀
    </span>
  `;
  
  tickerContent.innerHTML = tickerHtml + tickerHtml; // Duplicate for seamless loop
  ticker.appendChild(tickerContent);
  
  // Insert before message form
  const messageForm = chatContainer.querySelector('.message-form, #message-form');
  if (messageForm) {
    chatContainer.insertBefore(ticker, messageForm);
  } else {
    chatContainer.appendChild(ticker);
  }
  
  // Update tickers periodically - less frequently
  setInterval(() => {
    const tickerItems = document.querySelectorAll('.ticker-item');
    tickerItems.forEach(item => {
      if (item.textContent.includes('$')) {
        const isUp = Math.random() > 0.3; // 70% chance of going up
        const changeElement = item.querySelector('.change');
        if (changeElement) {
          const changePercent = (Math.random() * 5).toFixed(2);
          changeElement.textContent = `${isUp ? '+' : '-'}${changePercent}%`;
          item.style.color = isUp ? 'var(--stonks-green)' : 'var(--hodl-red)';
        }
      }
    });
  }, 10000); // Slowed from 5000ms to 10000ms
}

/**
 * Hook into existing functionality
 */
function hookIntoExistingFunctionality() {
  // Add enhanced typing effects (slow them down)
  if (window.typeMessage) {
    const originalTypeMessage = window.typeMessage;
    window.typeMessage = function(element, text, callback, speed) {
      // Slow down typing speed significantly
      const newSpeed = speed * 2.5; // 2.5x slower
      
      return originalTypeMessage(element, text, callback, newSpeed);
    };
  }
  
  // Add confetti effect on level up
  if (window.levelUpEffects) {
    const originalLevelUpEffects = window.levelUpEffects;
    window.levelUpEffects = function(newLevel) {
      // Call original function
      originalLevelUpEffects(newLevel);
      
      // Add confetti effect
      if (newLevel >= 3) {
        setTimeout(() => showConfetti(), 500); // Delayed confetti for better effect
      }
    };
  }
  
  // Fix character counter
  const userInput = document.getElementById('user-input');
  const charCounter = document.querySelector('.char-counter');
  if (userInput && charCounter) {
    const maxLength = userInput.getAttribute('maxlength') || 280;
    charCounter.textContent = `0/${maxLength}`;
    
    userInput.addEventListener('input', () => {
      const length = userInput.value.length;
      charCounter.textContent = `${length}/${maxLength}`;
    });
  }

  // Fix theme buttons
  const themeButtons = document.querySelectorAll('.theme-button');
  themeButtons.forEach(button => {
    button.removeEventListener('click', handleThemeClick); // Remove any existing handlers
    button.addEventListener('click', handleThemeClick);
  });
  
  // Fix quick phrase buttons
  const quickPhraseButtons = document.querySelectorAll('.quick-phrases button');
  quickPhraseButtons.forEach(button => {
    button.removeEventListener('click', handleQuickPhraseClick); // Remove any existing handlers
    button.addEventListener('click', handleQuickPhraseClick);
  });
}

/**
 * Apply scroll effects to messages
 */
function applyScrollEffects() {
  // Apply smooth scroll effects to messages (more subtle)
  const messages = document.querySelector('.messages');
  if (!messages) return;
  
  messages.removeEventListener('scroll', handleMessagesScroll); // Remove if exists
  messages.addEventListener('scroll', handleMessagesScroll);
}

/**
 * Handles message scroll events
 */
function handleMessagesScroll() {
  const messages = document.querySelector('.messages');
  const messageElements = messages.querySelectorAll('.message');
  
  messageElements.forEach(msg => {
    const rect = msg.getBoundingClientRect();
    const messagesRect = messages.getBoundingClientRect();
    
    // Distance from center of viewport
    const distanceFromCenter = Math.abs(
      (rect.top + rect.height/2) - (messagesRect.top + messagesRect.height/2)
    );
    
    // Scale based on distance from center (even more subtle)
    const scale = 1 - (distanceFromCenter / (messagesRect.height * 2));
    const scaleFactor = 0.97 + (scale * 0.03); // Makes it extremely subtle - 0.97 to 1.0
    
    msg.style.transform = `scale(${scaleFactor})`;
    msg.style.opacity = 0.8 + (scale * 0.2); // 0.8 to 1.0 opacity
  });
}

/**
 * Fix layout issues
 */
function fixLayoutIssues() {
  // Ensure the dashboard has the right structure
  const dashboard = document.querySelector('.dashboard');
  if (dashboard) {
    // Check if roast-controls container exists
    if (!dashboard.querySelector('.roast-controls')) {
      // Create a container for proper layout
      const roastControls = document.createElement('div');
      roastControls.className = 'roast-controls';
      
      // Move children to this container
      while (dashboard.firstChild) {
        roastControls.appendChild(dashboard.firstChild);
      }
      
      dashboard.appendChild(roastControls);
    }
  }
  
  // Fix message form layout
  const messageForm = document.querySelector('.message-form, #message-form');
  if (messageForm) {
    // Make sure the input container exists
    if (!messageForm.querySelector('.input-container')) {
      const inputContainer = document.createElement('div');
      inputContainer.className = 'input-container';
      
      // Find the input and button
      const input = messageForm.querySelector('input, textarea');
      const button = messageForm.querySelector('button[type="submit"]');
      
      if (input && button) {
        // Move them to the container
        inputContainer.appendChild(input.cloneNode(true));
        inputContainer.appendChild(button.cloneNode(true));
        
        // Replace the originals
        input.parentNode.replaceChild(inputContainer, input);
        if (button.parentNode) {
          button.parentNode.removeChild(button);
        }
      }
    }
  }
  
  // Fix any font color issues
  document.querySelectorAll('input, textarea').forEach(element => {
    if (window.getComputedStyle(element).color === 'rgb(0, 0, 0)') {
      element.style.color = 'var(--text-primary, #fff)';
    }
  });
}

/**
 * Handle theme button click
 */
function handleThemeClick(event) {
  const button = event.currentTarget;
  if (!button.dataset.theme) return;
  
  // Remove active class from all theme buttons
  document.querySelectorAll('.theme-button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Add active class to clicked button
  button.classList.add('active');
  
  // Apply theme
  if (window.dashboardFunctions && window.dashboardFunctions.applyTheme) {
    window.dashboardFunctions.applyTheme(button.dataset.theme);
  }
  
  // Play theme change sound if available
  if (window.dashboardFunctions && window.dashboardFunctions.playSound) {
    window.dashboardFunctions.playSound('themeChange');
  }
}

/**
 * Handle quick phrase button click
 */
function handleQuickPhraseClick(event) {
  const button = event.currentTarget;
  if (!button.dataset.phrase) return;
  
  // Set input value to the phrase
  const userInput = document.getElementById('user-input');
  if (userInput) {
    userInput.value = button.dataset.phrase;
    userInput.focus();
    
    // Update character counter
    const charCounter = document.querySelector('.char-counter');
    if (charCounter) {
      const maxLength = userInput.getAttribute('maxlength') || 280;
      charCounter.textContent = `${button.dataset.phrase.length}/${maxLength}`;
    }
  }
  
  // Add bounce animation
  button.classList.add('meme-bounce');
  setTimeout(() => {
    button.classList.remove('meme-bounce');
  }, 1000); // Slowed from 500ms to 1000ms
}

/**
 * Show confetti effect
 */
function showConfetti() {
  // Check if we've already added confetti script
  if (window.confetti) {
    triggerConfetti();
    return;
  }
  
  // Create minimal confetti function
  window.confetti = {
    create: function(canvasEl, options) {
      return new ConfettiGenerator(options).render();
    }
  };
  
  // Simplified confetti generator with slower animations
  function ConfettiGenerator(options) {
    const defaults = {
      particleCount: 30, // Reduced from 50
      angle: 90,
      spread: 45,
      startVelocity: 25, // Reduced from 45
      decay: 0.94, // Slower decay (0.9 → 0.94)
      gravity: 0.7, // Reduced gravity for slower fall
      colors: ['#8957ff', '#ffcc00', '#ff3366', '#00ff88', '#0099ff']
    };
    
    const finalOptions = Object.assign({}, defaults, options);
    
    function randomPhysics(angle, spread, startVelocity) {
      const radAngle = angle * (Math.PI / 180);
      const radSpread = spread * (Math.PI / 180);
      return {
        x: 0,
        y: 0,
        wobble: Math.random() * 5, // Reduced wobble
        wobbleSpeed: Math.random() * 0.05, // Slower wobble
        velocity: (startVelocity * 0.5) + (Math.random() * startVelocity),
        angle2D: -radAngle + ((0.5 * radSpread) - (Math.random() * radSpread)),
        angle3D: -(Math.PI / 4) + (Math.random() * (Math.PI / 2)),
        tiltAngle: Math.random() * Math.PI,
        tiltAngleSpeed: 0.05 + (Math.random() * 0.1) // Slower tilt
      };
    }
    
    return {
      render: function() {
        const particles = [];
        
        function renderParticle(context, particle) {
          context.fillStyle = particle.color;
          context.beginPath();
          context.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
          context.fill();
        }
        
        function updateParticle(particle, width, height) {
          particle.physics.x += Math.cos(particle.physics.angle2D) * particle.physics.velocity;
          particle.physics.y += Math.sin(particle.physics.angle2D) * particle.physics.velocity + particle.physics.gravity;
          particle.physics.wobble += particle.physics.wobbleSpeed;
          particle.physics.velocity *= particle.physics.decay;
          particle.physics.y += 1.5; // Reduced from 3
          particle.physics.tiltAngle += particle.physics.tiltAngleSpeed;
          
          particle.x += particle.physics.x;
          particle.y += particle.physics.y;
          particle.wobble = particle.physics.wobble;
          particle.angle = particle.physics.tiltAngle;
          
          return (particle.x < width + 20 && particle.x > -20 && particle.y < height + 20 && particle.y > -20);
        }
        
        function animate() {
          const canvas = document.getElementById('confetti-canvas');
          if (!canvas) return;
          
          const ctx = canvas.getContext('2d');
          const width = canvas.width;
          const height = canvas.height;
          
          ctx.clearRect(0, 0, width, height);
          
          particles.forEach((particle, i) => {
            if (!updateParticle(particle, width, height)) {
              particles.splice(i, 1);
              return;
            }
            
            renderParticle(ctx, particle);
          });
          
          if (particles.length) {
            requestAnimationFrame(animate);
          } else {
            // Remove canvas when done
            setTimeout(() => {
              if (canvas && canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
              }
            }, 2000); // Delay canvas removal
          }
        }
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.id = 'confetti-canvas';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '9999';
        document.body.appendChild(canvas);
        
        // Generate particles
        for (let i = 0; i < finalOptions.particleCount; i++) {
          particles.push({
            x: canvas.width * 0.5,
            y: canvas.height * 0.5,
            wobble: 0,
            size: Math.random() * 5 + 3,
            color: finalOptions.colors[Math.floor(Math.random() * finalOptions.colors.length)],
            angle: 0,
            physics: randomPhysics(finalOptions.angle, finalOptions.spread, finalOptions.startVelocity)
          });
        }
        
        animate();
      }
    };
  }
  
  triggerConfetti();
}

function triggerConfetti() {
  window.confetti.create(null, {
    particleCount: 60,
    spread: 70,
    origin: { y: 0.6 }
  });
}

// Initialize enhanced UI when script is loaded (if DOM is already loaded)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initEnhancedUI();
}

// Create custom roast level change event
function emitRoastLevelChangeEvent(level) {
  if (typeof level !== 'number') return;
  
  // Create and dispatch the event
  const event = new CustomEvent('roastLevelChange', { 
    detail: { level },
    bubbles: true,
    cancelable: true 
  });
  
  document.dispatchEvent(event);
}

// Hook into the roast level change function if it exists
if (typeof window.setRoastLevel === 'function') {
  const originalSetRoastLevel = window.setRoastLevel;
  window.setRoastLevel = function(level) {
    // Call original function
    originalSetRoastLevel(level);
    
    // Emit event for other components to react to
    emitRoastLevelChangeEvent(level);
  };
}

// Add theme change handler to apply theme-specific settings
function enhanceThemeSelection() {
  document.querySelectorAll('.theme-button').forEach(button => {
    button.addEventListener('click', function() {
      const theme = this.dataset.theme;
      
      // Remove all theme classes first
      document.body.classList.remove('crypto-theme', 'hacker-theme', 'gamer-theme', 'meme-theme');
      
      // Add new theme class
      if (theme) {
        document.body.classList.add(`${theme}-theme`);
      }
      
      // Special handling for meme theme
      if (theme === 'meme') {
        // Show toast with meme message
        if (window.showToast) {
          window.showToast('SUCH WOW! VERY MEME! 🚀', 'success', 3000);
        }
        
        // Add emoji animation
        if (window.visualEffects && typeof window.visualEffects.addFloatingEmojis === 'function') {
          window.visualEffects.addFloatingEmojis(['🚀', '💎', '👐', '🌕', '🦍'], 10);
        }
      }
    });
  });
} 