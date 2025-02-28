/**
 * Soundboard.js
 * 
 * Soundboard component for DEGEN ROAST 3000
 * Manages sound effects, playback, and volume controls
 */

class Soundboard extends ComponentBase {
    /**
     * Create a new Soundboard component
     * @param {string} containerId - ID of the container element
     * @param {Object} options - Component options
     */
    constructor(containerId, options = {}) {
        // Ensure options is an object to prevent undefined errors
        options = options || {};
        
        // Default options
        const defaultOptions = {
            defaultVolume: 0.5,
            initialMuted: false,
            showCategories: true,
            categories: ['ui', 'message', 'level', 'meme'],
            categoriesLabels: {
                ui: 'UI Sounds',
                message: 'Messages',
                level: 'Level Up',
                meme: 'Meme Sounds'
            }
        };
        
        // Merge default options with provided options
        const mergedOptions = {
            ...defaultOptions,
            ...options
        };
        
        // Call parent constructor FIRST before using this
        super(containerId, {});
        
        // AFTER super(): Store options separately since ComponentBase uses the second param as initialState
        this.options = mergedOptions;
        
        // Define available sounds
        const sounds = {
            ui: {
                hover: { src: 'audio/hover.mp3', volume: 0.2, icon: '🖱️' },
                select: { src: 'audio/select.mp3', volume: 0.3, icon: '👆' },
                clear: { src: 'audio/clear.mp3', volume: 0.4, icon: '🧹' }
            },
            message: {
                send: { src: 'audio/send.mp3', volume: 0.4, icon: '📤' },
                receive: { src: 'audio/receive.mp3', volume: 0.4, icon: '📥' }
            },
            level: {
                levelUp: { src: 'audio/levelup.mp3', volume: 0.5, icon: '⬆️' },
                levelUp2: { src: 'audio/levelup2.mp3', volume: 0.5, icon: '🔥' },
                levelUp3: { src: 'audio/levelup3.mp3', volume: 0.5, icon: '⚡' }
            },
            meme: {
                stonks: { src: 'audio/memes/stonks.mp3', volume: 0.7, icon: '📈' },
                airhorn: { src: 'audio/memes/airhorn.mp3', volume: 0.7, icon: '📢' },
                oof: { src: 'audio/memes/oof.mp3', volume: 0.7, icon: '💥' },
                emotionalDamage: { src: 'audio/memes/emotional_damage.mp3', volume: 0.7, icon: '😱' },
                helloDarkness: { src: 'audio/memes/hello_darkness.mp3', volume: 0.7, icon: '🌑' },
                nope: { src: 'audio/memes/nope.mp3', volume: 0.7, icon: '❌' },
                sadViolin: { src: 'audio/memes/sadviolin.mp3', volume: 0.7, icon: '🎻' },
                toBeContinued: { src: 'audio/memes/to_be_continued.mp3', volume: 0.7, icon: '⏱️' }
            }
        };
        
        // Initialize state (overriding the empty state from super)
        this.state = {
            volume: this.options.defaultVolume,
            muted: this.options.initialMuted,
            sounds: sounds,
            activeCategory: 'meme', // Start with meme sounds by default
            audioElements: {}
        };
        
        // Initialize the component
        this.init();
    }
    
    /**
     * Initialize the component
     */
    init() {
        try {
            // Double-check that options and required properties are available
            if (!this.options) {
                // Recreate options if they're missing
                console.warn('Soundboard: options object is missing, recreating with defaults');
                this.options = {
                    defaultVolume: 0.5,
                    initialMuted: false,
                    showCategories: true,
                    categories: ['ui', 'message', 'level', 'meme'],
                    categoriesLabels: {
                        ui: 'UI Sounds',
                        message: 'Messages',
                        level: 'Level Up',
                        meme: 'Meme Sounds'
                    }
                };
                
                // Make sure state is also updated with valid values
                if (this.state) {
                    this.state.volume = this.options.defaultVolume;
                    this.state.muted = this.options.initialMuted;
                }
            }
            
            // Preload sounds
            this.preloadSounds();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Render the component
            this.render();
            
            // Load saved volume from localStorage
            this.loadSavedPreferences();
            
            // Force immediate visibility of the container
            if (this.container) {
                this.container.style.display = 'block';
                this.container.style.minHeight = '400px';
            }
            
            // Force initial category to display
            // Use setTimeout to ensure the DOM is ready
            setTimeout(() => {
                console.log('Initializing soundboard with active category: meme');
                this.activateCategory('meme');
            }, 100);
        } catch (error) {
            console.error('Failed to initialize Soundboard:', error);
            this.renderErrorState(error.message || 'Initialization error');
        }
    }
    
    /**
     * Preload sound files
     */
    preloadSounds() {
        const sounds = this.state.sounds;
        
        // Create audio elements for each sound
        Object.keys(sounds).forEach(category => {
            Object.keys(sounds[category]).forEach(id => {
                const sound = sounds[category][id];
                const audio = new Audio(sound.src);
                audio.preload = 'auto';
                audio.volume = sound.volume * this.state.volume;
                
                // Store audio element
                if (!this.state.audioElements[category]) {
                    this.state.audioElements[category] = {};
                }
                this.state.audioElements[category][id] = audio;
            });
        });
    }
    
    /**
     * Load saved preferences from localStorage
     */
    loadSavedPreferences() {
        if (localStorage.getItem('soundboardVolume')) {
            const savedVolume = parseFloat(localStorage.getItem('soundboardVolume'));
            this.setVolume(savedVolume);
        }
        
        if (localStorage.getItem('soundboardMuted') === 'true') {
            this.toggleMute(true);
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
                this.setState({ isStonksModeActive: data.enabled });
            });
            
            // Listen for volume changes
            this.on('volumeChanged', (data) => {
                this.setVolume(data.volume);
            });
            
            // Listen for mute toggle
            this.on('muteToggled', (data) => {
                this.toggleMute(data.muted);
            });
            
            // Listen for playSound requests
            this.on('playSound', (data) => {
                if (data.category && data.sound) {
                    this.playSound(data.category, data.sound);
                } else if (data.sound) {
                    // Legacy support for just sound ID
                    this.playSound('ui', data.sound);
                }
            });
        }
    }
    
    /**
     * Render the component
     */
    render() {
        console.log('Rendering soundboard component...');
        const { showCategories, categories, categoriesLabels } = this.options;
        const { muted, activeCategory, volume } = this.state;
        
        // Create category buttons if enabled
        let categoriesHTML = '';
        if (showCategories) {
            categoriesHTML = `
                <div class="sound-categories">
                    ${categories.map(category => `
                        <button class="category-button ${category === activeCategory ? 'active' : ''}" 
                                data-category="${category}">
                            ${categoriesLabels[category] || category}
                        </button>
                    `).join('')}
                </div>
            `;
        }
        
        // Get volume icon based on current state
        const volumeIcon = this.getVolumeIcon();
        
        // Render component HTML
        this.container.innerHTML = `
            <div class="soundboard-component">
                <div class="soundboard-volume">
                    <button class="volume-icon" id="volume-icon" title="Volume">
                        <i class="${volumeIcon}"></i>
                    </button>
                    <input type="range" min="0" max="1" step="0.01" 
                           value="${volume}" class="volume-slider" 
                           id="volume-slider" ${muted ? 'disabled' : ''}>
                    <button class="mute-button ${muted ? 'muted' : ''}" id="mute-button">
                        ${muted ? 'Unmute' : 'Mute'}
                    </button>
                </div>
                
                ${categoriesHTML}
                
                <div class="sound-buttons" style="display: grid; min-height: 300px;">
                    <div class="loading-sounds">Loading sound buttons...</div>
                </div>
            </div>
        `;
        
        // Get references to key elements
        this.soundboardElement = this.container.querySelector('.soundboard-component');
        this.volumeSlider = this.container.querySelector('#volume-slider');
        this.volumeIcon = this.container.querySelector('#volume-icon');
        this.muteButton = this.container.querySelector('#mute-button');
        this.categoryButtons = this.container.querySelectorAll('.category-button');
        
        // Set up DOM event listeners
        this.setupDomEventListeners();
        
        // Apply additional styles to ensure proper layout
        this.applyAdditionalStyles();
        
        // Render sound buttons for active category
        setTimeout(() => {
            this.renderSoundButtons();
            console.log('Initial sound buttons rendered for category:', activeCategory);
        }, 100);
        
        // Mark as rendered
        this.rendered = true;
    }
    
    /**
     * Apply additional styles to ensure proper layout
     */
    applyAdditionalStyles() {
        if (this.soundboardElement) {
            this.soundboardElement.style.display = 'flex';
            this.soundboardElement.style.flexDirection = 'column';
            this.soundboardElement.style.height = '100%';
            this.soundboardElement.style.width = '100%';
            this.soundboardElement.style.overflow = 'hidden';
            this.soundboardElement.style.padding = '10px';
            this.soundboardElement.style.boxSizing = 'border-box';
            
            const soundCategories = this.soundboardElement.querySelector('.sound-categories');
            if (soundCategories) {
                soundCategories.style.flexShrink = '0';
                soundCategories.style.display = 'flex';
                soundCategories.style.flexWrap = 'wrap';
                soundCategories.style.gap = '6px';
                soundCategories.style.marginBottom = '10px';
                soundCategories.style.background = 'rgba(0, 0, 0, 0.2)';
                soundCategories.style.borderRadius = '8px';
                soundCategories.style.padding = '8px';
                soundCategories.style.border = '1px solid rgba(255, 255, 255, 0.12)';
                soundCategories.style.maxHeight = '55px';
                soundCategories.style.overflowX = 'auto';
                soundCategories.style.overflowY = 'hidden';
            }
            
            const soundButtons = this.soundboardElement.querySelector('.sound-buttons');
            if (soundButtons) {
                soundButtons.style.flex = '1';
                soundButtons.style.display = 'grid';
                soundButtons.style.gridTemplateColumns = 'repeat(auto-fill, minmax(85px, 1fr))';
                soundButtons.style.gap = '8px';
                soundButtons.style.overflowY = 'auto';
                soundButtons.style.minHeight = '0'; // Allow container to shrink if needed
                soundButtons.style.maxHeight = 'calc(100% - 100px)'; // Account for volume controls and categories
                soundButtons.style.padding = '12px';
                soundButtons.style.border = '1px solid rgba(255, 255, 255, 0.15)';
                soundButtons.style.borderRadius = '8px';
                soundButtons.style.backgroundColor = 'rgba(0, 0, 0, 0.25)';
                
                // Add modern scrollbar styles
                soundButtons.style.scrollbarWidth = 'thin';
                soundButtons.style.scrollbarColor = 'rgba(var(--accent-primary-rgb), 0.3) rgba(0, 0, 0, 0.1)';
                
                // Add some sound button effects
                const buttons = soundButtons.querySelectorAll('.sound-button');
                buttons.forEach(button => {
                    button.style.border = '1px solid rgba(255, 255, 255, 0.15)';
                    button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
                    button.style.padding = '8px';
                    button.style.borderRadius = '8px';
                    button.style.cursor = 'pointer';
                    button.style.transition = 'all 0.2s ease';
                    button.style.minHeight = '80px';
                    button.style.display = 'flex';
                    button.style.flexDirection = 'column';
                    button.style.alignItems = 'center';
                    button.style.justifyContent = 'center';
                    button.style.position = 'relative';
                    button.style.overflow = 'hidden';
                    
                    // Create the icon element with enhanced styling
                    const iconEl = button.querySelector('.sound-button-icon');
                    if (iconEl) {
                        iconEl.style.fontSize = '20px';
                        iconEl.style.marginBottom = '6px';
                        iconEl.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                        iconEl.style.width = '36px';
                        iconEl.style.height = '36px';
                        iconEl.style.display = 'flex';
                        iconEl.style.alignItems = 'center';
                        iconEl.style.justifyContent = 'center';
                        iconEl.style.borderRadius = '50%';
                        iconEl.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
                    }
                    
                    // Style the label
                    const labelEl = button.querySelector('.sound-button-label');
                    if (labelEl) {
                        labelEl.style.fontSize = '12px';
                        labelEl.style.fontWeight = '600';
                        labelEl.style.textAlign = 'center';
                        labelEl.style.lineHeight = '1.2';
                        labelEl.style.letterSpacing = '0.01em';
                        labelEl.style.maxWidth = '100%';
                        labelEl.style.overflow = 'hidden';
                        labelEl.style.textOverflow = 'ellipsis';
                        labelEl.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.3)';
                    }
                });
            }
            
            // Style volume controls
            const volumeControls = this.soundboardElement.querySelector('.soundboard-volume');
            if (volumeControls) {
                volumeControls.style.padding = '8px';
                volumeControls.style.marginBottom = '10px';
                volumeControls.style.gap = '8px';
                volumeControls.style.borderRadius = '8px';
                volumeControls.style.maxHeight = '45px';
            }
        }
    }
    
    /**
     * Add a self-healing check to recover from blank soundboard
     */
    addSelfHealingCheck() {
        // Check every 2 seconds if the soundboard is empty and reinitialize if needed
        this.healingInterval = setInterval(() => {
            const soundboardComponent = this.container.querySelector('.soundboard-component');
            const soundButtons = this.container.querySelector('.sound-buttons');
            
            // If the soundboard component is missing or sound buttons container is empty, reinitialize
            if (!soundboardComponent || (soundButtons && soundButtons.innerHTML.trim() === '')) {
                console.log('Self-healing: Soundboard appears to be empty, reinitializing...');
                
                // Re-render the component
                this.render();
                
                // Reapply the active category
                setTimeout(() => {
                    this.setActiveCategory(this.state.activeCategory || 'meme');
                }, 100);
            }
        }, 2000);
    }
    
    /**
     * Render sound buttons for the active category
     */
    renderSoundButtons() {
        console.log('Starting renderSoundButtons method');
        const soundButtonsContainer = this.container.querySelector('.sound-buttons');
        if (!soundButtonsContainer) {
            console.error('Sound buttons container not found');
            return;
        }

        // Clear existing sound buttons
        soundButtonsContainer.innerHTML = '';
        
        // Get sounds for the active category
        const sounds = this.state.sounds[this.state.activeCategory];
        
        console.log(`Rendering ${sounds ? Object.keys(sounds).length : 0} sound buttons for category: ${this.state.activeCategory}`);
        console.log('Available sounds keys:', sounds ? Object.keys(sounds) : 'none');
        
        // Force container styles - emergency fix
        soundButtonsContainer.style.display = 'grid';
        soundButtonsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(85px, 1fr))';
        soundButtonsContainer.style.gap = '8px';
        soundButtonsContainer.style.padding = '12px';
        soundButtonsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.25)';
        soundButtonsContainer.style.borderRadius = '12px';
        soundButtonsContainer.style.minHeight = '180px';
        
        // If there are no sounds for this category
        if (!sounds || Object.keys(sounds).length === 0) {
            console.warn(`No sounds found for category: ${this.state.activeCategory}`);
            
            // Add a message to the container
            const noSoundsMessage = document.createElement('div');
            noSoundsMessage.className = 'no-sounds';
            noSoundsMessage.innerHTML = `
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔇</div>
                <div>No sounds available for "${this.state.activeCategory}"</div>
            `;
            soundButtonsContainer.appendChild(noSoundsMessage);
            return;
        }
        
        // Log state information for debugging
        console.log('Active category:', this.state.activeCategory);
        console.log('Available sound categories:', Object.keys(this.state.sounds));
        console.log('Sound count in active category:', Object.keys(sounds).length);
        
        // Default icons for each category
        const defaultIcons = {
            'ui': 'fas fa-volume-up',
            'message': 'fas fa-comment',
            'level': 'fas fa-arrow-up',
            'meme': 'fas fa-laugh-squint',
            'effect': 'fas fa-magic',
            'voice': 'fas fa-microphone',
            'music': 'fas fa-music'
        };
        
        // Default background colors for each category
        const categoryColors = {
            'ui': 'rgba(30, 40, 60, 0.8)',
            'message': 'rgba(35, 45, 65, 0.8)',
            'level': 'rgba(40, 35, 60, 0.8)',
            'meme': 'rgba(45, 35, 55, 0.8)'
        };
        
        try {
            // Loop through each sound and create a button
            Object.keys(sounds).forEach(soundKey => {
                const sound = sounds[soundKey];
                if (!sound) {
                    console.warn(`Sound data missing for key: ${soundKey}`);
                    return;
                }
                
                // Get the appropriate icon and background color
                const defaultIcon = defaultIcons[this.state.activeCategory] || 'fas fa-play-circle';
                const categoryBg = categoryColors[this.state.activeCategory] || 'rgba(30, 40, 60, 0.8)';
                
                // Create the button
                const button = document.createElement('button');
                button.className = 'sound-button';
                button.dataset.sound = soundKey;
                button.dataset.category = this.state.activeCategory;
                
                // Force explicit styles - emergency fix
                button.style.backgroundColor = categoryBg;
                button.style.color = '#ffffff';
                button.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                button.style.borderRadius = '8px';
                button.style.padding = '8px';
                button.style.minHeight = '80px';
                button.style.display = 'flex';
                button.style.flexDirection = 'column';
                button.style.alignItems = 'center';
                button.style.justifyContent = 'center';
                button.style.cursor = 'pointer';
                button.style.transition = 'all 0.2s ease';
                
                // Add icon
                const iconElement = document.createElement('div');
                iconElement.className = 'sound-button-icon';
                
                // Force icon styles
                iconElement.style.fontSize = '20px';
                iconElement.style.marginBottom = '6px';
                iconElement.style.width = '36px';
                iconElement.style.height = '36px';
                iconElement.style.display = 'flex';
                iconElement.style.alignItems = 'center';
                iconElement.style.justifyContent = 'center';
                iconElement.style.borderRadius = '50%';
                iconElement.style.backgroundColor = 'rgba(0, 0, 0, 0.15)';
                
                // Use Font Awesome icon if available, otherwise use emoji
                if (sound.icon && sound.icon.startsWith('fa')) {
                    iconElement.innerHTML = `<i class="${sound.icon}"></i>`;
                } else if (sound.icon) {
                    iconElement.textContent = sound.icon;
                } else {
                    iconElement.innerHTML = `<i class="${defaultIcon}"></i>`;
                }
                
                // Add label
                const labelElement = document.createElement('div');
                labelElement.className = 'sound-button-label';
                labelElement.textContent = sound.label || this.formatSoundName(soundKey);
                
                // Force label styles
                labelElement.style.fontSize = '12px';
                labelElement.style.fontWeight = '600';
                labelElement.style.textAlign = 'center';
                labelElement.style.lineHeight = '1.2';
                labelElement.style.maxWidth = '100%';
                labelElement.style.overflow = 'hidden';
                labelElement.style.textOverflow = 'ellipsis';
                
                // Append elements to button
                button.appendChild(iconElement);
                button.appendChild(labelElement);
                
                // Append button to container
                soundButtonsContainer.appendChild(button);
            });
            
            // Attach event listeners
            this.attachSoundButtonListeners();
            
            // Return success message
            console.log(`Successfully rendered ${Object.keys(sounds).length} sound buttons`);
        } catch (error) {
            console.error('Error rendering sound buttons:', error);
            
            // Add an error message to the container
            soundButtonsContainer.innerHTML = `
                <div class="no-sounds">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                    <div>Error rendering sound buttons: ${error.message}</div>
                    <button id="retry-sounds-btn" style="margin-top: 20px; padding: 10px 20px; border-radius: 8px; 
                           background: rgba(55, 114, 255, 0.2); border: 1px solid rgba(55, 114, 255, 0.4); cursor: pointer;">
                        Retry
                    </button>
                </div>
            `;
            
            // Add retry button listener
            const retryBtn = soundButtonsContainer.querySelector('#retry-sounds-btn');
            if (retryBtn) {
                this.addListener(retryBtn, 'click', () => {
                    this.renderSoundButtons();
                });
            }
        }
    }
    
    /**
     * Attach event listeners to sound buttons
     */
    attachSoundButtonListeners() {
        const soundButtons = this.container.querySelectorAll('.sound-button');
        console.log(`Attaching listeners to ${soundButtons.length} sound buttons`);
        
        soundButtons.forEach(button => {
            // Remove existing listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add new listener
            this.addListener(newButton, 'click', () => {
                const category = newButton.getAttribute('data-category');
                const sound = newButton.getAttribute('data-sound');
                
                // Visual feedback
                newButton.classList.add('playing');
                setTimeout(() => newButton.classList.remove('playing'), 300);
                
                // Play the sound
                this.playSound(category, sound);
            });
        });
    }
    
    /**
     * Format a sound ID into a readable name
     * @param {string} id - Sound ID
     * @returns {string} Formatted name
     */
    formatSoundName(id) {
        // Convert camelCase to words with spaces and capitalize
        return id
            .replace(/([A-Z])/g, ' $1') // Insert a space before all capital letters
            .replace(/^./, str => str.toUpperCase()) // Capitalize the first letter
            .replace(/_/g, ' ') // Replace underscores with spaces
            .replace(/-/g, ' ') // Replace hyphens with spaces
            .trim();
    }
    
    /**
     * Set up DOM event listeners
     */
    setupDomEventListeners() {
        // Volume slider
        if (this.volumeSlider) {
            this.addListener(this.volumeSlider, 'input', (e) => {
                const newVolume = parseFloat(e.target.value);
                this.setVolume(newVolume);
            });
        }
        
        // Mute button
        if (this.muteButton) {
            this.addListener(this.muteButton, 'click', () => {
                this.toggleMute();
            });
        }
        
        // Volume icon
        if (this.volumeIcon) {
            this.addListener(this.volumeIcon, 'click', () => {
                this.toggleMute();
            });
        }
        
        // Category buttons
        if (this.categoryButtons) {
            this.categoryButtons.forEach(button => {
                this.addListener(button, 'click', (e) => {
                    e.preventDefault();
                    const category = button.getAttribute('data-category');
                    console.log(`Category button clicked: ${category}`);
                    
                    // Update active class on buttons
                    this.categoryButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    
                    // Update state and render sound buttons
                    this.setActiveCategory(category);
                });
            });
        }
        
        // Sound buttons
        const soundButtons = this.container.querySelectorAll('.sound-button');
        if (soundButtons) {
            soundButtons.forEach(button => {
                this.addListener(button, 'click', () => {
                    const category = button.getAttribute('data-category');
                    const sound = button.getAttribute('data-sound');
                    this.playSound(category, sound);
                });
            });
        }
    }
    
    /**
     * Set the active sound category
     * @param {string} category - Category ID
     */
    setActiveCategory(category) {
        console.log(`Setting active category to: ${category}`);
        
        if (!this.state.sounds[category]) {
            console.warn(`Category not found: ${category}`);
            return;
        }
        
        try {
            // Update state
            this.setState({ activeCategory: category });
            
            // Log available sounds in this category
            const sounds = this.state.sounds[category];
            console.log(`Category ${category} has ${Object.keys(sounds).length} sounds:`, 
                Object.keys(sounds).map(id => id));
            
            // Force immediate update of sound buttons
            this.renderSoundButtons();
            
            // Update category buttons
            const categoryButtons = this.container.querySelectorAll('.category-button');
            if (categoryButtons) {
                categoryButtons.forEach(button => {
                    const buttonCategory = button.getAttribute('data-category');
                    if (buttonCategory === category) {
                        button.classList.add('active');
                    } else {
                        button.classList.remove('active');
                    }
                });
            }
        } catch (error) {
            console.error('Error in setActiveCategory:', error);
        }
    }
    
    /**
     * Set volume level
     * @param {number} volume - Volume level (0-1)
     */
    setVolume(volume) {
        // Ensure volume is between 0 and 1
        volume = Math.max(0, Math.min(1, volume));
        
        // Update state
        this.setState({ volume });
        
        // Update all audio elements
        this.updateAudioVolumes();
        
        // Save to localStorage
        localStorage.setItem('soundboardVolume', volume.toString());
        
        // Show volume toast
        this.showVolumeToast();
    }
    
    /**
     * Update the volume of all audio elements
     */
    updateAudioVolumes() {
        const { audioElements, sounds, volume, muted } = this.state;
        
        // If audio elements exist, update volumes
        Object.keys(audioElements).forEach(category => {
            Object.keys(audioElements[category]).forEach(id => {
                const audio = audioElements[category][id];
                const soundVolume = sounds[category][id].volume;
                audio.volume = muted ? 0 : soundVolume * volume;
            });
        });
    }
    
    /**
     * Toggle mute state
     * @param {boolean} [forceMute] - Force a specific mute state
     */
    toggleMute(forceMute = null) {
        // If forceMute is provided, use it, otherwise toggle
        const newMuted = forceMute !== null ? forceMute : !this.state.muted;
        
        // Update state
        this.setState({ muted: newMuted });
        
        // Update all audio volumes
        this.updateAudioVolumes();
        
        // Save to localStorage
        localStorage.setItem('soundboardMuted', newMuted.toString());
        
        // Show mute toast
        this.showMuteToast();
    }
    
    /**
     * Get volume icon based on current state
     * @returns {string} Font Awesome icon class
     */
    getVolumeIcon() {
        const { volume, muted } = this.state;
        
        if (muted) {
            return 'fas fa-volume-mute';
        }
        
        if (volume > 0.7) {
            return 'fas fa-volume-up';
        } else if (volume > 0.3) {
            return 'fas fa-volume-down';
        } else {
            return 'fas fa-volume-off';
        }
    }
    
    /**
     * Play a sound
     * @param {string} category - Sound category
     * @param {string} soundId - Sound ID
     */
    playSound(category, soundId) {
        // If muted, don't play anything
        if (this.state.muted) return;
        
        // Check if we have this sound
        const audioElements = this.state.audioElements;
        if (!audioElements[category] || !audioElements[category][soundId]) {
            console.warn(`Sound not found: ${category}/${soundId}`);
            return;
        }
        
        // Get the audio element
        const audio = audioElements[category][soundId];
        
        // Reset to beginning if already playing
        audio.currentTime = 0;
        
        // Play the sound
        const promise = audio.play();
        
        // Handle autoplay restrictions
        if (promise !== undefined) {
            promise.catch(error => {
                console.warn('Audio playback was prevented:', error);
            });
        }
        
        // Emit sound played event
        this.emit('soundPlayed', { category, sound: soundId });
    }
    
    /**
     * Show volume level toast
     */
    showVolumeToast() {
        const volumeIcon = this.getVolumeIcon();
        const volumePercent = Math.round(this.state.volume * 100);
        this.showToast(`Volume: ${volumePercent}% ${volumeIcon}`);
    }
    
    /**
     * Show mute status toast
     */
    showMuteToast() {
        const icon = this.state.muted ? '🔇' : '🔊';
        const status = this.state.muted ? 'muted' : 'unmuted';
        this.showToast(`Sound ${status} ${icon}`);
    }
    
    /**
     * Show a toast notification
     * @param {string} message - Message to display
     */
    showToast(message) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'sound-toast';
        toast.textContent = message;
        
        // Add to document
        document.body.appendChild(toast);
        
        // Remove after delay
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 2000);
    }
    
    /**
     * Update component after state changes
     */
    update() {
        if (this.soundboardElement) {
            // Update theme and stonks mode classes
            this.soundboardElement.className = `soundboard-component theme-${this.state.currentTheme} ${this.state.isStonksModeActive ? 'stonks-mode' : ''}`;
            
            // Update volume slider
            if (this.volumeSlider) {
                this.volumeSlider.value = this.state.volume;
                this.volumeSlider.disabled = this.state.muted;
            }
            
            // Update volume icon
            if (this.volumeIcon) {
                this.volumeIcon.innerHTML = `<i class="${this.getVolumeIcon()}"></i>`;
            }
            
            // Update mute button
            if (this.muteButton) {
                this.muteButton.className = `mute-button ${this.state.muted ? 'muted' : ''}`;
                this.muteButton.textContent = this.state.muted ? 'Unmute' : 'Mute';
            }
            
            // Update category buttons
            if (this.categoryButtons) {
                this.categoryButtons.forEach(button => {
                    const category = button.getAttribute('data-category');
                    if (category === this.state.activeCategory) {
                        button.classList.add('active');
                    } else {
                        button.classList.remove('active');
                    }
                });
            }
            
            // Update sound buttons
            const soundButtonsContainer = this.container.querySelector('.sound-buttons');
            if (soundButtonsContainer) {
                soundButtonsContainer.innerHTML = this.renderSoundButtons();
                
                // Re-attach event listeners to new buttons
                const soundButtons = soundButtonsContainer.querySelectorAll('.sound-button');
                soundButtons.forEach(button => {
                    this.addListener(button, 'click', () => {
                        const category = button.getAttribute('data-category');
                        const sound = button.getAttribute('data-sound');
                        this.playSound(category, sound);
                    });
                });
            }
            
            // Reapply additional styles to ensure proper layout
            this.applyAdditionalStyles();
        } else {
            // If component is not rendered, render it
            this.render();
        }
    }
    
    /**
     * Clean up any resources when component is destroyed
     */
    destroy() {
        // Clear the self-healing interval if it exists
        if (this.healingInterval) {
            clearInterval(this.healingInterval);
        }
        
        // Call parent destroy method if it exists
        if (typeof super.destroy === 'function') {
            super.destroy();
        }
    }
    
    /**
     * Render error state when component fails
     * @param {string} errorMessage - The error message to display
     */
    renderErrorState(errorMessage) {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="soundboard-error-state">
                <div class="error-icon">⚠️</div>
                <h3>Soundboard Error</h3>
                <p>${errorMessage}</p>
                <button class="retry-button" id="${this.containerId}-retry">Retry</button>
            </div>
        `;
        
        // Style the error state
        const errorStyles = document.createElement('style');
        errorStyles.textContent = `
            .soundboard-error-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                height: 300px;
                padding: 20px;
                color: #ff3366;
                background-color: rgba(0, 0, 0, 0.5);
                border-radius: 12px;
                border: 2px solid #ff3366;
            }
            
            .soundboard-error-state .error-icon {
                font-size: 48px;
                margin-bottom: 16px;
            }
            
            .soundboard-error-state h3 {
                font-size: 24px;
                margin: 0 0 12px 0;
            }
            
            .soundboard-error-state p {
                margin: 0 0 20px 0;
                max-width: 300px;
            }
            
            .soundboard-error-state .retry-button {
                background-color: #3772ff;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.2s ease;
            }
            
            .soundboard-error-state .retry-button:hover {
                background-color: #2954cc;
                transform: translateY(-3px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }
        `;
        
        this.container.appendChild(errorStyles);
        
        // Add retry button handler
        const retryButton = document.getElementById(`${this.containerId}-retry`);
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                // Re-initialize the component
                this.container.innerHTML = '';
                this.init();
            });
        }
    }
    
    /**
     * Activate a sound category
     * @param {string} categoryName - The category to activate
     */
    activateCategory(categoryName) {
        // Ensure the category exists
        if (!this.state.sounds[categoryName]) {
            console.warn(`Category ${categoryName} does not exist`);
            return;
        }
        
        // Update state
        this.state.activeCategory = categoryName;
        
        // Update UI for categories
        const categories = this.container.querySelectorAll('.category-button');
        if (categories.length) {
            categories.forEach(button => {
                const category = button.dataset.category;
                if (category === categoryName) {
                    button.classList.add('active');
                    button.setAttribute('aria-selected', 'true');
                } else {
                    button.classList.remove('active');
                    button.setAttribute('aria-selected', 'false');
                }
            });
        }
        
        // Update sound buttons
        this.renderSoundButtons();
    }
}

// Make sure the component is available globally
if (typeof window !== 'undefined') {
    window.Soundboard = Soundboard;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Soundboard;
}