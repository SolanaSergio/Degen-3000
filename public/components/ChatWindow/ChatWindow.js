/**
 * ChatWindow.js
 * 
 * Main chat display component for DEGEN ROAST 3000
 * Handles rendering messages and chat-related functionality
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
      maxMessages: 50,             // Maximum number of messages to display
      animateMessages: true,       // Whether to animate message appearance
      typingSpeed: 20,             // Typing animation speed (ms per character)
      showTimestamps: true,        // Whether to show message timestamps
      autoScroll: true             // Auto-scroll to bottom on new messages
    };
    
    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Initialize base component
    super(containerId, {
      messages: [],                // Message history
      isTyping: false,             // Whether a typing animation is in progress
      currentTheme: typeof ThemeManager !== 'undefined' ? ThemeManager.getCurrentTheme() : 'crypto',
      currentLevel: 1,             // Current roast level
      options: mergedOptions       // Component options
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
      
      // Listen for new messages
      this.on('messageSent', (data) => {
        this.addMessage(data);
      });
      
      // Listen for bot responses
      this.on('botResponse', (data) => {
        this.addMessage(data);
      });
      
      // Listen for level changes
      this.on('levelChanged', (data) => {
        this.setState({ currentLevel: data.level });
      });
      
      // Listen for clear chat
      this.on('clearChat', () => {
        this.clearMessages();
      });
    }
  }
  
  /**
   * Render the component
   */
  render() {
    // Create the chat window HTML
    this.container.innerHTML = `
      <div class="chat-window theme-${this.state.currentTheme}">
        <div class="messages" id="${this.id}-messages"></div>
      </div>
    `;
    
    // Get the messages container
    this.messagesElement = document.getElementById(`${this.id}-messages`);
    
    // Render existing messages
    this.renderMessages();
    
    // Mark as rendered
    this.rendered = true;
  }
  
  /**
   * Render all messages
   */
  renderMessages() {
    if (!this.messagesElement) return;
    
    // Clear existing messages
    this.messagesElement.innerHTML = '';
    
    // Render each message
    this.state.messages.forEach(message => {
      this.renderMessage(message);
    });
    
    // Scroll to bottom if auto-scroll is enabled
    if (this.state.options.autoScroll) {
      this.scrollToBottom();
    }
  }
  
  /**
   * Render a single message
   * @param {Object} message - Message object
   * @returns {HTMLElement} - Message element
   */
  renderMessage(message) {
    if (!this.messagesElement) return null;
    
    // Create message element
    const messageElement = document.createElement('div');
    
    // Set classes
    messageElement.className = `message ${message.type}-message`;
    if (message.level) {
      messageElement.dataset.level = message.level;
      messageElement.classList.add(`level-${message.level}`);
    }
    
    // Add custom classes
    if (message.classes) {
      message.classes.forEach(cls => {
        messageElement.classList.add(cls);
      });
    }
    
    // Generate timestamp
    const timestamp = message.timestamp 
      ? new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      : new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    // Select icon based on message type
    const iconEmoji = message.type === 'user' ? '👤' : '🔥';
    
    // Create message structure
    messageElement.innerHTML = `
      <div class="message-icon">${message.icon || iconEmoji}</div>
      <div class="message-content">
        <div class="message-sender">${message.sender}</div>
        <div class="message-text">${message.text}</div>
        ${this.state.options.showTimestamps ? `<div class="message-timestamp">${timestamp}</div>` : ''}
      </div>
    `;
    
    // Add to container
    this.messagesElement.appendChild(messageElement);
    
    // Apply typing animation for bot messages
    if (message.type === 'bot' && this.state.options.animateMessages && !message.skipAnimation) {
      const textElement = messageElement.querySelector('.message-text');
      if (textElement) {
        // Store original text
        const originalText = textElement.textContent;
        
        // Set to empty to start animation
        textElement.textContent = '';
        
        // Mark as typing
        this.setState({ isTyping: true }, false);
        
        // Animate typing
        this.typeMessage(textElement, originalText, () => {
          // Done typing
          this.setState({ isTyping: false }, false);
          
          // Emit event when typing completes
          this.emit('typingComplete', { message });
        });
      }
    }
    
    // Scroll to the newly added message if auto-scroll is enabled
    if (this.state.options.autoScroll) {
      this.scrollToBottom();
    }
    
    return messageElement;
  }
  
  /**
   * Animate typing text into an element
   * @param {HTMLElement} element - Element to type text into
   * @param {string} text - Text to type
   * @param {Function} callback - Called when typing is complete
   */
  typeMessage(element, text, callback) {
    let index = 0;
    const speed = this.state.options.typingSpeed;
    
    // Clear any existing content
    element.textContent = '';
    
    // Typing function
    const type = () => {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        setTimeout(type, speed);
      } else {
        if (typeof callback === 'function') {
          callback();
        }
      }
    };
    
    // Start typing
    type();
  }
  
  /**
   * Add a message to the chat
   * @param {Object} message - Message object
   */
  addMessage(message) {
    // Create consistent message object
    const newMessage = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      timestamp: Date.now(),
      level: this.state.currentLevel,
      ...message
    };
    
    // Add to messages array
    const updatedMessages = [...this.state.messages, newMessage];
    
    // Limit the number of messages if needed
    if (this.state.options.maxMessages > 0 && updatedMessages.length > this.state.options.maxMessages) {
      updatedMessages.splice(0, updatedMessages.length - this.state.options.maxMessages);
    }
    
    // Update state
    this.setState({ messages: updatedMessages }, false);
    
    // Render just this message instead of all messages
    this.renderMessage(newMessage);
    
    // Emit event
    this.emit('messageAdded', { message: newMessage });
  }
  
  /**
   * Clear all messages
   */
  clearMessages() {
    // Update state
    this.setState({ messages: [] });
    
    // Emit event
    this.emit('messagesCleared', {});
  }
  
  /**
   * Scroll to the bottom of the chat
   */
  scrollToBottom() {
    if (this.messagesElement) {
      this.messagesElement.scrollTop = this.messagesElement.scrollHeight;
    }
  }
  
  /**
   * Update component after state changes
   */
  update() {
    // Re-render all messages
    this.renderMessages();
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatWindow;
} 