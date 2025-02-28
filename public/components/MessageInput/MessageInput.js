/**
 * MessageInput.js
 * 
 * Message input component for DEGEN ROAST 3000
 * Manages user input and message submission
 */
class MessageInput extends ComponentBase {
  /**
   * Create a new MessageInput component
   * @param {string} containerId - ID of the container element
   * @param {Object} options - Component options
   */
  constructor(containerId, options = {}) {
    // Default options
    const defaultOptions = {
      placeholder: "Type something to get absolutely roasted...", 
      maxLength: 500,
      showCharCounter: true,
      showClearButton: true,
      showQuickPhrases: true,
      sendButtonText: "Roast Me",
      sendButtonEmoji: "🔥",
      clearButtonText: "Clear Chat",
      clearButtonEmoji: "🧹",
      quickPhrases: [
        { text: "How's my portfolio?", icon: "💰" },
        { text: "Roast my coding skills", icon: "💻" },
        { text: "Say something savage", icon: "🔥" },
        { text: "Eviscerate me", icon: "💀" }
      ]
    };
    
    // Initialize base component with merged options and initial state
    super(containerId, {
      options: { ...defaultOptions, ...options },
      currentTheme: typeof ThemeManager !== 'undefined' ? 
        ThemeManager.getCurrentTheme() : 'crypto',
      isStonksModeActive: false,
      inputText: '',
      isTyping: false,
      selectedMeme: null
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
      
      // Listen for stonks mode changes
      this.on('stonksModeToggled', (data) => {
        this.setState({ isStonksModeActive: data.enabled });
      });
      
      // Listen for clear chat
      this.on('clearChat', () => {
        this.clearInput();
      });
      
      // Listen for meme selection
      this.on('memeSelected', (data) => {
        this.setState({ selectedMeme: data.meme });
        this.insertMemeReference(data.meme, data.displayName || data.meme);
      });
    }
  }
  
  /**
   * Render the component
   */
  render() {
    const { currentTheme, isStonksModeActive, inputText } = this.state;
    const { 
      placeholder,
      maxLength,
      showCharCounter,
      showClearButton,
      showQuickPhrases,
      sendButtonText,
      sendButtonEmoji,
      clearButtonText,
      clearButtonEmoji,
      quickPhrases
    } = this.state.options;
    
    // Generate HTML
    this.container.innerHTML = `
      <div class="message-input-component theme-${currentTheme} ${isStonksModeActive ? 'stonks-mode' : ''}">
        <form class="message-form" id="message-form">
          <div class="input-container">
            <textarea 
              id="user-input" 
              class="input-field"
              placeholder="${placeholder}" 
              maxlength="${maxLength}"
              rows="3"
              autocapitalize="sentences"
              autocomplete="off"
              autocorrect="on"
              spellcheck="true"
              style="font-size: 16px; min-height: 44px;"
            >${inputText}</textarea>
            ${showCharCounter ? `<div class="char-counter"><span id="char-count">0</span>/${maxLength}</div>` : ''}
          </div>
          
          ${showQuickPhrases && quickPhrases.length > 0 ? `
            <div class="quick-phrases">
              ${quickPhrases.map(phrase => `
                <button type="button" class="quick-phrase-button" data-text="${phrase.text}">
                  <span class="phrase-icon">${phrase.icon}</span>
                  <span class="phrase-text">${phrase.text}</span>
                </button>
              `).join('')}
            </div>
          ` : ''}
          
          <div class="button-row">
            ${showClearButton ? `
              <button type="button" id="clear-button" class="action-button clear-button">
                <span>${clearButtonText}</span>
                <span class="button-icon">${clearButtonEmoji}</span>
              </button>
            ` : ''}
            <button type="submit" id="send-button" class="action-button send-button" disabled>
              <span>${sendButtonText}</span>
              <span class="button-icon">${sendButtonEmoji}</span>
            </button>
          </div>
        </form>
      </div>
    `;
    
    // Get references to key elements
    this.messageInputComponent = this.container.querySelector('.message-input-component');
    this.messageForm = this.container.querySelector('#message-form');
    this.inputField = this.container.querySelector('#user-input');
    this.charCounter = this.container.querySelector('#char-count');
    this.sendButton = this.container.querySelector('#send-button');
    this.clearButton = this.container.querySelector('#clear-button');
    this.quickPhraseButtons = this.container.querySelectorAll('.quick-phrase-button');
    
    // Set up DOM event listeners
    this.setupDomEventListeners();
    
    // Update char counter
    this.updateCharCounter();
    
    // Mark as rendered
    this.rendered = true;
  }
  
  /**
   * Set up DOM event listeners
   */
  setupDomEventListeners() {
    if (this.messageForm) {
      this.addListener(this.messageForm, 'submit', this.handleSubmit.bind(this));
    }
    
    if (this.inputField) {
      this.addListener(this.inputField, 'input', this.handleInput.bind(this));
      this.addListener(this.inputField, 'keydown', this.handleKeyDown.bind(this));
    }
    
    if (this.clearButton) {
      this.addListener(this.clearButton, 'click', this.handleClearClick.bind(this));
    }
    
    if (this.quickPhraseButtons) {
      this.quickPhraseButtons.forEach(button => {
        this.addListener(button, 'click', this.handleQuickPhraseClick.bind(this));
      });
    }
  }
  
  /**
   * Handle form submission
   * @param {Event} event - Submit event
   */
  handleSubmit(event) {
    event.preventDefault();
    
    // Get input text
    const text = this.inputField.value.trim();
    
    // Don't send empty messages
    if (!text) return;
    
    // Emit event
    this.emit('messageSent', {
      text,
      timestamp: Date.now()
    });
    
    // Clear input
    this.clearInput();
    
    // Re-focus the input field after a short delay
    // This is crucial for mobile UX to ensure the input stays accessible
    const isMobile = window.innerWidth <= 1024 || 
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                    ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0);
    
    if (isMobile) {
      // On mobile, use different strategies for iOS vs Android
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      
      if (isIOS) {
        // For iOS, use a slightly longer delay and force visibility
        setTimeout(() => {
          // Ensure the text area is empty and visible
          this.inputField.style.height = 'auto';
          
          // Set focus on the input field 
          this.inputField.focus();
          
          // Ensure input is visible in viewport using scrollIntoView
          this.inputField.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Additional scroll adjustment for iOS
          setTimeout(() => {
            window.scrollTo(0, window.scrollY + 100);
          }, 200);
        }, 500);
      } else {
        // For Android, use standard approach
        setTimeout(() => {
          this.inputField.focus();
          
          // Ensure input is visible in viewport
          const rect = this.inputField.getBoundingClientRect();
          if (rect.bottom > window.innerHeight) {
            window.scrollTo({
              top: window.scrollY + (rect.bottom - window.innerHeight) + 10,
              behavior: 'smooth'
            });
          }
        }, 300);
      }
    } else {
      // On desktop, re-focus immediately
      this.inputField.focus();
    }
  }
  
  /**
   * Handle input changes
   * @param {Event} event - Input event
   */
  handleInput(event) {
    // Update state
    this.setState({ inputText: event.target.value, isTyping: true });
    
    // Update char counter
    this.updateCharCounter();
    
    // Enable/disable send button
    this.toggleSendButton();
    
    // For mobile: ensure the input field remains visible when typing
    const isMobile = window.innerWidth <= 1024 || 
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                    ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0);
    
    if (isMobile) {
      // Check if the input has overflowed its initial height
      if (this.inputField.scrollHeight > this.inputField.clientHeight) {
        // Adjust height to avoid clipping if multi-line
        this.inputField.style.height = 'auto';
        this.inputField.style.height = `${this.inputField.scrollHeight}px`;
      }
      
      // Ensure we can see what we're typing by scrolling the input into view
      const isInputInView = () => {
        const rect = this.inputField.getBoundingClientRect();
        const keyboardHeight = window.innerHeight * 0.4; // Estimate keyboard height
        return rect.bottom < (window.innerHeight - keyboardHeight);
      };
      
      if (!isInputInView()) {
        // Scroll to make sure the input is visible above the keyboard
        setTimeout(() => {
          this.inputField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
    
    // Reset typing flag after a short delay
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.setState({ isTyping: false });
    }, 500);
  }
  
  /**
   * Handle keydown events
   * @param {KeyboardEvent} event - Keydown event
   */
  handleKeyDown(event) {
    // Submit on Enter (without Shift)
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      
      // Get input text
      const text = this.inputField.value.trim();
      
      // Don't send empty messages
      if (!text) return;
      
      // Send message
      this.sendMessage(text);
      
      // Clear input
      this.clearInput();
    }
  }
  
  /**
   * Handle clear button click
   * @param {Event} event - Click event
   */
  handleClearClick(event) {
    // Emit clear chat event
    this.emit('clearChat', {});
    
    // Clear input
    this.clearInput();
    
    // Play sound if available
    if (window.appComponents && window.appComponents.soundboard) {
      window.appComponents.soundboard.playSound('ui', 'clear');
    }
  }
  
  /**
   * Handle quick phrase button click
   * @param {Event} event - Click event
   */
  handleQuickPhraseClick(event) {
    // Get phrase
    const button = event.currentTarget;
    const text = button.getAttribute('data-text');
    
    // Set as input
    this.inputField.value = text;
    this.setState({ inputText: text });
    
    // Update UI
    this.updateCharCounter();
    this.toggleSendButton();
    
    // Add animation
    button.classList.add('active');
    setTimeout(() => {
      button.classList.remove('active');
    }, 300);
    
    // Focus input field
    this.inputField.focus();
    
    // Play sound if available
    if (window.appComponents && window.appComponents.soundboard) {
      window.appComponents.soundboard.playSound('ui', 'select');
    }
  }
  
  /**
   * Send a message
   * @param {string} text - Message text
   */
  sendMessage(text) {
    // Emit message sent event
    this.emit('messageSent', {
      text: text,
      sender: 'You',
      timestamp: Date.now()
    });
    
    // Reset selected meme
    this.setState({ selectedMeme: null });
    
    // Play sound if available
    if (window.appComponents && window.appComponents.soundboard) {
      window.appComponents.soundboard.playSound('message', 'send');
    }
  }
  
  /**
   * Clear the input field
   */
  clearInput() {
    if (this.inputField) {
      this.inputField.value = '';
      this.setState({ inputText: '' });
      this.updateCharCounter();
      this.toggleSendButton();
    }
  }
  
  /**
   * Update character counter
   */
  updateCharCounter() {
    if (this.charCounter && this.inputField) {
      const count = this.inputField.value.length;
      this.charCounter.textContent = count;
      
      // Color the counter when nearing the limit
      if (count > this.state.options.maxLength * 0.9) {
        this.charCounter.parentElement.classList.add('near-limit');
      } else {
        this.charCounter.parentElement.classList.remove('near-limit');
      }
    }
  }
  
  /**
   * Toggle send button enabled/disabled state
   */
  toggleSendButton() {
    if (this.sendButton && this.inputField) {
      const hasText = this.inputField.value.trim().length > 0;
      this.sendButton.disabled = !hasText;
    }
  }
  
  /**
   * Insert a meme reference into the input field
   * @param {string} memeId - Meme identifier
   * @param {string} displayName - Display name
   */
  insertMemeReference(memeId, displayName) {
    if (!this.inputField) return;
    
    // Create meme tag
    const memeTag = `[meme:${memeId}]`;
    
    // Get cursor position
    const cursorPos = this.inputField.selectionStart;
    
    // Insert at cursor position or end
    const startText = this.inputField.value.substring(0, cursorPos);
    const endText = this.inputField.value.substring(cursorPos);
    this.inputField.value = `${startText} ${memeTag} ${endText}`;
    
    // Update state
    this.setState({ inputText: this.inputField.value });
    
    // Update UI
    this.updateCharCounter();
    this.toggleSendButton();
    
    // Focus input
    this.inputField.focus();
    
    // Play sound if available
    if (window.appComponents && window.appComponents.soundboard) {
      window.appComponents.soundboard.playSound('ui', 'meme');
    }
    
    // Emit event
    this.emit('memeInserted', { meme: memeId });
  }
  
  /**
   * Update component after state changes
   */
  update() {
    if (this.messageInputComponent) {
      // Update theme class
      this.messageInputComponent.className = `message-input-component theme-${this.state.currentTheme}`;
      
      // Update stonks mode class
      if (this.state.isStonksModeActive) {
        this.messageInputComponent.classList.add('stonks-mode');
      } else {
        this.messageInputComponent.classList.remove('stonks-mode');
      }
      
      // Update input text if changed externally
      if (this.inputField && this.inputField.value !== this.state.inputText) {
        this.inputField.value = this.state.inputText;
        this.updateCharCounter();
        this.toggleSendButton();
      }
    } else {
      // If critical elements don't exist, re-render
      this.render();
    }
  }
}

// Make sure the component is available globally
if (typeof window !== 'undefined') {
  window.MessageInput = MessageInput;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MessageInput;
} 