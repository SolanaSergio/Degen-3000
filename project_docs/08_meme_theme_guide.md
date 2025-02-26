# Meme Theme Implementation Guide

## Overview

The Meme theme is a special theme that combines professional design with internet meme culture elements. It creates a playful, visually dynamic experience while maintaining usability.

## Design Philosophy

The Meme theme follows these principles:
1. **Professional Yet Meme**: Maintains core functionality and readability while incorporating meme aesthetics
2. **Visual Humor**: Uses animations and styling to create a lighthearted experience
3. **Pop Culture References**: Incorporates familiar internet meme elements
4. **Balanced Experience**: Avoids being so over-the-top that it becomes unusable

## Key Visual Elements

### Comic Sans Typography
```css
.theme-meme .title {
  font-family: 'Comic Sans MS', cursive, sans-serif;
  animation: rainbow-text 3s linear infinite;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
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

### Rainbow Text Animation
```css
@keyframes rainbow-text {
  0% {color: #ff0000;}
  20% {color: #ffff00;}
  40% {color: #00ff00;}
  60% {color: #00ffff;}
  80% {color: #0000ff;}
  100% {color: #ff00ff;}
}
```

### Animated Borders
```css
.theme-meme .message {
  border: 3px solid;
  border-image: var(--meme-gradient) 1;
  animation: border-pulse 2s infinite alternate;
}

@keyframes border-pulse {
  0% {box-shadow: 0 0 5px var(--meme-primary);}
  50% {box-shadow: 0 0 20px var(--meme-secondary);}
  100% {box-shadow: 0 0 5px var(--meme-accent);}
}
```

### Animated Icons
```css
.meme-icon {
  display: none;
  margin-left: 5px;
  font-size: 1.2em;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {transform: rotate(0deg);}
  100% {transform: rotate(360deg);}
}
```

### Message Sparkles
```css
.meme-sparkle {
  position: relative;
  overflow: visible;
}

.meme-sparkle::before,
.meme-sparkle::after {
  content: '✨';
  position: absolute;
  font-size: 1.2em;
  opacity: 0;
  animation: sparkle-appear 2s ease-in-out;
}

@keyframes sparkle-appear {
  0% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  20% {
    opacity: 1;
    transform: scale(1.2) rotate(30deg);
  }
  80% {
    opacity: 1;
    transform: scale(1) rotate(-30deg);
  }
  100% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
}
```

### Emoji Reactions
```css
.emoji-reactions {
  position: absolute;
  right: -5px;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;
}

.floating-emoji {
  display: inline-block;
  font-size: 1.5em;
  opacity: 0;
  transform: translateY(0) scale(0);
  margin: 2px;
}

.emoji-animate {
  animation: float-emoji 3s ease-out forwards;
}
```

### "Not Stonks" Animation
```css
.stonks-text {
  font-weight: bold;
  color: #ff4d4d;
  display: inline-block;
  transform: rotate(-5deg);
  animation: stonks-shake 1s infinite;
}

@keyframes stonks-shake {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}
```

### Bounce Animations
```css
.meme-bounce {
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
  40% {transform: translateY(-20px);}
  60% {transform: translateY(-10px);}
}
```

## Color Scheme

The meme theme uses a vibrant color palette:

```css
/* Meme theme */
--meme-primary: #8A2BE2; /* Vibrant purple */
--meme-secondary: #FF69B4; /* Hot pink */
--meme-accent: #00FFFF; /* Cyan */
--meme-bg: #121212;
--meme-text: #FFFFFF;
--meme-gradient: linear-gradient(135deg, #8A2BE2, #FF69B4, #00FFFF);
```

## JavaScript Implementation

### Theme Activation
```javascript
// Apply special effects for meme theme
if (theme === 'meme') {
    document.querySelectorAll('.meme-icon').forEach(icon => {
        icon.style.display = 'inline-block';
    });
    document.querySelector('.meme-disclaimer').style.display = 'block';
    playSound('meme');
} else {
    document.querySelectorAll('.meme-icon').forEach(icon => {
        icon.style.display = 'none';
    });
    document.querySelector('.meme-disclaimer').style.display = 'none';
}
```

### Emoji Reactions
```javascript
// Add random emoji reaction to messages in meme theme
function addRandomEmojiReaction(messageElement) {
    const reactionEmojis = ['😂', '🤣', '💯', '👌', '🔥', '💀', '👀', '🙌', '💩', '��', '🧠', '🤦‍♂️', '👊'];
    const randomEmojis = Array.from({length: 1 + Math.floor(Math.random() * 2)}, 
        () => reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)]);
    
    const reactionContainer = document.createElement('div');
    reactionContainer.className = 'emoji-reactions';
    reactionContainer.innerHTML = randomEmojis.map(emoji => 
        `<span class="floating-emoji">${emoji}</span>`
    ).join('');
    
    messageElement.appendChild(reactionContainer);
    
    // Animate each emoji separately
    const emojis = reactionContainer.querySelectorAll('.floating-emoji');
    emojis.forEach((emoji, i) => {
        // Stagger the animations
        setTimeout(() => {
            emoji.classList.add('emoji-animate');
        }, i * 150);
    });
}
```

### Enhanced Message Styling
```javascript
// Add message with meme-specific effects
if (document.body.classList.contains('theme-meme') && !className.includes('loading')) {
    messageElement.classList.add('meme-sparkle');
}

// Add meme emoji reactions for meme theme
if (document.body.classList.contains('theme-meme') && Math.random() > 0.5) {
    addRandomEmojiReaction(messageElement);
}
```

### Meme-Themed Quick Phrases
The meme theme includes special quick phrases:

```html
<button type="button" data-phrase="Roast me like a meme">🤣 Meme Me</button>
<button type="button" data-phrase="Roast my social media">🤳 Social Media</button>
<button type="button" data-phrase="Explain crypto like I'm 5">👶 ELI5 Crypto</button>
```

## Sound Effects

The meme theme includes its own sound effect:

```javascript
// Meme theme sound
meme: { 
  src: '/audio/meme.mp3', 
  volume: 0.8, 
  preload: false,
  fallback: true
}
```

## Content Customization

When the meme theme is active, the roasts include more meme references and internet culture elements:

```javascript
// Meme-themed prefixes (currently implemented)
"WHEN THE MEME HITS JUST RIGHT! 👌 ",
"STONKS GO BRRRRR! 📈 ",
"NO CAP FR FR! ",
"THIS IS BIG BRAIN TIME! 🧠 ",
"YEET OR BE YEETED! ",
"HOLD MY AVOCADO TOAST! 🥑 ",
"VIBE CHECK FAILED! ❌ ",
"OK BOOMER LISTEN UP! ",
"THIS IS THE WAY! 🌟 ",
"SIR, THIS IS A WENDY'S! 🍔 "
```

## Enhanced UI Elements

### Special Placeholder Text
```css
.theme-meme #user-input::placeholder {
  background: var(--meme-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: bold;
}
```

### Gradient Chat Controls
```css
.theme-meme .chat-controls {
  background: linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(255, 105, 180, 0.2));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(138, 43, 226, 0.3);
}
```

### Hover Effects
```css
.theme-meme .message:hover {
  transform: scale(1.02) rotate(0.5deg);
}

.theme-meme .quick-phrases button::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
  transform: rotate(30deg);
  transition: 0.5s;
  opacity: 0;
}

.theme-meme .quick-phrases button:hover::after {
  opacity: 1;
  transform: rotate(30deg) translate(10%, 10%);
}
```

## Future Enhancements

Potential future improvements for the meme theme:
1. **Meme Templates**: Incorporate popular meme templates into responses
2. **GIF Support**: Add animated GIF reactions
3. **Sound Memes**: Include recognizable meme sound clips
4. **Custom Cursor**: Change cursor to something meme-themed
5. **Easter Eggs**: Hidden interactions that trigger special effects
6. **Meme Quote Generator**: Generate random meme quotes on specific actions
7. **Expanded Emoji Reactions**: More varied emoji reactions with custom behaviors

## Accessibility Considerations

While the meme theme is intentionally over-the-top, we should maintain accessibility by:
1. Ensuring text remains readable (sufficient contrast)
2. Providing options to reduce animations
3. Maintaining keyboard navigation
4. Ensuring screen readers can interpret content properly 