# MemeGallery Component Implementation Plan

## Overview
The MemeGallery component will provide users with a dedicated interface for selecting and inserting meme graphics into messages in the DEGEN ROAST 3000 application. This component will replace the existing meme selection functionality currently embedded in the Dashboard component, providing enhanced capabilities and a more focused user experience.

## Component Goals
- Create a dedicated, reusable meme selection interface
- Provide a responsive grid layout of available memes
- Allow for easy selection and insertion of memes into messages
- Support all application themes with consistent styling
- Integrate smoothly with other components via EventBus

## Implementation Details

### Component Structure
```
/components/MemeGallery/
  MemeGallery.js     # Component logic
  MemeGallery.css    # Component styling
  memes/             # Optional directory for meme assets
```

### Class Definition
The MemeGallery component will extend ComponentBase and implement the following structure:

```javascript
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
      currentTheme: 'crypto',      // Default theme
      selectedMeme: null,          // Currently selected meme
      isCollapsed: false,          // Collapsed state
      // Additional state properties as needed
    });
    
    // Initialize component
    this.init();
  }
  
  // Component methods to be implemented
}
```

### Required Methods

1. **init()** - Initialize the component
   - Set up event listeners
   - Preload meme images if needed

2. **render()** - Render the component UI
   - Create gallery container
   - Render available memes
   - Add header with title and collapse toggle
   - Set up proper theme classes

3. **handleMemeSelection(event)** - Handle meme selection
   - Update selected meme state
   - Emit meme selection event
   - Add visual feedback for selection

4. **handleToggleCollapse()** - Handle collapse toggle
   - Update collapsed state
   - Toggle UI elements visibility

5. **addMeme(meme)** - Add a new meme to the gallery
   - Validate meme object
   - Add to collection
   - Re-render if component is already rendered

6. **removeMeme(memeId)** - Remove a meme from the gallery
   - Find and remove the meme
   - Update UI

7. **getSelectedMeme()** - Get currently selected meme
   - Return selected meme object or null

8. **selectMeme(memeId)** - Programmatically select a meme
   - Find meme by ID
   - Update state and UI
   - Emit selection event

### Event Handling

The MemeGallery component will interact with other components primarily through the EventBus:

**Events to Subscribe to:**
- `themeChanged`: Update component styling when theme changes
- `resetSession`: Clear selected meme when session is reset
- `memeInserted`: Reset selection after a meme is inserted

**Events to Publish:**
- `memeSelected`: When a meme is selected
- `memeHovered`: When a meme is hovered (optional)

### CSS Structure

The MemeGallery CSS will follow the component styling pattern with scoped selectors:

```css
/* Main container */
.meme-gallery-component { }

/* Gallery header */
.meme-gallery-component .gallery-header { }
.meme-gallery-component .gallery-title { }
.meme-gallery-component .toggle-button { }

/* Gallery content */
.meme-gallery-component .gallery-content { }
.meme-gallery-component .meme-grid { }

/* Meme item */
.meme-gallery-component .meme-item { }
.meme-gallery-component .meme-image { }
.meme-gallery-component .meme-label { }
.meme-gallery-component .meme-item.selected { }

/* Theme-specific styling */
.meme-gallery-component.theme-crypto { }
.meme-gallery-component.theme-hacker { }
.meme-gallery-component.theme-gamer { }
.meme-gallery-component.theme-meme { }

/* Responsive adjustments */
@media (max-width: 768px) { }
@media (max-width: 480px) { }
```

## Integration with Other Components

### MessageInput Component
The MemeGallery needs to integrate with the MessageInput component to insert selected memes into user messages:

1. When a meme is selected in the MemeGallery:
   - Emit a `memeSelected` event with the meme ID
   - MessageInput listens for this event and adds the meme tag to the message text

2. Define a standard format for meme tags:
   ```
   [MEME:wojak]
   ```

### Application Initialization
Update the app.js to initialize the MemeGallery component:

```javascript
// Initialize MemeGallery
const memeGallery = new MemeGallery('meme-gallery-container', {
  layout: 'grid',
  showLabels: true,
  collapsible: true
});

// Add to appComponents
window.appComponents.memeGallery = memeGallery;
```

### Dashboard Component
Since we're extracting functionality from the Dashboard:

1. Remove meme gallery from Dashboard component
2. Update Dashboard tests to reflect these changes
3. Ensure Dashboard and MemeGallery can coexist without styling conflicts

## Testing Plan

1. **Unit Testing**
   - Test meme selection functionality
   - Test component initialization with different options
   - Test adding/removing memes
   - Test collapse functionality

2. **Integration Testing**
   - Test theme changes across the component
   - Test interaction with MessageInput
   - Test EventBus communication

3. **Responsive Testing**
   - Test on different screen sizes
   - Verify grid layout adjusts appropriately
   - Check touch interaction on mobile devices

4. **Visual Testing**
   - Verify appearance in all themes
   - Check animations and transitions
   - Verify selected state styling

## Implementation Steps

1. **Setup Component Structure (1 hour)**
   - Create MemeGallery.js and MemeGallery.css files
   - Define basic component class extending ComponentBase
   - Set up constructor with default options

2. **Implement Basic Rendering (2 hours)**
   - Create render() method
   - Implement meme grid layout
   - Add header with title and collapse toggle

3. **Add Core Functionality (2 hours)**
   - Implement meme selection
   - Set up EventBus communication
   - Add collapse toggle functionality

4. **Style Component (2 hours)**
   - Implement base styling
   - Add theme-specific styles
   - Create responsive adjustments

5. **Integrate with Other Components (1 hour)**
   - Connect to MessageInput
   - Update app.js initialization
   - Update index.html with meme gallery container

6. **Testing & Refinement (2 hours)**
   - Test across different devices and browsers
   - Fix any bugs or issues
   - Optimize performance

## HTML Integration

Add the following to index.html:

```html
<!-- MemeGallery component will be mounted here -->
<div id="meme-gallery-container" class="meme-gallery-wrapper"></div>
```

## Resources Needed

1. **Meme Images**
   - SVG or PNG files for each meme
   - Located in public/images/memes/

2. **Component Dependencies**
   - ComponentBase.js
   - EventBus.js
   - ThemeManager.js

## Timeline

Total estimated implementation time: **10 hours**
Target completion: **Day 7** of migration plan 