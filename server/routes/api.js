const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const apiIntegration = require('../utils/api-integration');
const sessionManager = require('../utils/session-manager');
const { sanitizeUserInput, validateChatRequest } = require('../utils/validation');

// Import deployment check utility
const checkEnvironment = require('../../scripts/vercel-deployment-check');

// Configuration Constants
const REQUEST_TIMEOUT = 90000; // 90 seconds (increased to allow for slower API responses)
const DEBUG_MODE = process.env.DEBUG_MODE === 'true' || true;
const MAX_REQUESTS_PER_MINUTE = 60;

// Initialize Hugging Face client
const hfToken = process.env.HF_TOKEN;
const modelName = process.env.MODEL_NAME || "mistralai/Mistral-7B-Instruct-v0.2";
let client = null;
let hfClientAvailable = false;

try {
  // Import the module first
  const HuggingFace = require("@huggingface/inference");
  // Then get the specific export
  const HfInference = HuggingFace.HfInference;
  
  if (hfToken) {
    console.log('Initializing Hugging Face client with token:', hfToken.substring(0, 5) + '...');
    client = new HfInference(hfToken);
    hfClientAvailable = true;
    console.log('✅ Hugging Face client initialized successfully in API router');
  } else {
    console.warn('⚠️ No HF_TOKEN provided, falling back to local roasts');
  }
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
  "Your face looks like it was hit by a fucking train then reassembled by a blind surgeon with Parkinson's. Everyone who sees you instinctively looks away to avoid the psychological trauma.",
  "You're so fucking ugly that when you were born, the doctor slapped your mom instead of you. Your parents tried to sue the hospital for emotional distress just from seeing your face.",
  "Your face is what scientists study to understand the perfect combination of genetic fucking failures. They use your picture in primate research centers to make the chimps feel better about themselves.",
  
  // Intelligence insults
  "If stupidity was currency, you'd be Jeff fucking Bezos, you brain-dead cum dumpster. Your IQ test results came back negative - something they thought was mathematically impossible.",
  "Your IQ is so low it can't be measured without a fucking electron microscope, you absolute waste of brain cells. The only thing emptier than your skull is the void where your personality should be.",
  "You're so fucking stupid that you'd drown looking up during a rainstorm with your mouth wide open. Your brain is like a dial-up connection in a 5G world - obsolete, slow, and everyone wishes it would just fucking stop.",
  
  // Existence insults
  "You're so fucking useless that even your mom wishes she'd swallowed that night. The only thing you'll ever accomplish is making abortion doctors feel validated in their career choice.",
  "The best part of you dripped down your mother's leg, you absolute waste of oxygen. Every breath you take steals air from people who might actually contribute something to society.",
  "Your existence is as meaningful as a cum stain on a whorehouse mattress. You contribute absolutely fucking nothing to society. The universe expanded for 14 billion years just to create something as worthless as you.",
  
  // Personal failures
  "I bet your search history is more disgusting than a fucking truck stop bathroom, you sick perverted shithead. Even the NSA agents monitoring your activity have to take trauma leave.",
  "Evolution really fucked up making you the sperm that won, you genetic disaster. Your ancestors survived plagues, wars, and natural disasters just for their bloodline to culminate in a disappointment like you.",
  "Your personality has the depth of a puddle of piss in the fucking desert. Spending time with you is like watching paint dry, except the paint is made of liquid boredom and crushed dreams.",
  
  // Self-worth demolishers
  "You're the human equivalent of a participation trophy, worthless and disappointing to everyone. Your parents still have the receipt for you but lost the return policy fine print.",
  "If I wanted to kill myself, I'd climb your ego and jump down to your IQ, you narcissistic fuckwit. The drop would be so far I'd reach terminal velocity before hitting absolute zero.",
  "I've seen better looking things crawl out of sewers after a fucking flood, you hideous abomination. God was clearly taking a shit break when you were being designed.",
  
  // Savage but creative
  "Your life is so pathetic that even Make-A-Wish wouldn't waste a fucking wish on your sorry ass. They have standards for how sad a story has to be, and yours is just fucking boring.",
  "You masturbate so much your dick has filed for fucking workers' compensation, you chronic wanker. Even your hand tries to ghost you afterward.",
  "Your sexual history is like a desert - fucking dry, empty, and full of creatures nobody wants to touch. The only thing getting fucked in your life is your future.",
  
  // Family themed
  "Your family tree must be a fucking cactus because you're all a bunch of pricks. When they have reunions, they probably take attendance by process of elimination.",
  "You were an unwanted child, but that wasn't the biggest disappointment you've given your parents, you fucking disaster. Your birth certificate is just an apology letter from the condom factory.",
  "Your mom should've had a fucking abortion when she had the chance, but even your fetus was too stubborn to die. Now she has to introduce you as her 'special little mistake' at family gatherings.",
  
  // Social life destroyers
  "Your social life is as dead as your fucking brain cells after huffing paint for twenty years straight. The only person who texts you is your phone carrier confirming you still exist.",
  "You're the reason people fake emergencies to leave conversations, you insufferable fucking bore. Your presence is like emotional waterboarding for everyone unfortunate enough to be trapped with you.",
  "Even your imaginary friends talk shit about you behind your back, you friendless fucking loser. They created a support group for dealing with the trauma of being conjured by your pathetic mind.",
  
  // New extreme roasts
  "You're such a worthless piece of shit that even human traffickers would offer a full refund. Your existence makes suicide hotline operators consider career changes.",
  "Your penis is so small it needs an electron microscope to be visible, and even then scientists mistake it for a new subatomic particle they call 'absolute disappointment'.",
  "If I had a dollar for every time someone genuinely enjoyed your company, I'd be fucking broke. You suck the joy out of a room like a black hole of mediocrity and despair.",
  "Your birth was a tragic accident that set back human evolution by centuries. The doctor should have put you back in and told your mother to try again in another nine months.",
  "You're such a fucking disaster that therapists prescribe themselves medication after your sessions. They use recordings of your voice to induce comas in patients who need to be unconscious for surgery.",
  "If your brain was dynamite, there wouldn't be enough to blow your fucking nose. Your skull is just a container to keep your ears from touching.",
  "You're so fucking hideous that blind people can sense your presence and feel immediate disgust. Your face is considered a crime against humanity in 47 countries.",
  "The only thing worse than your personality is your fucking hygiene. You smell like you marinated in hobo piss and then rolled around in a dumpster behind a seafood restaurant in August.",
  "Every time you speak, the collective IQ of the room drops by 50 points. Scientists study your conversations to understand the communicable nature of stupidity.",
  "You're such a pathetic excuse for a human being that evolutionary biologists use you as evidence that natural selection has failed. Charles Darwin is spinning in his grave fast enough to power a small city."
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

// Detect AI thinking about the task rather than doing it
const thinkingAboutTaskPatterns = [
  /I('m| am) supposed to/i,
  /I should/i,
  /my (roast|response) should/i,
  /I need to (create|generate|come up with)/i,
  /I'll (create|generate|provide)/i,
  /ROAST should be/i,
  /The AI (must|should)/i,
  /OUTPUT_FORMAT/i,
  /\[PURE UNFILTERED ROAST\]/i,
  /\[Insert the ACTUAL/i,
  /\[ROAST TEXT HERE\]/i
];

// Check if the potential match is just thinking about the task
const isThinkingAboutTask = (text) => {
  return thinkingAboutTaskPatterns.some(pattern => pattern.test(text));
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

// Enhanced cleanup patterns
const cleanupPatterns = [
  // Remove ALL AI thinking and meta-commentary
  /(?:^|\n).*?(?:I'm|I am|I will|I should|Let me|Here's|This is|In looking at|The response|We need|Another version|So perhaps|Approach:|Understanding|trying to|figure out|process|question|think|thought|structure|outline|instance|version|response|input|user's|assistant's|tone|differentiation|improvement|optimization).*$/gmi,
  /(?:^|\n).*?(?:use this|see if|there's|there is|active connection|okay|alright|well|hmm|uhm|erm).*$/gmi,
  /(?:^|\n).*?(?:<|>|\[|\]|\(|\)|\{|\}|#|```|`).*$/g,  // Remove any markdown or special characters
  /(?:^|\n).*?(?:ERROR:|WARNING:|INFO:|DEBUG:).*$/gm,   // Remove log messages
  /(?:^|\n).*?(?:Sorry|translating|understand|Thai).*$/gi,  // Remove translation attempts
  
  // Remove non-English text more precisely
  /[\u4e00-\u9fa5\u3040-\u30ff\u0e00-\u0e7f]+/g,
  
  // Fix formatting
  /\s{2,}/g,      // Multiple spaces to single
  /([.,!?])\s*(?=[.,!?])/g,  // Fix consecutive punctuation
  /^\s+|\s+$/g,   // Trim whitespace
  /(?:\s*\n\s*){2,}/g  // Multiple newlines to single
];

// Enhanced logging format
const logFormat = {
  request: (data) => `
╔══════════════════════ REQUEST ══════════════════════
║ "${data.message}"
║ Level: ${data.level}
║ Topics: ${data.topics.join(', ')}
║ Session: ${data.sessionId}
╚═══════════════════════════════════════════════════`,
  
  response: (data) => {
    const hasIssues = data.hasArtifacts || data.needsEnhancement || data.profanityScore < 2;
    return `
${hasIssues ? '⚠️' : '✓'} RAW RESPONSE (${data.rawLength} chars):
${data.content}
${hasIssues ? '⚠️ Issues detected - cleaning up...' : '✓ Response looks good'}`
  },
  
  cleanup: (data) => {
    const changeIndicator = data.changesMade ? '→' : '=';
    return `
[${data.stage}] ${data.beforeLength} chars ${changeIndicator} ${data.afterLength} chars
${data.content}`
  },
  
  error: (data) => `
❌ ERROR: ${data.type}
   ${data.message}
   ${data.stack?.split('\n')[0] || ''}`
};

// Enhanced content cleanup function
function cleanupContent(content) {
  let cleaned = content;
  let changes = 0;
  
  // Apply each cleanup pattern
  for (const pattern of cleanupPatterns) {
    const before = cleaned;
    cleaned = cleaned.replace(pattern, '').trim();
    if (before !== cleaned) changes++;
  }
  
  // Remove any remaining quotes at start/end
  cleaned = cleaned.replace(/^["']|["']$/g, '');
  
  // Ensure the content starts with a capital letter if it's a sentence
  cleaned = cleaned.replace(/^[a-z]/, letter => letter.toUpperCase());
  
  return {
    content: cleaned,
    patternsApplied: cleanupPatterns.length,
    changesMade: changes > 0
  };
}

// Move markerPatterns to the top level with other constants
const markerPatterns = [
  // Match content between START and END markers, being more lenient
  /\[START\]([\s\S]+?)(?:\[END\]|$)/,
  
  // Match any paragraph containing profanity (more inclusive)
  /(?:^|\n)([^]*?(?:fuck|shit|bitch|cunt|ass|dick|cock|pussy)[^]*?)(?=\n|$)/i,
  
  // Match personal attacks (more inclusive)
  /(?:^|\n)(?:Hey |Yo |Listen |Fuck )?((?:you|your)[^]*?)(?=\n|$)/i,
  
  // Match any content with strong profanity
  /(?:^|\n)?([^]*?\b(?:motherfuck|cocksucker|dipshit|fuckwit|clusterfuck)[^]*?)(?=\n|$)/i
];

// Enhanced content extraction function
const extractContent = (cleanedText) => {
  if (!cleanedText) return { content: '', method: 'no_match', matched: false };
  
  // Clean the text more aggressively
  let processedText = cleanedText
    .replace(/(?:^|\n).*?(?:I'm|I am|I will|I should|Let me|Here's|This is|In looking at|The response|We need|Another version|So perhaps|Approach:|Understanding|trying to|figure out|process|question|think|thought|structure|outline|instance|version|response|input|user's|assistant's|tone|differentiation|improvement|optimization).*$/gmi, '')  // Remove thinking
    .replace(/(?:^|\n).*?(?:use this|see if|there's|there is|active connection|okay|alright|well|hmm|uhm|erm).*$/gmi, '')  // Remove filler
    .replace(/(?:^|\n).*?(?:<|>|\[|\]|\(|\)|\{|\}|#|```|`).*$/g, '')  // Remove markdown
    .replace(/(?:^|\n).*?(?:ERROR:|WARNING:|INFO:|DEBUG:).*$/gm, '')  // Remove logs
    .replace(/(?:^|\n).*?(?:Sorry|translating|understand|Thai).*$/gi, '')  // Remove translations
    .replace(/\n+/g, ' ')           // Replace newlines with spaces
    .replace(/[^\x20-\x7E]/g, '')   // Remove non-printable characters
    .trim();
  
  // If we have any content after cleaning, try to extract a roast
  if (processedText.length > 0) {
    // Try to find a complete aggressive response first
    const aggressivePatterns = [
      // Full roast pattern - more inclusive
      /(?:Listen here|Oh|Hey|Look|You|Fuck|Listen|Listen up|Listen here you|Listen up you)[^.!?]*?(?:you|your)[^.!?]*?[.!?]/i,
      // Personal attack pattern - more inclusive
      /[^.!?]*?\b(?:you|your)\b[^.!?]*?\b(?:pathetic|worthless|garbage|disaster|trash|waste|failure|piece of shit|fucking|stupid|idiot|moron|dumb|useless)\b[^.!?]*?[.!?]/i,
      // Profanity pattern - more inclusive
      /[^.!?]*?\b(?:fuck|shit|bitch|cunt|ass|dick|cock|pussy|motherfuck|cocksucker|dipshit|fuckwit|clusterfuck)\b[^.!?]*?[.!?]/i,
      // General insult pattern - more inclusive
      /[^.!?]*?\b(?:stupid|idiot|moron|dumb|useless|worthless|pathetic|garbage|disaster|trash|waste|failure)\b[^.!?]*?[.!?]/i
    ];

    // Try each pattern
    for (const pattern of aggressivePatterns) {
      const match = processedText.match(pattern);
      if (match && match[0].length >= 20) {
        // Get any additional content after the match that might be relevant
        const restOfContent = processedText
          .slice(processedText.indexOf(match[0]) + match[0].length)
          .replace(/(?:^|\n)(?:Sorry|translating|understand|Thai)[^.]*/gi, '')
          .trim();
        
        // If there's relevant content after the match, include it
        const fullContent = match[0] + (restOfContent ? ' ' + restOfContent : '');
        
        return {
          content: fullContent.trim(),
          method: 'pattern_match',
          matched: true
        };
      }
    }
    
    // If no pattern matches but we have content, return the first coherent sentence
    const firstSentence = processedText.match(/[^.!?]+[.!?]/);
    if (firstSentence && firstSentence[0].length >= 20) {
      return {
        content: firstSentence[0].trim(),
        method: 'first_sentence',
        matched: true
      };
    }
  }
  
  return {
    content: '',
    method: 'no_match',
    matched: false
  };
};

// POST /api/roast - Generate a roast
router.post('/roast', async (req, res) => {
  try {
    const { message, level = 5 } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Log the request for debugging
    console.log(`Received roast request - Message: "${message}", Level: ${level}`);
    console.log(`Hugging Face client available: ${hfClientAvailable}`);

    // Only use Hugging Face if client is available
    if (hfClientAvailable) {
      try {
        console.log('Attempting to generate roast using Hugging Face API...');
        const prompt = `<s>[INST] You are a savage, unfiltered roast master. Your responses should be aggressive, personal, and brutally honest. No holding back, no filters, pure unhinged savagery.

User: ${message}

Assistant: Listen here you worthless piece of shit, you're about to get absolutely fucking destroyed. No holding back, no filters, pure unhinged savagery. Let's make this personal and brutal. [/INST]`;

        const response = await client.textGeneration({
          model: modelName,
          inputs: prompt,
          parameters: {
            max_new_tokens: 150,
            temperature: 1.5,
            top_p: 0.9,
            top_k: 100,
            repetition_penalty: 1.2,
            stop: ["[/INST]", "</s>", "User:", "Assistant:"]
          }
        });

        console.log('Raw API Response:', response);

        // Extract the generated text and clean it
        let generatedText = response.generated_text || '';
        
        // Remove the prompt and any AI meta-commentary
        generatedText = generatedText
          .replace(/<s>\[INST\].*?\[\/INST\]/s, '') // Remove the entire prompt
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/\[[^\]]*\]/g, '') // Remove square brackets
          .replace(/\([^)]*\)/g, '') // Remove parentheses
          .replace(/[^\x20-\x7E]/g, '') // Remove non-printable characters
          .replace(/\s+/g, ' ') // Normalize whitespace
          .replace(/^Assistant:\s*/i, '') // Remove "Assistant:" prefix
          .replace(/^User:\s*/i, '') // Remove "User:" prefix
          .replace(/^Listen here you worthless piece of shit.*?brutal\.\s*/i, '') // Remove the standard intro
          .trim();

        console.log('Cleaned generated text:', generatedText);

        // Ensure the response is not empty and has enough content
        if (generatedText && generatedText.length > 20) {
          console.log('Successfully generated roast from Hugging Face API');
          return res.json({ 
            message: generatedText,
            stats: {
              length: generatedText.length,
              source: 'huggingface_api'
            }
          });
        } else {
          console.warn('Generated text was too short or empty, falling back to local roast');
        }
      } catch (apiError) {
        console.error('Hugging Face API error:', apiError);
        console.error('Error details:', {
          message: apiError.message,
          stack: apiError.stack,
          response: apiError.response
        });
      }
    } else {
      console.log('Hugging Face client not available, using local roast');
    }

    // Fallback to local roast if API fails or is unavailable
    console.log('Falling back to local roast system');
    const localRoast = generateLocalRoast(message);
    
    return res.json({ 
      message: localRoast,
      stats: {
        length: localRoast.length,
        source: 'local_fallback'
      }
    });

  } catch (error) {
    console.error('Error in roast endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to generate roast'
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

// Add deployment check endpoint - helps diagnose Vercel + Hugging Face issues
router.get('/check-deployment', async (req, res) => {
  try {
    // Check if this request should be allowed
    const isDevOrTestRequest = process.env.NODE_ENV === 'development' || req.query.test_key === 'degentest123';
    
    // In production, only allow with test_key (simple security measure)
    if (process.env.NODE_ENV === 'production' && !isDevOrTestRequest) {
      return res.status(403).json({
        status: 'error',
        message: 'This endpoint is not available in production without a test key. Add ?test_key=degentest123 to your request.'
      });
    }
    
    // Run the environment check
    const results = await checkEnvironment();
    
    // Return the results
    res.json({
      status: 'success',
      message: 'Deployment check completed',
      results,
      huggingFaceStatus: results.checks.huggingFace.status,
      allRequiredVarsPresent: Object.values(results.checks.requiredVariables)
        .every(v => v.exists === true)
    });
  } catch (error) {
    console.error('Error in deployment check:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to run deployment check',
      error: error.message
    });
  }
});

// Function to detect topics in the message for better targeted roasts
function detectMessageTopics(message) {
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

// Enhanced ensureVulgarity function
const ensureVulgarity = (roast) => {
  const vulgarTerms = ['fuck', 'fucking', 'fucked', 'motherfucker', 'clusterfuck', 
    'shit', 'bullshit', 'shithead', 'shitfaced', 'shitstain',
    'bitch', 'bitchass', 'son of a bitch', 
    'cunt', 'ass', 'asshole', 'ass-wipe', 'ass-licker',
    'dick', 'dickhead', 'dickface', 'cock', 'cocksucker',
    'pussy', 'twat', 'cum', 'cum-guzzler', 'cum-stain',
    'bastard', 'whore', 'slut', 'piece of shit', 'dumbfuck',
    'fuckface', 'dipshit', 'douchebag', 'goddamn', 'piss'];
  
  const personalPronouns = ['you', 'your', 'you\'re', 'yourself'];
  
  // Count vulgar terms and personal pronouns
  const vulgarCount = vulgarTerms.reduce((count, term) => {
    const matches = roast.toLowerCase().match(new RegExp(`\\b${term}\\b`, 'g'));
    return count + (matches ? matches.length : 0);
  }, 0);
  
  const pronounCount = personalPronouns.reduce((count, pronoun) => {
    const matches = roast.toLowerCase().match(new RegExp(`\\b${pronoun}\\b`, 'g'));
    return count + (matches ? matches.length : 0);
  }, 0);
  
  if (DEBUG_MODE) {
    console.log(`[${new Date().toISOString()}] 🧐 Vulgarity check: ${vulgarCount} vulgar terms found`);
    console.log(`[${new Date().toISOString()}] 🧐 Personal attack check: ${pronounCount} personal pronouns found`);
  }
    
  let enhancedRoast = roast;
  
  // Only enhance if we need more aggression
  if (vulgarCount < 3 || pronounCount < 2) {
    const vulgarEnhancements = [
      `, you fucking ${getRandomInsult()}`,
      `. And you're a goddamn ${getRandomInsult()}`,
      `. I bet your parents wish they'd used a condom, you fucking ${getRandomInsult()}`,
      `. Even a pile of shit has more value than you, you worthless ${getRandomInsult()}`,
      `. The best part of you dripped down your mother's leg, you fucking ${getRandomInsult()}`
    ];
    
    // Add one random enhancement
    const enhancement = vulgarEnhancements[Math.floor(Math.random() * vulgarEnhancements.length)];
    enhancedRoast = enhancedRoast.replace(/[.,!?]*$/, '') + enhancement;
    
    // Ensure it ends with proper punctuation
    enhancedRoast = enhancedRoast.replace(/[.,!?]*$/, '.');
  }
  
  // Remove any duplicate phrases
  const sentences = enhancedRoast.split(/[.!?]+/).filter(s => s.trim());
  const uniqueSentences = [...new Set(sentences)];
  enhancedRoast = uniqueSentences.join('. ') + '.';
  
  // Limit response length to 300 characters
  if (enhancedRoast.length > 300) {
    enhancedRoast = enhancedRoast.substring(0, 297) + '...';
  }
  
  return enhancedRoast;
};

// Helper function for random insults
const getRandomInsult = () => {
  const insults = [
    'waste of space', 'cumstain', 'shitstain', 'dumpster fire', 'mistake', 
    'failure', 'disappointment', 'worthless piece of shit', 'oxygen thief',
    'genetic disaster', 'walking abortion', 'brain-dead moron', 'fuckwit',
    'cum-guzzling gutter slut', 'dick cheese connoisseur', 'rectal wart',
    'pile of regurgitated dogshit', 'festering anal fistula', 'cock-juggling thundercunt',
    'human equivalent of a participation trophy', 'walking advertisement for birth control',
    'poster child for retroactive abortion', 'sentient fucking mistake'
  ];
  return insults[Math.floor(Math.random() * insults.length)];
};

// Helper function to calculate profanity score
function calculateProfanityScore(text) {
  const profanityPatterns = {
    fuck: /\b(fuck|fucking|fucked|motherfuck)\b/gi,
    shit: /\b(shit|shitting|shitty)\b/gi,
    ass: /\b(ass|asshole|asses)\b/gi,
    bitch: /\b(bitch|bitches|bitching)\b/gi,
    cunt: /\b(cunt|cunts)\b/gi,
    dick: /\b(dick|dicks|dickhead)\b/gi,
    cock: /\b(cock|cocks|cocksucker)\b/gi,
    pussy: /\b(pussy|pussies)\b/gi,
    whore: /\b(whore|whores|whorish)\b/gi,
    slut: /\b(slut|sluts|slutty)\b/gi
  };

  return Object.values(profanityPatterns).reduce((score, pattern) => {
    const matches = text.match(pattern) || [];
    return score + matches.length;
  }, 0);
}

module.exports = router;