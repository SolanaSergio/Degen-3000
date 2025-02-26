# Styling and Themes

## CSS Architecture

The application uses a modular CSS approach with three main stylesheets:

1. **styles.css**: Core styling for layout, components, and themes
2. **animations.css**: Animation definitions and effects
3. **dashboard.css**: Specific styles for the dashboard components

## CSS Variables

CSS custom properties (variables) are used extensively for consistent theming:

```css
:root {
  /* Core colors */
  --bg-dark: #0a0a0a;
  --bg-light: #121212;
  --text-primary: #f0f0f0;
  --text-secondary: #b0b0b0;
  --border-color: rgba(255, 255, 255, 0.1);
  
  /* Accent colors */
  --neon-green: #39ff14;
  --neon-blue: #00f0ff;
  --neon-pink: #ff00ff;
  --neon-yellow: #ffff00;
  --neon-orange: #ff5e00;
  
  /* Roast level colors */
  --roast-level-1: #4caf50;
  --roast-level-2: #ff9800;
  --roast-level-3: #ff5722;
  --roast-level-4: #e91e63;
  --roast-level-5: #9c27b0;
  
  /* Meme theme */
  --meme-primary: #8A2BE2; /* Vibrant purple */
  --meme-secondary: #FF69B4; /* Hot pink */
  --meme-accent: #00FFFF; /* Cyan */
  --meme-gradient: linear-gradient(135deg, #8A2BE2, #FF69B4, #00FFFF);
  
  /* ... other variables */
}
```

## Theme System

### Theme Definitions

Each theme has its own set of CSS variables that override the defaults:

```css
.theme-crypto {
  --theme-primary: var(--neon-orange);
  --theme-secondary: #f7931a;
  --theme-accent: #ffca6a;
  --theme-gradient: linear-gradient(135deg, #ff5e00, #ff9000);
  --theme-shadow: 0 0 20px rgba(255, 94, 0, 0.4);
  --accent-color: var(--neon-orange);
  --secondary-accent: var(--neon-yellow);
  --bg-pattern: url('../images/crypto-bg.png');
}

.theme-hacker {
  --theme-primary: var(--neon-green);
  --theme-secondary: #00ff66;
  --theme-accent: #00ff9d;
  --theme-gradient: linear-gradient(135deg, #00ff66, #00ff9d);
  --theme-shadow: 0 0 20px rgba(0, 255, 102, 0.4);
  --accent-color: var(--neon-green);
  --secondary-accent: var(--neon-blue);
  --bg-pattern: url('../images/matrix-bg.png');
}

.theme-gamer {
  --theme-primary: var(--neon-pink);
  --theme-secondary: #ff00d4;
  --theme-accent: #c800ff;
  --theme-gradient: linear-gradient(135deg, #ff00d4, #c800ff);
  --theme-shadow: 0 0 20px rgba(255, 0, 212, 0.4);
  --accent-color: var(--neon-pink);
  --secondary-accent: var(--neon-blue);
  --bg-pattern: url('../images/gamer-bg.png');
}

.theme-meme {
  --accent-color: var(--meme-primary);
  --secondary-accent: var(--meme-secondary);
  --bg-pattern: url('../images/meme-bg.png');
  --button-primary: var(--meme-gradient);
}
```

### Theme Switching

Theme switching is handled in JavaScript with the following approach:

1. Theme toggles in the UI update the active theme
2. The theme class is applied to the `body` element
3. Theme-specific elements are shown/hidden based on current theme
4. The selection is saved to localStorage for persistence

```javascript
// Add event listener
toggle.addEventListener('click', () => {
    // Update active class
    themeToggles.forEach(t => t.classList.remove('active'));
    toggle.classList.add('active');
    
    // Set theme
    const newTheme = toggle.dataset.theme;
    dashboardState.theme = newTheme;
    localStorage.setItem('degenTheme', newTheme);
    
    // Apply theme changes
    applyTheme(newTheme);
    
    // Play sound
    playSound('themeChange');
    
    // Show notification
    showToast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme activated!`, 'success');
    
    // Update quick phrases
    updateQuickPhrases(newTheme);
});
```

## Meme Theme Styling

The "Meme" theme has unique styling that combines professional design with humorous meme culture elements:

```css
.theme-meme .title {
  font-family: 'Comic Sans MS', cursive, sans-serif;
  animation: rainbow-text 3s linear infinite;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.theme-meme .message {
  border: 3px solid;
  border-image: var(--meme-gradient) 1;
  animation: border-pulse 2s infinite alternate;
}

.theme-meme .send-button {
  position: relative;
  overflow: hidden;
  background: var(--meme-gradient);
  z-index: 1;
}

.meme-icon {
  display: none;
  margin-left: 5px;
  font-size: 1.2em;
  animation: spin 2s linear infinite;
}

.meme-disclaimer {
  display: none;
  font-style: italic;
  font-family: 'Comic Sans MS', cursive, sans-serif;
  color: var(--meme-secondary);
  margin-top: 10px;
  font-size: 0.9em;
  animation: pulse 2s infinite;
}
```

## Animations

Key animations defined in the system:

```css
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
  40% {transform: translateY(-20px);}
  60% {transform: translateY(-10px);}
}

@keyframes spin {
  0% {transform: rotate(0deg);}
  100% {transform: rotate(360deg);}
}

@keyframes pulse {
  0% {opacity: 0.6;}
  50% {opacity: 1;}
  100% {opacity: 0.6;}
}

@keyframes rainbow-text {
  0% {color: #ff0000;}
  20% {color: #ffff00;}
  40% {color: #00ff00;}
  60% {color: #00ffff;}
  80% {color: #0000ff;}
  100% {color: #ff00ff;}
}

@keyframes border-pulse {
  0% {box-shadow: 0 0 5px var(--meme-primary);}
  50% {box-shadow: 0 0 20px var(--meme-secondary);}
  100% {box-shadow: 0 0 5px var(--meme-accent);}
}
```

## Message Styling

Messages have different styling based on sender and roast level:

```css
/* User message styles */
.user-message {
  align-self: flex-end;
  background-color: rgba(10, 10, 10, 0.7);
  border-left: 4px solid #4a76fd;
}

/* Bot message styles */
.bot-message {
  align-self: flex-start;
  background-color: rgba(20, 20, 20, 0.8);
  border-left: 4px solid var(--theme-primary);
}

/* Level-based bot message styling */
.bot-message[data-level="2"] {
  border-left-color: var(--roast-level-2);
}

.bot-message[data-level="3"] {
  border-left-color: var(--roast-level-3);
}

.bot-message[data-level="4"] {
  border-left-color: var(--roast-level-4);
}

.bot-message[data-level="5"] {
  border-left-color: var(--roast-level-5);
  background-color: rgba(30, 0, 30, 0.8);
}
```

## Special Text Formatting

Text formatting for emphasizing parts of roasts:

```css
/* Special effects for extreme roasts */
.curse-word {
  color: var(--danger-red);
  font-weight: bold;
  text-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
}

.emphasis {
  font-weight: bold;
  font-style: italic;
}

.shake-text {
  display: inline-block;
  animation: text-shake 0.3s linear;
}
```

This is applied programmatically:

```javascript
function highlightIntensity(message, level) {
    // Only apply special formatting at higher levels
    if (level <= 1) return message;
    
    // Replace potential word matches with styled versions
    let formattedMessage = message;
    
    // Apply different emphasis based on roast level
    if (level >= 3) {
        // Add shake effect to ALL CAPS words
        formattedMessage = formattedMessage.replace(/\b([A-Z]{2,})\b/g, '<span class="shake-text">$1</span>');
        
        // Highlight curse words
        const curseWords = ['DAMN', 'SHIT', 'F***', 'HELL', 'CRAP', 'ASS'];
        curseWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'g');
            formattedMessage = formattedMessage.replace(regex, `<span class="curse-word">${word}</span>`);
        });
    }
    
    // Add emphasis to key phrases
    if (level >= 2) {
        const emphasisPhrases = ['ABSOLUTELY', 'COMPLETELY', 'LITERALLY', 'TOTALLY', 'ACTUALLY'];
        emphasisPhrases.forEach(phrase => {
            const regex = new RegExp(`\\b${phrase}\\b`, 'g');
            formattedMessage = formattedMessage.replace(regex, `<span class="emphasis">${phrase}</span>`);
        });
    }
    
    return formattedMessage;
}
```

## Responsive Design

Media queries ensure the application works well on different devices:

```css
@media (max-width: 768px) {
  .container {
    width: 95%;
    padding: var(--spacing-md);
    margin-top: 40px;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .chat-container {
    height: 400px;
  }
  
  .button-row {
    flex-direction: column;
  }
  
  .quick-phrases {
    flex-direction: column;
  }
  
  .quick-phrases button {
    width: 100%;
  }
} 