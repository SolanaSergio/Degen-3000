const express = require('express');
const router = express.Router();
const apiIntegration = require('../utils/api-integration');
const sessionManager = require('../utils/session-manager');

// Add request timeout (in milliseconds)
const REQUEST_TIMEOUT = 25000; // 25 seconds

// Debug mode for detailed logging
const DEBUG_MODE = true;

// Middleware to extract session ID from cookies
const extractSessionId = (req, res, next) => {
  const sessionId = req.cookies?.sessionId || req.headers['x-session-id'] || null;
  req.sessionId = sessionId;
  next();
};

// Apply session middleware to all routes
router.use(extractSessionId);

/**
 * POST /api/roast - Get a roast response
 * Processes user input and returns an AI-generated roast
 */
router.post('/roast', async (req, res) => {
  // Set a timeout to ensure the request doesn't hang
  const timeoutId = setTimeout(() => {
    console.error('❌ Request timeout in /api/roast');
    if (!res.headersSent) {
      return res.status(503).json({ 
        error: 'Request timeout',
        message: "Server took too long to respond. My brain is too powerful for your garbage internet connection."
      });
    }
  }, REQUEST_TIMEOUT);
  
  try {
    if (DEBUG_MODE) console.log('🔍 Request body:', req.body);
    const { message } = req.body;
    
    // Validate message
    if (!message) {
      clearTimeout(timeoutId);
      return res.status(400).json({ 
        error: 'Message is required',
        message: "Nice try sending an empty message. Too scared to get roasted?" 
      });
    }
    
    // Validate message is a string
    if (typeof message !== 'string') {
      clearTimeout(timeoutId);
      return res.status(400).json({ 
        error: 'Message must be a string',
        message: "What the hell are you trying to send me? I roast text, not whatever garbage that was."
      });
    }
    
    console.log('📨 Processing roast request:', message.substring(0, 50) + (message.length > 50 ? '...' : ''));
    
    // Get or create session
    const session = sessionManager.getSession(req.sessionId);
    console.log(`🔑 Session: ${session.id}, Level: ${session.roastLevel}`);
    
    // Track previous responses to avoid repetition
    if (!session.previousResponses) {
      session.previousResponses = [];
    }
    
    // Add user message to session history
    sessionManager.addMessage(session.id, 'user', message);
    
    // Get the updated session after adding message
    const updatedSession = sessionManager.getSession(session.id);
    
    // Make all roasts EXTREMELY intense - minimum level is 3
    // Level 1 user setting = actual level 3
    // Level 2 user setting = actual level 4
    // Level 3+ user setting = level 5
    // This ensures ALL roasts are creative and savage
    const adjustedLevel = Math.max(Math.min(updatedSession.roastLevel + 2, 5), 3);

    console.log(`🎯 Generating roast at level ${updatedSession.roastLevel} (adjusted to ${adjustedLevel} for MAXIMUM savagery)`);
    
    // Get roast from API integration with full message context and avoiding repetition
    let response = await apiIntegration.generateRoast(
      message,
      adjustedLevel // Use the adjusted higher level
    );
    
    // Check for repetition (exact same response or 90% similarity)
    let repetitionDetected = false;
    if (session.previousResponses.includes(response)) {
      console.log('⚠️ Exact repeated response detected, regenerating...');
      repetitionDetected = true;
    } else if (session.previousResponses.length > 0) {
      // Check for high similarity with previous responses
      for (const prevResponse of session.previousResponses) {
        if (calculateSimilarity(response, prevResponse) > 0.8) {
          console.log('⚠️ Similar response detected, regenerating...');
          repetitionDetected = true;
          break;
        }
      }
    }
    
    // If repetition detected, try to generate a different response at a higher level
    if (repetitionDetected) {
      console.log('🔄 Generating alternative response to avoid repetition');
      
      // Try with a temporary higher roast level
      const tempLevel = Math.min(updatedSession.roastLevel + 1, 5);
      response = await apiIntegration.generateRoast(message, tempLevel);
      
      // If still similar, add a custom prefix
      if (session.previousResponses.some(prev => calculateSimilarity(response, prev) > 0.7)) {
        const prefixes = [
          "Look, I've already roasted you but you're asking for more. ",
          "Since you're such a glutton for punishment: ",
          "Fine, you want another roast? Here you go: ",
          "I'm running out of ways to insult you, but I'll try: ",
          "You must really enjoy the abuse. Alright then: "
        ];
        response = prefixes[Math.floor(Math.random() * prefixes.length)] + response;
      }
    }
    
    // Store this response to prevent future repetition
    session.previousResponses.push(response);
    
    // Keep only the last 5 responses to avoid memory issues
    if (session.previousResponses.length > 5) {
      session.previousResponses.shift();
    }
    
    console.log(`✅ Roast generated (${response.length} chars): ${response.substring(0, 50)}...`);
    
    // Add bot response to session history
    sessionManager.addMessage(session.id, 'assistant', response);
    
    // Set session cookie if not exists
    if (!req.cookies?.sessionId) {
      res.cookie('sessionId', session.id, { 
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        sameSite: 'strict'
      });
    }
    
    // Clear the timeout since we're responding successfully
    clearTimeout(timeoutId);
    
    return res.json({
      message: response,
      roastLevel: updatedSession.roastLevel,
      sessionId: session.id
    });
  } catch (error) {
    // Clear the timeout since we're handling the error
    clearTimeout(timeoutId);
    
    console.error('❌ Error in /api/roast:', error);
    console.error('Stack trace:', error.stack);
    
    // Check for specific error types
    let statusCode = 500;
    let errorMessage = "Even my AI crashed trying to process how roastable you are. Try again if you dare.";
    
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      statusCode = 503;
      errorMessage = "Server timed out. I know you're desperate for my roasts, but even I need time to process your mediocrity.";
    } else if (error.name === 'TypeError') {
      statusCode = 400;
      errorMessage = "Your request was so bad it confused even my genius AI brain. Try sending something that makes sense.";
    } else if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
      statusCode = 503;
      errorMessage = "Network issues detected. My savage roasts are too powerful for your garbage internet connection.";
    }
    
    return res.status(statusCode).json({ 
      error: error.message || 'Internal server error',
      message: errorMessage
    });
  }
});

/**
 * Calculate similarity between two strings (Jaccard similarity on words)
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Similarity score between 0 and 1
 */
function calculateSimilarity(str1, str2) {
  // Convert strings to sets of words
  const words1 = new Set(str1.toLowerCase().split(/\s+/).filter(word => word.length > 3));
  const words2 = new Set(str2.toLowerCase().split(/\s+/).filter(word => word.length > 3));
  
  // Calculate intersection size
  const intersection = new Set([...words1].filter(word => words2.has(word)));
  
  // Calculate union size
  const union = new Set([...words1, ...words2]);
  
  // Return Jaccard similarity
  return intersection.size / union.size;
}

/**
 * GET /api/session - Get current session info
 * Returns session information for the current user
 */
router.get('/session', (req, res) => {
  try {
    const session = sessionManager.getSession(req.sessionId);
    
    // Convert Set to Array for JSON serialization
    const sessionResponse = {
      ...session,
      topics: Array.from(session.topics)
    };
    
    return res.json(sessionResponse);
  } catch (error) {
    console.error('Error in /api/session:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/preferences - Update user preferences
 * Updates theme and volume settings
 */
router.put('/preferences', (req, res) => {
  try {
    const { theme, volume } = req.body;
    const session = sessionManager.getSession(req.sessionId);
    
    const preferences = {};
    if (theme) preferences.theme = theme;
    if (volume !== undefined) preferences.volume = volume;
    
    const updatedSession = sessionManager.updatePreferences(session.id, preferences);
    
    // Convert Set to Array for JSON serialization
    const sessionResponse = {
      ...updatedSession,
      topics: Array.from(updatedSession.topics)
    };
    
    return res.json(sessionResponse);
  } catch (error) {
    console.error('Error in /api/preferences:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/reset - Reset user session
 * Creates a new session, effectively resetting progress
 */
router.post('/reset', (req, res) => {
  try {
    const newSession = sessionManager.createSession();
    
    res.cookie('sessionId', newSession.id, { 
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: 'strict'
    });
    
    // Convert Set to Array for JSON serialization
    const sessionResponse = {
      ...newSession,
      topics: Array.from(newSession.topics)
    };
    
    return res.json(sessionResponse);
  } catch (error) {
    console.error('Error in /api/reset:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/diagnostics - Test API connection
 * Runs diagnostics on the Hugging Face API connection
 */
router.get('/diagnostics', async (req, res) => {
  try {
    console.log('🔍 Running API diagnostics...');
    
    // Start time for performance measurement
    const startTime = Date.now();
    
    // Check if the SDK was loaded
    const sdkLoaded = typeof apiIntegration.testApiConnection === 'function';
    
    // Check for HF_TOKEN
    const hfTokenPresent = !!process.env.HF_TOKEN;
    const hfTokenPrefix = hfTokenPresent ? process.env.HF_TOKEN.substring(0, 5) + '...' : null;
    
    // Check for network connectivity (basic DNS resolution)
    let networkConnectivity = false;
    try {
      const dns = require('dns');
      const { promisify } = require('util');
      const dnsLookup = promisify(dns.lookup);
      await dnsLookup('api-inference.huggingface.co');
      networkConnectivity = true;
    } catch (err) {
      console.error('❌ DNS lookup failed:', err.message);
    }
    
    // Collect environment info
    const diagnostics = {
      timestamp: new Date().toISOString(),
      duration_ms: 0, // Will be updated at the end
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        hf_token_present: hfTokenPresent,
        hf_token_prefix: hfTokenPrefix,
        sdk_loaded: sdkLoaded,
        network_connectivity: networkConnectivity,
        memory_usage: process.memoryUsage(),
        uptime_seconds: process.uptime()
      },
      api_test: null,
      server_health: {
        activeConnections: req.connection.server._connections
      }
    };
    
    // Test API connection with retries if SDK is loaded
    if (sdkLoaded) {
      console.log('🧪 Testing API connection...');
      try {
        // Set a timeout for the API test (15 seconds)
        const apiTestPromise = apiIntegration.testApiConnection();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('API test timeout after 15 seconds')), 15000);
        });
        
        diagnostics.api_test = await Promise.race([apiTestPromise, timeoutPromise]);
        console.log('📊 API test result:', JSON.stringify(diagnostics.api_test));
      } catch (err) {
        console.error('❌ API test error:', err.message);
        diagnostics.api_test = { 
          success: false, 
          error: err.message,
          timestamp: new Date().toISOString()
        };
      }
    } else {
      console.error('❌ Cannot test API: SDK not properly loaded');
      diagnostics.api_test = { 
        success: false, 
        error: 'SDK not loaded',
        timestamp: new Date().toISOString()
      };
    }
    
    // Test generate a simple roast using local fallback (bypassing API)
    try {
      const testMessage = "This is a diagnostics test message.";
      const testLevel = 1; // Use level 1 to ensure local fallback
      const startRoast = Date.now();
      const roastResponse = await apiIntegration.generateRoast(testMessage, testLevel);
      const endRoast = Date.now();
      
      diagnostics.local_roast_test = {
        success: !!roastResponse,
        duration_ms: endRoast - startRoast,
        response_length: roastResponse.length,
        sample: roastResponse.substring(0, 50) + '...'
      };
    } catch (err) {
      diagnostics.local_roast_test = {
        success: false,
        error: err.message
      };
    }
    
    // Add suggestions based on diagnostic results
    diagnostics.suggestions = [];
    
    if (!hfTokenPresent) {
      diagnostics.suggestions.push("Set the HF_TOKEN environment variable with a valid Hugging Face API token");
    }
    
    if (!sdkLoaded) {
      diagnostics.suggestions.push("Install the Hugging Face SDK: npm install @huggingface/inference");
    }
    
    if (!networkConnectivity) {
      diagnostics.suggestions.push("Check network connectivity to api-inference.huggingface.co");
    }
    
    if (diagnostics.api_test && !diagnostics.api_test.success) {
      if (diagnostics.api_test.error && diagnostics.api_test.error.includes('Unauthorized')) {
        diagnostics.suggestions.push("The HF_TOKEN is invalid or has expired. Please update it with a valid token.");
      } else if (diagnostics.api_test.error && diagnostics.api_test.error.includes('timeout')) {
        diagnostics.suggestions.push("API request timed out. Hugging Face servers may be under heavy load or there may be network issues.");
      }
    }
    
    // Calculate total duration
    diagnostics.duration_ms = Date.now() - startTime;
    
    return res.json({
      success: true,
      diagnostics
    });
  } catch (error) {
    console.error('❌ Error in /api/diagnostics:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Diagnostics failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 