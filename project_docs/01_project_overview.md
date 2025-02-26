# DEGEN ROAST 3000 - Project Overview

## Introduction
Degen Roast 3000 is a humorous AI-powered web application that generates creative, savage roasts based on user input. The application has a crypto/tech theme and progressively increases in intensity (roast level) as users interact with it.

## Core Features
- **Roast Generation**: AI-powered responses that "roast" the user based on their input
- **Progressive Intensity**: A 5-level roast meter that increases as interaction continues
- **Multiple Themes**: Crypto, Hacker, Gamer, and Meme themes with specific styling
- **Sound Effects**: Audio feedback for various actions
- **Responsive Design**: Works across different device sizes

## Technology Stack
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js with Express
- **API**: Custom roast generation with Hugging Face AI integration
- **Storage**: Local storage for user preferences and session data

## API Integration
- **Hugging Face API**: Uses the Zephyr 7B Alpha model for high-level roast generation
- **Fallback System**: Local roasts database for when the API is unavailable or for lower-level roasts
- **Environment Variables**: Requires HF_TOKEN from Hugging Face to enable AI-powered roasts
- **Topic Detection**: Analyzes user messages to create context-appropriate roasts

## User Experience Flow
1. User visits the site and is greeted with a warning banner about brutal roasts
2. The UI shows the main dashboard with a roast level meter and theme selections
3. User enters a message or selects a quick phrase
4. System responds with a roast, with intensity based on the current roast level
5. As interaction continues, the roast level increases, making responses more intense
6. Users can change themes, reset their progress, or adjust volume settings

## Target Audience
- Crypto enthusiasts
- Gamers
- Tech-savvy users
- Anyone with a sense of humor who enjoys creative insults

## Development Status
The application is fully functional with both AI-powered roast generation and local fallbacks. Recent enhancements include fixing message submission issues, adding a new "Meme" theme, and improving the Hugging Face API integration. 