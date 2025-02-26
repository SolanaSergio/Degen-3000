# Event Reference for DEGEN ROAST 3000

## Overview

This document catalogs all events used in the DEGEN ROAST 3000 component system. Events are the primary communication mechanism between components, enabling loose coupling and better maintainability. This reference serves as a comprehensive guide to understand the event flow throughout the application.

## Event Communication System

Events in the DEGEN ROAST 3000 application are managed by the `EventBus` which implements a publish-subscribe pattern. Components can:

- **Publish** events to notify other components of actions or state changes
- **Subscribe** to events to react to actions or state changes from other components

## Core Events

### Application Lifecycle Events

#### `applicationInitialized`

**Description:** Fired when the application has fully initialized all components.

**Data Structure:**
```javascript
{
  timestamp: Number // Timestamp when initialization completed
}
```

**Publishers:**
- `app.js` (after all components are initialized)

**Subscribers:**
- Any component that needs to perform actions after all components are ready

---

### Message Events

#### `messageSent`

**Description:** Fired when a user submits a message.

**Data Structure:**
```javascript
{
  text: String,       // The message text
  sender: String,     // The sender name (usually "You")
  type: "user",       // Message type identifier
  timestamp: Number   // When the message was sent
}
```

**Publishers:**
- `MessageInput` component (when user submits a message)

**Subscribers:**
- `ChatWindow` component (to display the message)
- `app.js` (to generate a roast response)
- `Soundboard` component (to play send sound)

---

#### `botResponse`

**Description:** Fired when the system generates a bot response to the user.

**Data Structure:**
```javascript
{
  text: String,          // The response text
  sender: String,        // The sender name (usually "DEGEN ROAST 3000")
  type: "bot",           // Message type identifier
  level: Number,         // Roast level (1-5)
  timestamp: Number,     // When the response was generated
  classes: Array<String> // Optional CSS classes to apply
}
```

**Publishers:**
- `app.js` (after generating a response)

**Subscribers:**
- `ChatWindow` component (to display the response)
- `Soundboard` component (to play appropriate level sound)

---

#### `typingComplete`

**Description:** Fired when a typing animation for a message completes.

**Data Structure:**
```javascript
{
  message: Object // Reference to the message object
}
```

**Publishers:**
- `ChatWindow` component (after typing animation completes)

**Subscribers:**
- None currently (available for future extensions)

---

#### `messageAdded`

**Description:** Fired when a new message is added to the chat window.

**Data Structure:**
```javascript
{
  message: Object // The message that was added
}
```

**Publishers:**
- `ChatWindow` component (after adding a message to the display)

**Subscribers:**
- None currently (available for future extensions)

---

#### `messagesCleared`

**Description:** Fired when the chat history is cleared.

**Data Structure:**
```javascript
{} // Empty object, no additional data
```

**Publishers:**
- `ChatWindow` component (after clearing messages)

**Subscribers:**
- None currently (available for future extensions)

---

### Theme Events

#### `themeChanged`

**Description:** Fired when the application theme changes.

**Data Structure:**
```javascript
{
  theme: String,          // New theme name ('crypto', 'hacker', 'gamer', 'meme')
  previousTheme: String   // Previous theme name
}
```

**Publishers:**
- `ThemeManager` (when theme is changed)
- `Dashboard` component (when user selects a theme)

**Subscribers:**
- All components (to update their styling)
- `Soundboard` component (to play theme change sound)

---

#### `darkModeChanged`

**Description:** Fired when dark mode is toggled.

**Data Structure:**
```javascript
{
  isDark: Boolean // Whether dark mode is now enabled
}
```

**Publishers:**
- `ThemeManager` (when dark mode is toggled)

**Subscribers:**
- `app.js` (to update body class)
- Various components (to adjust styling)

---

### Level Events

#### `levelChanged`

**Description:** Fired when the roast level changes.

**Data Structure:**
```javascript
{
  level: Number,      // New level (1-5)
  oldLevel: Number    // Previous level (optional)
}
```

**Publishers:**
- `Dashboard` component (when user changes level)
- `app.js` (when level automatically increases)

**Subscribers:**
- `ChatWindow` component (to update styling for new messages)
- `Dashboard` component (to update level display)
- `Soundboard` component (to play level-up sound)

---

### UI Control Events

#### `clearChat`

**Description:** Fired when the user requests to clear the chat.

**Data Structure:**
```javascript
{} // Empty object, no additional data
```

**Publishers:**
- `Dashboard` component (when user clicks reset button)

**Subscribers:**
- `ChatWindow` component (to clear messages)
- `app.js` (to reset level)
- `Soundboard` component (to play reset sound)

---

#### `volumeChanged`

**Description:** Fired when the volume level is adjusted.

**Data Structure:**
```javascript
{
  volume: Number // Volume level from 0.0 to 1.0
}
```

**Publishers:**
- `Dashboard` component (when user adjusts volume slider)

**Subscribers:**
- `Soundboard` component (to update volume level)

---

#### `muteToggled`

**Description:** Fired when the mute state is toggled.

**Data Structure:**
```javascript
{
  muted: Boolean // Whether sound is now muted
}
```

**Publishers:**
- `Dashboard` component (when user clicks mute button)

**Subscribers:**
- `Soundboard` component (to update mute state)

---

### Meme Events

#### `memeSelected`

**Description:** Fired when a meme is selected from the gallery.

**Data Structure:**
```javascript
{
  meme: String,     // Meme identifier (e.g., 'wojak', 'pepe', 'doge')
  displayName: String // Optional display name for the meme
}
```

**Publishers:**
- `Dashboard` component (currently, until MemeGallery is implemented)
- `MemeGallery` component (when implemented)

**Subscribers:**
- `MessageInput` component (to insert meme tag)
- `Soundboard` component (to play meme sound)

---

#### `memeInserted`

**Description:** Fired when a meme is inserted into a message.

**Data Structure:**
```javascript
{
  meme: String    // Meme identifier
}
```

**Publishers:**
- `MessageInput` component (after inserting a meme tag)

**Subscribers:**
- `MemeGallery` component (to reset selection)

---

### Sound Events

#### `soundPlayed`

**Description:** Fired when a sound effect is played.

**Data Structure:**
```javascript
{
  category: String,  // Sound category ('ui', 'level', 'roast', 'meme')
  sound: String      // Sound identifier
}
```

**Publishers:**
- `Soundboard` component (when a sound is played)

**Subscribers:**
- Various debugging tools
- Analytics (optional)

---

## Event Flow Diagrams

### Message Submission Flow

```
┌───────────────┐    messageSent     ┌────────────┐
│ MessageInput  │───────────────────>│ ChatWindow │
└───────┬───────┘                    └────────────┘
        │                                   ▲
        │                                   │
        │                                   │
        │                             botResponse
        ▼                                   │
    ┌───────┐       handleUserMessage       │
    │ app.js │──────────────────────────────┘
    └───────┘
```

### Theme Change Flow

```
┌────────────┐    themeChanged     ┌──────────────┐
│  Dashboard │───────────────────>│ ThemeManager  │
└─────┬──────┘                    └──────┬────────┘
      │                                  │
      │                                  │
      │                                  ▼
      │                         ┌──────────────────┐
      │                         │ themeChanged     │
      │                         │ broadcast        │
      │                         └─────────┬────────┘
      │                                   │
      ▼                                   ▼
┌─────────────┐                   ┌─────────────┐
│ ChatWindow  │<──────────────────│ All Other   │
└─────────────┘                   │ Components  │
                                 └─────────────┘
```

### Level Change Flow

```
┌────────────┐    levelChanged     ┌────────────┐
│  Dashboard │───────────────────>│ ChatWindow │
└──────┬─────┘                    └────────────┘
       │                                ▲
       │                                │
       │                                │
       │                          levelChanged
       │                                │
       ▼                                │
┌─────────────┐    levelChanged   ┌─────────┐
│  Soundboard │<──────────────────│  app.js │
└─────────────┘                   └─────────┘
```

## Best Practices for Event Usage

1. **Be Specific:** Use specific event names that clearly describe what happened
2. **Consistent Data:** Maintain consistent data structures for each event
3. **Minimal Data:** Include only necessary data in event payloads
4. **Documentation:** Document all events your component publishes or subscribes to
5. **Error Handling:** Handle missing or malformed event data gracefully
6. **Performance:** Avoid firing events excessively or in tight loops

## Adding New Events

When adding new events to the system:

1. Document the event in this reference
2. Use consistent naming conventions (camelCase verb+noun)
3. Define a clear data structure
4. Identify publishers and subscribers
5. Test event flow thoroughly

## Event Naming Conventions

- Use camelCase (e.g., `messageSent`, not `message_sent`)
- Start with a verb in past tense (e.g., `levelChanged`, not `changeLevel`)
- Be specific about what happened (e.g., `volumeChanged` not `sliderMoved`)
- Use domain-specific terms when appropriate 