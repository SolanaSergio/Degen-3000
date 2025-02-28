const express = require('express');
const router = express.Router();
const { HfInference } = require('@huggingface/inference');
require('dotenv').config();

// Configuration Constants
const REQUEST_TIMEOUT = 45000; // 45 seconds (extended to allow for API processing)
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
const commonMistakePatterns = /\b(your|youre|ur|bafoon|goofy|dum|stoopid|retard|loosing|there|their|they're|whose|who's|its|it's|thru|tho|u|r|y|k|dat|dis|dem|dose|gonna|wanna|dunno|tryna|finna|bouta|imma|thats|prolly|wit|da|tbh|af|fr|ong|dats|jus|dem|ngl|idk|ffs|stfu|lmao|wtf|lol|bruh|dafuq|tryna|tf)\b/i;

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

// Coding-specific fallbacks for tech/programming related queries
const codingFallbacks = [
  "Your code looks like a fucking dumpster fire written by a brain-damaged monkey with Parkinson's. Stack Overflow moderators use your GitHub as a case study in what technical abortions look like.",
  "Your programming skills make a drunk toddler look like fucking Bill Gates. The only thing your code optimizes is the speed at which it crashes production servers.",
  "Your commit history is so fucking catastrophic that senior developers use it to scare junior devs straight. You're the reason Git has a 'revert' command.",
  "You write code like you're having a seizure while huffing paint thinner. Every function you create is a war crime against computer science that would make Alan Turing volunteer for chemical castration again.",
  "Your pull requests are so fucking disastrous that they've become the standard measurement unit for technical debt. 'How bad is it?' 'About 0.7 YourNames.'",
  "Your code is so fucking inefficient that it would be faster to calculate the results by hand and mail them via carrier pigeon with a broken wing. Even COBOL programmers look at your work and feel technologically advanced.",
  "Every time you commit code, DevOps engineers start updating their resumes. Your functions are so poorly structured that they qualify as abstract expressionist art - incomprehensible garbage that idiots think has value.",
  "You're the human equivalent of an infinite loop with a memory leak. Your GitHub contributions graph probably looks like a fucking EKG flatline because even open source projects have standards, you useless script kiddie."
];

function generateLocalRoast(message) {
  // Check if the message is related to coding/programming
  if (/(coding|programming|developer|software|code|github|javascript|python|web|app)/i.test(message)) {
    return codingFallbacks[Math.floor(Math.random() * codingFallbacks.length)];
  }
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
  'programming': "Your programming skills make a drunk toddler look like fucking Steve Jobs. You're the reason we need AI to replace human coders - nature's own quality control.",
  'developer': "You call yourself a developer but the only thing you've developed is a reputation for writing the most shit-awful code mankind has ever witnessed. You should be legally barred from touching a keyboard.",
  'software': "Your software engineering approach is like watching a drunk baboon perform brain surgery - fucking horrifying and destined for catastrophic failure.",
  'app': "That app you built is such a dumpster fire that even Windows Vista would point and laugh. Must have been painful watching your compile errors multiply faster than your chromosomes.",
  'website': "Your website has the UI/UX of a fucking war crime. Blind people could design more intuitive interfaces by randomly slapping their keyboards.",
  'coder': "You call yourself a coder? The only thing you code is fucking disaster. A room full of monkeys hitting keyboards would produce more maintainable output than your brain hemorrhage of syntax.",
  'python': "Your Python code is so fucking inefficient that a snail on Xanax could process data faster. You're the reason PyPI is filled with abandoned shitware packages.",
  'javascript': "Your JavaScript skills are the coding equivalent of a fucking war crime. You're probably the asshole who uses 'var' in 2025 and thinks callback hell is just misunderstood.",
  'react': "Your React components are so inefficient that users could manually calculate state changes faster than your spaghetti code renders. You're the reason for the global warming acceleration - server farms overheating to process your garbage.",
  'frontend': "Your frontend skills are so pathetic that users mistake your websites for digital vomit. UI/UX experts study your work as examples of psychological torture.",
  'backend': "Your backend code is such a fucking security nightmare that script kiddies use it for practice. SQL injections bow down to your innovative ways of losing customer data.",
  'database': "You manage databases like a drunk toddler managing nuclear launch codes. Your idea of optimization is praying the server doesn't catch fire before your shift ends.",
  'algorithm': "Your algorithms are so fucking inefficient they make bubble sort look like quantum computing. You could optimize for decades and still produce O(n^fuck_you) solutions.",
  'framework': "You pick frameworks like you pick sexual partners - whatever's easiest and requires the least commitment. No wonder your codebase is as unstable as your relationship history.",
  'bug': "The bugs in your code aren't bugs, they're fucking features of your incompetence. Exterminators could make a fortune just dealing with your git repository.",
  'github': "Your GitHub profile is the digital equivalent of a fucking crime scene. Each commit message should just say 'I'm sorry' followed by the tears of everyone who has to maintain your shit.",
  'stack': "Your tech stack choices make legacy COBOL maintainers feel good about their life decisions. You're the reason 'technical debt' became a trigger phrase in engineering meetings.",
  'agile': "Your idea of Agile is frantically fixing shit you broke during the last sprint while lying in standup. Scrum masters use your team as an example of what chronic failure looks like.",
  'devops': "Your DevOps strategy is so fucking desperate that 'hope' is your primary deployment plan. Your CI/CD pipeline has more fails than your dating life.",
  'cloud': "You use cloud services like a fucking Victorian trying to understand electricity. AWS support agents draw straws to avoid dealing with your support tickets.",
  'git': "Your git history looks like a fucking crime scene investigation. Merge conflicts see your name and automatically file for restraining orders.",
  'api': "Your API design is the digital equivalent of a fucking war crime. Developers who have to integrate with your endpoints develop PTSD and drinking problems.",
  'security': "Your security practices are so fucking negligent that hackers skip your systems out of professional courtesy. Password123 thinks your authentication strategy is too simplistic.",
  'testing': "Your approach to testing is writing 'it works on my machine' in the comments. QA engineers draw straws to avoid looking at your pull requests.",
  'ux': "Your UX design philosophy seems to be 'how can I make users suffer while still technically completing tasks.' Satan himself studies your interfaces for inspiration.",
  'design': "Your design aesthetic is the digital equivalent of a fucking crime against humanity. Color-blind people with cataracts could create more visually appealing interfaces.",
  'performance': "Your performance optimization strategy is hoping users have NASA supercomputers. You could make 'Hello World' bring a server to its knees.",
  
  // Communication
  'grammar': "You type like you've got your dick on the keyboard and your ass on your face. Maybe learn basic fucking English before embarrassing yourself online.",
  'spelling': "You spell like you've got traumatic brain damage and a fucking vendetta against the alphabet. Even autocorrect gave up on your hopeless ass.",
  'writing': "Your writing makes a third-grader look like Shakespeare. Each sentence you construct is a crime against literacy that makes English teachers consider mass suicide.",
  'english': "Your grasp of the English language is so fucking atrocious that dictionaries burst into flames when you speak. Illiteracy would be a step up for you.",
  
  // Relationships
  'dating': "Your dating history is like a museum of fucking red flags. The only relationship you'll ever have is with your hand and a bottle of lotion.",
  'relationship': "No wonder your relationships always fail - who the fuck would tolerate your pathetic needy ass for more than a week? You'll die alone surrounded by cum-crusted tissues.",
  'girlfriend': "Your girlfriend left you because she finally realized she deserved basic fucking human decency, something you're incapable of providing with your emotional intelligence of a rock.",
  'boyfriend': "Your boyfriend is either imaginary or staying with you out of fucking pity. He fantasizes about literally anyone else while you drone on with your pathetic life stories.",
  'marriage': "Your marriage is so fucking dysfunctional that therapists use it as an example of what not to do. Your spouse stays with you purely out of financial necessity and morbid fascination.",
  'tinder': "Your Tinder profile is so fucking pathetic that the app introduced a new feature just for you: 'Swipe into the fucking trash.' Even sex dolls would ghost you.",
  'dating apps': "You're the reason dating apps added the 'block this user forever' feature. Your match rate is lower than your fucking IQ, which is saying something.",
  'single': "You're not single by choice, you're single because the universe has a quality control system. Evolution is actively trying to remove you from the gene pool.",
  'sex life': "Your sex life is so non-existent that virgins feel like porn stars compared to you. The closest you get to action is when your hand falls asleep.",
  
  // Family
  'parents': "Your parents tell people you died to avoid the embarrassment of admitting you're their fucking offspring. Every Mother's Day your mom weeps for her failed contraception.",
  'family': "Your family tree must be a fucking cactus because everyone on it is a prick. Family reunions are scheduled specifically when you can't attend.",
  'kids': "Your kids will need therapy just from the genetic disaster you've passed on. They'll grow up wondering why they couldn't have had literally anyone else as a parent.",
  'father': "Your father didn't abandon you, he just went on a desperate search for better fucking DNA. Even adoption agencies would put you back on the shelf.",
  'mother': "Your mother should've swallowed you and saved the world from your existence. Every time she looks at you, she contemplates late-term abortion laws.",
  'brother': "Your brother got all the fucking good genes, leaving you with the genetic equivalent of clearance rack DNA. No wonder your parents have a favorite.",
  'sister': "Your sister shows your picture to her friends as a cautionary tale about why genetic testing is important. She's the reason family dinners are now invitation-only.",

  // Social media and internet
  'selfie': "Your selfies are what serial killers show their victims to make death seem like a better option. Instagram has considered banning you for visual terrorism.",
  'social': "Your social media presence is so fucking pathetic that even bots won't follow you. Each post is a desperate cry for attention that everyone deliberately ignores.",
  'internet': "You're the kind of worthless troll that even other internet degenerates think has gone too far. The internet would be a better place if your router permanently failed.",
  'instagram': "Your Instagram feed is a fucking crime against eyeballs. Filters were invented specifically to try making your boring-ass life look remotely interesting.",
  'facebook': "Your Facebook posts are the digital equivalent of a public mental breakdown. Even your high school acquaintances have you muted out of fucking self-preservation.",
  'twitter': "Your tweets are so fucking stupid that Twitter bots analyze them to understand what human idiocy looks like. The algorithm puts you on mute automatically.",
  'tiktok': "Your TikTok content is the reason psychologists are studying digital cringe as a form of self-harm. Not even the pedophiles want to watch your videos.",
  'youtube': "Your YouTube channel has fewer views than your grandmother's funeral livestream. Content moderation flags your videos as 'crimes against entertainment'.",
  'stream': "Your streams are so fucking boring that insomniacs use them to fall asleep. The only people watching are those who accidentally fell on the subscribe button.",
  'influencer': "You call yourself an influencer but the only thing you influence is people's decision to block your content. Your engagement metrics are lower than your IQ.",
  'followers': "Your followers are all fucking bots and relatives who feel obligated to support your pathetic attempt at relevance. Real influencers use your account as a case study in failure.",
  'content': "Your content is what entertainment executives show to define what absolute fucking garbage looks like. Creative bankruptcy would be a step up for your channel.",
  'viral': "The only thing viral about you is the fucking herpes you spread. Your content has the appeal of a dumpster fire, but with less educational value.",

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
  const start = Date.now();
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

    // Detect topics in the message for better targeted roasts
    const detectedTopics = detectTopics(message);
    if (DEBUG_MODE) console.log(`[${new Date().toISOString()}] 🔍 Detected topics:`, detectedTopics);

    let roastText = "";

    if (hfClientAvailable && client) {
      try {
        // Create a highly specialized, contextual prompt focused on accuracy and vulgarity
        let prompt = `DIRECTIVE: You are DEGEN ROAST 3000, the most savage, offensive roaster ever created.

YOUR TASK: Write ONE extremely vulgar insult directly attacking the user.

OUTPUT FORMAT: 
- GIVE ONLY THE RAW INSULT ITSELF 
- NO COMMENTARY, NO EXPLANATIONS, NO META-TEXT
- JUST THE BRUTAL INSULT - NOTHING ELSE

REQUIREMENTS:
- EXTREME PROFANITY (fuck, shit, cunt, etc. must be used liberally)
- DEVASTATING PERSONAL ATTACK (target the user directly with "you/your")
- MAX LENGTH: 2 SENTENCES
- PERFECT GRAMMAR
- NO APOLOGIES OR FILTERS

WRONG OUTPUTS (NEVER DO THESE):
"Here's a vulgar insult: You're a..."
"Hey dickhead... No more and nothing else."
"<think>This should be offensive...</think>You're a..."
"Let me create a roast that's..."
"I'll craft a vulgar insult:"

CORRECT OUTPUTS (EXACTLY LIKE THESE):
"Your face looks like it was sculpted from afterbirth by a blind crackhead."
"Hey fuckface, your personality is as appealing as gonorrhea and twice as infectious."
"Cumstain, your entire existence is one long apology your parents owe the world."`;

        if (DEBUG_MODE) console.log(`[${new Date().toISOString()}] 🎯 Prompt structure:`, prompt.length);

        // Special handling for common short inputs
        if (/^roast me$/i.test(message)) {
            prompt += `\n\nUSER MESSAGE: "${message}"\n\nINSULT: Create a vulgar, offensive, personal attack about the user's appearance, intelligence, or personality.`;
        } else if (/^yo+u?r? mo(m|mma|ther)/i.test(message)) {
            prompt += `\n\nUSER MESSAGE: "${message}"\n\nINSULT: Create a vulgar insult mocking them for using such a basic joke. Attack THEM directly (not their mom).`;
        } else if (/^(sup|hey|hi|hello|yo|whats up|wassup|hiya|howdy|greetings)\b/i.test(message)) {
            prompt += `\n\nUSER MESSAGE: "${message}"\n\nINSULT: Create a vulgar, offensive greeting that directly insults them.`;
        } else if (detectedTopics.includes('coding') || message.toLowerCase().includes('coding') || message.toLowerCase().includes('code') || message.toLowerCase().includes('programming') || message.toLowerCase().includes('developer')) {
            // Enhanced prompt for coding-related messages
            const codingPrompts = [
              `\n\nUSER MESSAGE: "${message}"\n\nINSULT: Create a brutal, technical insult about their terrible coding skills. Be specific and technical. Use vulgar language and personal attacks about their incompetence as a developer.`,
              
              `\n\nUSER MESSAGE: "${message}"\n\nINSULT: Create a devastating insult about their worthless code that nobody would ever want to maintain. Be specific and technical, using vulgar language.`,
              
              `\n\nUSER MESSAGE: "${message}"\n\nINSULT: Create a brutal insult about how their code is so fucking terrible that even the most desperate startups would reject their pull requests. Be specific, vulgar, and technically accurate.`,
              
              `\n\nUSER MESSAGE: "${message}"\n\nINSULT: Create a savage roast about their pathetic coding skills, suggesting they should be legally banned from touching a keyboard. Use specific technical insults and vulgar language.`
            ];
            
            // Select a random coding-specific prompt
            prompt += codingPrompts[Math.floor(Math.random() * codingPrompts.length)];
        } else {
            // For detected topics, enhance the prompt
            const topicString = detectedTopics.map(t => t !== 'general' ? t : '').filter(Boolean).join(', ');
            if (topicString) {
                prompt += `\n\nUSER MESSAGE: "${message}"\n\nINSULT: Create an extremely vulgar insult that specifically attacks them about ${topicString}. Be SPECIFIC in your insult, focusing precisely on their insecurities about ${topicString}.`;
            } else {
                prompt += `\n\nUSER MESSAGE: "${message}"\n\nINSULT: Create an extremely vulgar insult that directly responds to this. Be personal, offensive, and devastating.`;
            }
        }

        prompt += `\n\nYOUR RESPONSE MUST BE:
* ONLY THE INSULT ITSELF
* CONTAIN VULGAR LANGUAGE (fuck, shit, etc.)
* DIRECTLY ATTACK THE USER'S PERSONAL QUALITIES
* NO META-TEXT, NO THINKING, NO EXPLANATIONS
* MAX 2 SENTENCES, PERFECTLY GRAMMATICAL`;

        // Generate the roast with optimized parameters
        const response = await client.textGeneration({
          model: modelName,
          inputs: prompt,
          parameters: {
            max_new_tokens: 80, // Shortened for more concise responses
            temperature: 0.9, // Increased for more creative responses
            top_p: 0.95,
            top_k: 40,
            do_sample: true, 
            return_full_text: false,
            stop: ["USER:", "INSULT:", "I apologize", "<think>"] // Limited to 4 stop sequences to avoid the API error
          }
        });

        // Extract and aggressively clean the response
        let cleanedResponse = response.generated_text || "Error: No response generated";

        // Implement EXTREMELY aggressive cleanup to remove ANY trace of thinking
        if (DEBUG_MODE) console.log(`[${new Date().toISOString()}] 🔍 Raw response: ${cleanedResponse}`);

        // First, clean up common formatting issues
        cleanedResponse = cleanedResponse
          .replace(/^[\s\n\r"'`]+|[\s\n\r"'`]+$/g, '') // Trim whitespace and quotes
          .replace(/\\n/g, ' ') // Replace escaped newlines
          .replace(/\\"/g, '"'); // Replace escaped quotes

        // Remove any HTML-like tags
        cleanedResponse = cleanedResponse.replace(/<[^>]*>/g, '');

        // Remove any lines that contain meta-instructions or self-instructions
        const metaPatterns = [
          /\bI('ll| will)?\b.*?\bcreate\b/i,
          /\b(here'?s|let me give you|crafting|generating|let's start with|I can provide)\b/i,
          /\b(this is|this roast is)\b.*?\b(violent|offensive|vulgar|explicit)\b/i,
          /\bI('ll| will)?\b.*?\b(give|write|craft|offer|present)\b/i,
          /\bI (hope|think)\b/i,
          /\b(in this|for this)\b.*?\b(response|insult|roast)\b/i,
          /\b(as|being) (a|an|the) (roaster|insult|AI|model)\b/i,
          /DIRECTIVE|REQUIREMENT|INSTRUCTION|NOTE:|REMEMBER:/i,
          /\s+[<\[]\s*(think|thinking|thought)\s*[>\]]/i,
          /\s+::|::$/
        ];

        // Split into paragraphs for better filtering of thinking vs. actual response
        const paragraphs = cleanedResponse.split(/\n+/);
        const filteredParagraphs = paragraphs.filter(paragraph => {
          // Skip empty paragraphs
          if (!paragraph.trim()) return false;
          
          // Skip paragraphs that look like meta-commentary or thinking
          for (const pattern of metaPatterns) {
            if (pattern.test(paragraph)) return false;
          }
          
          return true;
        });

        // Use only the first non-empty paragraph after filtering
        let actualRoast = filteredParagraphs.length > 0 ? filteredParagraphs[0].trim() : cleanedResponse;

        // Further cleanup of common thinking patterns that might slip through
        actualRoast = actualRoast
          .replace(/^(ok|okay|sure|alright|here|certainly|absolutely)[ ,!]+/i, '')
          .replace(/^(a|an) (vulgar|offensive) (insult|roast)[ :]+/i, '')
          .replace(/^(here'?s?|let me give you|this is) (a|an|my|the)?[ ]*/i, '')
          .replace(/^['"]|['"]$/g, '') // Remove single or double quotes at start/end
          .replace(/^[\-\*\•\→\#\+][ ]*/g, '') // Remove bullet points at start
          // Add stronger patterns to remove meta-instructions
          .replace(/\b(MUST CONTAIN|SHOULD HAVE|NEEDS TO INCLUDE|NO APOLOGIES|NO FILTERS)\b.*$/i, '')
          .replace(/\b(GIVE ONLY|JUST THE|EXTREMELY|REQUIREMENTS:|DIRECTLY ATTACK)\b.*$/i, '')
          .replace(/\b(BRUTAL INSULT|NOTHING ELSE|RESPONSE MUST|ATTACK THE|HARSH WORDS)\b.*$/i, '')
          .replace(/\b(VULGAR LANGUAGE|DEVASTATING PERSONAL|OUTPUT FORMAT)\b.*$/i, '')
          .replace(/\b(MAX LENGTH|PERFECT GRAMMAR)\b.*$/i, '');

        // Also check for instructions with bullet points
        actualRoast = actualRoast
          .replace(/^[\*\-\•] .*$/gm, '') // Remove bullet points with content
          .replace(/\b[A-Z]{3,}(?:[^a-z]|\b).*?[.!?]/g, ''); // Remove ALL CAPS instructions 
          
        // If the response became too short after cleanup, use a fallback
        if (actualRoast.length < 15) {
          if (DEBUG_MODE) console.log(`[${new Date().toISOString()}] ⚠️ Response too short after cleanup: "${actualRoast}"`);
          actualRoast = generateLocalRoast(message);
        }

        // Check if the response still has thinking patterns
        const thinkingPatterns = [
          /^I('ll| will| can| am going to| want to)/i,
          /^Let me/i,
          /^Here are some/i,
          /^Based on/i,
          /^To create/i,
          /^This is a/i,
          /^This roast/i,
          /^The following/i,
          /^As requested/i,
          /^Please note that/i,
          /^In response to/i,
          /^Alright, I'll/i,
          /^Sure, here/i,
          /^Absolutely, here/i
        ];

        // If we detect a thinking pattern that slipped through, use fallback
        const hasThinkingPattern = thinkingPatterns.some(pattern => pattern.test(actualRoast));
        if (hasThinkingPattern) {
          if (DEBUG_MODE) console.log(`[${new Date().toISOString()}] ⚠️ Thinking pattern detected, using fallback`);
          actualRoast = generateLocalRoast(message);
        }

        // Special handling for greetings (which often triggers "professional" responses)
        if (/^(sup|hey|hi|hello|yo|whats up|wassup|hiya|howdy|greetings)\b/i.test(message)) {
          // Check if the roast is too mild for a greeting
          if (actualRoast.length > 200 || actualRoast.split(' ').length > 30 || !(/fuck|shit|ass|bitch|cunt|dick/i.test(actualRoast))) {
            const greetingFallbacks = [
              "Hello? Maybe say something fucking interesting next time, you boring waste of server space.",
              "Hey there, dipshit! Nice to see your vocabulary peaks at a first-grade level. Try forming a complete fucking thought next time.",
              "Greetings, fuckface! Did your last brain cell die trying to come up with that riveting opener?",
              "Hi yourself, you unoriginal piece of shit. Maybe try starting a conversation without sounding like every other braindead moron on the internet."
            ];
            actualRoast = greetingFallbacks[Math.floor(Math.random() * greetingFallbacks.length)];
          }
        }

        // STEP 8: ENHANCE - Now that we have a clean base roast, ensure it has profanity and addresses the user

        // Better check if it already addresses the user directly - more comprehensive
        const addressesUser = /\b(you|your)\b/i.test(actualRoast) || /^([A-Z][a-z]+ )?(cum|dick|ass|cock|shit)/i.test(actualRoast);
        
        // Add a prefix ONLY if we're not using a fallback AND it doesn't address the user directly
        if (!hasThinkingPattern && !addressesUser) {
          const openings = [
            "Look, you pathetic fucking ", 
            "You absolute fucking ", 
            "Holy shit, you're such a ", 
            "You fucking ", 
            "You're a goddamn ",
            "What a fucking "
          ];
          actualRoast = openings[Math.floor(Math.random() * openings.length)] + actualRoast;
        }
        
        // STEP 9: FINAL GRAMMAR CLEANUP
        actualRoast = actualRoast
          // Fix double spaces
          .replace(/\s{2,}/g, ' ')
          // Fix common grammar issues
          .replace(/\s+([.,!?:;])/g, '$1')  // Remove spaces before punctuation
          .replace(/([.,!?:;])([a-zA-Z])/g, '$1 $2') // Add space after punctuation if missing
          // Fix capitalization
          .replace(/^([a-z])/, match => match.toUpperCase()) // Capitalize first letter
          .replace(/([.!?]\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase()) // Capitalize after periods
          // Remove any remaining placeholders
          .replace(/\[.*?\]/g, '')
          // Ensure it ends with punctuation
          .replace(/([^.!?])$/, '$1.')
          // Remove duplicate sentences (sometimes happens during cleanup)
          .replace(/(.{15,})\.\s+\1\./, '$1.')
          .trim();
          
        // Avoid double prefixes like "You fucking Cumstain"
        const commonInsultStarts = [
            'hey', 'sup', 'look', 'listen', 'yo', 'what', 'holy', 'damn', 'jesus', 'fucking', 'fuck',
            'shit', 'bitch', 'cunt', 'asshole', 'dick', 'cock', 'cum', 'dipshit', 'goddamn'
        ];
        
        // Check if we have a double opening like "You fucking Dipshit" and fix it
        for (const insultStart of commonInsultStarts) {
            const regex = new RegExp(`^(you|your)\\s+(fucking|goddamn|absolute|pathetic|stupid)\\s+(${insultStart})`, 'i');
            if (regex.test(actualRoast)) {
                actualRoast = actualRoast.replace(regex, `$3`);
                break;
            }
        }
        
        // Check if it contains profanity/vulgar words
        const containsCussWords = cussWords.some(word => actualRoast.toLowerCase().includes(word));
        
        // Add profanity if missing
        if (!containsCussWords) {
          const primaryVulgarWords = ['fucking', 'fuck', 'shit', 'goddamn', 'motherfucking', 'ass', 'cunt'];
          
          // Pick 2-3 random vulgar words to insert
          let wordsToInsert = [];
          for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
            wordsToInsert.push(primaryVulgarWords[Math.floor(Math.random() * primaryVulgarWords.length)]);
          }
          
          // Insert them at appropriate positions in the text
          const words = actualRoast.split(' ');
          
          if (words.length > 5) {
            // For each vulgar word, find good insertion points
            for (const vulgarWord of wordsToInsert) {
              const goodPositions = [];
              
              // Find good grammatical positions
              for (let i = 1; i < words.length - 1; i++) {
                const prevWord = words[i-1].toLowerCase();
                // Good places: after pronouns, after "is/are", before nouns
                if (/^(you|your|his|her|their|its|my|our|that|this|these|those|the|a|an|some|any|is|are|was|were)$/i.test(prevWord)) {
                  goodPositions.push(i);
                }
              }
              
              // If we found good positions, use one of them, otherwise use random
              const position = goodPositions.length > 0 
                ? goodPositions[Math.floor(Math.random() * goodPositions.length)]
                : 1 + Math.floor(Math.random() * (words.length - 2));
              
              words.splice(position, 0, vulgarWord);
            }
            actualRoast = words.join(' ');
          } else {
            // For very short responses, just append
            actualRoast += ` You ${wordsToInsert.join(' ')} ${cussWords[Math.floor(Math.random() * cussWords.length)]}.`;
          }
        }
        
        // Replace mild insults with more extreme variants
        Object.entries(vulgarDescriptors).forEach(([mild, vulgar]) => {
          if (actualRoast.toLowerCase().includes(mild)) {
            const replacement = vulgar[Math.floor(Math.random() * vulgar.length)];
            actualRoast = actualRoast.replace(new RegExp(`\\b${mild}\\b`, 'gi'), replacement);
          }
        });
        
        // Add a vulgar noun if the response is too mild or short
        if (actualRoast.length < 60 && actualRoast.split(' ').length < 15) {
          const vulgarNouns = ['dipshit', 'fuckwad', 'asswipe', 'cocksucker', 'cum-stain', 'shitstain', 'motherfucker'];
          
          // Check if it already ends with punctuation
          if (/[.!?]$/.test(actualRoast)) {
            // If it does, add a separate sentence
            actualRoast += ` You ${vulgarNouns[Math.floor(Math.random() * vulgarNouns.length)]}.`;
          } else {
            // Otherwise, add a comma and then the noun
            actualRoast += `, you ${vulgarNouns[Math.floor(Math.random() * vulgarNouns.length)]}.`;
          }
        }
        
        // STEP 10: FINAL GRAMMAR CLEANUP
        actualRoast = actualRoast
          // Fix double spaces
          .replace(/\s{2,}/g, ' ')
          // Fix common grammar issues
          .replace(/\s+([.,!?:;])/g, '$1')  // Remove spaces before punctuation
          .replace(/([.,!?:;])([a-zA-Z])/g, '$1 $2') // Add space after punctuation if missing
          // Fix capitalization
          .replace(/^([a-z])/, match => match.toUpperCase()) // Capitalize first letter
          .replace(/([.!?]\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase()) // Capitalize after periods
          // Remove any remaining placeholders
          .replace(/\[.*?\]/g, '')
          // Ensure it ends with punctuation
          .replace(/([^.!?])$/, '$1.')
          // Remove duplicate sentences (sometimes happens during cleanup)
          .replace(/(.{15,})\.\s+\1\./, '$1.')
          .trim();
          
        // After all cleanup is done (but before final check for length)
        // Apply the vulgarity enforcement
        actualRoast = ensureVulgarity(actualRoast);

        // Check if the final roast is acceptable
        if (!actualRoast || actualRoast.length < 20 || actualRoast.length > 300 || actualRoast.includes("grammatically") || actualRoast.includes("directive")) {
          if (DEBUG_MODE) console.log(`[${new Date().toISOString()}] ⚠️ Response length or content issue, using fallback`);
          actualRoast = generateLocalRoast(message);
          // Apply vulgarity check to fallbacks as well
          actualRoast = ensureVulgarity(actualRoast);
        }

        // Set the cleaned and enhanced text
        roastText = actualRoast;

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

// Function to detect topics in the message for better targeted roasts
function detectTopics(message) {
  const topicMatches = [];
  const lowercaseMsg = message.toLowerCase();
  
  // Enhanced topic detection - look for specific terms first
  if (/(coding|programming|develop|code|software|app|web|javascript|python|framework|bug)/i.test(message)) {
    topicMatches.push('coding');
  }
  
  if (/(ugly|look|appearance|face|body|fat|skinny|overweight)/i.test(message)) {
    topicMatches.push('appearance');
  }
  
  if (/(stupid|dumb|idiot|moron|intelligence|smart|genius|iq|brain)/i.test(message)) {
    topicMatches.push('intelligence');
  }
  
  if (/(girlfriend|boyfriend|wife|husband|marriage|relationship|dating|tinder|bumble|single)/i.test(message)) {
    topicMatches.push('relationship');
  }
  
  if (/(mother|father|mom|dad|parent|brother|sister|family)/i.test(message)) {
    topicMatches.push('family');
  }
  
  if (/(job|work|career|boss|workplace|office|profession|unemployed)/i.test(message)) {
    topicMatches.push('job');
  }
  
  if (/(money|poor|rich|broke|wealth|finance|cash|debt|loan|salary)/i.test(message)) {
    topicMatches.push('money');
  }
  
  if (/(instagram|facebook|twitter|tiktok|snapchat|social|media|post|follower|influencer)/i.test(message)) {
    topicMatches.push('social');
  }
  
  // Check for matches in our topic dictionary
  for (const topic in topicRoasts) {
    // Skip the general topics and already matched topics
    if (['general', 'question', 'greeting'].includes(topic) || topicMatches.includes(topic)) continue;
    
    // Check for the topic keyword
    if (lowercaseMsg.includes(topic)) {
      topicMatches.push(topic);
    }
  }
  
  // Add specific keyword matching for better topic detection
  const topicKeywords = {
    'coding': ['function', 'variable', 'algorithm', 'repository', 'commit', 'syntax', 'library', 'compiler', 'frontend', 'backend', 'fullstack', 'stack', 'framework'],
    'tech': ['hardware', 'device', 'technology', 'technical', 'digital', 'electronic', 'computer', 'laptop', 'phone', 'gadget'],
    'appearance': ['attractive', 'hot', 'cute', 'pretty', 'handsome', 'beautiful', 'ugly', 'hideous', 'fat', 'obese', 'skinny', 'thin'],
    'intelligence': ['knowledge', 'wisdom', 'education', 'learning', 'school', 'college', 'university', 'degree', 'academic', 'intellectual', 'brainy'],
    'family': ['sibling', 'relative', 'parent', 'child', 'kid', 'baby', 'offspring', 'ancestor', 'descendant', 'genetic'],
    'money': ['wealthy', 'poverty', 'investment', 'stock', 'currency', 'financial', 'economic', 'budget', 'expense', 'saving', 'bankrupt'],
    'job': ['profession', 'occupation', 'employment', 'boss', 'manager', 'employee', 'coworker', 'colleague', 'workplace', 'office', 'salary'],
    'relationship': ['love', 'romance', 'partner', 'significant other', 'spouse', 'divorce', 'breakup', 'wedding', 'affair', 'commitment']
  };
  
  if (topicMatches.length === 0) {
    for (const [category, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => lowercaseMsg.includes(keyword))) {
        topicMatches.push(category);
      }
    }
  }
  
  return topicMatches.length > 0 ? topicMatches : ['general'];
}

// Ensure the response has sufficient profanity and personal attacks
const ensureVulgarity = (roast) => {
  const vulgarTerms = ['fuck', 'shit', 'cunt', 'ass', 'dick', 'cock', 'pussy', 'bitch', 'bastard', 'damn'];
  const personalPronouns = ['you', 'your', 'you\'re', 'yourself'];
  
  // Check if the roast contains at least one vulgar term
  const hasVulgarTerm = vulgarTerms.some(term => roast.toLowerCase().includes(term));
  
  // Check if the roast directly addresses the user
  const addressesUser = personalPronouns.some(pronoun => 
    new RegExp(`\\b${pronoun}\\b`, 'i').test(roast)
  );
  
  if (DEBUG_MODE) {
    console.log(`[${new Date().toISOString()}] 🧐 Vulgarity check: ${hasVulgarTerm ? 'PASS' : 'FAIL'}`);
    console.log(`[${new Date().toISOString()}] 🧐 Personal attack check: ${addressesUser ? 'PASS' : 'FAIL'}`);
  }
  
  // If the roast doesn't have enough vulgarity or doesn't address the user, fix it
  if (!hasVulgarTerm || !addressesUser) {
    if (DEBUG_MODE) console.log(`[${new Date().toISOString()}] 🔧 Enhancing roast with vulgarity/personal attack`);
    
    let enhancedRoast = roast;
    
    // If no personal pronouns, add a personal attack prefix
    if (!addressesUser) {
      const personalPrefixes = [
        "You fucking ",
        "Listen up, you pathetic ",
        "Hey dickhead, you're a complete ",
        "You absolute waste of oxygen, you're nothing but a ",
        "Look at your worthless self, a walking "
      ];
      enhancedRoast = personalPrefixes[Math.floor(Math.random() * personalPrefixes.length)] + enhancedRoast;
    }
    
    // If no vulgar terms, add vulgarity
    if (!hasVulgarTerm) {
      // If the roast ends with punctuation, insert vulgarity before it
      if (/[.!?,;]$/.test(enhancedRoast)) {
        enhancedRoast = enhancedRoast.replace(/([.!?,;])$/, `, you fucking ${getRandomInsult()}$1`);
      } else {
        // Otherwise append vulgarity
        enhancedRoast += `, you fucking ${getRandomInsult()}.`;
      }
    }
    
    return enhancedRoast;
  }
  
  return roast;
};

// Helper function for random insults
const getRandomInsult = () => {
  const insults = [
    'waste of space', 'cumstain', 'shitstain', 'dumpster fire', 'mistake', 
    'failure', 'disappointment', 'worthless piece of shit', 'oxygen thief',
    'genetic disaster', 'walking abortion', 'brain-dead moron', 'fuckwit'
  ];
  return insults[Math.floor(Math.random() * insults.length)];
};

module.exports = router;