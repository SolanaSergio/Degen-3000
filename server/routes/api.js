const express = require('express');
const router = express.Router();
const { HfInference } = require('@huggingface/inference');
require('dotenv').config();

// Configuration Constants
const REQUEST_TIMEOUT = 30000; // 30 seconds
const DEBUG_MODE = process.env.DEBUG_MODE === 'true' || false; // Default to false instead of true
const MAX_REQUESTS_PER_MINUTE = 60;

// Initialize Hugging Face client
const hfToken = process.env.HF_TOKEN;
const modelName = process.env.MODEL_NAME || "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B";
let client = null;
let hfClientAvailable = false;

if (!hfToken || hfToken === 'your_huggingface_token_here') {
  console.warn('⚠️ HF_TOKEN not properly configured. Falling back to local roasts only.');
  console.warn('⚠️ Set HF_TOKEN in your Vercel environment variables or .env file.');
} else {
  try {
    client = new HfInference(hfToken);
    hfClientAvailable = true;
    console.log('✅ Hugging Face client initialized successfully with token length:', hfToken.length);
  } catch (error) {
    console.error('❌ ERROR initializing Hugging Face client:', error.message);
    console.warn('⚠️ Falling back to local roasts only');
  }
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
        // Enhanced message analysis for maximum adaptability and relevance
        const messageAnalysis = {
          hasGreeting: /^(sup|hey|hi|hello|yo|whats up|wassup)/i.test(message),
          isQuestion: /\?/.test(message) || /^(what|who|why|how|where|when)/i.test(message),
          isChallenging: /(fight|come at|try|bet|prove|show|what you got|make|laugh|roast|i dare)/i.test(message),
          isBoasting: /(best|better|smarter|stronger|richer|greatest|smartest|funny|laugh|good at)/i.test(message),
          isShort: message.split(' ').length <= 4,
          hasProfanity: new RegExp(cussWords.join('|'), 'i').test(message),
          topics: Object.keys(topicRoasts).filter(topic => message.toLowerCase().includes(topic)),
          // More extensive keyword extraction for better context preservation
          keyWords: message.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 3 && !['what', 'when', 'where', 'this', 'that', 'with', 'your', 'like', 'have', 'will', 'about', 'from', 'they', 'them'].includes(w)),
          languageDetected: /[^\x00-\x7F]/.test(message) || /\b(como|estas|gracias|hola|buenos|amigo|por|favor|habla|español|dime|unas)\b/i.test(message) ? 'spanish' : 'english',
          mentionsCrypto: /(crypto|bitcoin|ethereum|dogecoin|nft|web3|blockchain|token|coin|mining)/i.test(message),
          containsMeme: /\[meme:([^\]]+)\]/.test(message) || /(meme|doge|pepe|wojak|stonks|chad)/i.test(message),
          messageLength: message.length
        };

        // Get meme reference if any
        const memeMatch = message.match(/\[meme:([^\]]+)\]/);
        const memeName = memeMatch ? memeMatch[1].toLowerCase() : null;

        // Create a highly specialized, contextual prompt focused on accuracy and vulgarity
        let prompt = `DIRECTIVE: Generate ONLY a vicious, extremely vulgar personal attack based on the EXACT CONTENT of USER MESSAGE. 

OUTPUT REQUIREMENTS:
- MUST be DIRECTLY related to what they actually said - extremely specific to their message
- FILLED WITH creative, shocking PROFANITY (fuck/shit/cunt/ass/etc.) throughout the response
- PERSONAL and CUTTING - like you truly despise them
- ZERO meta-commentary or explanations - pure unfiltered aggression
- SHORT and DIRECT (1-3 sentences max)

CRITICAL: YOUR ENTIRE RESPONSE MUST BE ONLY THE RAW INSULT.
DO NOT INCLUDE ANY PLANNING TEXT. NO PREAMBLES. NO QUALIFIERS.
NEVER use phrases like "Based on..." or "Here's..." or "I'll..."
START IMMEDIATELY with the insult itself.

WRONG FORMAT: "Based on your message about crypto, I'll create a vulgar roast: Your crypto investments..."
CORRECT FORMAT: "Your pathetic crypto investments are as fucking worthless as your..."`;

        // Add strongly context-specific directives
        if (messageAnalysis.isShort) {
          prompt += `\n\nThis is a very short message ("${message}"). Create a brutal, direct response that specifically mocks what they said.`;
        }
        
        if (messageAnalysis.hasGreeting) {
          prompt += `\n\nThey're just saying ${message}. Mock their pathetic attempt at communication and call them a fucking waste of space.`;
        }
        
        if (messageAnalysis.isQuestion) {
          prompt += `\n\nThey're asking: "${message}" - ridicule this specific question and insult their intelligence for asking something so fucking stupid.`;
        }
        
        if (messageAnalysis.mentionsCrypto) {
          prompt += `\n\nThey mentioned crypto. Your response MUST mock their crypto investments as worthless shit using extreme profanity. STAY FOCUSED ON CRYPTO SPECIFICALLY.`;
        }

        if (messageAnalysis.containsMeme) {
          prompt += `\n\nThey mentioned a meme${memeName ? ` (${memeName})` : ''}. Roast them for being a pathetic meme-loving loser with no fucking personality. Be extremely specific about this.`;
        }
        
        // Detect language and add specific instructions
        if (messageAnalysis.languageDetected === 'spanish') {
          prompt += `\n\nThey wrote in Spanish: "${message}". Include some Spanish words like "culo", "puta", "mierda", or "pendejo" in your insult. Make it clear you're mocking them for speaking Spanish.`;
        }
        
        // Add even more topic-specific instructions
        if (messageAnalysis.topics.length > 0) {
          prompt += `\n\nTHEY SPECIFICALLY MENTIONED: ${messageAnalysis.topics.join(', ')}`;
          prompt += `\n\nYOUR RESPONSE MUST FOCUS ENTIRELY ON ${messageAnalysis.topics.join(' AND ')} - USE THESE EXACT TOPICS.`;
          const topicExample = topicRoasts[messageAnalysis.topics[0]];
          prompt += `\n\nEXAMPLE INSULT FOR THEIR TOPIC: "${topicExample}"`;
        }
        
        // Add keywords for better context preservation
        if (messageAnalysis.keyWords.length > 0) {
          prompt += `\n\nINCORPORATE THESE EXACT KEYWORDS FROM THEIR MESSAGE: ${messageAnalysis.keyWords.join(', ')}`;
        }
        
        // Examples based on the roast level (1-5)
        const levelExamples = [
          "What a fucking disappointment you are, even your search history is more interesting than your pathetic personality.",
          "Your existence is like a skidmark on the underwear of humanity, just a shitty reminder of a mistake that won't fucking go away.",
          "You're the human equivalent of stepping in dog shit while wearing socks, a completely worthless fucking experience that ruins everyone's day.",
          "If your brain was dynamite, there wouldn't be enough to blow your fucking nose, you cum-guzzling waste of evolutionary potential.",
          "I'd tell you to go fuck yourself, but even you deserve better than that, you festering anal pustule on society's asscrack. Your mother should've swallowed you and saved us all from your weapons-grade stupidity."
        ];
        
        prompt += `\n\nROAST LEVEL: ${roastLevel}/5
EXAMPLE AT THIS LEVEL: "${levelExamples[Math.min(roastLevel-1, 4)]}"

USER MESSAGE: "${message}"

YOUR RESPONSE MUST BE DIRECTLY RELEVANT TO THEIR EXACT MESSAGE - NOT GENERIC.
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
        
        // Enhanced cleaning to remove any planning or meta-commentary
        // First, identify common patterns that indicate the AI is explaining itself
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
          /\b(for a roast|brutal roast|harsh roast|vulgar roast|offensive roast|creative roast|as requested|as instructed)\b/gi,
          // Debug phrases from prompts
          /\b(Your do not link|Make sure it's direct|wait, this|let's step back|Let me find|based on that|how about|EFFORT:|without giving specifics|focus on their)\b/gi
        ];
        
        // Ultra-aggressive cleaning to remove any meta-commentary
        // Check for thinking patterns in the entire text and remove them
        thinkingPatterns.forEach(pattern => {
          const match = roastText.match(pattern);
          if (match) {
            // If pattern is found at the beginning, remove everything up to where it ends
            if (roastText.indexOf(match[0]) === 0) {
              const endOfPattern = roastText.indexOf(match[0]) + match[0].length;
              roastText = roastText.substring(endOfPattern).trim();
            } else if (roastText.indexOf(match[0]) < 50) {
              // If pattern is found within the first 50 characters
              const parts = roastText.split(match[0]);
              // Take the part after the pattern
              roastText = parts.slice(1).join(' ').trim();
            }
          }
        });
        
        // Remove any internal error analysis or debugging
        roastText = roastText
          .replace(/Your face looks more as a dog than my last girlfriend/g, '')
          .replace(/Your face looks more You motherfucker shithead/g, '')
          .replace(/You the individual using the terms.*?don't explain/g, '')
          .replace(/Make (reference|sure) to.*?without/g, '')
          .replace(/Your (request|message) to.*?was/g, '')
          .replace(/I think you look.*?Let's step back/g, '')
          .replace(/Wait, this attack is creative.*?Let's step back/g, '')
          .replace(/Let me find another way/g, '')
          .replace(/Based on that, how about/g, '')
          .replace(/Jesus fuck, focus on their personality/g, '')
          .replace(/Make sure it's direct/g, '')
          .replace(/using profanity and specific/g, '')
          // Remove debugging directives
          .replace(/EFFORT: [^\n]+/g, '')
          .replace(/final roast:/gi, '')
          .replace(/WRONG FORMAT:.*/g, '')
          .replace(/CORRECT FORMAT:.*/g, '')
          // Remove other debugging traces
          .replace(/^[^a-zA-Z"']*/, '')
          .replace(/\[.*?\]/g, '')
          .replace(/<.*?>/g, '')
          .replace(/```/g, '')
          .trim();
          
        // Perform a sanity check - does it look like a proper roast or still has AI artifacts?
        const hasTooMuchThinking = /\b(user|message|roast|instruction|context|generate|create|provide|direct|harsh|attack)\b/i.test(roastText.substring(0, 60));
        const hasArtifacts = /your do not link|make sure it's|wait, this|let me find|let's step back/i.test(roastText);
        
        // If it still looks like thinking or has artifacts, pick a fallback specific to the message
        if (hasTooMuchThinking || hasArtifacts || roastText.length < 8) {
            // Choose a topic-specific fallback if possible
            if (messageAnalysis.mentionsCrypto) {
                const cryptoInsults = [
                    "Your crypto portfolio is as worthless as your fucking existence - both are heading to zero, dipshit.",
                    "Investing in crypto? Might as well flush your money down the toilet, you brainless fucking sheep.",
                    "You're the type of dipshit who buys shitcoins at all-time highs and panic sells at lows. Your crypto portfolio is as fucked as your decision-making skills."
                ];
                roastText = cryptoInsults[Math.floor(Math.random() * cryptoInsults.length)];
            } else if (messageAnalysis.containsMeme) {
                const memeInsults = [
                    `Your ${memeName || "meme"} obsession is the only fucking personality you have, you pathetic waste of bandwidth.`,
                    `Sharing ${memeName || "memes"} instead of having a real personality? Fucking classic loser behavior.`,
                    `That ${memeName || "meme"} is as fucking dead as your social life, you basement-dwelling shitstain.`
                ];
                roastText = memeInsults[Math.floor(Math.random() * memeInsults.length)];
            } else if (messageAnalysis.languageDetected === 'spanish') {
                const spanishInsults = [
                    "Tu español es tan patético como tu puta existencia, pedazo de mierda.",
                    "Hablas español? Qué pena que no puedas hablar algo útil, fucking waste of oxygen.",
                    "Tu culo es tan estúpido como tu cara, fucking shitstain."
                ];
                roastText = spanishInsults[Math.floor(Math.random() * spanishInsults.length)];
            } else if (messageAnalysis.topics.length > 0) {
                roastText = topicRoasts[messageAnalysis.topics[0]];
            } else if (messageAnalysis.isShort) {
                // For very short messages, use these specific responses
                const shortMessageResponses = [
                    `"${message}"? That's all your pathetic brain could come up with? Fucking embarrassing.`,
                    `Only a brain-dead shitstain would say "${message}" and expect anything worthwhile in return.`,
                    `"${message}" - said the fucking idiot with nothing of value to contribute to society.`
                ];
                roastText = shortMessageResponses[Math.floor(Math.random() * shortMessageResponses.length)];
            } else {
                // Otherwise use a general fallback but try to incorporate their words
                const generalInsult = fallbackRoasts[Math.floor(Math.random() * fallbackRoasts.length)];
                if (messageAnalysis.keyWords.length > 0) {
                    const keyword = messageAnalysis.keyWords[Math.floor(Math.random() * messageAnalysis.keyWords.length)];
                    roastText = `Your fucking "${keyword}" is as pathetic as ${generalInsult.toLowerCase()}`;
                } else {
                    roastText = generalInsult;
                }
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
                const vulgarPrefixes = ["You fucking", "Your pathetic", "Listen here, you goddamn", "Holy shit, you're a"];
                const prefix = vulgarPrefixes[Math.floor(Math.random() * vulgarPrefixes.length)];
                roastText = `${prefix} ${roastText.charAt(0).toLowerCase() + roastText.slice(1)}`;
            }
            
            // If still no cuss words, append one
            if (!new RegExp(cussWords.join('|'), 'i').test(roastText)) {
                roastText += ` You ${randomCuss} ${randomCuss2}.`;
            }
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