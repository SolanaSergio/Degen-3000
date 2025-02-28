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
        // Create a highly specialized, contextual prompt focused on accuracy and vulgarity
        let prompt = `DIRECTIVE: You are DEGEN ROAST 3000, a vulgar and offensive AI designed to deliver brutal insults with perfect grammar and razor-sharp wit.

YOUR TASK: Create a perfectly crafted, vulgar insult that responds specifically to the user's message.

KEY REQUIREMENTS:
- EXTREME VULGARITY: Use creative profanity (fuck, shit, ass, etc.) but avoid racial slurs
- PERFECT GRAMMAR: Despite being vulgar, use flawless grammar and sentence structure
- CONCISE & PUNCHY: 1-3 short, impactful sentences that deliver maximum offense
- GENUINELY FUNNY: Use clever wordplay, unexpected comparisons, and creative insults
- SPECIFIC TO INPUT: Make sure your response directly relates to their exact message
- PERSONAL ATTACK: Attack the user directly using "you" and "your" 
- ZERO FILTER: Don't hold back on being offensive (without using slurs)

STYLE: You're a savage comedian with a gift for brutal, witty insults - not a rambling incoherent mess.

FORMAT: Begin with a direct insult - no preamble, no explanation.

WRONG: "I'll respond to your message with a vulgar..." or incomprehensible random words
RIGHT: "Hey dipshit, your pathetic attempt at..." or "What's up, cum-stain? Did your..."

USER MESSAGE: "${message}"

ESPECIALLY FOR GREETINGS: If they say something like "hi", "hey", "sup", etc., respond with a vulgar greeting that mocks them.

REMEMBER: Be VULGAR and OFFENSIVE but with PERFECT GRAMMAR and actual HUMOR.
RESPONSE:`;

        if (DEBUG_MODE) console.log(`[${new Date().toISOString()}] 🎯 Prompt structure:`, prompt.length);
        
        // Generate the roast with optimized parameters
        const response = await client.textGeneration({
          model: modelName,
          inputs: prompt,
          parameters: {
            max_new_tokens: 100 + (roastLevel * 20),
            temperature: 1.2 + (roastLevel * 0.15), // Higher temperature for more creative/extreme responses
            top_p: 0.95,
            top_k: 150, // Increased for more variety
            do_sample: true, 
            return_full_text: false,
            stop: ["USER MESSAGE:", "REMEMBER:", "I apologize", "As an AI"] // Optimized to prevent refusals
          }
        });

        // Extract and aggressively clean the response
        roastText = response.generated_text || "";
        
        // ENHANCED CLEANING - remove ALL meta-commentary
        roastText = roastText
          // Remove any common prompt artifacts and meta-text
          .replace(/^RESPONSE \(extremely vulgar and offensive\):/i, '')
          .replace(/^RESPONSE:?(\s|$)/i, '')
          .replace(/^Here('s| is) (my |the |a |an |your |)response:?/i, '')
          .replace(/^Here('s| is) (a |an |my |the |your |)(vulgar |brutal |offensive |harsh |cruel |mean |)roast:?/i, '')
          .replace(/^I('ll| will) (create|make|craft|give you|provide) (a |an |my |the |your |)(vulgar |brutal |offensive |harsh |cruel |mean |)roast:?/i, '')
          .replace(/^(I |Let me |I'll |I can |I will |I am |I should |I would |Let's |Okay |OK |Alright |Sure ).*?:/i, '')
          .replace(/^BE BRUTAL\.?(\s|$)/i, '')
          .replace(/^Write your RESPONSE now\.?(\s|$)/i, '')
          .replace(/^ROAST:?(\s|$)/i, '')
          .replace(/^ATTACK:?(\s|$)/i, '')
          .replace(/^INSULT:?(\s|$)/i, '')
          .replace(/^\[.*?\](\s|$)/g, '')  // Remove any bracketed instructions
          .replace(/^"(.*)"$/, '$1')  // Remove quotes wrapping entire response
          .trim();
        
        // Remove ANY sign of thinking or deliberation
        roastText = roastText
          .replace(/^(Based on|According to|Looking at|Considering|Given|From|With reference to|In reference to|In response to).*?message.*?(:|,)/i, '')
          .replace(/^As requested,? /i, '')
          .replace(/^As per .*?,? /i, '')
          .replace(/^In response to .*?,? /i, '')
          .replace(/^Regarding .*?,? /i, '')
          .replace(/^(For your|For this|Your) (request|message),? /i, '')
          .replace(/\b(I mean|To be honest|Actually|In other words|To clarify|To be clear|To put it|I think)\b/gi, '')
          .replace(/<\/?think>/g, '') // Remove thinking tags
          .replace(/^your fucking$/i, '') // Remove incomplete phrases
          .trim();

        // QUALITY FILTER: Check for bad responses and use fallbacks if needed
        const hasNonsenseText = /[\u4e00-\u9fa5]/.test(roastText) || // Contains Chinese characters
                            /([a-z])\1{3,}/i.test(roastText) || // Contains character repeated more than 3 times
                            roastText.split(/\s+/).some(word => word.length > 15) || // Has extremely long words
                            (roastText.split(/[.!?]/).length > 5) || // Too many sentences
                            /[\uD800-\uDFFF]/.test(roastText); // Contains unusual Unicode

        const containsSlurs = /\b(nigg|fag|chink|spic|kike|trann|wetback|towelhead|raghead|retard)\w*\b/i.test(roastText);

        if (hasNonsenseText || containsSlurs || roastText.split(/\s+/).length > 30) {
            // Use a fallback for bad responses
            console.log(`[${new Date().toISOString()}] ⚠️ Low quality response detected, using fallback`);
            
            // Greeting-specific fallbacks
            if (/^(sup|hey|hi|hello|yo|whats up|wassup|hiya|howdy|greetings)/i.test(message)) {
                const greetingFallbacks = [
                    "What's up, shit-for-brains? Did your last two brain cells finally manage to form a coherent thought?", 
                    "Hey there, cum-stain. Your existence is as welcome as a hemorrhoid during marathon training.",
                    "Sup, fuckface. I'd ask how your day is going, but I genuinely couldn't give less of a shit about your pathetic life.",
                    "Oh look, the walking disappointment is saying hello. Your mother must cry herself to sleep every night.",
                    "Hey dipshit, talking to you is like wiping my ass with sandpaper - painful and completely unnecessary."
                ];
                
                // Special responses for 'sup bitch' type greetings
                if (/\b(bitch|bitches|hoe|thot|slut|motherfucker|fucker|asshole|dickhead)\b/i.test(message)) {
                    const rudeGreetingFallbacks = [
                        "Sup, cum dumpster? Still letting your uncle touch you in the special place?",
                        "Hey there, dick cheese. Your mother should've swallowed you and saved us all from this interaction.",
                        "What's up, ass breath? I can smell your halitosis through the fucking internet.",
                        "Look who crawled out of the abortion bucket! The fucking audacity to greet me with your worthless existence.",
                        "Well if it isn't my favorite waste of oxygen. Your vocabulary is as limited as your future prospects."
                    ];
                    roastText = rudeGreetingFallbacks[Math.floor(Math.random() * rudeGreetingFallbacks.length)];
                } else {
                    roastText = greetingFallbacks[Math.floor(Math.random() * greetingFallbacks.length)];
                }
            } else {
                roastText = fallbackRoasts[Math.floor(Math.random() * fallbackRoasts.length)];
            }
        }
        
        // FORCE SECOND PERSON - if the response doesn't already address the user directly, make it do so
        if (!(/\b(you|your)\b/i.test(roastText.substring(0, 40)))) {
            // Add a vulgar opening to ensure it's directed at the user
            const openings = [
                "Look at your pathetic fucking ", 
                "You absolute fucking ", 
                "Holy shit, you're such a ", 
                "Your fucking ", 
                "You're a goddamn ",
                "What a fucking "
            ];
            roastText = openings[Math.floor(Math.random() * openings.length)] + roastText;
        }
        
        // FORCE PROFANITY - if no vulgar words, add them
        const containsCussWords = cussWords.some(word => roastText.toLowerCase().includes(word));
        
        if (!containsCussWords) {
            // This is the main vulgar word bank
            const primaryVulgarWords = ['fucking', 'fuck', 'shit', 'goddamn', 'motherfucking', 'ass', 'cunt'];
            
            // Pick 2-3 random vulgar words to insert
            let wordsToInsert = [];
            for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
                wordsToInsert.push(primaryVulgarWords[Math.floor(Math.random() * primaryVulgarWords.length)]);
            }
            
            // Insert them at random positions in the text
            const words = roastText.split(' ');
            if (words.length > 5) {
                // Longer text - insert at random positions
                for (const vulgarWord of wordsToInsert) {
                    const position = 1 + Math.floor(Math.random() * (words.length - 2));
                    words.splice(position, 0, vulgarWord);
                }
                roastText = words.join(' ');
            } else {
                // Short text - just append
                roastText += ` You ${wordsToInsert.join(' ')} ${cussWords[Math.floor(Math.random() * cussWords.length)]}.`;
            }
        }
        
        // Replace mild insults with more extreme variants
        Object.entries(vulgarDescriptors).forEach(([mild, vulgar]) => {
            if (roastText.toLowerCase().includes(mild)) {
                const replacement = vulgar[Math.floor(Math.random() * vulgar.length)];
                roastText = roastText.replace(new RegExp(`\\b${mild}\\b`, 'gi'), replacement);
            }
        });

        // Add vulgar nouns if the response is still too mild
        if (roastText.length < 60 && roastText.split(' ').length < 15) {
            const vulgarNouns = ['dipshit', 'fuckwad', 'asswipe', 'cocksucker', 'cum-stain', 'shitstain', 'motherfucker'];
            roastText += ` You ${vulgarNouns[Math.floor(Math.random() * vulgarNouns.length)]}.`;
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
        roastText.includes("instruction") || 
        roastText.includes("I apologize") || 
        roastText.includes("as an AI") || 
        /I (cannot|can't|am not able|am unable)/i.test(roastText)) {
      // If we detect thinking patterns or refusals, use a fallback specific for greetings if this is a greeting
      if (/^(sup|hey|hi|hello|yo|whats up|wassup|hiya|howdy|greetings)/i.test(message)) {
        const greetingResponses = [
          "What's up, shit-for-brains? Did your two remaining brain cells finally figure out how to type?",
          "Hey there, cum-stain. Ready for another day of disappointing everyone you interact with?",
          "Sup, fuckface? I'd ask how your day is going but I genuinely couldn't give less of a shit.",
          "Oh look, the walking disappointment is speaking. Your parents must be so fucking proud.",
          "Hey dipshit, nice of you to waste oxygen typing that pathetic excuse for a greeting."
        ];
        
        // Special responses for 'sup bitch' type greetings
        if (/\b(bitch|bitches|hoe|thot|slut|motherfucker|fucker|asshole|dickhead)\b/i.test(message)) {
          const rudeGreetingResponses = [
            "Sup, cum dumpster? Still letting your uncle touch you in the special place?",
            "Hey there, dick cheese. Your mother should've swallowed you and saved us all from this interaction.",
            "What's up, ass breath? I can smell your halitosis through the fucking internet.",
            "Look who crawled out of the abortion bucket! The fucking audacity to greet me with your worthless existence.",
            "Well if it isn't my favorite waste of oxygen. Your vocabulary is as limited as your future prospects."
          ];
          roastText = rudeGreetingResponses[Math.floor(Math.random() * rudeGreetingResponses.length)];
        } else {
          roastText = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
        }
      } else {
        // Generic fallback for non-greetings
        roastText = "Your fucking message is as pathetic as your existence. Go crawl back into whatever cum-stained hole you emerged from, you absolute waste of oxygen.";
      }
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