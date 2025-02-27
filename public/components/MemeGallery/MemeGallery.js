/**
 * MemeGallery.js
 * 
 * Meme gallery component for DEGEN ROAST 3000
 * Displays available memes and allows selection/insertion into messages
 */
class MemeGallery extends ComponentBase {
  /**
   * Create a new MemeGallery component
   * @param {string} containerId - ID of the container element
   * @param {Object} options - Component options
   */
  constructor(containerId, options = {}) {
    // Default options
    const defaultOptions = {
      layout: 'grid',              // Display layout: 'grid' or 'carousel'
      showLabels: true,            // Show meme labels
      collapsible: true,           // Allow collapsing the gallery
      initialCollapsed: false,     // Initial collapsed state
      animateSelection: true,      // Animate meme selection
      memes: [                     // Default meme collection
        { id: 'wojak', name: 'Wojak', image: 'images/memes/wojak.svg' },
        { id: 'pepe', name: 'Pepe', image: 'images/memes/pepe.svg' },
        { id: 'doge', name: 'Doge', image: 'images/memes/doge.svg' }
      ]
    };
    
    // Initialize base component with merged options
    super(containerId, {
      options: { ...defaultOptions, ...options },
      currentTheme: typeof ThemeManager !== 'undefined' ? 
        ThemeManager.getCurrentTheme() : 'crypto',
      selectedMeme: null,          // Currently selected meme
      isCollapsed: options.initialCollapsed || false,
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
    
    // Set initial collapsed state if needed
    if (this.state.isCollapsed) {
      this.toggleCollapse(true);
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
      
      // Reset selection when a message with a meme is sent
      this.on('memeInserted', () => {
        this.setState({ selectedMeme: null });
      });
      
      // Reset when session is cleared
      this.on('clearChat', () => {
        this.setState({ selectedMeme: null });
      });
    }
  }
  
  /**
   * Render the component
   */
  render() {
    const { currentTheme, selectedMeme } = this.state;
    const { layout, showLabels, collapsible } = this.state.options;
    
    // Generate HTML
    this.container.innerHTML = `
      <div class="meme-gallery-component theme-${currentTheme}">
        <div class="gallery-header">
          <h3 class="gallery-title">Meme Gallery</h3>
          ${collapsible ? '<button class="toggle-button">▼</button>' : ''}
        </div>
        <div class="gallery-content">
          <div class="meme-grid layout-${layout}">
            ${this.renderMemeItems()}
          </div>
          <p class="gallery-help-text">Click a meme to add it to your message</p>
        </div>
      </div>
    `;
    
    // Get references to key elements
    this.galleryElement = this.container.querySelector('.meme-gallery-component');
    this.contentElement = this.container.querySelector('.gallery-content');
    this.toggleButton = this.container.querySelector('.toggle-button');
    
    // Set up DOM event listeners
    this.setupDomEventListeners();
    
    // Mark as rendered
    this.rendered = true;
  }
  
  /**
   * Render the meme items
   * @returns {string} HTML for meme items
   */
  renderMemeItems() {
    const { memes } = this.state.options;
    const { selectedMeme } = this.state;
    const { showLabels } = this.state.options;
    
    return memes.map(meme => {
      const isSelected = selectedMeme === meme.id;
      return `
        <div class="meme-item ${isSelected ? 'selected' : ''}" data-meme-id="${meme.id}">
          <div class="meme-image-container">
            <img src="${meme.image}" alt="${meme.name}" class="meme-image">
          </div>
          ${showLabels ? `<div class="meme-label">${meme.name}</div>` : ''}
        </div>
      `;
    }).join('');
  }
  
  /**
   * Set up DOM event listeners
   */
  setupDomEventListeners() {
    // Find elements
    const memeItems = this.container.querySelectorAll('.meme-item');
    
    // Add listeners for meme selection
    memeItems.forEach(item => {
      this.addListener(item, 'click', (event) => {
        const memeId = item.dataset.memeId;
        this.handleMemeSelection(memeId);
      });
    });
    
    // Add listener for collapse toggle
    if (this.toggleButton) {
      this.addListener(this.toggleButton, 'click', () => {
        this.toggleCollapse();
      });
    }
  }
  
  /**
   * Handle meme selection
   * @param {string} memeId - ID of the selected meme
   */
  handleMemeSelection(memeId) {
    // Find the selected meme
    const selectedMeme = this.state.options.memes.find(meme => meme.id === memeId);
    if (!selectedMeme) return;
    
    // Update state
    this.setState({ selectedMeme: memeId });
    
    // Emit event
    this.emit('memeSelected', {
      meme: memeId,
      displayName: selectedMeme.name
    });
    
    // Play selection sound if soundboard is available
    if (window.appComponents && window.appComponents.soundboard) {
      window.appComponents.soundboard.playSound('ui', 'select');
    }
    
    // Animate selection if enabled
    if (this.state.options.animateSelection) {
      const memeElement = this.container.querySelector(`.meme-item[data-meme-id="${memeId}"]`);
      if (memeElement) {
        memeElement.classList.add('animate-selection');
        setTimeout(() => {
          memeElement.classList.remove('animate-selection');
        }, 500);
      }
    }
  }
  
  /**
   * Toggle the collapsed state of the gallery
   * @param {boolean} [forceState] - Force specific state (true = collapsed)
   */
  toggleCollapse(forceState) {
    const newState = forceState !== undefined ? forceState : !this.state.isCollapsed;
    
    // Update state
    this.setState({ isCollapsed: newState });
    
    // Update UI
    if (this.contentElement) {
      this.contentElement.style.display = newState ? 'none' : 'block';
    }
    
    if (this.toggleButton) {
      this.toggleButton.innerHTML = newState ? '▲' : '▼';
    }
  }
  
  /**
   * Add a new meme to the gallery
   * @param {Object} meme - Meme object to add
   * @param {string} meme.id - Unique identifier for the meme
   * @param {string} meme.name - Display name for the meme
   * @param {string} meme.image - Path to meme image
   * @returns {boolean} Success indicator
   */
  addMeme(meme) {
    // Validate meme object
    if (!meme || !meme.id || !meme.name || !meme.image) {
      console.error('Invalid meme object:', meme);
      return false;
    }
    
    // Check if meme already exists
    if (this.state.options.memes.some(m => m.id === meme.id)) {
      console.warn(`Meme with ID ${meme.id} already exists`);
      return false;
    }
    
    // Add to collection
    const updatedMemes = [...this.state.options.memes, meme];
    this.state.options.memes = updatedMemes;
    
    // Re-render if already rendered
    if (this.rendered) {
      this.render();
    }
    
    return true;
  }
  
  /**
   * Remove a meme from the gallery
   * @param {string} memeId - ID of the meme to remove
   * @returns {boolean} Success indicator
   */
  removeMeme(memeId) {
    // Check if meme exists
    const index = this.state.options.memes.findIndex(meme => meme.id === memeId);
    if (index === -1) {
      console.warn(`Meme with ID ${memeId} not found`);
      return false;
    }
    
    // Remove from collection
    const updatedMemes = [...this.state.options.memes];
    updatedMemes.splice(index, 1);
    this.state.options.memes = updatedMemes;
    
    // Clear selection if the removed meme was selected
    if (this.state.selectedMeme === memeId) {
      this.setState({ selectedMeme: null });
    }
    
    // Re-render if already rendered
    if (this.rendered) {
      this.render();
    }
    
    return true;
  }
  
  /**
   * Get the currently selected meme
   * @returns {Object|null} Selected meme object or null
   */
  getSelectedMeme() {
    if (!this.state.selectedMeme) return null;
    
    return this.state.options.memes.find(meme => meme.id === this.state.selectedMeme) || null;
  }
  
  /**
   * Programmatically select a meme
   * @param {string} memeId - ID of the meme to select
   * @returns {boolean} Success indicator
   */
  selectMeme(memeId) {
    // Check if meme exists
    const meme = this.state.options.memes.find(m => m.id === memeId);
    if (!meme) {
      console.warn(`Meme with ID ${memeId} not found`);
      return false;
    }
    
    // Update selection
    this.handleMemeSelection(memeId);
    return true;
  }
  
  /**
   * Update component after state changes
   */
  update() {
    if (this.galleryElement) {
      // Update theme
      this.galleryElement.className = `meme-gallery-component theme-${this.state.currentTheme}`;
      
      // Update selected meme
      const memeItems = this.container.querySelectorAll('.meme-item');
      memeItems.forEach(item => {
        const memeId = item.dataset.memeId;
        item.classList.toggle('selected', memeId === this.state.selectedMeme);
      });
    } else {
      // If component elements don't exist, re-render
      this.render();
    }
  }
}

// Make sure the component is available globally
if (typeof window !== 'undefined') {
  window.MemeGallery = MemeGallery;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MemeGallery;
} 