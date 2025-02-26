# File Structure

## Root Directory
- **package.json**: Node.js project configuration and dependencies
- **package-lock.json**: Dependency lock file
- **README.md**: Project documentation
- **.env**: Environment variables (excluded from version control)
- **.env.example**: Example environment variables template
- **run.js**: Script to run the application and verify environment setup

## Server
- **server/server.js**: Main Express server application
- **server/routes/**: API routes
  - **api.js**: API endpoints
- **server/models/**: Database models
- **server/utils/**: Utility functions
  - **session-manager.js**: Manages user sessions
  - **api-integration.js**: Hugging Face API integration and roast generation

## Public (Frontend)
- **public/index.html**: Main HTML file
- **public/css/**: CSS stylesheets
  - **styles.css**: Main stylesheet
  - **animations.css**: Animation styles
  - **dashboard.css**: Dashboard component styles
- **public/js/**: JavaScript files
  - **script.js**: Main application logic
  - **dashboard.js**: Dashboard functionality
- **public/audio/**: Sound effect files
  - Various `.mp3` files for different interactions
- **public/images/**: Image resources
  - Theme-specific backgrounds
  - UI elements
- **public/fonts/**: Custom font files

## Project Documentation
- **project_docs/**: Documentation and references
  - Various markdown files with project information

## Key Files Explained

### Frontend
- **index.html**: The main entry point that structures the UI
- **script.js**: Contains primary application logic including:
  - Message handling (`sendMessage()`)
  - UI manipulation
  - API integration
  - Roast rendering and styling
- **dashboard.js**: Manages the dashboard UI including:
  - Theme switching
  - Sound effects
  - Roast level meter
  - User preferences

### Backend
- **server.js**: Express application setup:
  - Middleware configuration
  - Route registration
  - Security settings
  - Static file serving
- **api-integration.js**: Handles roast generation:
  - Topic detection from user messages
  - Hugging Face API integration for AI-powered roasts
  - Local fallback roast database
  - Response formatting and personalization

### Environment
- **.env**: Contains environment variables:
  - `HF_TOKEN`: Hugging Face API token for AI-powered roasts
  - `PORT`: Optional server port (defaults to 3000)
- **run.js**: Entry point script:
  - Verifies environment setup
  - Provides guidance if HF_TOKEN is missing
  - Starts the server

### Styling
- **styles.css**: Main styles including:
  - Theme variables
  - Component styling
  - Responsive design
  - Animation definitions 