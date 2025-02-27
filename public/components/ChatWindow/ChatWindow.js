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
   * Add a new message to the chat
   * @param {Object} message - Message object
   * @param {boolean} animate - Whether to use typing animation for bot messages
   */
  addMessage(message, animate = false) {
    // Clone current messages
    const updatedMessages = [...this.state.messages];
    
    // Add new message
    updatedMessages.push(message);
    
    // Trim messages if over limit
    if (updatedMessages.length > this.state.options.maxMessages) {
      updatedMessages.shift();
    }
    
    // Update state
    this.setState({ messages: updatedMessages });
    
    // If bot message and animation enabled, show typing animation
    if (message.sender === 'bot' && animate) {
      this.showTypingAnimation(message.text);
    }
    
    // Emit event
    this.emit('messageAdded', { message });
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
   */
  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
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