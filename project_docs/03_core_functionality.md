# Core Functionality

## Message Flow

### 1. User Input Processing
- User types message in input field or selects a quick phrase
- Character counter updates real-time as user types
- Submit event triggers when user clicks Send or presses Enter

### 2. Message Submission (`sendMessage()` function)
```javascript
async function sendMessage() {
    const messageInput = document.getElementById('user-input');
    const message = messageInput.value.trim();
    
    if (!message) {
        return; // Don't send empty messages
    }
    
    // Clear input and focus back for next message
    messageInput.value = '';
    updateCharCounter(0); // Reset character counter
    messageInput.focus();
    
    // Add user message to chat
    appendMessage('user', message);
    
    // Show loading indicator
    isGeneratingResponse = true;
    appendMessage('bot', '<div class="loading-indicator"><span>🔥</span><span>💀</span><span>🤡</span></div>', 'loading-message');
    
    try {
        // Call the API with session ID in the header
        const response = await fetch('/api/roast', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-ID': sessionId
            },
            body: JSON.stringify({ message })
        });
        
        // Process API response...
    } catch (error) {
        // Generate fallback if API fails...
    }
}
```

### 3. API Processing (server-side)
- The `/api/roast` endpoint processes the message
- User's session ID tracks conversation context
- The system determines the appropriate roast level based on session history
- A response is generated using either the Hugging Face API or local templates

### 4. Hugging Face API Integration
The application uses the Hugging Face Inference API for high-quality AI-generated roasts:

```javascript
// API integration with Hugging Face
if (process.env.HF_TOKEN && fetch && normalizedLevel >= 3 && Math.random() > 0.3) {
    const API_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-alpha";
    
    // Create a prompt for the roast
    const topicsStr = topics.slice(0, 3).join(", ");
    const prompt = `Generate a savage, funny roast of someone. The roast should be about this topic: "${topicsStr}". 
                  The roast level should be ${normalizedLevel}/5 in intensity (5 being most brutal).
                  Their message was: "${message}"
                  Make it very creative, funny, and devastating. Maximum 2 sentences.`;
    
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.HF_TOKEN}`
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_new_tokens: 150,
                temperature: 0.8,
                top_p: 0.95,
                repetition_penalty: 1.2
            }
        })
    });
    
    // Process response...
}
```

### 5. Local Fallback System
The application has an extensive database of pre-written roasts categorized by topic and intensity level. These are used when:
- The Hugging Face API is unavailable
- The HF_TOKEN is not configured
- For lower-level roasts (levels 1-2)
- Randomly even at higher levels for variety

### 6. Response Rendering
- Responses are received from backend API or generated as fallbacks
- The `appendMessage()` function adds the response to the chat
- Special formatting is applied based on roast level
- Text is typed out with animation for realistic effect

### 7. Roast Level Management
- System tracks the user's "roast level" (1-5)
- Each interaction may increase the level
- UI updates to reflect current level
- Responses become more intense at higher levels

## Theme System

### Theme Controls
- Users can select from multiple themes (Crypto, Hacker, Gamer, Meme)
- Theme selection is stored in localStorage
- Themes affect:
  - Color scheme
  - Background patterns
  - Font styling
  - Quick phrase options
  - Message styling

### Theme Implementation
```javascript
function applyTheme(theme) {
    // Remove existing theme classes
    document.body.className = '';
    document.body.classList.add(`theme-${theme}`);
    
    // Update components with theme-specific styling
    // ...
    
    // Apply special effects for meme theme
    if (theme === 'meme') {
        document.querySelectorAll('.meme-icon').forEach(icon => {
            icon.style.display = 'inline-block';
        });
        document.querySelector('.meme-disclaimer').style.display = 'block';
        playSound('meme');
    } else {
        // Hide meme-specific elements
        // ...
    }
}
```

## Audio System

### Sound Management
- Sound effects are preloaded for common actions
- Volume control affects all sounds
- Fallback sounds are provided in base64 encoding if audio files fail to load
- Sound types include:
  - UI interaction sounds (clicks, sends)
  - Level-up notifications
  - Theme change effects
  - Response reactions

### Sound Implementation
```javascript
function playSound(soundName) {
    // Don't play if sounds are disabled or volume is 0
    if (!dashboardState.soundsEnabled || dashboardState.volume <= 0 || !SOUNDS[soundName]) {
        return;
    }
    
    try {
        // Lazy-load sounds that weren't preloaded
        if (!audioElements[soundName]) {
            // Create and configure audio element
            // ...
        }
        
        // Reset and play sound
        const audio = audioElements[soundName];
        audio.pause();
        audio.currentTime = 0;
        audio.play();
    } catch (error) {
        console.warn(`Error with sound ${soundName}:`, error);
    }
}
```

## Session Management

- User sessions track:
  - Current roast level
  - Interaction history
  - Theme preferences
  - Session ID for API continuity
- Sessions can be reset to start fresh
- Data is stored in both:
  - Browser localStorage (client-side)
  - Server-side session storage

## Quick Phrases

- Predefined message templates are provided
- Phrases are theme-specific
- Clicking a phrase:
  - Populates the input field
  - Focuses the field
  - Updates character counter
  - Applies animation to the clicked button 