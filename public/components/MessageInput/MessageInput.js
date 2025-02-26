/**
 * MessageInput.js
 * 
 * Component for user message input functionality including:
 * - Message text input area
 * - Character counter
 * - Quick phrase selection buttons
 * - Submit handling
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
      maxLength: 280,              // Maximum message length
      placeholder: "Enter your message...",
      submitButtonText: "Send",
      quickPhrases: [
        { emoji: "📉", text: "Roast my crypto portfolio", phrase: "Roast my crypto portfolio" },
        { emoji: "💻", text: "My Code", phrase: "Roast my coding skills" },
        { emoji: "🤔", text: "Life Choices", phrase: "Roast my life choices" },
        { emoji: "🤣", text: "Meme Me", phrase: "Roast me like a meme" },
        { emoji: "💰", text: "Crypto Trader", phrase: "I'm a crypto trader" },
        { emoji: "🔥", text: "Roast Hard", phrase: "Roast me hard" }
      ],
      showCharacterCounter: true,
      animateQuickPhrases: true
    };
    
    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Initialize base component
    super(containerId, {
      message: "",                 // Current message text
      characterCount: 0,           // Current character count
      isSubmitting: false,         // Whether a message is being submitted
      canSubmit: false,            // Whether the message can be submitted
      currentTheme: typeof ThemeManager !== 'undefined' ? ThemeManager.getCurrentTheme() : 'crypto',
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
    }
  }
  
  /**
   * Render the component
   */
  render() {
    // Create the message input HTML
    this.container.innerHTML = `
      <div class="message-input theme-${this.state.currentTheme}">
        <form id="${this.id}-form" class="message-form">
          <div class="input-container">
            <textarea 
              id="${this.id}-textarea" 
              placeholder="${this.state.options.placeholder}" 
              maxlength="${this.state.options.maxLength}"
              >${this.state.message}</textarea>
            <button 
              type="submit" 
              id="${this.id}-submit"
              class="submit-button"
              ${!this.state.canSubmit ? 'disabled' : ''}
            >${this.state.options.submitButtonText}</button>
          </div>
          ${this.state.options.showCharacterCounter ? 
            `<div class="char-counter ${this.getCounterClass()}" id="${this.id}-counter">
              ${this.state.characterCount}/${this.state.options.maxLength}
            </div>` 
            : ''}
          <div class="quick-phrases" id="${this.id}-quick-phrases">
            ${this.renderQuickPhrases()}
          </div>
        </form>
      </div>
    `;
    
    // Get form elements
    this.form = document.getElementById(`${this.id}-form`);
    this.textarea = document.getElementById(`${this.id}-textarea`);
    this.submitButton = document.getElementById(`${this.id}-submit`);
    this.counter = document.getElementById(`${this.id}-counter`);
    this.quickPhrasesContainer = document.getElementById(`${this.id}-quick-phrases`);
    
    // Set up form event listeners
    this.setupFormEventListeners();
    
    // Mark as rendered
    this.rendered = true;
  }
  
  /**
   * Set up form event listeners
   */
  setupFormEventListeners() {
    if (this.form) {
      // Form submit
      this.addListener(this.form, 'submit', this.handleSubmit);
    }
    
    if (this.textarea) {
      // Input change
      this.addListener(this.textarea, 'input', this.handleInput);
      
      // Focus/blur
      this.addListener(this.textarea, 'focus', () => {
        this.textarea.classList.add('focused');
      });
      
      this.addListener(this.textarea, 'blur', () => {
        this.textarea.classList.remove('focused');
      });
    }
    
    // Quick phrase buttons
    const quickPhraseButtons = this.container.querySelectorAll('.quick-phrase-button');
    quickPhraseButtons.forEach(button => {
      this.addListener(button, 'click', this.handleQuickPhrase);
    });
  }
  
  /**
   * Handle form submit
   * @param {Event} event - Submit event
   */
  handleSubmit(event) {
    // Prevent form submission
    event.preventDefault();
    
    if (!this.state.canSubmit || this.state.isSubmitting) {
      return;
    }
    
    // Get message text
    const message = this.state.message.trim();
    
    if (message) {
      // Update state
      this.setState({
        isSubmitting: true
      });
      
      // Broadcast message via EventBus
      this.emit('messageSent', {
        text: message,
        sender: 'You',
        type: 'user'
      });
      
      // Play sound if available
      if (typeof playSound === 'function') {
        playSound('send');
      }
      
      // Clear message
      this.setState({
        message: '',
        characterCount: 0,
        canSubmit: false,
        isSubmitting: false
      });
      
      // Focus textarea
      if (this.textarea) {
        this.textarea.focus();
      }
    }
  }
  
  /**
   * Handle input changes
   * @param {Event} event - Input event
   */
  handleInput(event) {
    // Get current message
    const message = event.target.value;
    
    // Update state
    this.setState({
      message: message,
      characterCount: message.length,
      canSubmit: message.trim().length > 0
    });
    
    // Update character counter
    this.updateCharCounter();
  }
  
  /**
   * Handle quick phrase click
   * @param {Event} event - Click event
   */
  handleQuickPhrase(event) {
    // Get phrase
    const phrase = event.target.dataset.phrase;
    
    if (phrase) {
      // Update state
      this.setState({
        message: phrase,
        characterCount: phrase.length,
        canSubmit: true
      });
      
      // Update textarea
      if (this.textarea) {
        this.textarea.value = phrase;
        this.textarea.focus();
      }
      
      // Update character counter
      this.updateCharCounter();
      
      // Add animation
      if (this.state.options.animateQuickPhrases) {
        event.target.classList.add('meme-bounce');
        setTimeout(() => {
          event.target.classList.remove('meme-bounce');
        }, 1000);
      }
      
      // Play sound if available
      if (typeof playSound === 'function') {
        playSound('click');
      }
    }
  }
  
  /**
   * Update character counter display
   */
  updateCharCounter() {
    if (this.counter) {
      // Update counter text
      this.counter.textContent = `${this.state.characterCount}/${this.state.options.maxLength}`;
      
      // Update counter class
      this.counter.className = `char-counter ${this.getCounterClass()}`;
    }
  }
  
  /**
   * Get CSS class for character counter based on current count
   * @returns {string} - CSS class
   */
  getCounterClass() {
    const count = this.state.characterCount;
    const max = this.state.options.maxLength;
    
    if (count >= max) {
      return 'at-limit';
    } else if (count >= max * 0.8) {
      return 'near-limit';
    }
    
    return '';
  }
  
  /**
   * Render quick phrases buttons
   * @returns {string} - HTML for quick phrase buttons
   */
  renderQuickPhrases() {
    // Create buttons HTML
    return this.state.options.quickPhrases.map(phrase => {
      return `
        <button 
          type="button" 
          class="quick-phrase-button" 
          data-phrase="${phrase.phrase}"
        >${phrase.emoji} ${phrase.text}</button>
      `;
    }).join('');
  }
  
  /**
   * Update component after state changes
   */
  update() {
    // If textarea exists, just update its content
    if (this.textarea) {
      // Update textarea
      this.textarea.value = this.state.message;
      
      // Enable/disable submit button
      if (this.submitButton) {
        if (this.state.canSubmit) {
          this.submitButton.removeAttribute('disabled');
        } else {
          this.submitButton.setAttribute('disabled', 'true');
        }
      }
      
      // Update character counter
      this.updateCharCounter();
    } else {
      // Otherwise, re-render completely
      this.render();
    }
  }
  
  /**
   * Clear the current message
   */
  clearMessage() {
    this.setState({
      message: '',
      characterCount: 0,
      canSubmit: false
    });
  }
  
  /**
   * Get the current message
   * @returns {string} - Current message
   */
  getMessage() {
    return this.state.message;
  }
  
  /**
   * Set a message programmatically
   * @param {string} message - Message to set
   */
  setMessage(message) {
    this.setState({
      message: message,
      characterCount: message.length,
      canSubmit: message.trim().length > 0
    });
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MessageInput;
} 