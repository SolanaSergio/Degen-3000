# Event Reference - DEGEN ROAST 3000

This document provides a comprehensive reference for all events used for inter-component communication in the DEGEN ROAST 3000 application.

## Core System Events

| Event Name | Published By | Consumed By | Description | Payload |
|------------|--------------|-------------|-------------|---------|
| `themeChanged` | ThemeManager, ControlPanel | All Components | Fired when the application theme changes | `{ theme: string, source: string }` |
| `stonksModeToggled` | ControlPanel | All Components | Fired when stonks mode is toggled | `{ enabled: boolean, source: string }` |
| `aiModeChanged` | ControlPanel | ChatWindow | Fired when AI mode changes | `{ advanced: boolean, source: string }` |

## UI Control Events

| Event Name | Published By | Consumed By | Description | Payload |
|------------|--------------|-------------|-------------|---------|
| `soundEnabledChanged` | ControlPanel | Soundboard | Fired when sound is enabled/disabled | `{ enabled: boolean, source: string }` |
| `notificationsEnabledChanged` | ControlPanel | Header, ChatWindow | Fired when notifications are enabled/disabled | `{ enabled: boolean, source: string }` |
| `animationsEnabledChanged` | ControlPanel | All Components | Fired when animations are enabled/disabled | `{ enabled: boolean, source: string }` |
| `debugInfoToggled` | ControlPanel | All Components | Fired when debug info is toggled | `{ enabled: boolean, source: string }` |
| `settingsReset` | ControlPanel | All Components | Fired when settings are reset | `{ source: string }` |

## Chat Interaction Events

| Event Name | Published By | Consumed By | Description | Payload |
|------------|--------------|-------------|-------------|---------|
| `messageSent` | MessageInput | ChatWindow | Fired when a user sends a message | `{ text: string, timestamp: number, type: string }` |
| `botResponse` | ChatWindow | ChatWindow | Fired when a bot response is received | `{ text: string, timestamp: number, type: string, level: number }` |
| `messageAdded` | ChatWindow | MessageInput | Fired when a message is added to the chat | `{ messageId: string, type: string }` |
| `typingStarted` | ChatWindow | UI Components | Fired when bot starts typing | `{ duration: number }` |
| `typingComplete` | ChatWindow | UI Components | Fired when bot stops typing | `{}` |
| `clearChat` | MessageInput, ControlPanel | ChatWindow | Fired when chat should be cleared | `{}` |
| `messagesCleared` | ChatWindow | MessageInput | Fired when chat messages are cleared | `{}` |

## Media Events

| Event Name | Published By | Consumed By | Description | Payload |
|------------|--------------|-------------|-------------|---------|
| `playSound` | Various Components | Soundboard | Fired when a sound should be played | `{ sound: string, category?: string }` |
| `soundPlayed` | Soundboard | Various Components | Fired when a sound has been played | `{ sound: string, category: string }` |
| `memeSelected` | MemeGallery | MessageInput | Fired when a meme is selected | `{ memeId: string, displayName: string, url: string }` |
| `memeInserted` | MessageInput | ChatWindow | Fired when a meme is inserted into a message | `{ memeId: string, displayName: string }` |

## Ticker Events

| Event Name | Published By | Consumed By | Description | Payload |
|------------|--------------|-------------|-------------|---------|
| `tickerUpdated` | StonksTicker | UI Components | Fired when ticker data is updated | `{ symbols: Object, timestamp: number }` |
| `tickerModeChanged` | StonksTicker | UI Components | Fired when ticker mode changes | `{ mode: string }` |

## Header Events

| Event Name | Published By | Consumed By | Description | Payload |
|------------|--------------|-------------|-------------|---------|
| `warningBannerShown` | Header | UI Components | Fired when warning banner is shown | `{}` |
| `warningBannerHidden` | Header | UI Components | Fired when warning banner is hidden | `{}` |
| `titleChanged` | Header | UI Components | Fired when title text changes | `{ title: string }` |
| `subtitleChanged` | Header | UI Components | Fired when subtitle text changes | `{ subtitle: string }` |

## Error Events

| Event Name | Published By | Consumed By | Description | Payload |
|------------|--------------|-------------|-------------|---------|
| `error` | Any Component | UI Components | Fired when an error occurs | `{ message: string, source: string, data?: any }` |
| `connectionFailed` | Network Components | UI Components | Fired when connection to backend fails | `{ reason: string }` |

## Best Practices for Event Usage

1. **Consistent Naming**: Use verb+noun naming convention (e.g., `messageAdded`, not `addMessage`)
2. **Source Identification**: Always include a `source` property in events where multiple components could emit the same event
3. **Payload Consistency**: Keep payload structures consistent for similar events
4. **Documentation**: Add new events to this document when they are created
5. **Event Bubbling**: Avoid creating events that trigger other events to prevent infinite loops

## Example Usage

```javascript
// Publishing an event
this.emit('messageSent', { 
  text: 'Hello, world!', 
  timestamp: Date.now(),
  type: 'user'
});

// Subscribing to an event
this.on('messageSent', (data) => {
  console.log(`New message sent: ${data.text}`);
  this.addMessageToChat(data);
});
``` 