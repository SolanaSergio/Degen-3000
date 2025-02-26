/**
 * DEGEN ROAST 3000 - Visual Effects
 * Adds confetti, floating emojis, and other visual flair
 */

class VisualEffectsManager {
  constructor() {
    // DOM elements
    this.container = document.getElementById('floating-emojis-container');
    
    // Effect settings
    this.confettiDuration = 3000; // 3 seconds
    this.confettiParticleCount = 100;
    this.floatingEmojisLimit = 20; // Prevent too many emojis
    
    // Emoji collections for animations
    this.savageEmojis = ['🔥', '💀', '☠️', '⚰️', '🪦', '💥', '🧨', '🤬', '😱', '😵'];
    this.happyEmojis = ['😂', '🤣', '👌', '👍', '🏆', '🎯', '💯', '🙌', '👏', '🎉'];
    this.moneyEmojis = ['💰', '💵', '💸', '🤑', '💎', '📈', '🚀', '🪙', '💹', '👑'];
    this.sadEmojis = ['😢', '😭', '😓', '😔', '😪', '🥺', '😿', '👎', '📉', '🗑️'];
    
    // State
    this.activeEmojis = [];
    this.lastEmojiTime = 0;
    
    // Initialize
    this.init();
  }
  
  /**
   * Initialize the effects system
   */
  init() {
    // Ensure the container exists
    if (!this.container) {
      console.warn('Emoji container not found, creating one');
      this.container = document.createElement('div');
      this.container.id = 'floating-emojis-container';
      document.body.appendChild(this.container);
    }
    
    // Listen for relevant events
    this.setupEventListeners();
    
    console.log('🎊 Visual effects system initialized');
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for roast level changes to trigger effects
    document.addEventListener('roastLevelChange', (e) => {
      const newLevel = e.detail.level;
      if (newLevel >= 3) {
        this.triggerConfetti({
          particleCount: newLevel * 20,
          spread: 70 + (newLevel * 10),
          origin: { y: 0.5 }
        });
      }
    });
    
    // Listen for reaction clicks
    document.querySelectorAll('.reaction-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const emoji = e.currentTarget.textContent.trim();
        this.addFloatingEmojis(emoji, 5, e.clientX, e.clientY);
        
        // Play sound if soundboard exists
        if (window.soundboard) {
          if (emoji === '🔥') {
            window.soundboard.play('airhorn');
          } else if (emoji === '📈') {
            window.soundboard.play('stonks');
          } else if (emoji === '💀') {
            window.soundboard.play('damn');
          } else {
            window.soundboard.play('laugh');
          }
        }
      });
    });
    
    // Click on meme icons to add them to message
    document.querySelectorAll('.meme-icon').forEach(icon => {
      icon.addEventListener('click', (e) => {
        const memeType = e.currentTarget.dataset.meme;
        const userInput = document.getElementById('user-input');
        
        if (userInput && memeType) {
          // Add meme tag to input
          const memeTag = `[${memeType.toUpperCase()}]`;
          userInput.value += memeTag;
          userInput.focus();
          
          // Update character counter
          const charCounter = document.getElementById('char-counter');
          if (charCounter) {
            const maxLength = userInput.getAttribute('maxlength') || 280;
            charCounter.textContent = `${userInput.value.length}/${maxLength}`;
          }
          
          // Show visual feedback
          this.addFloatingEmojis('🔥', 3, e.clientX, e.clientY);
          
          // Play sound if soundboard exists
          if (window.soundboard) {
            window.soundboard.play('click');
          }
        }
      });
    });
    
    // Toggle dark mode
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        // Save preference
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode ? 'true' : 'false');
        
        // Play sound if soundboard exists
        if (window.soundboard) {
          window.soundboard.play('themeChange');
        }
        
        // Show visual feedback
        const emoji = isDarkMode ? '🌙' : '☀️';
        this.addFloatingEmojis(emoji, 5, window.innerWidth - 50, 50);
      });
      
      // Load saved preference
      if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
      }
    }
  }
  
  /**
   * Trigger confetti effect
   * @param {Object} options - Confetti configuration
   */
  triggerConfetti(options = {}) {
    // Only trigger if confetti library is loaded
    if (typeof confetti !== 'undefined') {
      const defaults = {
        particleCount: this.confettiParticleCount,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8957ff', '#ff3366', '#ffcc00', '#00ff88', '#00bcd4']
      };
      
      const config = { ...defaults, ...options };
      
      confetti({
        ...config,
        zIndex: 9000,
        disableForReducedMotion: true
      });
      
      // For longer durations, add some random bursts
      if (options.duration && options.duration > 1000) {
        setTimeout(() => {
          confetti({
            ...config,
            particleCount: config.particleCount / 2,
            origin: { y: 0.7, x: Math.random() },
            zIndex: 9000
          });
        }, 300);
      }
    }
  }
  
  /**
   * Show "savage" effects for high level roasts
   * @param {Element} messageElement - DOM element of the message
   * @param {number} level - Roast level (1-5)
   */
  showSavageEffects(messageElement, level) {
    if (!messageElement) return;
    
    if (level >= 4) {
      // Add savage roast class
      messageElement.classList.add('savage-roast');
      
      // Add floating emojis
      const rect = messageElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      this.addFloatingEmojis(this.savageEmojis, level + 2, centerX, centerY);
      
      // For level 5, add extreme effects
      if (level >= 5) {
        messageElement.classList.add('extreme-roast');
        
        // Trigger small confetti burst
        this.triggerConfetti({
          particleCount: 30,
          spread: 50,
          origin: { 
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight 
          }
        });
        
        // Play sound if soundboard exists
        if (window.soundboard) {
          window.soundboard.play('emotional_damage');
        }
      }
    } else if (level >= 3) {
      // Add spicy roast class
      messageElement.classList.add('spicy-roast');
      
      // For level 3, add subtle effects
      const rect = messageElement.getBoundingClientRect();
      this.addFloatingEmojis(this.savageEmojis, 2, rect.right, rect.top);
      
      // Play sound if soundboard exists
      if (window.soundboard) {
        window.soundboard.play('ouch');
      }
    }
  }
  
  /**
   * Add floating emoji animations
   * @param {string|Array} emoji - Emoji or array of emojis to float
   * @param {number} count - Number of emojis
   * @param {number} x - Starting X position
   * @param {number} y - Starting Y position
   */
  addFloatingEmojis(emoji, count = 1, x, y) {
    // Rate limit emoji creation (max 5 per second)
    const now = Date.now();
    if (now - this.lastEmojiTime < 200) return;
    this.lastEmojiTime = now;
    
    // Clean up any completed animations
    this.cleanupEmojis();
    
    // Limit the number of active emojis
    if (this.activeEmojis.length > this.floatingEmojisLimit) return;
    
    // Convert single emoji to array
    const emojis = Array.isArray(emoji) ? emoji : [emoji];
    
    // Default to center of screen if no position provided
    const startX = x || window.innerWidth / 2;
    const startY = y || window.innerHeight / 2;
    
    // Create and animate emojis
    for (let i = 0; i < count; i++) {
      // Select random emoji from the array
      const selectedEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      
      // Create emoji element
      const emojiEl = document.createElement('div');
      emojiEl.className = 'floating-emoji';
      emojiEl.textContent = selectedEmoji;
      
      // Random position adjustment
      const offsetX = (Math.random() - 0.5) * 60;
      const offsetY = (Math.random() - 0.5) * 60;
      
      // Set position
      emojiEl.style.left = `${startX + offsetX}px`;
      emojiEl.style.top = `${startY + offsetY}px`;
      
      // Set animation variables for randomness
      const animX = (Math.random() - 0.5) * 200;
      const animY = -100 - (Math.random() * 100);
      const rotation = (Math.random() - 0.5) * 60;
      
      emojiEl.style.setProperty('--x', `${animX}px`);
      emojiEl.style.setProperty('--y', `${animY}px`);
      emojiEl.style.setProperty('--r', `${rotation}deg`);
      
      // Add to container
      this.container.appendChild(emojiEl);
      
      // Keep track of active emojis
      this.activeEmojis.push({
        element: emojiEl,
        expires: now + 2000 // 2 seconds
      });
      
      // Remove after animation completes
      setTimeout(() => {
        if (emojiEl.parentNode) {
          emojiEl.parentNode.removeChild(emojiEl);
        }
      }, 2000);
    }
  }
  
  /**
   * Clean up completed emoji animations
   */
  cleanupEmojis() {
    const now = Date.now();
    this.activeEmojis = this.activeEmojis.filter(emoji => {
      if (emoji.expires < now) {
        if (emoji.element.parentNode) {
          emoji.element.parentNode.removeChild(emoji.element);
        }
        return false;
      }
      return true;
    });
  }
}

// Initialize effects system
window.visualEffects = new VisualEffectsManager(); 