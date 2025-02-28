# CSS Architecture - DEGEN ROAST 3000

This document explains the CSS architecture of the DEGEN ROAST 3000 application, including the layering strategy, component styling, theming system, and best practices.

## CSS Layering Strategy

The application follows a carefully structured CSS layering approach to maintain separation of concerns, improve maintainability, and provide consistent styling:

### 1. Reset Layer (`reset.css`)

The reset layer normalizes browser defaults to ensure consistent rendering across all browsers:

```css
/* Example from reset.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
}

/* Remove default styling from various elements */
ul, ol {
  list-style: none;
}

button, input, select, textarea {
  font-family: inherit;
  font-size: inherit;
}
```

### 2. Variables Layer (`variables.css`)

This defines design tokens that can be used throughout the application and by components:

```css
/* Example from variables.css */
:root {
  /* Core colors */
  --bg-primary: #121420;
  --bg-secondary: #1c2033;
  --bg-tertiary: #252a3d;
  
  /* Text colors */
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-tertiary: rgba(255, 255, 255, 0.5);
  
  /* Accent colors */
  --accent-primary: #3772ff;
  --accent-secondary: #fd5c63;
  --accent-tertiary: #00c9a7;
  
  /* For use in JavaScript and calculations */
  --accent-primary-rgb: 55, 114, 255;
  
  /* Spacing system */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-xxl: 48px;
  
  /* Border radius */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 16px;
  --border-radius-xl: 24px;
  
  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.3);
  --shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  
  /* Typography */
  --font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.5rem;
  --font-size-xxl: 2rem;
  
  /* Z-index layers */
  --z-background: -1;
  --z-base: 1;
  --z-above: 10;
  --z-modal: 100;
  --z-tooltip: 500;
  --z-top: 1000;
  
  /* Animation durations */
  --duration-fast: 0.15s;
  --duration-medium: 0.3s;
  --duration-slow: 0.5s;
  
  /* Transitions */
  --transition-base: all var(--duration-medium) ease;
  --transition-fast: all var(--duration-fast) ease;
  --transition-bounce: all var(--duration-medium) cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

### 3. Base Layer (`base.css`)

The base layer sets foundational styling for HTML elements:

```css
/* Example from base.css */
body {
  font-family: var(--font-family);
  font-size: var(--font-size-md);
  color: var(--text-primary);
  background-color: var(--bg-primary);
  line-height: 1.5;
}

h1, h2, h3, h4, h5, h6 {
  margin-bottom: var(--space-md);
  line-height: 1.2;
}

a {
  color: var(--accent-primary);
  text-decoration: none;
  transition: var(--transition-base);
}

button {
  cursor: pointer;
  border: none;
  background: none;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
}
```

### 4. Layout Layer (`app-layout.css`)

This layer establishes the overall application layout structure:

```css
/* Example from app-layout.css */
.container {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: var(--space-md);
}

.content-grid {
  display: grid;
  grid-template-columns: 280px minmax(600px, 1fr) 280px;
  gap: var(--space-lg);
  height: calc(100vh - 180px);
}

.left-sidebar-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.chat-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.right-sidebar-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
```

### 5. Enhanced UI Layer (`enhanced-ui.css`)

This provides enhanced styling for UI elements and interactions:

```css
/* Example from enhanced-ui.css */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-sm) var(--space-md);
  background-color: var(--accent-primary);
  color: white;
  border-radius: var(--border-radius-md);
  transition: var(--transition-base);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card {
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
}

.input {
  background-color: var(--bg-tertiary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius-md);
  padding: var(--space-sm) var(--space-md);
  color: var(--text-primary);
  transition: var(--transition-base);
}
```

### 6. Component Enhancements Layer (`component-enhancements.css`)

This layer provides specialized styling and fixes for specific components:

```css
/* Example from component-enhancements.css */
#soundboard-container {
  display: block !important;
  min-height: 400px !important;
  visibility: visible !important;
  opacity: 1 !important;
  height: auto !important;
  overflow: visible !important;
  background: rgba(20, 30, 50, 0.8) !important;
  border: 2px solid rgba(55, 114, 255, 0.3) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
  border-radius: 16px !important;
  padding: 20px !important;
  margin: 20px 0 !important;
  position: relative !important;
  z-index: 10 !important;
}

.soundboard-component .sound-buttons::-webkit-scrollbar {
  width: 8px;
}

.soundboard-component .sound-buttons::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
```

### 7. Component-Specific Layer (`[ComponentName].css`)

Each component has its own CSS file with component-specific styling:

```css
/* Example from Soundboard.css */
.soundboard-component {
  width: 100%;
  padding: var(--space-lg);
  background-color: var(--bg-secondary);
  border: 2px solid var(--border-primary);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--space-lg);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  height: 100%;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  position: relative;
}

.soundboard-volume {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.sound-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--space-md);
  overflow-y: auto;
  padding-right: var(--space-sm);
  flex: 1;
}
```

### 8. Responsive Overrides Layer (`mobile-enhanced.css`)

This layer contains mobile-specific overrides and responsive design adjustments:

```css
/* Example from mobile-enhanced.css */
@media (max-width: 768px) {
  .content-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .left-sidebar-wrapper,
  .right-sidebar-wrapper {
    width: 100%;
  }
  
  .chat-section {
    order: 1;
  }
  
  .left-sidebar-wrapper {
    order: 2;
  }
  
  .right-sidebar-wrapper {
    order: 3;
  }
}
```

## Component Styling Approach

Components in the application follow a consistent styling pattern:

### Root Component Class

Each component uses a root class matching its name:

```css
.soundboard-component {
  /* Component root styles */
}

.control-panel-component {
  /* Component root styles */
}
```

### Child Element Naming

Child elements follow a consistent naming convention:

```css
/* Parent-child relationship */
.soundboard-component .sound-buttons {
  /* Child element styling */
}

.soundboard-component .sound-button {
  /* Specific element styling */
}
```

### State-Based Styling

Components use class-based state indicators:

```css
/* Active state styling */
.sound-button.active {
  background-color: var(--accent-primary);
}

/* Playing state styling */
.sound-button.playing {
  animation: sound-button-pulse 0.3s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

/* Disabled state styling */
.sound-button.disabled {
  opacity: 0.5;
  pointer-events: none;
}
```

## Theming System

The application supports dynamic theming through CSS variables and theme classes:

### Theme-Specific Variables

Each theme has its own set of CSS variables:

```css
/* Base theme variables (default crypto theme) */
:root {
  --accent-primary: #3772ff;
  --accent-secondary: #fd5c63;
  /* Other variables... */
}

/* Hacker theme */
.theme-hacker {
  --accent-primary: #00ff66;
  --accent-secondary: #00cc99;
  /* Other hacker theme variables... */
}

/* Gamer theme */
.theme-gamer {
  --accent-primary: #9146ff;
  --accent-secondary: #ff6f9c;
  /* Other gamer theme variables... */
}

/* Meme theme */
.theme-meme {
  --accent-primary: #ffd600;
  --accent-secondary: #ff6b6b;
  /* Other meme theme variables... */
}
```

### Theme Application

Themes are applied by adding a class to the `<body>` element:

```javascript
// Example of theme application in ThemeManager.js
function applyTheme(themeName) {
  document.body.className = `theme-${themeName}`;
  localStorage.setItem('theme', themeName);
  EventBus.publish('themeChanged', { theme: themeName });
}
```

### Component Theme Support

Components respond to theme changes automatically through CSS variables:

```css
.sound-button {
  background-color: var(--bg-secondary);
  border: 2px solid var(--border-primary);
  color: var(--text-primary);
}

/* Theme-specific overrides */
.theme-crypto .sound-button {
  /* Any crypto theme specific styles */
}

.theme-hacker .sound-button {
  /* Any hacker theme specific styles */
}
```

## CSS Best Practices

### 1. Use CSS Variables

Always use CSS variables for colors, spacing, and other design tokens:

```css
/* Good */
.element {
  color: var(--text-primary);
  margin: var(--space-md);
}

/* Avoid */
.element {
  color: #ffffff;
  margin: 16px;
}
```

### 2. Keep Specificity Low

Avoid high specificity selectors when possible:

```css
/* Good */
.sound-button {
  background-color: var(--bg-secondary);
}

/* Avoid */
#soundboard-container .sound-buttons .sound-button {
  background-color: var(--bg-secondary);
}
```

### 3. Component-Specific Selectors

Use component-specific selectors to avoid style conflicts:

```css
/* Good - scoped to component */
.soundboard-component .volume-slider {
  height: 12px;
}

/* Avoid - too generic */
.volume-slider {
  height: 12px;
}
```

### 4. Mobile-First or Desktop-First Approach

Be consistent with your responsive approach:

```css
/* Mobile-first example */
.content-grid {
  display: flex;
  flex-direction: column;
}

@media (min-width: 1024px) {
  .content-grid {
    display: grid;
    grid-template-columns: 280px 1fr 280px;
  }
}

/* Desktop-first example */
.content-grid {
  display: grid;
  grid-template-columns: 280px 1fr 280px;
}

@media (max-width: 1024px) {
  .content-grid {
    display: flex;
    flex-direction: column;
  }
}
```

### 5. CSS Enhancements vs. Component Changes

When fixing styling issues:

1. First try CSS-only fixes in `component-enhancements.css`
2. If that doesn't work, modify the component's CSS file
3. Only modify the component JS file if necessary for structural changes

### 6. Animation Performance

Use performant properties for animations:

```css
/* Good - uses transform and opacity */
.button:hover {
  transform: translateY(-2px);
  opacity: 0.9;
}

/* Avoid - can cause layout thrashing */
.button:hover {
  margin-top: -2px;
  background-color: rgba(55, 114, 255, 0.9);
}
```

## Troubleshooting CSS Issues

### Specificity Problems

If styles aren't being applied, check specificity:

1. Use the browser DevTools to inspect the element
2. Look for styles being overridden
3. Add more specific selectors or (sparingly) use `!important`

### Visual Regression

When making CSS changes:

1. Test on multiple screen sizes
2. Check all supported themes
3. Verify no unintended side effects in other components

### Cross-Browser Issues

Test CSS changes in multiple browsers:

1. Chrome/Edge (Chromium)
2. Firefox
3. Safari

### Fixing Layout Issues

For layout problems:

1. First, check the HTML structure to ensure it matches expected patterns
2. Verify CSS variables are properly defined
3. Use the DevTools Layout panel to diagnose grid/flex issues
4. Create targeted fixes in `component-enhancements.css`

## Creating New Component Styles

When creating styles for a new component:

1. Create a dedicated CSS file: `components/MyComponent/MyComponent.css`
2. Use the component name as the root class: `.my-component`
3. Structure child elements with semantic naming
4. Use CSS variables for theming and consistency
5. Include responsive design considerations
6. Test with all application themes 