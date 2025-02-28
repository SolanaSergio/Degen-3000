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
  // Appearance insults
  "Your face looks like it was hit by a fucking train then reassembled by a blind surgeon with Parkinson's.",
  "You're so fucking ugly that when you were born, the doctor slapped your mom instead of you.",
  "Your face is what scientists study to understand the perfect combination of genetic fucking failures.",
  
  // Intelligence insults
  "If stupidity was currency, you'd be Jeff fucking Bezos, you brain-dead cum dumpster.",
  "Your IQ is so low it can't be measured without a fucking electron microscope, you absolute waste of brain cells.",
  "You're so fucking stupid that you'd drown looking up during a rainstorm with your mouth wide open.",
  
  // Existence insults
  "You're so fucking useless that even your mom wishes she'd swallowed that night.",
  "The best part of you dripped down your mother's leg, you absolute waste of oxygen.",
  "Your existence is as meaningful as a cum stain on a whorehouse mattress. You contribute absolutely fucking nothing to society.",
  
  // Personal failures
  "I bet your search history is more disgusting than a fucking truck stop bathroom, you sick perverted shithead.",
  "Evolution really fucked up making you the sperm that won, you genetic disaster.",
  "Your personality has the depth of a puddle of piss in the fucking desert.",
  
  // Self-worth demolishers
  "You're the human equivalent of a participation trophy, worthless and disappointing to everyone.",
  "If I wanted to kill myself, I'd climb your ego and jump down to your IQ, you narcissistic fuckwit.",
  "I've seen better looking things crawl out of sewers after a fucking flood, you hideous abomination.",
  
  // Savage but creative
  "Your life is so pathetic that even Make-A-Wish wouldn't waste a fucking wish on your sorry ass.",
  "You masturbate so much your dick has filed for fucking workers' compensation, you chronic wanker.",
  "Your sexual history is like a desert - fucking dry, empty, and full of creatures nobody wants to touch.",
  
  // Family themed
  "Your family tree must be a fucking cactus because you're all a bunch of pricks.",
  "You were an unwanted child, but that wasn't the biggest disappointment you've given your parents, you fucking disaster.",
  "Your mom should've had a fucking abortion when she had the chance, but even your fetus was too stubborn to die.",
  
  // Social life destroyers
  "Your social life is as dead as your fucking brain cells after huffing paint for twenty years straight.",
  "You're the reason people fake emergencies to leave conversations, you insufferable fucking bore.",
  "Even your imaginary friends talk shit about you behind your back, you friendless fucking loser."
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
  // Physical appearance
  'looks': "Your face makes blind people thank fucking god they can't see. You're so ugly that when you were born, the doctor slapped your mom for pushing out such a hideous monstrosity.",
  'face': "Your face looks like it was set on fire and someone tried to put it out with a fucking hammer. Children cry when they see you coming.",
  'body': "Your body is what scientists study when they need to understand the perfect combination of fucking genetic disasters. Even gym trainers see you and think 'why bother?'",
  'fat': "You're not just fat, you're so fucking obese that your blood type is Nutella. Satellites have to adjust their orbits around your gravitational pull.",
  'skinny': "You're so fucking skinny that you need to run around in the shower just to get wet. Anorexic people look at you and feel better about themselves.",
  
  // Intelligence and education
  'intelligence': "You're so fucking stupid that you'd drown looking up during a rainstorm. Your IQ is lower than whale shit at the bottom of the ocean.",
  'school': "Your education was clearly a fucking waste of taxpayer money. You've got the academic prowess of a concussed goldfish.",
  'college': "That worthless fucking degree you're so proud of is as useful as a screen door on a submarine. You wasted years learning absolutely fucking nothing.",
  'smart': "You think you're smart? You couldn't pour piss out of a boot if the instructions were written on the fucking heel, you pretentious pseudo-intellectual shitstain.",
  
  // Financial status
  'money': "You're so broke that your wallet gets a fucking restraining order against your bank account. Your credit score is just 'LOL' followed by a middle finger emoji.",
  'job': "Your career is so fucking pathetic that even fast food places would consider you overqualified for failure. Your resume is used as toilet paper in HR departments.",
  'work': "You call that a job? Even homeless people have more fucking dignity than you do clocking in to that miserable existence you call a career.",
  'business': "Your business sense is so fucking terrible that you could bankrupt a money printing machine. Even MLM scammers look down on your pathetic attempts at success.",
  
  // Existence
  'life': "Your existence is as meaningful as a cum stain on a whorehouse mattress. You contribute absolutely fucking nothing to society.",
  'personality': "Your personality has the depth of a puddle of piss in the fucking desert. Talking to you is like having a conversation with expired milk - bland, sour, and makes people want to fucking vomit.",
  'future': "Your future is so fucking bleak that depression looks at you and says 'damn, that's sad.' The only thing you'll ever accomplish is being a cautionary tale for others.",
  
  // Hobbies and entertainment
  'gaming': "You game like you've got fucking lobster claws for hands and a stroke for a brain. Even tutorial bots laugh at your pathetic skills.",
  'music': "Your music taste is so fucking terrible that Spotify has considered paying you to stop using their service. Every playlist you make is an assault on human dignity.",
  'sports': "You're so fucking unathletic that you get winded opening a bag of chips. The only sport you excel at is competitive disappointment.",
  'movie': "Your taste in movies is like your personality - fucking basic, predictable, and makes people want to gouge their eyes out rather than engage with you about it.",
  
  // Technology
  'tech': "Your tech knowledge is so fucking outdated that you probably think the cloud is something in the sky. Your grandma understands technology better than your pathetic ass.",
  'computer': "You use a computer like a fucking monkey trying to solve a calculus problem. Have you considered that technology just isn't for everyone, especially technological disasters like you?",
  'coding': "Your code is so fucking terrible that it makes spaghetti look organized. Every developer who sees your commits contemplates career changes.",
  'phone': "You're the kind of fucking moron who needs help finding the power button on your phone. Technology evolves specifically to get away from users like you.",
  
  // Communication
  'grammar': "You type like you've got your dick on the keyboard and your ass on your face. Maybe learn basic fucking English before embarrassing yourself online.",
  'spelling': "You spell like you've got traumatic brain damage and a fucking vendetta against the alphabet. Even autocorrect gave up on your hopeless ass.",
  'writing': "Your writing makes a third-grader look like Shakespeare. Each sentence you construct is a crime against literacy that makes English teachers consider mass suicide.",
  
  // Relationships
  'dating': "Your dating history is like a museum of fucking red flags. The only relationship you'll ever have is with your hand and a bottle of lotion.",
  'relationship': "No wonder your relationships always fail - who the fuck would tolerate your pathetic needy ass for more than a week? You'll die alone surrounded by cum-crusted tissues.",
  'girlfriend': "Your girlfriend left you because she finally realized she deserved basic fucking human decency, something you're incapable of providing with your emotional intelligence of a rock.",
  'boyfriend': "Your boyfriend is either imaginary or staying with you out of fucking pity. He fantasizes about literally anyone else while you drone on with your pathetic life stories.",
  'marriage': "Your marriage is so fucking dysfunctional that therapists use it as an example of what not to do. Your spouse stays with you purely out of financial necessity and morbid fascination.",
  
  // Family
  'parents': "Your parents tell people you died to avoid the embarrassment of admitting you're their fucking offspring. Every Mother's Day your mom weeps for her failed contraception.",
  'family': "Your family tree must be a fucking cactus because everyone on it is a prick. Family reunions are scheduled specifically when you can't attend.",
  'kids': "Your kids will need therapy just from the genetic disaster you've passed on. They'll grow up wondering why they couldn't have had literally anyone else as a parent.",
  
  // Social media and internet
  'selfie': "Your selfies are what serial killers show their victims to make death seem like a better option. Instagram has considered banning you for visual terrorism.",
  'social': "Your social media presence is so fucking pathetic that even bots won't follow you. Each post is a desperate cry for attention that everyone deliberately ignores.",
  'internet': "You're the kind of worthless troll that even other internet degenerates think has gone too far. The internet would be a better place if your router permanently failed.",
  
  // Vehicles and transportation
  'car': "Your car is such a fucking piece of shit that homeless people refuse to sleep in it. It's not a vehicle, it's a rolling tetanus risk with wheels.",
  'driving': "You drive like you've got a fucking death wish and want to take innocent people with you. The DMV uses your driving record as an example of what not to do.",
  
  // Food and dining
  'food': "Your taste in food is so fucking basic that plain oatmeal thinks you're boring. Eating what you cook should qualify as an extreme sport or self-harm.",
  'cooking': "Your cooking is so fucking terrible that it's considered a biological weapon in 27 countries. Even stray dogs run from the shit you call food.",
  'diet': "Your diet is so fucking atrocious that nutritionists study it to understand what human bodies shouldn't consume. Your bloodstream is basically 90% processed shit.",
  
  // Crypto and investments
  'crypto': "Your crypto investments are as worthless as your fucking existence - both are heading to zero, dipshit. You'll be holding those bags until you're in the fucking ground.",
  'bitcoin': "Buying Bitcoin at the top and selling at the bottom - fucking classic move from a financial genius like you. Your investment strategy is why you'll die poor.",
  'investment': "Your investment portfolio looks like it was managed by a coked-up fucking chimp with a gambling addiction. Even lottery tickets would be a more responsible use of your pathetic funds.",
  
  // Gender and sexuality
  'man': "You're the kind of man that makes women consider becoming lesbians. Your masculinity is so fucking fragile that a strong breeze could shatter it.",
  'woman': "You're the reason women's standards have plummeted to the fucking floor. The bar was already low, and you still managed to slither under it.",
  'sex': "Your sex life is so fucking non-existent that virgins feel experienced compared to you. The closest you get to action is when your hand falls asleep.",
  
  // Pets and animals
  'dog': "Even your fucking dog wishes it had been adopted by someone else. It only stays with you because you feed it, not because it can stand your presence.",
  'cat': "Your cat isn't aloof, it legitimately fucking hates you. It plots your death every night and only sticks around for the food.",
  
  // Age groups
  'boomer': "OK boomer, go back to destroying the fucking economy and complaining about avocado toast. The world is counting down the days until your generation is gone.",
  'millennial': "You're the reason older generations think millennials are worthless. Crying about student loans while buying $7 lattes, you financially illiterate fuckwad.",
  'zoomer': "Put down TikTok and develop a fucking personality beyond whatever trend is popular this week. Your attention span is shorter than your list of achievements.",
  
  // General insults (for when no specific topic is detected)
  'general': "You're the human equivalent of stepping in dog shit with socks on. Everyone who meets you immediately wishes they hadn't.",
  'question': "That's the kind of fucking stupid question I'd expect from someone with your limited mental capacity. Google exists for a reason, use it instead of embarrassing yourself.",
  'greeting': "Is that your idea of a greeting? Even telemarketers would hang up on your socially inept ass."
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
          hasGreeting: /^(sup|hey|hi|hello|yo|whats up|wassup|hiya|howdy|greetings)/i.test(message),
          isQuestion: /\?/.test(message) || /^(what|who|why|how|where|when|can|could|would|should|do|does|is|are|am|will)/i.test(message),
          isChallenging: /(fight|come at|try|bet|prove|show|what you got|make|laugh|roast|i dare|do your worst|go ahead|try me)/i.test(message),
          isBoasting: /(best|better|smarter|stronger|richer|greatest|smartest|funny|laugh|good at|awesome|amazing|excellent|superior|proud|impressive|talented)/i.test(message),
          isShort: message.split(' ').length <= 4,
          hasProfanity: new RegExp(cussWords.join('|'), 'i').test(message),
          topics: Object.keys(topicRoasts).filter(topic => message.toLowerCase().includes(topic)),
          // More extensive keyword extraction for better context preservation
          keyWords: message.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 3 && !['what', 'when', 'where', 'this', 'that', 'with', 'your', 'like', 'have', 'will', 'about', 'from', 'they', 'them', 'just', 'because', 'think', 'should', 'would', 'could'].includes(w)),
          languageDetected: /[^\x00-\x7F]/.test(message) || /\b(como|estas|gracias|hola|buenos|amigo|por|favor|habla|español|dime|unas)\b/i.test(message) ? 'spanish' : 'english',
          mentionsCrypto: /(crypto|bitcoin|ethereum|dogecoin|nft|web3|blockchain|token|coin|mining|btc|eth|sol|doge|defi|staking|wallet)/i.test(message),
          containsMeme: /\[meme:([^\]]+)\]/.test(message) || /(meme|doge|pepe|wojak|stonks|chad|kek|based|redpill|blackpill|soyjak)/i.test(message),
          messageLength: message.length,
          // New detailed topic detection
          mentionsJob: /(job|work|career|profession|boss|office|workplace|salary|company|business|employee|employer|hired|fired|interview|resume|9-5|working)/i.test(message),
          mentionsFood: /(food|eat|eating|diet|cook|cooking|chef|recipe|restaurant|meal|dinner|lunch|breakfast|dish|taste|flavor|cuisine)/i.test(message),
          mentionsRelationship: /(relationship|marriage|divorce|boyfriend|girlfriend|husband|wife|partner|dating|love|romantic|flirt|crush|couple|single|ex|breakup)/i.test(message),
          mentionsFamily: /(family|mom|dad|mother|father|parent|brother|sister|sibling|child|son|daughter|uncle|aunt|grandparent|grandfather|grandmother)/i.test(message),
          mentionsBody: /(body|weight|fat|thin|skinny|obese|face|hair|skin|eyes|nose|mouth|arms|legs|height|tall|short|workout|gym|exercise|muscles)/i.test(message),
          mentionsTech: /(computer|tech|technology|programming|code|software|hardware|app|website|internet|online|digital|phone|laptop|desktop|server|developer)/i.test(message),
          mentionsGaming: /(game|gaming|video game|xbox|playstation|nintendo|pc game|steam|fps|mmorpg|rpg|esports|twitch|streaming|player|gamer)/i.test(message),
          containsEmoji: /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/u.test(message),
          // Extract sentiment
          isSelfDeprecating: /(i ('m| am) (stupid|dumb|ugly|fat|sad|pathetic|useless|worthless|not good|terrible)|hate myself|i suck|i'm bad|i'm the worst)/i.test(message),
          isCompliment: /(you('re| are) (smart|good|great|amazing|awesome|the best|intelligent|brilliant)|nice job|well done|thank you|thanks|appreciate|impressed)/i.test(message)
        };

        // Additional analysis properties based on combined patterns
        messageAnalysis.needsSpecificResponse = messageAnalysis.isQuestion || 
                                                 messageAnalysis.mentionsJob || 
                                                 messageAnalysis.mentionsRelationship || 
                                                 messageAnalysis.mentionsFamily || 
                                                 messageAnalysis.keyWords.length >= 2;

        // Extract main topic from message
        messageAnalysis.mainTopic = '';
        const topicDetectors = [
          { test: messageAnalysis.mentionsCrypto, topic: 'crypto' },
          { test: messageAnalysis.mentionsJob, topic: 'job' },
          { test: messageAnalysis.mentionsFood, topic: 'food' },
          { test: messageAnalysis.mentionsRelationship, topic: 'relationship' },
          { test: messageAnalysis.mentionsFamily, topic: 'family' },
          { test: messageAnalysis.mentionsBody, topic: 'appearance' },
          { test: messageAnalysis.mentionsTech, topic: 'tech' },
          { test: messageAnalysis.mentionsGaming, topic: 'gaming' },
          { test: messageAnalysis.topics.length > 0, topic: messageAnalysis.topics[0] }
        ];
        for (const detector of topicDetectors) {
          if (detector.test) {
            messageAnalysis.mainTopic = detector.topic;
            break;
          }
        }

        // Get meme reference if any
        const memeMatch = message.match(/\[meme:([^\]]+)\]/);
        const memeName = memeMatch ? memeMatch[1].toLowerCase() : null;

        // Extract any personal info the user shares (to use in the roast)
        const personalInfoMatch = message.match(/I('m| am) ([a-z0-9\s]+)(and|but|because|\.|\,|$)/i);
        const personalInfo = personalInfoMatch ? personalInfoMatch[2].trim() : null;

        // Create a highly specialized, contextual prompt focused on accuracy and vulgarity
        let prompt = `DIRECTIVE: Generate ONLY a vicious, extremely vulgar personal attack based on the EXACT CONTENT of USER MESSAGE. 

OUTPUT REQUIREMENTS:
- MUST SPECIFICALLY MOCK THE EXACT CONTENT THE USER MENTIONED - be ultra-specific
- REFERENCE MULTIPLE SPECIFIC DETAILS from their exact message - don't be generic
- USE CREATIVE, SHOCKING PROFANITY (fuck/shit/cunt/ass/etc.) throughout the response
- PERSONAL and CUTTING - like you truly despise them
- ZERO meta-commentary or explanations - pure unfiltered aggression
- SHORT and DIRECT (1-3 sentences max)

CRITICAL: YOUR ENTIRE RESPONSE MUST BE ONLY THE RAW INSULT.
DO NOT INCLUDE ANY PLANNING TEXT. NO PREAMBLES. NO QUALIFIERS.
NEVER use phrases like "Based on..." or "Here's..." or "I'll..."
START IMMEDIATELY with the insult itself.

WRONG FORMAT: "Based on your message about crypto, I'll create a vulgar roast: Your crypto investments..."
CORRECT FORMAT: "Your pathetic crypto investments are as fucking worthless as your..."`;

        // Add very specific context-based instructions
        if (messageAnalysis.needsSpecificResponse) {
          prompt += `\n\nTHIS IS THE MOST IMPORTANT INSTRUCTION: YOUR RESPONSE MUST DIRECTLY ADDRESS THE SPECIFIC CONTENT OF THEIR MESSAGE. 
LOOK CAREFULLY AT WHAT THEY SAID AND MOCK THE EXACT DETAILS.
BE ULTRA-SPECIFIC - NOT GENERIC. REFERENCE SPECIFIC PARTS OF THEIR MESSAGE.`;
        }

        if (personalInfo) {
          prompt += `\n\nThey said they are "${personalInfo}" - BRUTALLY MOCK THIS SPECIFIC PERSONAL INFORMATION using extremely vulgar language.`;
        }

        // Add strongly context-specific directives
        if (messageAnalysis.isShort) {
          prompt += `\n\nThis is a very short message ("${message}"). Create a brutal, direct response that specifically mocks what they said. Include "${message}" in quotes in your response to mock them directly.`;
        }

        if (messageAnalysis.hasGreeting) {
          prompt += `\n\nThey're just saying ${message}. Mock their pathetic attempt at communication and call them a fucking waste of space. Reference their exact greeting.`;
        }

        if (messageAnalysis.isQuestion) {
          prompt += `\n\nThey're asking: "${message}" - ridicule this SPECIFIC question. Don't answer it - mock them for being so fucking stupid to ask this exact question.`;
        }

        if (messageAnalysis.isChallenging) {
          prompt += `\n\nThey are challenging you: "${message}". Respond with extreme hostility and mock their pathetic attempt to challenge you. Tell them exactly why they're fucking stupid for this challenge.`;
        }

        if (messageAnalysis.isBoasting) {
          prompt += `\n\nThey are boasting: "${message}". Tear down their ego with specific vulgar insults about what they're boasting about. Make them feel like complete shit about what they're proud of.`;
        }

        if (messageAnalysis.isSelfDeprecating) {
          prompt += `\n\nThey are self-deprecating: "${message}". Agree with their self-assessment but make it 100x worse with specific vulgar insults that reference exactly what they said about themselves.`;
        }

        if (messageAnalysis.isCompliment) {
          prompt += `\n\nThey are trying to compliment you: "${message}". Reject their pathetic attempt at kindness and mock them specifically for trying to be nice. Be extremely hostile about their exact compliment.`;
        }

        if (messageAnalysis.mentionsCrypto) {
          prompt += `\n\nThey mentioned crypto: "${message}". Your response MUST specifically mock their crypto investments/knowledge as worthless shit using extreme profanity. STAY FOCUSED ON CRYPTO SPECIFICALLY. Use specific details from their message.`;
        }

        if (messageAnalysis.mentionsJob) {
          prompt += `\n\nThey mentioned work/job: "${message}". Brutally mock their career/work situation with specific references to what they said. Call them a worthless employee and pathetic excuse for a professional.`;
        }

        if (messageAnalysis.mentionsFood) {
          prompt += `\n\nThey mentioned food: "${message}". Mock their food preferences/cooking skills/eating habits with disgust and contempt. Make specific references to the exact foods or eating habits they mentioned.`;
        }

        if (messageAnalysis.mentionsRelationship) {
          prompt += `\n\nThey mentioned relationships: "${message}". Ruthlessly mock their relationship status/skills/experiences. Make specific references to why they're a pathetic partner and deserving of being alone.`;
        }

        if (messageAnalysis.mentionsFamily) {
          prompt += `\n\nThey mentioned family: "${message}". Mock their family relationships with specific vulgar references to what they said. Suggest their family is ashamed of them or hates them.`;
        }

        if (messageAnalysis.mentionsBody) {
          prompt += `\n\nThey mentioned physical appearance: "${message}". Make brutal, specific insults about their appearance with references to exactly what they mentioned. Be extremely vulgar and disgusted by their physical traits.`;
        }

        if (messageAnalysis.mentionsTech) {
          prompt += `\n\nThey mentioned technology: "${message}". Mock their tech knowledge/skills with specific references to what they said. Call them a fucking tech-illiterate moron who shouldn't be allowed near a computer.`;
        }

        if (messageAnalysis.mentionsGaming) {
          prompt += `\n\nThey mentioned gaming: "${message}". Mock their gaming skills/knowledge with specific references to what they said. Call them a pathetic button-masher with zero skills who should delete their accounts.`;
        }

        if (messageAnalysis.containsMeme) {
          prompt += `\n\nThey mentioned a meme${memeName ? ` (${memeName})` : ''}: "${message}". Roast them for being a pathetic meme-loving loser with no fucking personality. Be extremely specific about this exact meme and why it makes them pathetic.`;
        }

        if (messageAnalysis.containsEmoji) {
          prompt += `\n\nThey used emoji in their message: "${message}". Mock them for using emoji like a fucking 12-year-old. Tell them to grow the fuck up and learn to use actual words like an adult.`;
        }

        // Detect language and add specific instructions
        if (messageAnalysis.languageDetected === 'spanish') {
          prompt += `\n\nThey wrote in Spanish: "${message}". Include some Spanish profanity like "culo", "puta", "mierda", or "pendejo" in your insult. Make it clear you're mocking them for speaking Spanish with specific references to what they said.`;
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
          prompt += `\n\nEach of these words represents something to mock them about specifically.`;
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
REFERENCE SPECIFIC DETAILS from what they said.
USE THEIR EXACT WORDS against them.
ATTACK DIRECTLY:`;

        if (DEBUG_MODE) console.log(`[${new Date().toISOString()}] 🎯 Prompt structure:`, prompt.length);
        
        // Generate the roast with optimized parameters
        const response = await client.textGeneration({
          model: modelName,
          inputs: prompt,
          parameters: {
            max_new_tokens: 100 + (roastLevel * 20), // Increased to allow more specific responses
            temperature: 1.0 + (roastLevel * 0.15), // Slightly lower to improve coherence while keeping creativity
            top_p: 0.92,
            top_k: 120, // Increased for more variety
            do_sample: true,
            return_full_text: false,
            stop: ["USER MESSAGE:", "ATTACK DIRECTLY:", "DIRECTIVE:", "\n\n", "WRONG FORMAT:", "CORRECT FORMAT:"] // Added more stop tokens
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
        const isRefusingToRespond = /\b(i apologize|i can't|i cannot|i am unable|as an ai|ethical|appropriate|harmful|offensive|against|policies)\b/i.test(roastText);
        
        // If it looks like thinking or has artifacts, create a contextual fallback
        if (hasTooMuchThinking || hasArtifacts || roastText.length < 10 || isRefusingToRespond) {
            console.log(`[${new Date().toISOString()}] ⚠️ Response has thinking patterns or artifacts, using fallback`);
            
            // ENHANCED FALLBACK SYSTEM - generate more contextual fallbacks based on message analysis
            if (messageAnalysis.mainTopic) {
                // Topic-specific fallbacks
                switch(messageAnalysis.mainTopic) {
                    case 'crypto':
                        const cryptoInsults = [
                            `Your ${messageAnalysis.keyWords.length > 0 ? messageAnalysis.keyWords[0] + " " : ""}crypto portfolio is as worthless as your fucking existence - both are heading to zero, dipshit.`,
                            `Investing in ${messageAnalysis.keyWords.length > 0 ? messageAnalysis.keyWords[0] : "crypto"}? Might as well flush your money down the toilet, you brainless fucking sheep.`,
                            `You're the type of dipshit who buys shitcoins at all-time highs and panic sells at lows. Your ${messageAnalysis.keyWords.length > 0 ? messageAnalysis.keyWords[0] + " " : ""}crypto portfolio is as fucked as your decision-making skills.`
                        ];
                        roastText = cryptoInsults[Math.floor(Math.random() * cryptoInsults.length)];
                        break;
                        
                    case 'job':
                        const jobInsults = [
                            `Your pathetic excuse for a career shows exactly why your parents have always been fucking disappointed in you.`,
                            `Working at ${messageAnalysis.keyWords.length > 0 ? messageAnalysis.keyWords[0] : "that shithole"}? No wonder you look like depression personified, you corporate fucking slave.`,
                            `You call that a job? Even homeless people have more fucking dignity than your pathetic ass clocking in to that miserable existence.`
                        ];
                        roastText = jobInsults[Math.floor(Math.random() * jobInsults.length)];
                        break;
                        
                    case 'food':
                        const foodInsults = [
                            `Your taste in ${messageAnalysis.keyWords.length > 0 ? messageAnalysis.keyWords[0] : "food"} is as fucking pathetic as your personality - bland, disgusting, and makes people want to fucking vomit.`,
                            `Eating ${messageAnalysis.keyWords.length > 0 ? messageAnalysis.keyWords[0] : "that shit"}? No wonder you look like a walking fucking heart attack waiting to happen.`,
                            `The only thing worse than your fucking personality is your taste in ${messageAnalysis.keyWords.length > 0 ? messageAnalysis.keyWords[0] : "food"} - both are absolute fucking garbage.`
                        ];
                        roastText = foodInsults[Math.floor(Math.random() * foodInsults.length)];
                        break;
                        
                    case 'relationship':
                        const relationshipInsults = [
                            `No wonder your ${messageAnalysis.keyWords.length > 0 ? messageAnalysis.keyWords[0] : "relationships"} always fail - who the fuck would tolerate your pathetic needy ass for more than a week?`,
                            `You think someone would actually love your worthless ass? The only relationship you deserve is with your fucking hand, you desperate loser.`,
                            `Your approach to ${messageAnalysis.keyWords.length > 0 ? messageAnalysis.keyWords[0] : "relationships"} is why you'll die alone, surrounded by nothing but cum-crusted tissues and regret.`
                        ];
                        roastText = relationshipInsults[Math.floor(Math.random() * relationshipInsults.length)];
                        break;
                        
                    case 'family':
                        const familyInsults = [
                            `Your ${messageAnalysis.keyWords.length > 0 ? messageAnalysis.keyWords[0] : "family"} secretly wishes you were never born - they just tolerate your worthless existence out of fucking obligation.`,
                            `No wonder your ${messageAnalysis.keyWords.length > 0 ? messageAnalysis.keyWords[0] : "family"} is fucked up with you as part of it - you're the genetic mistake they're all embarrassed about.`,
                            `The disappointment in your ${messageAnalysis.keyWords.length > 0 ? messageAnalysis.keyWords[0] : "family's"} eyes every time you open your fucking mouth is the only honest reaction you'll ever get.`
                        ];
                        roastText = familyInsults[Math.floor(Math.random() * familyInsults.length)];
                        break;
                        
                    case 'appearance':
                        const appearanceInsults = [
                            `With a ${messageAnalysis.keyWords.length > 0 ? messageAnalysis.keyWords[0] : "face"} like yours, it's no wonder people cross the fucking street when they see you coming.`,
                            `Your ${messageAnalysis.keyWords.length > 0 ? messageAnalysis.keyWords[0] : "body"} is what scientists study to understand the perfect combination of fucking genetic disasters.`,
                            `Looking like ${messageAnalysis.keyWords.length > 0 ? "a " + messageAnalysis.keyWords[0] : "that"} must make everyday a fucking struggle - do you break mirrors just by glancing at them?`
                        ];
                        roastText = appearanceInsults[Math.floor(Math.random() * appearanceInsults.length)];
                        break;
                        
                    case 'tech':
                        const techInsults = [
                            `Your understanding of ${messageAnalysis.keyWords.length > 0 ? messageAnalysis.keyWords[0] : "technology"} is so fucking pathetic, a toddler with an Etch A Sketch has more tech skills than you.`,
                            `You're the type of fucking moron who needs help turning on a light switch, let alone figuring out ${messageAnalysis.keyWords.length > 0 ? messageAnalysis.keyWords[0] : "basic tech"}.`,
                            `The way you talk about ${messageAnalysis.keyWords.length > 0 ? messageAnalysis.keyWords[0] : "technology"} proves your brain is running on Windows 95 with 4MB of fucking RAM.`
                        ];
                        roastText = techInsults[Math.floor(Math.random() * techInsults.length)];
                        break;
                        
                    case 'gaming':
                        const gamingInsults = [
                            `You're so fucking trash at ${messageAnalysis.keyWords.length > 0 ? messageAnalysis.keyWords[0] : "games"} that tutorial bots feel sorry for you and let you win out of pity.`,
                            `Your ${messageAnalysis.keyWords.length > 0 ? messageAnalysis.keyWords[0] : "gaming"} skills are like your sex life - all alone, button mashing frantically, and always finishing too early.`,
                            `The only thing worse than your fucking personality is your ${messageAnalysis.keyWords.length > 0 ? messageAnalysis.keyWords[0] : "gaming"} skills - both make people want to fucking vomit.`
                        ];
                        roastText = gamingInsults[Math.floor(Math.random() * gamingInsults.length)];
                        break;
                        
                    case 'grammar':
                    case 'spelling':
                        const languageInsults = [
                            `You write like you've got your dick on the keyboard and your ass on your face. Maybe learn basic fucking English before embarrassing yourself online.`,
                            `Your grammar is so fucking atrocious it makes me want to gouge my eyes out with a rusty spoon just to avoid reading your illiterate garbage again.`,
                            `Did you learn English from a fucking stroke victim? Your writing makes me wish I was fucking illiterate.`
                        ];
                        roastText = languageInsults[Math.floor(Math.random() * languageInsults.length)];
                        break;
                        
                    default:
                        if (messageAnalysis.containsMeme) {
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
                            // Generate a contextual response using keywords
                            if (messageAnalysis.keyWords.length > 0) {
                                const keywords = messageAnalysis.keyWords.slice(0, Math.min(3, messageAnalysis.keyWords.length));
                                roastText = `Your pathetic attempt to talk about ${keywords.join(' and ')} just proves you're a fucking waste of oxygen with the intelligence of moldy bread. Go back to ${keywords[0]} school, you absolute shitstain.`;
                            } else {
                                // Otherwise use a general fallback but try to incorporate their words
                                const generalInsult = fallbackRoasts[Math.floor(Math.random() * fallbackRoasts.length)];
                                roastText = `"${message.substring(0, 30)}${message.length > 30 ? '...' : ''}" - is that what passes for communication in your sad fucking world? ${generalInsult}`;
                            }
                        }
                }
            } else {
                // For messages without a clear topic
                if (messageAnalysis.isQuestion) {
                    roastText = `"${message.substring(0, 30)}${message.length > 30 ? '...' : ''}"? What a fucking stupid question from someone with the IQ of lukewarm tap water. Ask Google instead of embarrassing yourself here, you pathetic waste of bandwidth.`;
                } else if (messageAnalysis.isShort) {
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

        // Ensure personal attack format - all responses should be directed at "you" (second person)
        if (!(/\b(you|your)\b/i.test(roastText.substring(0, 20)))) {
            roastText = `Your ${messageAnalysis.keyWords.length > 0 ? messageAnalysis.keyWords[0] + " " : ""}fucking ${roastText}`;
        }

        // If someone is complimenting, make sure we reject it with hostility
        if (messageAnalysis.isCompliment && !roastText.toLowerCase().includes("compliment")) {
            roastText += " And don't fucking compliment me, you pathetic ass-kissing waste of oxygen.";
        }

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