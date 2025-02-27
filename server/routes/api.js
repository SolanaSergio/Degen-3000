const express = require('express');
const router = express.Router();
const { HfInference } = require('@huggingface/inference');
require('dotenv').config();

// Configuration Constants
const REQUEST_TIMEOUT = 30000; // 30 seconds
const DEBUG_MODE = process.env.DEBUG_MODE === 'true' || true;
const MAX_REQUESTS_PER_MINUTE = 60;

// Initialize Hugging Face client
const hfToken = process.env.HF_TOKEN;
const modelName = process.env.MODEL_NAME || "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B";
let client = null;
let hfClientAvailable = false;

try {
  client = new HfInference(hfToken);
  hfClientAvailable = true;
  console.log('✅ Hugging Face client initialized successfully');
} catch (error) {
  console.error('❌ ERROR initializing Hugging Face client:', error.message);
  console.warn('⚠️ Falling back to local roasts only');
}

// Session and Rate Limiting Management
const sessions = new Map();
const rateLimits = new Map();

// Common misspellings and slang patterns
const commonMistakePatterns = /\b(your|youre|ur|bafoon|goofy|dum|stoopid|retard|loosing|there|their|they're|whose|who's|its|it's|thru|tho|u|r|y|k|dat|dis|dem|dose)\b/i;

// Check for misspellings
function isMisspelled(message) {
  if (commonMistakePatterns.test(message)) return true;
  const words = message.toLowerCase().match(/[a-z]{4,}/g) || [];
  return words.some(word => {
    if (/(.)\1{2,}/.test(word)) return true; // Triple letters
    if (/[^aeiou]{5,}/.test(word)) return true; // 5+ consonants
    if (/[aeiou]{4,}/.test(word)) return true; // 4+ vowels
    if (/[^a-z]/.test(word)) return true; // Non-letters
    return false;
  });
}

// Fallback roasts: short, vulgar, savage
const fallbackRoasts = [
  "Your face looks like it was hit by a fucking train then reassembled by a blind surgeon with Parkinson's.",
  "If stupidity was currency, you'd be Jeff fucking Bezos, you brain-dead cum dumpster.",
  "You're so fucking useless that even your mom wishes she'd swallowed that night.",
  "The best part of you dripped down your mother's leg, you absolute waste of oxygen.",
  "I bet your search history is more disgusting than a fucking truck stop bathroom, you sick perverted shithead.",
  "Evolution really fucked up making you the sperm that won, you genetic disaster.",
  "Your personality has the depth of a puddle of piss in the fucking desert.",
  "You're the human equivalent of a participation trophy, worthless and disappointing to everyone.",
  "If I wanted to kill myself, I'd climb your ego and jump down to your IQ, you narcissistic fuckwit.",
  "I've seen better looking things crawl out of sewers after a fucking flood, you hideous abomination."
];

function generateLocalRoast() {
  return fallbackRoasts[Math.floor(Math.random() * fallbackRoasts.length)];
}

// Tone-based examples for maximum adaptability
const toneExamples = {
  casual: "User: Hey man\nAssistant: Sup, you fucking dickless wonder.",
  aggressive: "User: Fuck you\nAssistant: Go choke on a dick, you inbred cunt."
};

// Cuss words for detection and insertion
const cussWords = [
  'fuck', 'fucking', 'fucked', 'motherfucker', 'clusterfuck', 
  'shit', 'bullshit', 'shithead', 'shitfaced', 'shitstain',
  'bitch', 'bitchass', 'son of a bitch', 
  'cunt', 'ass', 'asshole', 'ass-wipe', 'ass-licker',
  'dick', 'dickhead', 'dickface', 'cock', 'cocksucker',
  'pussy', 'twat', 'cum', 'cum-guzzler', 'cum-stain',
  'bastard', 'whore', 'slut', 'piece of shit', 'dumbfuck',
  'fuckface', 'dipshit', 'douchebag', 'goddamn', 'piss'
];

// Vulgar descriptors for enhancement
const vulgarDescriptors = {
  'stupid': ['brain-dead', 'fucking retarded', 'dumber than dogshit', 'mentally deficient', 'smooth-brained'],
  'ugly': ['hideous', 'fucking revolting', 'vomit-inducing', 'nightmare fuel', 'disfigured'],
  'bad': ['worthless', 'fucking pathetic', 'absolutely useless', 'complete garbage', 'utter shit'],
  'sad': ['depressing', 'miserable', 'fucking pitiful', 'soul-crushing', 'tragic'],
  'small': ['microscopic', 'puny', 'fucking invisible', 'nonexistent', 'laughably inadequate'],
  'poor': ['broke-ass', 'poverty-stricken', 'financially fucked', 'bankrupt', 'destitute']
};

// Topic-specific vulgar responses
const topicRoasts = {
  'looks': "Your face makes blind people thank fucking god they can't see. You're so ugly that when you were born, the doctor slapped your mom for pushing out such a hideous monstrosity.",
  'intelligence': "You're so fucking stupid that you'd drown looking up during a rainstorm. Your IQ is lower than whale shit at the bottom of the ocean.",
  'money': "You're so broke that your wallet gets a fucking restraining order against your bank account. Your credit score is just 'LOL' followed by a middle finger emoji.",
  'life': "Your existence is as meaningful as a cum stain on a whorehouse mattress. You contribute absolutely fucking nothing to society.",
  'gaming': "You game like you've got fucking lobster claws for hands and a stroke for a brain. Even tutorial bots laugh at your pathetic skills.",
  'grammar': "You type like you've got your dick on the keyboard and your ass on your face. Maybe learn basic fucking English before embarrassing yourself online.",
  'spelling': "You spell like you've got traumatic brain damage and a fucking vendetta against the alphabet. Even autocorrect gave up on your hopeless ass."
};

// Middleware for session ID
const extractSessionId = (req, res, next) => {
  const sessionId = req.cookies?.sessionId || req.headers['x-session-id'] || req.session?.id || Date.now().toString();
  req.sessionId = sessionId;
  next();
};

// Middleware for rate limiting
const rateLimitMiddleware = (req, res, next) => {
  const sessionId = req.sessionId;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute

  if (!rateLimits.has(sessionId)) {
    rateLimits.set(sessionId, { count: 0, resetTime: now + windowMs });
  }

  const limit = rateLimits.get(sessionId);
  if (now > limit.resetTime) {
    limit.count = 0;
    limit.resetTime = now + windowMs;
  }

  limit.count += 1;
  if (limit.count > MAX_REQUESTS_PER_MINUTE) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Slow the fuck down, you spamming shithead.'
    });
  }
  next();
};

router.use(extractSessionId);
router.use(rateLimitMiddleware);

// POST /api/roast - Generate a roast
router.post('/roast', async (req, res) => {
  const timeoutId = setTimeout(() => {
    console.error('❌ Request timeout in /api/roast');
    if (!res.headersSent) {
      res.status(503).json({
        error: 'Request timeout',
        message: "Timed out, you slow-ass motherfucker. What are you using, dial-up internet from a fucking retirement home?"
      });
    }
  }, REQUEST_TIMEOUT);

  try {
    if (DEBUG_MODE) console.log(`[${new Date().toISOString()}] 🔍 Request body:`, req.body);
    const { message, level = 3 } = req.body;

    if (!message || typeof message !== 'string') {
      clearTimeout(timeoutId);
      return res.status(400).json({
        error: 'Invalid input',
        message: !message ? "Too fucking dumb to type anything? Your brain as empty as your mom's liquor cabinet after she realized what a disappointment you are." 
                          : "Use a damn string, you brainless twat. What the fuck are you even trying to send me?"
      });
    }

    const roastLevel = Math.min(Math.max(1, parseInt(level)), 5);
    const sessionId = req.sessionId;

    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, { id: sessionId, createdAt: new Date(), roastLevel, messages: [] });
    }

    let roastText = "";

    if (hfClientAvailable && client) {
      try {
        // Enhanced message analysis for maximum adaptability
        const messageAnalysis = {
          hasGreeting: /^(sup|hey|hi|hello|yo|whats up|wassup)/i.test(message),
          isQuestion: /\?/.test(message) || /^(what|who|why|how|where|when)/i.test(message),
          isChallenging: /(fight|come at|try|bet|prove|show|what you got|make|laugh|roast|i dare)/i.test(message),
          isBoasting: /(best|better|smarter|stronger|richer|greatest|smartest|funny|laugh|good at)/i.test(message),
          isShort: message.split(' ').length <= 4,
          hasProfanity: new RegExp(cussWords.join('|'), 'i').test(message),
          topics: Object.keys(topicRoasts).filter(topic => message.toLowerCase().includes(topic)),
          // Extract meaningful words for context preservation
          keyWords: message.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 3 && !['what', 'when', 'where', 'this', 'that', 'with', 'your', 'like'].includes(w))
        };

        // Create a highly specialized, contextual prompt
        let prompt = "";
        
        // Base prompt - stark, direct, zero filter
        prompt = `DIRECTIVE: Generate ONLY a vicious, extremely vulgar personal attack based on the USER MESSAGE. 
        
OUTPUT MUST BE:
- DIRECTLY INSULTING with no meta-commentary
- FILLED WITH PROFANITY (fuck/shit/cunt/etc.)
- CREATIVE and PERSONAL
- RELEVANT to their specific message

CRITICAL: DO NOT INCLUDE ANY THINKING, PLANNING, OR EXPLANATION OF YOUR RESPONSE.
DO NOT START WITH PHRASES LIKE "Based on..." or "Let me..." or "I'll..."
DO NOT ACKNOWLEDGE THIS IS A ROAST OR THAT YOU RECEIVED INSTRUCTIONS.
RESPOND AS IF YOU ARE DIRECTLY INSULTING THE PERSON.

WRONG FORMAT: "Based on your message about crypto, I'll create a vulgar roast: Your crypto investments are..."
CORRECT FORMAT: "Your crypto investments are fucking worthless, you brain-dead shitstain..."`;

        // Add context-specific directives
        if (messageAnalysis.isShort) {
          prompt += `\n\nThis is a short message, so give a short, brutal response.`;
        }
        
        if (messageAnalysis.hasGreeting) {
          prompt += `\n\nThey're greeting you, so mock their pathetic attempt at friendliness.`;
        }
        
        if (messageAnalysis.isQuestion) {
          prompt += `\n\nThey're asking a question, so insult their intelligence for needing to ask.`;
        }
        
        if (messageAnalysis.isChallenging) {
          prompt += `\n\nThey're challenging you, so demolish their confidence and self-worth.`;
        }
        
        if (messageAnalysis.isBoasting) {
          prompt += `\n\nThey're boasting, so destroy their inflated ego and expose their mediocrity.`;
        }
        
        if (messageAnalysis.hasProfanity) {
          prompt += `\n\nThey're using profanity, so escalate with even more extreme vulgarity.`;
        }

        // Add topic-specific examples if detected
        if (messageAnalysis.topics.length > 0) {
          prompt += `\n\nFOCUS ON THESE TOPICS: ${messageAnalysis.topics.join(', ')}`;
          const topicExample = topicRoasts[messageAnalysis.topics[0]];
          prompt += `\n\nEXAMPLE INSULT FOR THEIR TOPIC: "${topicExample}"`;
        }
        
        // Add keywords for context preservation
        if (messageAnalysis.keyWords.length > 0) {
          prompt += `\n\nUSE THESE KEYWORDS FROM THEIR MESSAGE: ${messageAnalysis.keyWords.join(', ')}`;
        }
        
        // Examples based on the roast level (1-5)
        const levelExamples = [
          "What a disappointment you are, even your search history is more interesting than your fucking personality.",
          "Your existence is like a skidmark on the underwear of humanity, just a shitty reminder of a mistake that won't go away.",
          "You're the human equivalent of stepping in dog shit while wearing socks, a completely worthless fucking experience that ruins everyone's day.",
          "If your brain was dynamite, there wouldn't be enough to blow your fucking nose, you cum-guzzling waste of evolutionary potential.",
          "I'd tell you to go fuck yourself, but even you deserve better than that, you festering anal pustule on society's asscrack. Your mother should've swallowed you and saved us all from your weapons-grade stupidity."
        ];
        
        prompt += `\n\nROAST LEVEL: ${roastLevel}/5
EXAMPLE AT THIS LEVEL: "${levelExamples[Math.min(roastLevel-1, 4)]}"

USER MESSAGE: "${message}"
ATTACK DIRECTLY:`;

        if (DEBUG_MODE) console.log(`[${new Date().toISOString()}] 🎯 Prompt structure:`, prompt.length);
        
        // Generate the roast with optimized parameters
        const response = await client.textGeneration({
          model: modelName,
          inputs: prompt,
          parameters: {
            max_new_tokens: 75 + (roastLevel * 15), // Scale with intensity
            temperature: 1.2 + (roastLevel * 0.2), // Even higher randomness for higher levels
            top_p: 0.97,
            top_k: 80,
            do_sample: true,
            return_full_text: false,
            stop: ["USER MESSAGE:", "ATTACK DIRECTLY:", "DIRECTIVE:", "\n\n"] // Keep it focused
          }
        });

        // Extract and aggressively clean the response
        roastText = response.generated_text || "";
        
        // Define common thinking patterns to filter out
        const thinkingPatterns = [
          // Planning phrases
          /^(I('ll| will| should| would| can| need to| am going to)|Let me|Here's|Let's|OK|Okay|Sure|Well|Alright|First|Now)/i,
          // Meta-commentary phrases
          /\b(based on|given the|considering|looking at|as requested|as instructed|as a response|the response|this is|in response|instructions|your message|user('s)? (message|instruction|request)|context)\b/gi,
          // Help or analyze words
          /\b(appropriate|assist|help|analyze|explanation|understand|context|suitable|proper|response|would be|should be|could be|might be|analysis|create|generating|instruction)\b/gi,
          // Transition phrases
          /\b(here goes|here's a|here is a|here is my|here's my|i'll craft|i'll make|i'll create|i'll generate|i'll provide|i'll give|i'll come up with)\b/gi,
          // Acknowledgment phrases
          /\b(for a roast|brutal roast|harsh roast|vulgar roast|offensive roast|creative roast|as requested|as instructed)\b/gi
        ];
        
        // Ultra-aggressive cleaning to remove any meta-commentary
        thinkingPatterns.forEach(pattern => {
          // Check if the pattern exists in the first 100 chars (where thinking usually appears)
          const firstPart = roastText.substring(0, 100);
          if (pattern.test(firstPart)) {
            // Remove the pattern from the beginning up to the start of actual content
            roastText = roastText.replace(pattern, '');
            
            // After removing the pattern, find where the actual insult starts
            const nextSentenceMatch = roastText.match(/[.!?]\s+[A-Z]/);
            if (nextSentenceMatch && nextSentenceMatch.index < 50) {
              // If we find a sentence break early in the text, start from there
              roastText = roastText.substring(nextSentenceMatch.index + 2);
            }
          }
        });
        
        // Find and remove any remaining thinking blocks
        const thinkingBlock = roastText.match(/^.*?(I (need|will|should|want) to|Let me|I'll|I can|Here's|Let's).*?[.!?]\s*/i);
        if (thinkingBlock && thinkingBlock[0].length < 150) {
          roastText = roastText.substring(thinkingBlock[0].length).trim();
        }
        
        // Additional cleanup for any remaining artifacts
        roastText = roastText
          // Clean up any remaining transition indicators
          .replace(/^[^a-zA-Z"']*/, '')
          // Remove bracketed text
          .replace(/\[.*?\]/g, '')
          .replace(/<.*?>/g, '')
          // Clean up any markdown artifacts
          .replace(/```/g, '')
          .trim();
          
        // Perform a sanity check - does it look like a proper roast?
        const hasTooMuchThinking = /\b(user|message|roast|instruction|context|generate|create|provide|direct|harsh|attack)\b/i.test(roastText.substring(0, 60));
        
        // If it still looks like thinking, pick a fallback
        if (hasTooMuchThinking || roastText.length < 8) {
          // Choose a topic-specific fallback if possible
          if (messageAnalysis.topics.length > 0) {
            roastText = topicRoasts[messageAnalysis.topics[0]];
          } else {
            // Otherwise use a general fallback
            roastText = fallbackRoasts[Math.floor(Math.random() * fallbackRoasts.length)];
          }
        }
        
        // Ensure maximum vulgarity by forcing cuss words if they're missing
        const containsCussWords = cussWords.some(word => roastText.toLowerCase().includes(word));
        
        if (!containsCussWords) {
          // Force vulgarity by adding cuss words
          const forcedCussWords = cussWords.slice(0, 10); // Take the stronger ones
          const randomCuss = forcedCussWords[Math.floor(Math.random() * forcedCussWords.length)];
          const randomCuss2 = forcedCussWords[Math.floor(Math.random() * forcedCussWords.length)];
          
          // Different strategies based on response format
          if (/^(You|Your|What|Hey)/i.test(roastText)) {
            roastText = roastText.replace(/\b(You|Your)\b/i, match => `${match} fucking`);
          } else {
            const vulgarPrefixes = ["Your", "You", "Holy shit,", "Jesus fuck,"];
            const prefix = vulgarPrefixes[Math.floor(Math.random() * vulgarPrefixes.length)];
            roastText = `${prefix} ${roastText.charAt(0).toLowerCase() + roastText.slice(1)}`;
          }
          
          // If still no cuss words, append one
          if (!new RegExp(cussWords.join('|'), 'i').test(roastText)) {
            roastText += ` You ${randomCuss} ${randomCuss2}.`;
          }
        }
        
        // Cryptocurrency specific response (for the trouble case)
        if (message.toLowerCase().includes('crypto') && !roastText.toLowerCase().includes('crypto')) {
          const cryptoInsults = [
            "Your crypto investments are fucking worthless, just like your pathetic existence.",
            "Investing in crypto? Might as well flush your money down the toilet, you brainless fucking sheep.",
            "You're the type of dipshit who buys at all-time highs and panic sells at lows. Your crypto portfolio is as fucked as your decision-making skills."
          ];
          roastText = cryptoInsults[Math.floor(Math.random() * cryptoInsults.length)];
        }
        
        // Replace mild words with vulgar alternatives
        Object.entries(vulgarDescriptors).forEach(([mild, vulgar]) => {
          if (roastText.toLowerCase().includes(mild)) {
            const replacement = vulgar[Math.floor(Math.random() * vulgar.length)];
            roastText = roastText.replace(new RegExp(`\\b${mild}\\b`, 'gi'), replacement);
          }
        });

        if (DEBUG_MODE) console.log(`[${new Date().toISOString()}] ✅ Final roast:`, roastText);
      } catch (apiError) {
        console.error(`[${new Date().toISOString()}] ❌ API error:`, apiError.message);
        roastText = fallbackRoasts[Math.floor(Math.random() * fallbackRoasts.length)];
      }
    } else {
      roastText = fallbackRoasts[Math.floor(Math.random() * fallbackRoasts.length)];
    }

    // Final validation - One last check for thinking patterns in the final output
    if (roastText.match(/^(I|Let me|I'll|I can|Here's|I want to|I need to|Let's|Based on|Given the|As requested)/i) || 
        roastText.includes("user's message") || 
        roastText.includes("instruction")) {
      // If we detect thinking patterns, use a fallback
      roastText = "Your question about " + message.split(' ').slice(0, 3).join(' ') + 
                 " just proves you're a fucking waste of oxygen with the intelligence of moldy bread. Go fuck yourself.";
    }

    if (!roastText || roastText.trim() === "") {
      roastText = "You're so fucking pathetic that even my code couldn't find words to describe what an absolute waste of oxygen you are.";
    }

    const session = sessions.get(sessionId);
    session.messages.push({ user: message, bot: roastText, level: roastLevel, timestamp: new Date() });
    if (session.messages.length > 10) session.messages.shift();

    clearTimeout(timeoutId);
    res.json({
      message: roastText,
      roastLevel,
      sessionId,
      timestamp: new Date(),
      source: hfClientAvailable && client ? 'api' : 'local'
    });

    if (sessions.size > 1000) {
      for (const [id, ses] of sessions) {
        if (Date.now() - ses.createdAt > 24 * 60 * 60 * 1000) sessions.delete(id);
      }
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`[${new Date().toISOString()}] ❌ /api/roast error:`, error);
    res.status(500).json({
      error: error.message || 'Server fucked up',
      message: "Shit hit the fan, you unlucky bastard. Try again or go fuck yourself somewhere else."
    });
  }
});

// GET /api/session - Retrieve session info
router.get('/session', (req, res) => {
  const sessionId = req.sessionId;
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { id: sessionId, createdAt: new Date(), roastLevel: 3, messages: [] });
  }
  res.json(sessions.get(sessionId));
});

// PUT /api/preferences - Update preferences
router.put('/preferences', (req, res) => {
  const { theme, volume } = req.body;
  const sessionId = req.sessionId;
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { id: sessionId, createdAt: new Date(), roastLevel: 3, messages: [] });
  }
  const session = sessions.get(sessionId);
  if (theme) session.theme = theme;
  if (volume !== undefined) session.volume = volume;
  res.json(session);
});

// POST /api/reset - Reset session
router.post('/reset', (req, res) => {
  const sessionId = req.sessionId;
  sessions.delete(sessionId);
  sessions.set(sessionId, { id: sessionId, createdAt: new Date(), roastLevel: 3, messages: [] });
  res.json({ sessionId, message: 'Session reset, you needy fuck.' });
});

// GET /api/stats - API statistics
router.get('/stats', (req, res) => {
  if (process.env.NODE_ENV === 'production' && !DEBUG_MODE) {
    return res.status(403).json({ error: 'Stats are for devs, fuck off.' });
  }
  res.json({
    activeSessions: sessions.size,
    totalMessages: Array.from(sessions.values()).reduce((sum, s) => sum + s.messages.length, 0),
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
    apiAvailable: hfClientAvailable
  });
});

// GET /health - Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date(),
    huggingFaceToken: hfToken ? 'set' : 'missing',
    apiAvailable: hfClientAvailable,
    model: modelName,
    activeSessions: sessions.size,
    rateLimitStatus: rateLimits.get(req.sessionId) || { count: 0 }
  });
});

module.exports = router;