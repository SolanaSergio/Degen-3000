/**
 * ChatWindow.js
 * 
 * Chat window component for DEGEN ROAST 3000
 * Manages the display of chat messages and interactions
 */
class ChatWindow extends ComponentBase {
  /**
   * Create a new ChatWindow component
   * @param {string} containerId - ID of the container element
   * @param {Object} options - Component options
   */
  constructor(containerId, options = {}) {
    // Default options
    const defaultOptions = {
      messages: [],                // Initial messages to display
      maxMessages: 50,             // Maximum number of messages to show
      typingSpeed: 30,             // Typing animation speed (ms per character)
      enableTypingAnimation: true, // Enable typing animation for bot messages
      autoScroll: true,            // Auto-scroll to new messages
      showSenderLabels: true,      // Show sender name labels
      showTimestamps: false,       // Show message timestamps
      botName: "ROAST BOT"         // Name to display for bot messages
    };
    
    // Initialize base component with merged options
    super(containerId, {
      options: { ...defaultOptions, ...options },
      messages: options.messages || defaultOptions.messages,
      currentTheme: typeof ThemeManager !== 'undefined' ? 
        ThemeManager.getCurrentTheme() : 'crypto',
      isStonksModeActive: false,
      isTyping: false
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
    
    // Initialize scroll observer
    this.setupScrollObserver();
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
      
      // Listen for new messages
      this.on('messageSent', (data) => {
        this.addMessage({
          text: data.text,
          sender: 'user',
          timestamp: data.timestamp || Date.now()
        });
      });
      
      // Listen for bot responses
      this.on('botResponse', (data) => {
        this.addMessage({
          text: data.text,
          sender: 'bot',
          level: data.level || 1,
          timestamp: data.timestamp || Date.now()
        }, this.state.options.enableTypingAnimation);
      });
      
      // Listen for clear chat requests
      this.on('clearChat', () => {
        this.clearChat();
      });
    }
  }
  
  /**
   * Render the component
   */
  render() {
    const { currentTheme, isStonksModeActive } = this.state;
    
    // Generate HTML
    this.container.innerHTML = `
      <div class="chat-window-component theme-${currentTheme} ${isStonksModeActive ? 'stonks-mode' : ''}">
        <div class="messages-container" id="messages-container">
          ${this.renderMessages()}
          <div class="typing-indicator hidden">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>
    `;
    
    // Get references to key elements
    this.chatElement = this.container.querySelector('.chat-window-component');
    this.messagesContainer = this.container.querySelector('.messages-container');
    this.typingIndicator = this.container.querySelector('.typing-indicator');
    
    // Apply Stonks Mode if active
    if (isStonksModeActive) {
      this.applyStonksMode();
    }
    
    // Mark as rendered
    this.rendered = true;
  }
  
  /**
   * Render the messages
   * @returns {string} HTML for messages
   */
  renderMessages() {
    const { messages } = this.state;
    const { showSenderLabels, showTimestamps, botName } = this.state.options;
    
    if (messages.length === 0) {
      return '';
    }
    
    return messages.map(message => {
      const timestamp = showTimestamps ? new Date(message.timestamp).toLocaleTimeString() : '';
      const level = message.level || 1;
      const sender = message.sender === 'bot' ? botName : 'YOU';
      const messageClass = message.sender === 'bot' ? 'bot-message' : 'user-message';
      
      return `
        <div class="message ${messageClass}" data-timestamp="${message.timestamp}">
          <div class="message-content">
            ${showSenderLabels ? `<span class="message-sender">${sender}:</span>` : ''}
            <div class="message-text ${message.sender === 'bot' ? `level-${level}` : ''}">
              ${message.text}
            </div>
            ${showTimestamps ? `<div class="message-timestamp">${timestamp}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }
  
  /**
   * Set up the scroll observer for auto-scrolling
   */
  setupScrollObserver() {
    // Create an observer for new messages
    this.messageObserver = new MutationObserver((mutations) => {
      if (this.state.options.autoScroll) {
        this.scrollToBottom();
      }
    });
    
    // Start observing
    if (this.messagesContainer) {
      this.messageObserver.observe(this.messagesContainer, {
        childList: true,
        subtree: true
      });
    }
  }
  
  /**
   * Add a message to the chat
   * @param {Object} message - Message object
   * @param {boolean} animate - Whether to animate the message
   */
  addMessage(message, animate = false) {
    // Add timestamp if not provided
    if (!message.timestamp) {
      message.timestamp = Date.now();
    }
    
    // Add the message to state
    const messages = [...this.state.messages, message];
    
    // Trim messages if over limit
    if (messages.length > this.state.options.maxMessages) {
      messages.shift();
    }
    
    // Update state
    this.setState({ messages, isTyping: animate });
    
    // Scroll to bottom immediately for user messages
    if (message.sender === 'user') {
      this.scrollToBottom(true);
    }
    
    // If not animating, render immediately and scroll
    if (!animate) {
      this.renderMessages();
      this.scrollToBottom(true);
      return;
    }
    
    // Start typing animation
    this.showTypingAnimation(message.text);
    
    // After the animation completes or on mobile devices, ensure input field is accessible
    setTimeout(() => {
      // Get the message input field
      const inputField = document.querySelector('#user-input, .input-field, textarea.chat-input');
      
      // Check if we're on a mobile device
      const isMobile = window.innerWidth <= 1024 || 
                       /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                       ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0);
      
      // Only do this on mobile, as it can interrupt desktop typing
      if (isMobile && inputField) {
        // Ensure the input field is visible and focused
        inputField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          inputField.focus();
        }, 300);
      }
    }, message.text.length * (this.state.options.typingSpeed || 30) + 500);
  }
  
  /**
   * Show typing animation for bot messages
   * @param {string} text - Text to display with animation
   */
  showTypingAnimation(text) {
    // Get most recent message element
    const messageElements = this.container.querySelectorAll('.message');
    if (messageElements.length === 0) return;
    
    const lastMessage = messageElements[messageElements.length - 1];
    const textElement = lastMessage.querySelector('.message-text');
    if (!textElement) return;
    
    // Show typing indicator
    this.setState({ isTyping: true });
    if (this.typingIndicator) {
      this.typingIndicator.classList.remove('hidden');
    }
    
    // Store original text and clear it
    const fullText = text;
    textElement.textContent = '';
    
    // Type out text
    let charIndex = 0;
    const typeNextChar = () => {
      if (charIndex < fullText.length) {
        textElement.textContent += fullText.charAt(charIndex);
        charIndex++;
        setTimeout(typeNextChar, this.state.options.typingSpeed);
      } else {
        // Typing complete
        this.setState({ isTyping: false });
        if (this.typingIndicator) {
          this.typingIndicator.classList.add('hidden');
        }
        
        // Emit typing complete event
        this.emit('typingComplete', { message: fullText });
      }
    };
    
    // Start typing animation
    setTimeout(typeNextChar, this.state.options.typingSpeed);
  }
  
  /**
   * Scroll to bottom of messages
   * @param {boolean} smooth - Whether to use smooth scrolling
   */
  scrollToBottom(smooth = true) {
    if (this.messagesContainer) {
      // Check if already at bottom (within 100px)
      const isNearBottom = this.messagesContainer.scrollHeight - this.messagesContainer.scrollTop - this.messagesContainer.clientHeight < 100;
      
      // For iOS, we need extra reliability
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      
      if (isIOS) {
        // iOS needs multiple attempts at scrolling to be reliable
        // First try with requestAnimationFrame for timing with render cycle
        requestAnimationFrame(() => {
          this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
          
          // Then try again after a delay
          setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            
            // And once more for good measure on iOS
            setTimeout(() => {
              this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            }, 100);
          }, 50);
        });
      } else {
        // Non-iOS devices can use smooth scrolling when appropriate
        if (smooth && !isNearBottom) {
          try {
            // Try modern scrollTo with smooth behavior
            this.messagesContainer.scrollTo({
              top: this.messagesContainer.scrollHeight,
              behavior: 'smooth'
            });
          } catch (e) {
            // Fallback for browsers that don't support smooth scrolling
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
          }
        } else {
          // Instant scroll for cases where we're already close to the bottom
          this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
      }
      
      // For mobile devices in general, add an additional check
      // to make sure scroll happened correctly
      if (window.innerWidth <= 1024) {
        setTimeout(() => {
          // Calculate if we're actually at the bottom
          const scrollBottom = this.messagesContainer.scrollTop + this.messagesContainer.clientHeight;
          const atBottom = Math.abs(scrollBottom - this.messagesContainer.scrollHeight) < 10;
          
          // If not, force it again
          if (!atBottom) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
          }
        }, 300);
      }
    }
  }
  
  /**
   * Clear all messages from chat
   */
  clearChat() {
    this.setState({ messages: [] });
    
    // Emit event
    this.emit('messagesCleared', {});
  }
  
  /**
   * Apply Stonks Mode styling
   */
  applyStonksMode() {
    if (this.chatElement) {
      this.chatElement.classList.add('stonks-mode');
    }
  }
  
  /**
   * Update component after state changes
   */
  update() {
    if (this.chatElement) {
      // Update theme class
      this.chatElement.className = `chat-window-component theme-${this.state.currentTheme}`;
      
      // Update stonks mode class
      if (this.state.isStonksModeActive) {
        this.chatElement.classList.add('stonks-mode');
      } else {
        this.chatElement.classList.remove('stonks-mode');
      }
      
      // Re-render messages
      if (this.messagesContainer) {
        this.messagesContainer.innerHTML = this.renderMessages();
        
        // Add back typing indicator
        if (this.typingIndicator) {
          this.messagesContainer.appendChild(this.typingIndicator);
          
          // Show/hide typing indicator
          if (this.state.isTyping) {
            this.typingIndicator.classList.remove('hidden');
          } else {
            this.typingIndicator.classList.add('hidden');
          }
        }
      }
    } else {
      // If critical elements don't exist, re-render
      this.render();
    }
  }
  
  /**
   * Clean up when component is destroyed
   */
  destroy() {
    // Disconnect observer
    if (this.messageObserver) {
      this.messageObserver.disconnect();
    }
    
    // Call parent destroy
    super.destroy();
  }
}

// Make sure the component is available globally
if (typeof window !== 'undefined') {
  window.ChatWindow = ChatWindow;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatWindow;
} 