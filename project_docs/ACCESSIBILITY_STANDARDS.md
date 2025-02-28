# Accessibility Standards - DEGEN ROAST 3000

This document outlines the accessibility standards and implementation guidelines for components in the DEGEN ROAST 3000 application. Following these standards ensures that our application is usable by people with diverse abilities and adheres to WCAG 2.1 AA guidelines.

## Accessibility Core Principles

All components should adhere to these four core principles of accessibility (POUR):

1. **Perceivable**: Information and user interface components must be presentable to users in ways they can perceive
2. **Operable**: User interface components and navigation must be operable
3. **Understandable**: Information and the operation of the user interface must be understandable
4. **Robust**: Content must be robust enough to be interpreted by a wide variety of user agents, including assistive technologies

## Component-Specific Guidelines

### Keyboard Accessibility

All interactive components must be fully keyboard accessible:

```javascript
// In your component's initialization
init() {
  // ... other initialization code
  
  // Add keyboard event handling
  this.setupKeyboardAccessibility();
}

/**
 * Set up keyboard accessibility for the component
 */
setupKeyboardAccessibility() {
  // Add keyboard event listener to component
  this.addListener(this.container, 'keydown', this.handleKeyDown);
  
  // Ensure interactive elements are focusable
  const interactiveElements = this.container.querySelectorAll('button, a, [role="button"]');
  interactiveElements.forEach(element => {
    // Ensure tabindex is set appropriately
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0');
    }
    
    // Add keyboard event listeners to interactive elements
    this.addListener(element, 'keydown', this.handleElementKeyDown);
  });
}

/**
 * Handle keydown events on the component container
 * @param {KeyboardEvent} event - The keydown event
 */
handleKeyDown(event) {
  // Implement component-specific keyboard handling
  switch (event.key) {
    case 'Escape':
      // Close dialogs, menus, etc.
      this.closeOpenUI();
      break;
    // Additional key handling as needed
  }
}

/**
 * Handle keydown events on interactive elements within the component
 * @param {KeyboardEvent} event - The keydown event
 */
handleElementKeyDown(event) {
  // Handle Enter and Space keys for button-like elements
  if ((event.key === 'Enter' || event.key === ' ') && 
      (event.target.tagName !== 'BUTTON' && event.target.tagName !== 'A')) {
    event.preventDefault();
    event.target.click(); // Trigger the click event
  }
}
```

### Focus Management

Components should manage focus appropriately:

1. **Visual Focus Indicators**: All interactive elements must have a visible focus indicator

```css
/* In your component's CSS */
.interactive-element:focus {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* Don't use outline: none without an alternative focus indicator */
.custom-focus:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--accent-primary);
}
```

2. **Focus Trapping**: Modals and dialogs should trap focus while open

```javascript
/**
 * Trap focus within a modal or dialog
 * @param {HTMLElement} container - The container to trap focus within
 */
trapFocus(container) {
  // Get all focusable elements within the container
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  // Set initial focus
  firstElement.focus();
  
  // Handle tab key to cycle through focusable elements
  this.addListener(container, 'keydown', (event) => {
    if (event.key === 'Tab') {
      // Shift+Tab on first element should go to last element
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
      // Tab on last element should go to first element
      else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  });
}
```

3. **Focus Restoration**: Return focus when components are closed

```javascript
/**
 * Open a dialog with proper focus management
 * @param {HTMLElement} dialog - The dialog element to open
 */
openDialog(dialog) {
  // Store the element that had focus before opening the dialog
  this.previouslyFocusedElement = document.activeElement;
  
  // Show the dialog
  dialog.setAttribute('aria-hidden', 'false');
  dialog.style.display = 'block';
  
  // Trap focus inside the dialog
  this.trapFocus(dialog);
}

/**
 * Close a dialog with proper focus management
 * @param {HTMLElement} dialog - The dialog element to close
 */
closeDialog(dialog) {
  // Hide the dialog
  dialog.setAttribute('aria-hidden', 'true');
  dialog.style.display = 'none';
  
  // Restore focus to the element that had focus before opening the dialog
  if (this.previouslyFocusedElement) {
    this.previouslyFocusedElement.focus();
  }
}
```

### Semantic HTML

Use semantically appropriate HTML elements:

```javascript
render() {
  // Use semantic HTML elements
  this.container.innerHTML = `
    <nav class="sound-categories" aria-label="Sound categories">
      <ul role="tablist">
        ${this.renderCategoryTabs()}
      </ul>
    </nav>
    
    <section class="sound-content" aria-live="polite">
      <h2 id="category-heading">${this.state.activeCategory} Sounds</h2>
      <div class="sound-buttons" role="tabpanel" aria-labelledby="category-heading">
        ${this.renderSoundButtons()}
      </div>
    </section>
    
    <footer class="controls">
      <button class="volume-button" aria-label="Adjust volume">
        <i class="fas ${this.getVolumeIcon()}"></i>
      </button>
      <input type="range" class="volume-slider" 
        min="0" max="1" step="0.1" value="${this.state.volume}"
        aria-label="Volume level" />
    </footer>
  `;
  
  // Setup event listeners
  this.setupEventListeners();
}
```

### ARIA Attributes

Use ARIA attributes correctly to enhance accessibility:

```javascript
/**
 * Render category tabs with appropriate ARIA attributes
 * @returns {string} HTML for category tabs
 */
renderCategoryTabs() {
  return this.state.categories.map(category => {
    const isActive = category === this.state.activeCategory;
    return `
      <li role="presentation">
        <button id="tab-${category}" 
          class="category-button ${isActive ? 'active' : ''}"
          role="tab"
          aria-selected="${isActive}"
          aria-controls="panel-${category}"
          ${isActive ? '' : 'tabindex="-1"'}>
          ${this.state.categoriesLabels[category] || category}
        </button>
      </li>
    `;
  }).join('');
}

/**
 * Render sound buttons with appropriate ARIA attributes
 * @returns {string} HTML for sound buttons
 */
renderSoundButtons() {
  const category = this.state.activeCategory;
  const sounds = this.state.sounds[category] || {};
  
  if (Object.keys(sounds).length === 0) {
    return `<div class="no-sounds" role="alert">No sounds available in this category</div>`;
  }
  
  return Object.entries(sounds).map(([id, sound]) => {
    return `
      <button class="sound-button" 
        data-sound="${id}" 
        data-category="${category}"
        aria-label="Play ${sound.label || id} sound">
        <span class="sound-icon" aria-hidden="true">${sound.icon || '🔊'}</span>
        <span class="sound-label">${sound.label || id}</span>
      </button>
    `;
  }).join('');
}
```

### Color and Contrast

Ensure sufficient color contrast and don't rely solely on color to convey information:

```css
/* Ensure text has sufficient contrast against background */
.sound-button {
  /* Background/foreground with at least 4.5:1 contrast ratio */
  background-color: var(--bg-secondary); /* #1c2033 */
  color: var(--text-primary); /* #ffffff, contrast ratio 15.2:1 */
  
  /* Don't rely solely on color for states */
  &.active {
    background-color: var(--accent-primary);
    color: white;
    /* Also add a visual indicator beyond color */
    border: 2px solid white;
    font-weight: bold;
  }
  
  /* For error states, include an icon */
  &.error {
    border-color: var(--error-color);
    /* Include an icon or symbol for non-color visual cue */
    &::before {
      content: "⚠️";
      margin-right: 5px;
    }
  }
}
```

### Screen Reader Support

Ensure components work well with screen readers:

```javascript
/**
 * Update a live region to announce changes to screen readers
 * @param {string} message - The message to announce
 * @param {string} type - The type of announcement (assertive or polite)
 */
announceToScreenReader(message, type = 'polite') {
  // Get or create a live region
  let liveRegion = document.getElementById(`${this.containerId}-live-region`);
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = `${this.containerId}-live-region`;
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', type);
    liveRegion.setAttribute('aria-relevant', 'additions');
    this.container.appendChild(liveRegion);
  }
  
  // Update the live region
  liveRegion.textContent = message;
  
  // Clear after a delay for transient messages
  if (type === 'assertive') {
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 3000);
  }
}

// CSS for screen-reader-only elements
// Add this to your component CSS
```
css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Responsive and Mobile Accessibility

Ensure components are accessible across different devices and screen sizes:

```css
/* Responsive design with accessible touch targets */
@media (max-width: 768px) {
  .sound-button {
    /* Minimum touch target size of 44x44px */
    min-height: 44px;
    min-width: 44px;
    padding: 12px;
    
    /* Increase spacing between touch targets */
    margin: 8px;
  }
  
  /* Adjust font size for readability */
  .sound-label {
    font-size: 16px; /* Minimum readable font size on mobile */
  }
}
```

## Implementation Checklist

Use this checklist when developing or reviewing components:

### Keyboard Accessibility
- [ ] All interactive elements are keyboard accessible
- [ ] Custom keyboard shortcuts are documented and don't conflict with browser/screen reader shortcuts
- [ ] Focus is visually indicated at all times
- [ ] Tab order follows a logical sequence

### Semantic HTML and ARIA
- [ ] Semantic HTML elements are used where appropriate (button, nav, header, etc.)
- [ ] ARIA roles, states, and properties are used correctly
- [ ] Dynamic content changes are announced to screen readers with aria-live regions
- [ ] Form elements have associated labels

### Visual Design
- [ ] Color contrast meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- [ ] Information is not conveyed by color alone
- [ ] Text can be resized up to 200% without loss of functionality
- [ ] Component is usable at different screen sizes

### Testing
- [ ] Tested with keyboard navigation
- [ ] Tested with screen readers (NVDA, JAWS, VoiceOver)
- [ ] Tested with browser zoom set to 200%
- [ ] Tested with high contrast mode

## Accessibility Testing Tools

1. **Keyboard Testing**: Navigate through your component using only the keyboard
2. **Screen Reader Testing**: Test with NVDA (Windows), VoiceOver (Mac), or JAWS
3. **Automated Tools**: Use automated accessibility checkers like axe-core
4. **Color Contrast Checkers**: Use tools like WebAIM's Contrast Checker

## Event-Based Accessibility Integration

Integrate accessibility with the event system:

```javascript
// Subscribe to theme change events
this.on('themeChanged', (data) => {
  // Check if high contrast theme is activated
  if (data.theme === 'high-contrast') {
    this.enhanceContrastForAccessibility();
  }
});

// Subscribe to accessibility settings changes
this.on('accessibilitySettingsChanged', (data) => {
  if (data.reducedMotion) {
    this.disableAnimations();
  }
  
  if (data.largeText) {
    this.increaseFontSize();
  }
});

// Emit events for accessibility actions
this.addListener(this.container.querySelector('.sound-button'), 'click', (event) => {
  // Emit event for sound played
  this.emit('soundPlayed', { 
    sound: event.target.dataset.sound,
    category: event.target.dataset.category,
    // Include accessibility information
    announced: true
  });
  
  // Announce to screen reader
  this.announceToScreenReader(`Playing ${event.target.dataset.sound} sound`);
});
```

## Incorporating Accessibility into Components

Here's how to incorporate accessibility into your component lifecycle:

```javascript
class AccessibleComponent extends ComponentBase {
  constructor(containerId, options = {}) {
    // Default options with accessibility settings
    const defaultOptions = {
      // Normal options
      defaultVolume: 0.5,
      // Accessibility options
      accessibilityOptions: {
        announceStateChanges: true,
        enhancedFocus: true,
        highContrast: false,
        reducedMotion: false
      }
    };
    
    super(containerId, {
      ...defaultOptions,
      ...options
    });
    
    // Initialize state
    this.state = {
      // Component state
      volume: this.options.defaultVolume,
      // Track accessibility state
      a11y: {
        lastFocusedElement: null,
        announcementsEnabled: this.options.accessibilityOptions.announceStateChanges
      }
    };
    
    this.init();
  }
  
  init() {
    // Load preferences
    this.loadAccessibilityPreferences();
    
    // Setup standard event listeners
    this.setupEventListeners();
    
    // Setup accessibility-specific event listeners
    this.setupAccessibilityEventListeners();
    
    // Render the component
    this.render();
    
    // Initialize accessibility features
    this.initAccessibility();
  }
  
  loadAccessibilityPreferences() {
    // Check if user has set accessibility preferences
    if (localStorage.getItem('a11y-high-contrast') === 'true') {
      this.options.accessibilityOptions.highContrast = true;
    }
    
    if (localStorage.getItem('a11y-reduced-motion') === 'true') {
      this.options.accessibilityOptions.reducedMotion = true;
    }
  }
  
  setupAccessibilityEventListeners() {
    // Listen for global accessibility events
    this.on('accessibilitySettingsChanged', this.handleAccessibilitySettingsChanged);
    
    // Listen for focus events on the container
    this.addListener(this.container, 'focusin', this.handleFocusIn);
    this.addListener(this.container, 'focusout', this.handleFocusOut);
  }
  
  initAccessibility() {
    // Set appropriate ARIA attributes on the container
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', this.constructor.name);
    
    // Create a live region for announcements
    this.createLiveRegion();
    
    // Apply high contrast if enabled
    if (this.options.accessibilityOptions.highContrast) {
      this.applyHighContrast();
    }
    
    // Apply reduced motion if enabled
    if (this.options.accessibilityOptions.reducedMotion) {
      this.applyReducedMotion();
    }
  }
  
  // Other accessibility methods...
}
```

By following these accessibility standards and implementation guidelines, you'll ensure that the DEGEN ROAST 3000 components are usable by the widest possible audience, including people with disabilities. 