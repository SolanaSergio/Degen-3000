# UI Components

## Main Layout Structure

```html
<div class="container theme-transition">
    <h1 class="title gradient-text">DEGEN ROAST 3000</h1>
    <p class="subtitle">The most savage AI roast generator on the internet</p>
    
    <div class="dashboard">
        <!-- Roast level card -->
        <!-- Settings card -->
    </div>
    
    <div class="chat-container" id="chat-container">
        <div class="messages" id="messages"></div>
        
        <form id="message-form" class="chat-controls">
            <!-- Chat controls -->
        </form>
    </div>
    
    <div class="disclaimer">
        <!-- Disclaimer text -->
    </div>
</div>
```

## Dashboard Components

### Roast Level Meter
- Visual indicator of current roast intensity (1-5)
- Progress bar that fills as level increases
- Numeric level display
- Markers for each level milestone

```html
<div class="dashboard-card" id="roast-level-card">
    <h3>ROAST LEVEL</h3>
    <div class="roast-meter">
        <div class="roast-meter-bar">
            <div class="roast-meter-fill" id="roast-meter-fill"></div>
            <div class="roast-meter-markers">
                <div class="marker" data-level="1">1</div>
                <div class="marker" data-level="2">2</div>
                <div class="marker" data-level="3">3</div>
                <div class="marker" data-level="4">4</div>
                <div class="marker" data-level="5">5</div>
            </div>
        </div>
        <div class="roast-level-indicator">
            Current Level: <span id="roast-level">1</span>
        </div>
    </div>
</div>
```

### Settings Card
- Theme selection toggles
- Volume slider
- Reset session button

```html
<div class="dashboard-card" id="settings-card">
    <h3>SETTINGS</h3>
    <div class="settings-group">
        <label>Theme:</label>
        <div class="theme-toggles">
            <button class="theme-toggle active" data-theme="crypto">Crypto</button>
            <button class="theme-toggle" data-theme="hacker">Hacker</button>
            <button class="theme-toggle" data-theme="gamer">Gamer</button>
            <button class="theme-toggle" data-theme="meme">Meme</button>
        </div>
    </div>
    <div class="settings-group">
        <label>Volume:</label>
        <input type="range" id="volume-slider" min="0" max="1" step="0.1" value="0.5">
    </div>
    <button id="reset-session" class="reset-button button-hover">Reset Progress</button>
</div>
```

## Chat Interface

### Messages Container
- Scrollable area for conversation history
- User messages styled differently from bot responses
- Message styling varies by roast level
- Animation effects for new messages

### Message Form
- Textarea for user input
- Character counter
- Send button
- Clear chat button
- Quick phrases section

```html
<form id="message-form" class="chat-controls">
    <div class="char-counter" id="char-counter">0/500</div>
    <textarea id="user-input" name="message" placeholder="Enter your message..." maxlength="500"></textarea>
    <div class="button-row">
        <button type="button" id="clear-chat" class="clear-button button-hover">Clear Chat</button>
        <button type="submit" id="send-button" class="send-button button-hover">
            <span>Send</span>
            <span class="meme-icon">🚀</span>
        </button>
    </div>
    <div class="quick-phrases" id="quick-phrases">
        <button type="button" data-phrase="Roast my crypto portfolio">📉 My Portfolio</button>
        <button type="button" data-phrase="Roast my coding skills">💻 My Code</button>
        <button type="button" data-phrase="Roast my life choices">🤔 Life Choices</button>
        <button type="button" data-phrase="Roast me like a meme">🤣 Meme Me</button>
    </div>
</form>
```

## Message Display

Messages are dynamically created and added to the chat using the `appendMessage()` function:

```javascript
function appendMessage(sender, message, className = '') {
    const messagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    
    // Set appropriate classes
    messageElement.className = `message ${sender}-message ${className}`;
    
    // Add roast level data attribute for bot messages
    if (sender === 'bot' && !className.includes('loading-message')) {
        messageElement.dataset.level = dashboardState.roastLevel;
    }
    
    // Add message icon based on sender
    const iconEmoji = sender === 'user' ? '👤' : '🔥';
    
    // Generate timestamp
    const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    // Set inner HTML structure
    if (!className.includes('loading-message')) {
        // Apply special formatting for bot messages
        if (sender === 'bot') {
            message = highlightIntensity(message, dashboardState.roastLevel);
        }
        
        // Create message structure
        messageElement.innerHTML = `
            <div class="message-icon">${iconEmoji}</div>
            <div class="message-content">
                ${message}
                <div class="message-timestamp">${timestamp}</div>
            </div>
        `;
        
        // Add to container
        messagesContainer.appendChild(messageElement);
        
        // Apply typing animation for bot messages
        if (sender === 'bot' && !className) {
            const contentElement = messageElement.querySelector('.message-content');
            typeMessage(contentElement, message, () => {
                // Animation complete
                messageElement.classList.add('complete');
            });
        }
    } else {
        // This is a loading message, just add it directly
        messageElement.innerHTML = `
            <div class="message-icon">${iconEmoji}</div>
            <div class="message-content">${message}</div>
        `;
        messagesContainer.appendChild(messageElement);
    }
    
    // Auto-scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
```

## Theme-Specific UI Elements

### Meme Theme
- Comic Sans font for title
- Rainbow text animation
- Pulsing border effects
- Rocket emoji in send button
- Custom disclaimer text
- Bounce animation for quick phrase buttons

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

## Toast Notifications

- Temporary messages that appear and fade out
- Different styling based on type (info, success, warning, error)
- Used for:
  - Level-up notifications
  - Error messages
  - Status updates
  - Theme changes

## Responsive Design

- Media queries adjust layout for different screen sizes
- Mobile-optimized controls
- Flexible container sizing
- Adjusted font sizes and spacing for small screens 