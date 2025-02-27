/**
 * StonksTicker.js
 * 
 * StonksTicker component for DEGEN ROAST 3000
 * Displays cryptocurrency price information with updating values
 */
class StonksTicker extends ComponentBase {
  /**
   * Create a new StonksTicker component
   * @param {string} containerId - ID of the container element
   * @param {Object} options - Component options
   */
  constructor(containerId, options = {}) {
    // Default options
    const defaultOptions = {
      tickers: [
        { symbol: 'MEME', price: '+43.48%', isUp: true },
        { symbol: 'DOGE', price: '+9.23%', isUp: true },
        { symbol: 'ROFL', price: '-29.39%', isUp: false },
        { symbol: 'KEK', price: '+15.67%', isUp: true }
      ],
      updateInterval: 5000, // Update prices every 5 seconds
      enableAnimations: true,
      enableRandomUpdates: true
    };
    
    // Initialize base component with merged options
    super(containerId, {
      options: { ...defaultOptions, ...options },
      tickers: options.tickers || defaultOptions.tickers,
      currentTheme: typeof ThemeManager !== 'undefined' ? 
        ThemeManager.getCurrentTheme() : 'crypto',
      updateIntervalId: null
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
    
    // Start automatic updates if enabled
    if (this.state.options.enableRandomUpdates) {
      this.startUpdates();
    }
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
        if (data.enabled) {
          this.accelerateUpdates();
        } else {
          this.normalizeUpdates();
        }
      });
    }
  }
  
  /**
   * Render the component
   */
  render() {
    const { currentTheme } = this.state;
    const { tickers } = this.state;
    
    // Generate HTML
    this.container.innerHTML = `
      <div class="stonks-ticker-component theme-${currentTheme}">
        <div class="ticker-grid">
          ${tickers.map(ticker => `
            <div class="ticker-item ${ticker.isUp ? 'price-up' : 'price-down'}">
              <span class="ticker-symbol">${ticker.symbol}</span>
              <span class="ticker-price">${ticker.price}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    // Get references to key elements
    this.tickerElement = this.container.querySelector('.stonks-ticker-component');
    this.tickerItems = this.container.querySelectorAll('.ticker-item');
    
    // Mark as rendered
    this.rendered = true;
  }
  
  /**
   * Start automatic price updates
   */
  startUpdates() {
    // Clear any existing interval
    if (this.state.updateIntervalId) {
      clearInterval(this.state.updateIntervalId);
    }
    
    // Set up new interval
    const intervalId = setInterval(() => {
      this.updateRandomPrice();
    }, this.state.options.updateInterval);
    
    // Store interval ID in state
    this.setState({ updateIntervalId: intervalId });
  }
  
  /**
   * Stop automatic price updates
   */
  stopUpdates() {
    if (this.state.updateIntervalId) {
      clearInterval(this.state.updateIntervalId);
      this.setState({ updateIntervalId: null });
    }
  }
  
  /**
   * Accelerate updates for Stonks Mode
   */
  accelerateUpdates() {
    // Stop current updates
    this.stopUpdates();
    
    // Set up faster interval
    const intervalId = setInterval(() => {
      this.updateRandomPrice(true); // true means more extreme changes
    }, this.state.options.updateInterval / 2); // Twice as fast
    
    // Store interval ID in state
    this.setState({ updateIntervalId: intervalId });
    
    // Add stonks class to ticker
    if (this.tickerElement) {
      this.tickerElement.classList.add('stonks-mode');
    }
  }
  
  /**
   * Return updates to normal speed
   */
  normalizeUpdates() {
    // Stop accelerated updates
    this.stopUpdates();
    
    // Restart at normal speed
    this.startUpdates();
    
    // Remove stonks class from ticker
    if (this.tickerElement) {
      this.tickerElement.classList.remove('stonks-mode');
    }
  }
  
  /**
   * Update a random ticker with a new price
   * @param {boolean} extremeChanges - Whether to generate more extreme price changes
   */
  updateRandomPrice(extremeChanges = false) {
    // Clone current tickers
    const updatedTickers = [...this.state.tickers];
    
    // Select a random ticker to update
    const randomIndex = Math.floor(Math.random() * updatedTickers.length);
    const ticker = updatedTickers[randomIndex];
    
    // Calculate a new random price change
    const baseChange = extremeChanges ? 20 : 5; // Base percentage
    const randomChange = (Math.random() * baseChange).toFixed(2);
    
    // Randomly decide if price goes up or down
    const goesUp = Math.random() > 0.4; // 60% chance of going up
    
    // Update the ticker
    ticker.isUp = goesUp;
    ticker.price = goesUp ? `+${randomChange}%` : `-${randomChange}%`;
    
    // Update state
    this.setState({ tickers: updatedTickers });
    
    // Emit event for other components
    this.emit('tickerUpdated', {
      symbol: ticker.symbol,
      price: ticker.price,
      isUp: ticker.isUp
    });
  }
  
  /**
   * Update all tickers with new data
   * @param {Array} newTickers - Array of new ticker data
   */
  updateAllTickers(newTickers) {
    this.setState({ tickers: newTickers });
  }
  
  /**
   * Update a specific ticker
   * @param {string} symbol - Ticker symbol
   * @param {string} price - New price value
   * @param {boolean} isUp - Whether price is up or down
   */
  updateTicker(symbol, price, isUp) {
    const updatedTickers = this.state.tickers.map(ticker => {
      if (ticker.symbol === symbol) {
        return { 
          ...ticker, 
          price,
          isUp
        };
      }
      return ticker;
    });
    
    this.setState({ tickers: updatedTickers });
  }
  
  /**
   * Update component after state changes
   */
  update() {
    if (this.tickerElement) {
      // Update theme class
      this.tickerElement.className = `stonks-ticker-component theme-${this.state.currentTheme}`;
      if (this.state.updateIntervalId && this.state.options.updateInterval < 3000) {
        this.tickerElement.classList.add('stonks-mode');
      }
      
      // Update ticker items
      this.state.tickers.forEach((ticker, index) => {
        if (this.tickerItems[index]) {
          const item = this.tickerItems[index];
          
          // Update price class
          if (ticker.isUp) {
            item.classList.remove('price-down');
            item.classList.add('price-up');
          } else {
            item.classList.remove('price-up');
            item.classList.add('price-down');
          }
          
          // Update price text
          const priceElement = item.querySelector('.ticker-price');
          if (priceElement) {
            priceElement.textContent = ticker.price;
            
            // Add flash animation
            if (this.state.options.enableAnimations) {
              priceElement.classList.remove('price-flash');
              // Trigger reflow to restart animation
              void priceElement.offsetWidth;
              priceElement.classList.add('price-flash');
            }
          }
        }
      });
    } else {
      // If critical elements don't exist, re-render
      this.render();
    }
  }
  
  /**
   * Clean up when component is destroyed
   */
  destroy() {
    // Stop updates
    this.stopUpdates();
    
    // Call parent destroy
    super.destroy();
  }
}

// Make sure the component is available globally
if (typeof window !== 'undefined') {
  window.StonksTicker = StonksTicker;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StonksTicker;
} 