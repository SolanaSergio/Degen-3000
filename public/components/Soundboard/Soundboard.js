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
                levelUp: { src: 'audio/level-up.mp3', volume: 0.5, icon: '⬆️' }
            },
            meme: {
                stonks: { src: 'audio/stonks.mp3', volume: 0.5, icon: '📈' },
                notStonks: { src: 'audio/not-stonks.mp3', volume: 0.5, icon: '📉' },
                meme: { src: 'audio/meme.mp3', volume: 0.5, icon: '🤣' }
            }
        };
        
        // Initialize base component with merged options and initial state
        super(containerId, {
            options: { ...defaultOptions, ...options },
            currentTheme: typeof ThemeManager !== 'undefined' ? 
                ThemeManager.getCurrentTheme() : 'crypto',
            isStonksModeActive: false,
            volume: options.defaultVolume || defaultOptions.defaultVolume,
            muted: options.initialMuted || defaultOptions.initialMuted,
            activeCategory: 'ui',
            sounds: sounds,
            audioElements: {}
        });
        
        // Initialize component
        this.init();
    }
    
    /**
     * Initialize the component
     */
    init() {
        // Preload sounds
        this.preloadSounds();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Render the component
        this.render();
        
        // Load saved volume from localStorage
        this.loadSavedPreferences();
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
        const { currentTheme, isStonksModeActive, volume, muted, activeCategory, sounds } = this.state;
        const { showCategories, categoriesLabels } = this.state.options;
        
        // Generate volume icon based on current volume
        const volumeIcon = this.getVolumeIcon();
        
        // Generate HTML
        this.container.innerHTML = `
            <div class="soundboard-component theme-${currentTheme} ${isStonksModeActive ? 'stonks-mode' : ''}">
                <div class="soundboard-volume">
                    <button class="volume-icon" id="volume-icon">${volumeIcon}</button>
                    <input 
                        type="range" 
                        class="volume-slider" 
                        id="volume-slider" 
                        min="0" 
                        max="1" 
                        step="0.1" 
                        value="${volume}"
                        ${muted ? 'disabled' : ''}
                    >
                    <button class="mute-button ${muted ? 'muted' : ''}" id="mute-button">
                        ${muted ? '🔇 Unmute' : '🔊 Mute'}
                    </button>
                </div>
                
                ${showCategories ? `
                    <div class="sound-categories">
                        ${Object.keys(sounds).map(category => `
                            <button class="category-button ${category === activeCategory ? 'active' : ''}" data-category="${category}">
                                ${categoriesLabels[category] || category}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="sound-buttons">
                    ${this.renderSoundButtons()}
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
        
        // Mark as rendered
        this.rendered = true;
    }
    
    /**
     * Render sound buttons for the active category
     * @returns {string} HTML for sound buttons
     */
    renderSoundButtons() {
        const { sounds, activeCategory } = this.state;
        
        // Get sounds for active category
        const categoryItems = sounds[activeCategory];
        if (!categoryItems) return '';
        
        return Object.keys(categoryItems).map(id => {
            const sound = categoryItems[id];
            return `
                <button class="sound-button" data-category="${activeCategory}" data-sound="${id}">
                    <span class="sound-button-icon">${sound.icon || '🔊'}</span>
                    <span class="sound-button-label">${this.formatSoundName(id)}</span>
                </button>
            `;
        }).join('');
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
                this.addListener(button, 'click', () => {
                    const category = button.getAttribute('data-category');
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
        if (this.state.sounds[category]) {
            this.setState({ activeCategory: category });
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
     * Get volume icon based on current volume
     * @returns {string} Volume icon
     */
    getVolumeIcon() {
        const { volume, muted } = this.state;
        
        if (muted) return '🔇';
        if (volume === 0) return '🔇';
        if (volume < 0.33) return '🔈';
        if (volume < 0.67) return '🔉';
        return '🔊';
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
                this.volumeIcon.textContent = this.getVolumeIcon();
            }
            
            // Update mute button
            if (this.muteButton) {
                this.muteButton.className = `mute-button ${this.state.muted ? 'muted' : ''}`;
                this.muteButton.textContent = this.state.muted ? '🔇 Unmute' : '🔊 Mute';
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
        } else {
            // If component is not rendered, render it
            this.render();
        }
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