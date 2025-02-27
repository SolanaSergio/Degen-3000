const express = require('express');
const router = express.Router();
const apiIntegration = require('../utils/api-integration');
const sessionManager = require('../utils/session-manager');
const { HfInference } = require('@huggingface/inference');
require('dotenv').config();

// Add request timeout (in milliseconds)
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Debug mode for detailed logging
const DEBUG_MODE = true;

// Initialize Hugging Face client with token from .env
const hfToken = process.env.HF_TOKEN;
const modelName = process.env.MODEL_NAME || "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B";

// Try to create the HF client, but handle errors gracefully
let client = null;
let hfClientAvailable = false;
try {
  client = new HfInference(hfToken);
  hfClientAvailable = true;
  console.log('✅ Hugging Face client initialized successfully');
} catch (error) {
  console.error('❌ ERROR initializing Hugging Face client:', error.message);
  console.error('Stack trace:', error.stack);
  console.warn('⚠️ WARNING: Using local fallback roasts only.');
}

// Session management
const sessions = new Map();

// Middleware to extract session ID from cookies
const extractSessionId = (req, res, next) => {
  const sessionId = req.cookies?.sessionId || req.headers['x-session-id'] || req.session?.id || null;
  req.sessionId = sessionId;
  next();
};

// Apply session middleware to all routes
router.use(extractSessionId);

// Local fallback roasts for when the API is not available
const fallbackRoasts = [
  "Your investment strategy is like a game of pin the tail on the donkey, except the donkey is your retirement fund and you're blindfolded by FOMO.",
  "I've seen more promising returns from a Nigerian prince email scam than your trading history. At least the prince promised profits.",
  "Your crypto portfolio diversification is impressive... it's equally worthless across all blockchains! True decentralization of losses.",
  "HODL? More like HODLing onto false hope with those shitcoins you picked. Even your wallet is trying to forget its seed phrase.",
  "Your trading chart looks like the heart monitor of someone who just discovered their life savings went into Luna right before the crash.",
  "Calling your strategy 'buy high, sell low' would be an insult to people who accidentally do that. You've turned it into an art form.",
  "Diamond hands? More like cubic zirconia fingers the way you panic sell at every dip and FOMO back in at the peak.",
  "To the moon? The only thing mooning here is the market showing you its backside while your portfolio craters to the Earth's core.",
  "Your wallet has more dead coins than a graveyard has tombstones. Ever consider selling 'Portfolio Disaster Tours' as an NFT?",
  "If your trading strategy was printed out, it would be best used as toilet paper during a crypto winter. At least then it would serve a purpose.",
  "Your entry and exit points are timed so perfectly wrong that exchanges should pay you to do the opposite of your trades.",
  "The only green in your portfolio is the mold growing on what's left of your initial investment.",
  "You buy the rumor, sell the news, and somehow still manage to time both exactly wrong. That takes special talent."
];

/**
 * Generate a local fallback roast when API is not available
 * @param {number} level - Roast level (1-5)
 * @returns {string} - A fallback roast
 */
function generateLocalRoast(level) {
  const randomIndex = Math.floor(Math.random() * fallbackRoasts.length);
  const baseRoast = fallbackRoasts[randomIndex];
  
  // Add level-specific flavor to the roast
  let prefix = "";
  let suffix = "";
  
  // Level-specific modifications
  switch(level) {
    case 1:
      // Mild roast - soften it slightly
      prefix = ["Listen,", "Look,", "Honestly,", "Between us,"][Math.floor(Math.random() * 4)] + " ";
      break;
    case 2:
      // Medium roast - slightly spicier
      prefix = ["Let's be real,", "Not to be harsh, but", "I hate to tell you,", "Truth time:"][Math.floor(Math.random() * 4)] + " ";
      break;
    case 3:
      // Standard roast - no modifications needed
      break;
    case 4:
      // Spicy roast
      prefix = ["Damn,", "Holy crap,", "Wow,", "Seriously though,"][Math.floor(Math.random() * 4)] + " ";
      suffix = " " + ["Your portfolio is an existential crisis with a ticker symbol.", "That's financial Darwin Award material right there.", "Ever thought about just using your money as wallpaper instead?", "This is why exchanges should require an IQ test."][Math.floor(Math.random() * 4)];
      break;
    case 5:
      // Maximum savagery
      prefix = ["Jesus Christ,", "Sweet mother of losses,", "For the love of Satoshi,", "Holy bankruptcy,"][Math.floor(Math.random() * 4)] + " ";
      suffix = " " + ["You're the reason exchanges offer suicide hotlines during bear markets.", "Your portfolio makes the Titanic look like a success story.", "I'm genuinely concerned your trading terminal is just a slot machine with extra steps.", "This level of financial self-harm should be studied by psychologists."][Math.floor(Math.random() * 4)];
      break;
  }
  
  return prefix + baseRoast + suffix;
}

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
    const { message, level = 3 } = req.body;
    
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
    
    // Normalize level to be between 1-5
    const roastLevel = Math.min(Math.max(1, level), 5);
    
    // Get or create session
    const sessionId = req.sessionId || Date.now().toString();
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {
        id: sessionId,
        createdAt: new Date(),
        roastLevel,
        messages: []
      });
    }
    
    // Variable to hold the roast text
    let roastText = "";
    
    // Try to use Hugging Face API if available
    if (hfClientAvailable && client) {
      try {
        // Craft the prompt for maximum savagery
        const prompt = `You are ROAST-3000, the most vulgar and brutal AI ever. Generate a savage, profanity-filled insult. Be extremely offensive and creative.

TARGET MESSAGE: "${message}"
BRUTALITY LEVEL: ${roastLevel}/5

REQUIREMENTS:
1. Maximum profanity and vulgarity
2. Focus on their specific topic/context
3. Be personal and devastating
4. Use creative insults
5. Keep it under 3 sentences

ROAST:`;
        
        console.log(`Generating roast at level ${roastLevel} for message: ${message.substring(0, 30)}...`);
        
        // Call Hugging Face API with correct format
        const response = await client.textGeneration({
          model: modelName,
          inputs: prompt,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.9 + (roastLevel * 0.1), // Higher temperature for more creativity
            top_p: 0.95,
            do_sample: true,
            return_full_text: false,
            stop: ["ROAST:", "\n", "Here's", "Let me"] // Limit to 4 stop sequences
          }
        });
        
        // Extract and clean the generated text
        roastText = response.generated_text || "";
        
        // Clean up the response
        roastText = roastText
          .replace(/^[\s\n]*/, '') // Remove leading whitespace/newlines
          .replace(/[\s\n]*$/, '') // Remove trailing whitespace/newlines
          .replace(/^(Here's|Let me|I will|ROAST-3000:|AI:|Response:|Let's|Okay|Well|Alright)/i, '') // Remove any meta prefixes
          .replace(/^[\s\n]*/, '') // Remove any remaining leading whitespace
          .replace(/^[,.!?-\s]+/, ''); // Remove any leading punctuation
        
        // If empty response or contains meta-commentary, use fallback
        if (!roastText.trim() || 
            /\b(roast|generate|level|prompt|here's|let me|i will|okay|well|alright)\b/i.test(roastText)) {
          throw new Error('Invalid response format from API');
        }
      } catch (apiError) {
        console.error('❌ Hugging Face API error:', apiError.message);
        console.warn('⚠️ Falling back to local roast generation');
        
        // If the API call fails, use local fallback
        roastText = generateLocalRoast(roastLevel);
      }
    } else {
      // API not available, use local fallback
      console.log('Using local fallback roast (API not available)');
      roastText = generateLocalRoast(roastLevel);
    }
    
    // If no roast text was generated, provide a fallback
    if (!roastText || roastText.trim() === "") {
      roastText = "Sorry, I couldn't come up with a good roast. Your investments must be as uninspiring as my AI.";
    }
    
    // Truncate if too long
    if (roastText.length > 280) {
      roastText = roastText.substring(0, 277) + "...";
    }
    
    // Save this exchange in the session history
    const session = sessions.get(sessionId);
    session.messages.push({
      user: message,
      bot: roastText,
      level: roastLevel,
      timestamp: new Date()
    });
    
    // Limit history to last 10 exchanges
    if (session.messages.length > 10) {
      session.messages = session.messages.slice(-10);
    }
    
    // Update session roast level
    session.roastLevel = roastLevel;
    
    // Clear the timeout since the request completed
    clearTimeout(timeoutId);
    
    // Return the roast
    res.json({
      message: roastText,
      roastLevel,
      sessionId,
      timestamp: new Date(),
      source: hfClientAvailable && client ? 'api' : 'local'
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
 * GET /api/session - Get current session info
 * Returns session information for the current user
 */
router.get('/session', (req, res) => {
  try {
    const sessionId = req.sessionId || Date.now().toString();
    
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {
        id: sessionId,
        createdAt: new Date(),
        roastLevel: 3,
        messages: []
      });
    }
    
    res.json(sessions.get(sessionId));
  } catch (error) {
    console.error('Error in /api/session:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: "Failed to retrieve session information"
    });
  }
});

/**
 * PUT /api/preferences - Update user preferences
 * Updates theme and volume settings
 */
router.put('/preferences', (req, res) => {
  try {
    const { theme, volume } = req.body;
    const sessionId = req.sessionId || Date.now().toString();
    
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {
        id: sessionId,
        createdAt: new Date(),
        roastLevel: 3,
        messages: [],
        theme: theme,
        volume: volume
      });
    } else {
      const session = sessions.get(sessionId);
      if (theme) session.theme = theme;
      if (volume !== undefined) session.volume = volume;
    }
    
    res.json(sessions.get(sessionId));
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
    const sessionId = req.sessionId || Date.now().toString();
    
    sessions.delete(sessionId);
    
    // Create new session
    sessions.set(sessionId, {
      id: sessionId,
      createdAt: new Date(),
      roastLevel: 3,
      messages: []
    });
    
    return res.json({
      sessionId,
      message: 'Session reset successfully'
    });
  } catch (error) {
    console.error('Error in /api/reset:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/stats - Get API statistics
 * Returns statistics about API usage
 */
router.get('/stats', (req, res) => {
  try {
    // Only allow this in development/debug mode
    if (process.env.NODE_ENV === 'production' && !DEBUG_MODE) {
      return res.status(403).json({ error: 'Forbidden in production mode' });
    }
    
    const stats = {
      activeSessions: sessions.size,
      totalMessages: Array.from(sessions.values()).reduce((total, session) => {
        return total + session.messages.length;
      }, 0),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      apiAvailable: hfClientAvailable
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error in /api/stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /health - API health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    huggingFaceToken: hfToken ? 'configured' : 'missing',
    apiAvailable: hfClientAvailable,
    model: modelName
  });
});

module.exports = router; 