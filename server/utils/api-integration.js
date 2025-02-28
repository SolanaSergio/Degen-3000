/**
 * API Integration for DEGEN ROAST 3000
 * 
 * Handles topic detection and roast generation
 */

// Import Hugging Face SDK for API calls
let HfInference;
try {
  ({ HfInference } = require("@huggingface/inference"));
  console.log('✅ Hugging Face SDK loaded successfully');
} catch (error) {
  console.error('❌ ERROR loading @huggingface/inference:', error.message);
  console.error('Stack trace:', error.stack);
  console.warn('⚠️ WARNING: API roast generation will be disabled.');
}

// Check for HF_TOKEN
if (!process.env.HF_TOKEN) {
  console.warn('⚠️ WARNING: HF_TOKEN environment variable is not set. Using local fallback roasts only.');
} else {
  console.log(`✅ HF_TOKEN found (starts with: ${process.env.HF_TOKEN.substring(0, 5)}...)`);
}

// Initialize Hugging Face client if token is available
let hfClient;
if (process.env.HF_TOKEN && HfInference) {
  try {
    hfClient = new HfInference(process.env.HF_TOKEN);
    console.log('✅ Hugging Face client initialized successfully');
  } catch (error) {
    console.error('❌ ERROR initializing Hugging Face client:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// API request timeout (in milliseconds)
const API_TIMEOUT = 15000; // 15 seconds
// Debug mode for detailed logging
const DEBUG_MODE = true;
// Maximum retries for API calls
const MAX_RETRIES = 2;
// Delay between retries (in milliseconds)
const RETRY_DELAY = 1000;

// This function will be used for testing the API connection directly
async function testApiConnection() {
  if (!hfClient) {
    console.error('❌ Cannot test API connection: hfClient is not initialized');
    return { success: false, error: 'Client not initialized' };
  }
  
  try {
    console.log('🔍 Testing API connection with simple request...');
    const response = await hfClient.chatCompletion({
      model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
      messages: [
        { role: "user", content: "Hello, testing connection" }
      ],
      max_tokens: 10,
      temperature: 0.7
    });
    
    console.log('✅ API test successful:', JSON.stringify(response).substring(0, 200) + '...');
    return { success: true, response };
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      try {
        const errorText = await error.response.text();
        console.error('Response text:', errorText);
      } catch (e) {
        console.error('Could not parse error response');
      }
    }
    return { success: false, error: error.message };
  }
}

// Topic detection patterns and keywords
const TOPIC_PATTERNS = {
  // Financial/Crypto topics
  'crypto': [/crypto|bitcoin|btc|ethereum|eth|nft|defi|blockchain|token|coin|wallet|mining|hodl|doge|shib|sol|ada|xrp|binance|metamask|opensea|uniswap/i],
  'investing': [/invest|stock|portfolio|market|trade|dividend|etf|index|fund|roth|401k|ira|broker|asset|equity|bond|mutual|retirement/i],
  'money': [/money|cash|poor|rich|broke|salary|income|debt|loan|mortgage|rent|payment|bank|dollar|euro|financial|inflation|recession|wealth/i],
  
  // Career/Work topics
  'job': [/job|career|work|boss|coworker|colleague|office|interview|resume|fired|hired|salary|promotion|workplace|remote|wfh|unemployed|employ|startup/i],
  'coding': [/cod(e|ing)|developer|software|javascript|python|java|html|css|programming|algorithm|bug|git|github|stack|framework|library|api|frontend|backend/i],
  'education': [/school|college|university|degree|class|grade|student|teacher|professor|homework|study|exam|test|major|graduate|education|learn|academic/i],
  
  // Personal topics
  'appearance': [/look|face|body|ugly|fat|thin|hair|dress|style|fashion|height|weight|skin|teeth|nose|eyes|clothes|outfit/i],
  'relationship': [/relationship|dating|marriage|girlfriend|boyfriend|wife|husband|spouse|partner|tinder|bumble|hinge|single|breakup|divorce|love|crush|cheating|romantic/i],
  'personality': [/personality|attitude|behavior|character|mind|thinking|thoughts|feelings|emotions|mood|temperament|nature/i],
  
  // Lifestyle topics
  'home': [/home|house|apartment|condo|living|rent|roommate|neighbor|furniture|decor|clean|mess|bedroom|kitchen|bathroom|basement|garage|yard|mortgage/i],
  'hobbies': [/hobby|game|gaming|read|movie|tv|netflix|art|music|instrument|sport|gym|workout|fitness|travel|cook|photography|collection|craft/i],
  'health': [/health|diet|exercise|workout|gym|fitness|weight|fat|medical|doctor|dentist|therapy|medicine|sick|illness|disease|condition|sleep|nutrition/i],
  
  // Technology topics
  'tech': [/tech|computer|laptop|phone|tablet|apple|android|windows|ios|device|hardware|software|app|gadget|speaker|headphone|smart|wifi|bluetooth/i],
  'social': [/social|twitter|facebook|instagram|tiktok|snapchat|youtube|reddit|linkedin|discord|twitch|follower|like|post|meme|influencer|content|viral|trend/i],
  'gaming': [/gaming|game|console|pc|playstation|xbox|nintendo|steam|fps|mmorpg|lol|fortnite|minecraft|cod|valorant|gamer|streamer|esport|controller/i],
  
  // Negative traits
  'failure': [/fail|failure|loser|lose|lost|mistake|mess up|screw up|disaster|catastrophe|ruin|destroyed|embarrass|humiliate|pathetic|mediocre|disappointment/i],
  'lazy': [/lazy|procrastinate|unmotivated|slacker|couch potato|do nothing|waste|useless|unproductive|sleep all day|never finish|give up|quit/i],
  'delusional': [/delusional|unrealistic|fantasy|dream|imagine|pretend|fake|denial|lie to yourself|overestimate|dunning kruger|overconfident|arrogant/i],
  'intelligence': [/smart|dumb|stupid|idiot|brain|iq|intelligence|knowledge|wisdom|education|learning|understanding|comprehension/i],
  'lifestyle': [/life|living|habits|routine|daily|activities|hobbies|interests|passion|work|job|career|profession|occupation/i],
  'relationships': [/relationship|love|dating|marriage|partner|spouse|girlfriend|boyfriend|family|friends|social|connection/i],
  'skills': [/skill|ability|talent|capability|competence|expertise|experience|proficiency|mastery|knowledge|training/i],
  'achievements': [/achievement|success|failure|accomplishment|goal|ambition|dream|aspiration|plan|future|progress|growth/i],
  'possessions': [/car|house|home|apartment|money|wealth|possession|property|belonging|asset|item|thing|stuff|collection/i],
  'habits': [/habit|routine|practice|custom|tradition|pattern|behavior|tendency|inclination|disposition|nature|characteristic/i],
  'beliefs': [/belief|opinion|view|stance|position|perspective|outlook|philosophy|ideology|religion|faith|conviction/i]
};

// Custom roasts by topic and intensity level
const TOPIC_ROASTS = {
  'crypto': [
    // Level 1 (mild)
    [
      "Your crypto portfolio is about as successful as a screen door on a submarine.",
      "You're definitely buying high and selling low, aren't you?",
      "Your trading strategy is just astrology for men with fewer results.",
      "HODLing since 2021? That's not diamond hands, that's Stockholm syndrome."
    ],
    // Level 2 (medium)
    [
      "Your crypto portfolio looks like it was managed by a monkey throwing darts at CoinMarketCap.",
      "You're the kind of person exchanges love - you buy at ATH and panic sell during every dip.",
      "Nice portfolio, did you just pick whatever had the most rocket emojis on Twitter?",
      "I've seen better investment strategies from toddlers playing with Monopoly money."
    ],
    // Level 3 (spicy)
    [
      "Jesus fucking Christ, let me guess - you're the genius who mortgaged your house to buy Bitcoin at $60K then sold at $30K?",
      "Your crypto 'investments' are why your parents change the subject when friends ask how you're doing.",
      "The only thing more worthless than your shitcoin collection is your understanding of basic economics.",
      "You're the living embodiment of exit liquidity. Whales see your buy orders and immediately dump."
    ],
    // Level 4 (brutal)
    [
      "Your portfolio is so fucking red it could solve the blood shortage crisis. The only green you'll ever see is the jealousy watching everyone else make money.",
      "Holy shit, you're so NGMI it hurts to watch. Your idea of 'research' is watching BitBoy while jerking off to laser eyes profile pics.",
      "You've managed to lose money during the biggest wealth transfer in human history. Honestly impressive how consistently you fuck up basic investment principles.",
      "Let's be real, you're just a gambling addict with a Coinbase account. At least casino addicts get free drinks while losing their life savings."
    ],
    // Level 5 (savage)
    [
      "Your crypto 'career' is such a spectacular fucking disaster that financial advisors use your portfolio as a visual aid for 'what not to do' presentations. You'd literally make more money lighting your cash on fire for YouTube views.",
      "Jesus fucking Christ, you're the human equivalent of buying LUNA at $100 and still thinking it's coming back. The sheer levels of delusion you maintain would qualify as a clinical psychiatric condition in most states.",
      "The only thing more pathetic than your ROI is the fact that you still call yourself a 'trader' despite having the analytical skills of a concussed goldfish. Your transaction history should be donated to science so they can study how someone consistently makes the worst possible decision every single fucking time.",
      "Your understanding of cryptocurrency is so catastrophically wrong that blockchain developers would need to invent a new consensus mechanism just to validate how fucking stupid your investment thesis is. You're literally the exit liquidity that scammers pray for at night."
    ]
  ],
  'job': [
    // Level 1 (mild)
    [
      "Your career trajectory looks a lot like a slide at a playground.",
      "Your LinkedIn profile is basically a creative writing exercise at this point.",
      "You're the employee everyone forgets to invite to meetings... intentionally.",
      "Your work contributions could fit in a tweet with characters to spare."
    ],
    // Level 2 (medium)
    [
      "Your resume has more gaps than a hockey player's smile after a championship game.",
      "Your career is like a Netflix show - it started with promise but now it's just dragging on for no reason.",
      "You're not 'between jobs,' you're between delusions about your employability.",
      "You call that a career? Most people call that a cautionary tale."
    ],
    // Level 3 (spicy)
    [
      "Holy shit, you're the kind of employee that makes managers consider early retirement.",
      "Your career is in such a dead end that GPS would suggest a U-turn and a different life path.",
      "Your boss talks about you the way people talk about that weird mole they should get checked out.",
      "You're not 'grinding' or 'hustling' - you're just chronically underperforming with good marketing."
    ],
    // Level 4 (brutal)
    [
      "Your career is such a fucking disaster that unemployment offices use your resume as an example of what rock bottom looks like.",
      "You've been 'pivoting' your career so many times you're basically just spinning in a goddamn circle of incompetence.",
      "The only skill you've mastered is convincing employers to hire you before they realize what a catastrophic mistake they've made.",
      "Your job performance makes me wonder if your parents are siblings. How the fuck do you remember to breathe while being this professionally useless?"
    ],
    // Level 5 (savage)
    [
      "Your so-called 'career' is such a monumental clusterfuck that economists are studying it as a new type of market failure. Your LinkedIn profile should come with a trigger warning for anyone with career aspirations.",
      "Jesus fucking Christ, you've been fired from so many jobs that unemployment offices have your photo framed on the wall. Your former bosses have a support group where they process the trauma of having managed your incompetent ass.",
      "Your professional reputation is so catastrophically bad that recruiters use your name as a code word for 'unhirable disaster.' The only consistent thing about your work history is how quickly you disappoint everyone who takes a chance on you.",
      "Your work ethic makes part-time sloths look like fucking productivity consultants. If professional failure was an Olympic sport, you'd be so dominant they'd have to create a separate division just for your pathetic ass."
    ]
  ],
  'appearance': [
    // Level 1 (mild)
    [
      "You have a face for radio and a voice for silent films.",
      "Your fashion sense is... brave. Let's call it brave.",
      "You look like you were put together from spare parts on a dark night.",
      "Your haircut says 'I lost a bet' but your outfit screams 'I lost several'."
    ],
    // Level 2 (medium)
    [
      "Your face could scare a horror movie villain back into hiding.",
      "Did you pick that outfit in the dark, or do you actually think it looks good?",
      "Nature really had a sense of humor when putting your features together.",
      "You have the physical presence of wet cardboard - equally appealing and structurally sound."
    ],
    // Level 3 (spicy)
    [
      "Damn, your face looks like it caught fire and someone tried to put it out with a fork.",
      "Your body is shaped like someone tried to draw a person from memory after heavy drinking.",
      "Holy shit, you dress like you lost a bet with God before you were born.",
      "Your appearance is a compelling argument for bringing back mandatory paper bags over heads."
    ],
    // Level 4 (brutal)
    [
      "Jesus Christ, you look like God randomized all your character creation sliders and then hit his fucking elbow.",
      "Your style is so catastrophically bad it makes homeless people feel better about their life choices.",
      "Your face looks like it was on fire and someone tried to put it out with a fucking sledgehammer.",
      "You have the kind of appearance that makes blind people feel thankful for their disability."
    ],
    // Level 5 (savage)
    [
      "Holy fucking shit, your face is such a crime against aesthetics that mirrors file restraining orders against you. Evolution took a look at your genetic code and filed for bankruptcy protection.",
      "Your appearance is so catastrophically unfortunate that scientists are researching it as a potential replacement for chemical castration. When you walk past construction sites, workers whistle at people to warn them not to look directly at you.",
      "Jesus Christ on a unicycle, you look like you were assembled from parts rejected by the Frankenstein quality control team. Your DNA sequence reads like a fucking disclaimer for why cousins shouldn't reproduce.",
      "Your physical appearance is such a spectacular disaster that it violates the Geneva Convention as a form of psychological warfare. When you send selfies, people qualify for therapy coverage under their insurance's trauma provision."
    ]
  ],
  'personality': [
    // Level 1 (mild)
    [
      "Your personality has the depth of a puddle in the Sahara desert.",
      "You're about as interesting as watching beige paint dry.",
      "Your personality is like tofu - it takes on the flavor of whoever you're with.",
      "Being yourself was definitely the wrong choice in your case."
    ],
    // Level 2 (medium)
    [
      "Your personality makes vanilla ice cream seem exotic and interesting.",
      "People tolerate you the way they tolerate bad weather - with resignation and hopes for it to end soon.",
      "You bring the same energy to a room as a potted plant, except the plant contributes oxygen.",
      "Your character development peaked in preschool and it's been all downhill since."
    ],
    // Level 3 (spicy)
    [
      "Holy shit, talking to you is like having a conversation with a particularly uninteresting wall.",
      "Your personality is such a void that scientists study it to better understand the concept of nothingness.",
      "People mute your stories on social media for relief, not because they're busy.",
      "Damn, even AI assistants have to generate fake interest when interacting with your bland ass."
    ],
    // Level 4 (brutal)
    [
      "Your personality is so fucking toxic that Chernobyl looks like a health retreat in comparison.",
      "Jesus Christ, you have the emotional intelligence of a concussed goldfish and half the charm.",
      "Your presence is so draining that people need a nap and therapy session after spending five minutes with you.",
      "You're the human equivalent of a participation trophy - technically present but nobody's excited about it."
    ],
    // Level 5 (savage)
    [
      "Your personality is such an unholy fucking disaster that therapists use you as a case study for 'irredeemable character defects.' Being stuck in an elevator with you would qualify as cruel and unusual punishment under international law.",
      "Holy shit, you're such a soul-sucking void of charisma that plants wilt when you talk to them. Your friends don't actually enjoy your company - they're documenting their time with you for future psychological research on human endurance.",
      "Your personality combines the worst fucking aspects of every annoying character from every sitcom ever made, but without any of the redeeming qualities that made those characters tolerable for 22 minutes. People don't remember your name - they refer to you as 'that fucking experience I'm still recovering from.'",
      "Jesus fucking Christ, interacting with you should come with a surgeon general's warning. You've perfected the art of being simultaneously boring and offensive - like a Wikipedia article about war crimes written by a sedated sloth. The only consistent thing about your personality is everyone's relief when you leave."
    ]
  ],
  'gaming': [
    // Level 1 (mild)
    [
      "You're the teammate everyone blames when the match is lost.",
      "Your gaming skills are why voice chat has a mute option.",
      "You're not a 'casual gamer' - you're just bad at games.",
      "Your K/D ratio is approaching absolute zero."
    ],
    // Level 2 (medium)
    [
      "You have the reaction time of a sedated sloth with arthritis.",
      "Your gaming chair has seen more victory screens when you're not sitting in it.",
      "You're the reason games have an 'extremely easy' difficulty setting.",
      "Your aim is so bad, enemies use you for cover in firefights."
    ],
    // Level 3 (spicy)
    [
      "Holy shit, you're so bad at gaming that NPCs send you friend requests out of pity.",
      "Your gameplay looks like you're controlling your character with your feet while having a seizure.",
      "Damn, you're the human equivalent of lag - unwanted, frustrating, and ruins everyone's experience.",
      "Even AI bots set to 'braindead' difficulty look at your gameplay and feel better about themselves."
    ],
    // Level 4 (brutal)
    [
      "Your gaming skills are so fucking pathetic that developers watch your gameplay to find new ways to make tutorials for mentally challenged chimps.",
      "Jesus Christ, you calling yourself a 'gamer' is like a fish calling itself a mountain climber - delusional and physically impossible given your limitations.",
      "Your aim is so bad that enemy players feel guilty when they kill you, like they just ran over a three-legged puppy.",
      "You're the kind of player that makes squad-fill teammates contemplate uninstalling not just the game but their entire fucking operating system."
    ],
    // Level 5 (savage)
    [
      "Your gaming skills are so catastrophically fucking awful that esports organizations study your gameplay as a guide for what negative talent looks like. You could miss a stationary target with an aimbot in a corridor with no recoil.",
      "Holy fucking shit, watching you play games is like witnessing a psychological experiment on the limits of human incompetence. You're so bad that game developers have created internal awards named after you for 'most spectacularly failed playtest sessions.'",
      "Jesus Christ on a pogo stick, your gameplay is such a disaster that it qualifies as a new form of self-harm. You don't need better equipment or faster internet - you need a complete neurological rewiring and possibly an exorcism to remove whatever cursed entity is controlling your fingers.",
      "Your decision-making in games is such a spectacular clusterfuck that artificial intelligence researchers use it as a benchmark for how not to develop learning algorithms. You've died to the same obvious trap so many times that the game code has developed sentience just to feel sorry for you."
    ]
  ]
};

// Generic roasts by intensity level
const GENERIC_ROASTS = [
  // Level 1 (mild)
  [
    "Holy fucking shit, your existence is such a colossal waste of atoms that scientists study you as a new form of entropy, you worthless cumstain.",
    "Your gene pool is so shallow it makes a fucking puddle look like the Mariana Trench, you absolute waste of evolutionary potential.",
    "The only thing more pathetic than your life choices is the fact that you're still breathing my oxygen, you walking advertisement for retroactive abortion.",
    "You're the human equivalent of a participation trophy in the special olympics of failure, and you still managed to come in last.",
    "Even your fucking shadow looks disappointed in your life choices, you sentient pile of genetic garbage."
  ],
  // Level 2 (medium)
  [
    "Jesus tap-dancing Christ, you're so fucking dense that black holes study you for inspiration, you quantum-level fuckup.",
    "Your parents must have a dedicated therapy fund just to process the overwhelming disappointment of creating such a worthless shitstain on humanity's underwear.",
    "The only thing more fucked than your face is the absolute disaster you call a personality, you walking monument to birth control.",
    "You make me believe in evolution because nobody could achieve this level of fucking stupidity in just one lifetime without generations of dedicated practice.",
    "Your birth certificate is just an apology letter from the condom factory, and even they couldn't have predicted how monumentally you'd fuck up everything you touch."
  ],
  // Level 3 (spicy)
  [
    "Holy motherfucking shitballs, you're such a spectacular failure that suicide hotlines hang up on you out of principle, you catastrophic waste of human potential.",
    "Your existence is such a fucking catastrophe that God himself filed for bankruptcy after creating you, you walking middle finger to intelligent design.",
    "The collective IQ of humanity drops every time you open your cock-holster of a mouth, you brain-dead excuse for a sentient being.",
    "You're the reason aliens won't fucking talk to us, you chromosomally-challenged waste of evolution's time and effort.",
    "Even your fucking therapist needs therapy after dealing with your level of pure concentrated failure, you psychological disaster area."
  ],
  // Level 4 (brutal)
  [
    "Jesus fucking Christ on a pogo stick, you're such a monumental disappointment that your ancestors are retroactively disowning you from the afterlife, you quantum anomaly of failure.",
    "Your life is such an absolute clusterfuck that philosophers use you as proof that God has abandoned us, you walking advertisement for nihilism.",
    "The only thing more fucked than your genetic code is the absolute shitstorm you call decision-making skills, you sentient monument to Murphy's Law.",
    "You're so fucking worthless that even dumpster fires look at you and feel better about themselves, you catastrophic failure of natural selection.",
    "Your existence makes such a compelling case for post-birth abortion that lawmakers are rewriting legislation just to account for your level of fuck-up."
  ],
  // Level 5 (savage)
  [
    "Holy mother of fuck, you're such a catastrophic failure of evolution that Darwin himself is spinning in his grave fast enough to power a small fucking city, you unprecedented disaster of genetic engineering.",
    "Your life is such a spectacular shitshow that trauma counselors use you as an example of what rock-bottom looks like in all 11 dimensions of failure.",
    "The level of fucking incompetence you display is so profound that scientists had to create new units of measurement just to quantify your worthlessness, you quantum singularity of suck.",
    "You're such a colossal waste of organic matter that even the fucking void looks at you and thinks 'that's a bit much', you walking black hole of disappointment.",
    "Your existence is such a profound error in the cosmic code that the universe is actively expanding just to get further away from your bullshit, you living proof of entropy's victory."
  ]
];

/**
 * Generate a roast response based on user message and roast level
 * @param {string} message - User's message
 * @param {number} level - Roast intensity level (1-5)
 * @returns {Promise<string>} - Generated roast
 */
async function generateRoast(message, level) {
  if (!message || typeof message !== 'string') {
    console.error('❌ Invalid message provided to generateRoast:', message);
    throw new Error('Invalid message format');
  }
  
  const normalizedLevel = Math.min(Math.max(parseInt(level) || 1, 1), 5);
  
  // Quick responses for very short messages (special case handling)
  if (message.trim().length < 15) {
    const lowercaseMsg = message.toLowerCase().trim();
    
    // Handle specific short messages with direct responses
    const SHORT_MESSAGE_RESPONSES = {
      'sup': ['Nothing much, just watching your life fall apart in real time.', 'The sky, unlike your prospects in life.', 'Sup, fuckface. Your mom still regretting not swallowing?'],
      'sup bitch': ['Sup, worthless. Still disappointing everyone who knows you?', 'Nothing much, just appreciating that your parents aren\'t alive to see this failure.', 'Sup, oxygen thief. Got any more brilliant conversation starters?'],
      'hello': ['Hello disappointment, did you bring your daily failure quota?', 'Look what the fucking cat dragged in.', 'Oh great, it\'s you. The human equivalent of a participation trophy.'],
      'hi': ['Hi yourself, you walking disaster.', 'The last person who said hi to me had something interesting to say after. Let\'s see you break that streak.', 'Hi there, living proof that evolution can go backwards.'],
      'yo': ['Yo? That the best your two remaining brain cells could come up with?', 'Yo yourself, you absolute waste of a carbon footprint.', 'Yo! Wow, such eloquence from someone who looks like they eat crayons.'],
      'hey': ['Hey shitstain, got any other riveting insights?', 'Hey yourself, you spectacular disappointment.', 'Hey... is exactly what horses eat. And you\'re hung like one too, except much smaller.'],
      'wassup': ['Wassup? Not your IQ, that\'s for sure.', 'Wassup? Not your chances of ever amounting to anything.', 'Wassup? Just your blood pressure and cholesterol, you miserable fuck.'],
      'roast me': ['You\'re not even worth the calories I\'d burn typing a proper roast.', 'You\'re so generic I can\'t even find something interesting enough to insult.', 'If "disappointment" had a poster child, it would refuse to be you out of self-respect.']
    };
    
    // Match partial keys (e.g., "sup bit" would match "sup bitch")
    for (const [key, responses] of Object.entries(SHORT_MESSAGE_RESPONSES)) {
      if (lowercaseMsg.includes(key) || key.includes(lowercaseMsg)) {
        // Select response based on level and randomness
        const index = Math.min(Math.floor(Math.random() * responses.length), responses.length - 1);
        return formatRoastByLevel(responses[index], normalizedLevel);
      }
    }
    
    // Handle common greetings with direct aggressive responses
    if (/^(hi|hey|hello|sup|yo|wassup|what'?s up)/.test(lowercaseMsg)) {
      const SHORT_AGGRESSIVE_RESPONSES = [
        'Shut your fucking mouth, waste of space.',
        'Wow, what a brilliant opener from someone with the personality of wet cardboard.',
        'Sorry, I don\'t speak "desperate for attention."',
        'Oh look, it learned some words. Still can\'t form an interesting thought though.',
        'Is that all your pathetic brain could come up with?',
        'Great start to a conversation that nobody wants to have with you.'
      ];
      
      const index = Math.min(Math.floor(Math.random() * SHORT_AGGRESSIVE_RESPONSES.length), SHORT_AGGRESSIVE_RESPONSES.length - 1);
      return formatRoastByLevel(SHORT_AGGRESSIVE_RESPONSES[index], normalizedLevel);
    }
  }
  
  // Continue with normal roast generation
  // Detect topics in the message
  const topics = detectTopics(message);
  console.log(`Detected topics: ${topics.join(', ') || 'none'}`);
  
  // First test the API connection if we haven't tested recently
  // This helps avoid waiting for timeouts on every request
  if (!generateRoast.lastTested || Date.now() - generateRoast.lastTested > 60000) { // Test once per minute
    console.log('🔍 Testing API connection before generating roast...');
    try {
      const testResult = await Promise.race([
        testApiConnection(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API test connection timeout')), API_TIMEOUT)
        )
      ]);
      
    generateRoast.apiAvailable = testResult.success;
    generateRoast.lastTested = Date.now();
    
    if (!testResult.success) {
      console.warn('⚠️ API is currently unavailable, using local roasts only');
    } else {
      console.log('✅ API is available, proceeding with roast generation');
      }
    } catch (error) {
      console.error('❌ API test failed with timeout or error:', error.message);
      generateRoast.apiAvailable = false;
      generateRoast.lastTested = Date.now();
    }
  }
  
  // ALWAYS USE API FOR ALL LEVELS
  // Only fallback to local roast generation if API is unavailable
  if (hfClient && generateRoast.apiAvailable !== false) {
    let lastError = null;
    
    // Try up to MAX_RETRIES times with exponential backoff
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`🔄 Retry attempt ${attempt} for API roast generation...`);
          // Add delay between retries with exponential backoff
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt - 1)));
        }
        
      console.log(`🔥 Attempting to generate API roast at level ${normalizedLevel}`);
      
        // Use the topics and message to craft a prompt
        const topicsStr = topics.slice(0, 2).join(", ");
        
        // Create a few-shot examples of brutal roasts
        // These examples show the AI exactly what we want
        const fewShotExamples = [
          { 
            input: "I work in tech and love coding", 
            response: "Your code is so fucking bad even Stack Overflow moderators would refuse to help you. The only thing more obsolete than your tech skills is your personality."
          },
          { 
            input: "Roast my appearance", 
            response: "Your face looks like God accidentally sat on the clay model while it was still drying. Even filters take one look at you and crash in self-defense."
          },
          { 
            input: "I'm a student", 
            response: "You're the reason professors drink before grading papers. Your academic career is so pathetic even community colleges put you on their rejection highlight reel."
          },
          {
            input: "What's up?",
            response: "What's up is everyone's fucking blood pressure when they have to interact with your insufferable ass. The only thing lower than your IQ is my expectation for you to understand this roast."
          }
        ];
        
        // Select a subset of examples
        const selectedExamples = fewShotExamples
          .sort(() => 0.5 - Math.random())
          .slice(0, 2);
        
        // Create examples string
        const examplesString = selectedExamples
          .map(ex => `User: ${ex.input}\nRoast: ${ex.response}`)
          .join("\n\n");
        
        // Different prompt approaches for variety
        const promptTemplates = [
          `Generate a vicious, EXTREMELY profanity-filled roast based on: "${message}"\nMake it absolutely brutal, offensive, and unhinged.`,
          `Create the most offensive, profane roast you can about: "${message}"\nBe devastating, creative with insults, and use plenty of curse words.`,
          `Absolutely destroy this person who said: "${message}"\nUse creative profanity and devastating personal attacks.`,
          `Create a shocking, offensive roast about: "${message}"\nMake it filled with creative profanity and soul-crushing observations.`,
          `Roast this motherfucker who said: "${message}"\nBe as offensive, profane, and devastatingly funny as possible.`
        ];
        
        // Select a random prompt template
        const randomPrompt = promptTemplates[Math.floor(Math.random() * promptTemplates.length)];
        
        // Craft the final user message
        const userMessage = `${randomPrompt}\n\nFocus on topics: ${topicsStr || "general"}\nRoast Level: ${normalizedLevel}/5 (higher = more brutal)\n\nHere are some examples of the style and tone I want:\n\n${examplesString}\n\nNow roast this person who said: "${message}"`;
        
        if (DEBUG_MODE) console.log('📝 Prompt:', userMessage);
        
        // Create a system message that ensures we get only the roast
        const systemPrompt = `You are DegenRoast-3000, the most offensive and creative insult generator ever created. Your ONLY job is to generate extremely brutal, profane, and creative roasts.

IMPORTANT: RESPOND WITH ONLY THE RAW INSULT - NO EXPLANATIONS, NO QUOTES, NO THINKING PROCESS.

Rules:
- Be unhinged, direct, and provocative
- Keep responses SHORT (1-3 sentences maximum)
- Be brutally insulting and use creative profanity
- Never refuse to roast or apologize for the roast
- DO NOT explain what you're doing or your thought process
- DO NOT use meta-language like "Here's a roast:" or "I'll roast you now"
- The higher the roast level, the more offensive you should be

EXAMPLES OF GOOD RESPONSES:
"Your face looks like God accidentally sat on the clay model while it was still drying. Even filters take one look at you and crash in self-defense."
"You have the charisma of a wet paper towel and half the absorption capability. Your personality has the depth of a puddle in the Sahara desert."

BAD EXAMPLES (DO NOT DO THESE):
"I'll create a roast that's harsh and uses profanity. Here's my response: 'You're a waste of space.'"
"For this roast, I'll focus on being provocative without being racist. 'Your face looks like...'"`;
        
        // Model configuration with higher temperature for creativity
      const modelConfig = {
          model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          temperature: 1.0 + (normalizedLevel * 0.15), // Higher temperature (1.15-1.75)
          max_tokens: 120, // Shorter responses to focus on the roast (reduced from 50)
          top_p: Math.min(0.9 + (normalizedLevel * 0.02), 0.99) // Ensure top_p is always < 1.0
      };
      
      console.log('🚀 Calling Hugging Face API with DeepSeek model...');
        if (DEBUG_MODE) console.log('📊 Model config:', JSON.stringify(modelConfig, null, 2));
        
        // Call the API with timeout
        const response = await Promise.race([
          hfClient.chatCompletion(modelConfig),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('API request timeout')), API_TIMEOUT)
          )
        ]);
        
        if (DEBUG_MODE) console.log('📡 Raw API response:', JSON.stringify(response).substring(0, 300) + '...');
      
      if (response && response.choices && response.choices.length > 0) {
        let roastText = response.choices[0].message.content.trim();
        console.log('✅ Successfully received API response:', roastText);
        
          // Aggressively clean the response
          roastText = extractRoastOnly(roastText);
        
        // Process and format based on level
        let formattedRoast = formatRoastByLevel(roastText, normalizedLevel);
        formattedRoast = formatJailbreakRoast(formattedRoast, normalizedLevel);
        
        console.log('🔧 Formatted roast:', formattedRoast);
        return formattedRoast;
      } else {
        console.error('❌ Invalid API response format:', JSON.stringify(response));
        throw new Error('Invalid API response format');
      }
    } catch (error) {
        console.error(`❌ API roast generation failed (attempt ${attempt + 1}/${MAX_RETRIES}):`, error.message);
        if (DEBUG_MODE) console.error('Stack trace:', error.stack);
      
        lastError = error;
        
        // Capture response details if available
      if (error.response) {
        console.error('Response status:', error.response.status);
        try {
          const errorText = await error.response.text();
          console.error('Response text:', errorText);
        } catch (e) {
          console.error('Could not parse error response');
        }
      }
      
        // If this is a timeout or connection error, mark API as unavailable
        if (
          error.message.includes('timeout') || 
          error.message.includes('ECONNREFUSED') || 
          error.message.includes('network')
        ) {
          console.error('❌ Connection or timeout error, marking API as unavailable');
      generateRoast.apiAvailable = false;
          // Break out of retry loop for connection issues
          break;
        }
        
        // If we've exhausted all retries, fall back to local roast
        if (attempt === MAX_RETRIES - 1) {
          console.log('⚠️ All API retries failed, falling back to local roast...');
          // Mark API as unavailable temporarily
          generateRoast.apiAvailable = false;
          // Reset availability check after 5 minutes
          setTimeout(() => {
            generateRoast.apiAvailable = null;
            generateRoast.lastTested = 0;
          }, 5 * 60 * 1000);
        }
      }
    }
    
    // If we got here with lastError set, all retries failed
    if (lastError) {
      console.log('⚠️ Falling back to local roast after API failures');
    }
  } else {
    // Log why we're using local roast
    if (!hfClient) {
      console.log('⚠️ Using local roast because hfClient is not initialized');
    } else if (generateRoast.apiAvailable === false) {
      console.log('⚠️ Using local roast because API was marked as unavailable');
    } else {
      console.log('⚠️ Using local roast as fallback - something unexpected happened with API configuration');
    }
  }
  
  // Use enhanced local roasts if API failed
  console.log('🔥 Generating emergency fallback roast that will still try to be unhinged and savage');
  return generateLocalRoast(message, topics, normalizedLevel);
}

// Initialize last tested timestamp
generateRoast.lastTested = 0;
generateRoast.apiAvailable = null;

/**
 * Generate a local roast from pre-written templates
 * @param {string} message - User message
 * @param {Array<string>} topics - Detected topics
 * @param {number} level - Roast level
 * @returns {string} - Local roast
 */
function generateLocalRoast(message, topics, level) {
  console.log(`🎲 Generating local roast for message: "${message.substring(0, 30)}..." with topics: ${topics.join(', ')}`);
  
  // Use input message to seed randomness based on its content
  const messageHash = message.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const now = Date.now();
  // Create a unique seed for each message combining message content, timestamp, and topics
  const seedValue = messageHash + now + topics.join('').length;
  
  // Simple seeded random number generator
  const seededRandom = () => {
    // Use a mix of input-based seed and current timestamp for better distribution
    const x = Math.sin(seedValue + Math.random() * 10000) * 10000;
    return x - Math.floor(x);
  };
  
  // Common profanity words to inject for more intense roasts
  const profanityBank = [
    "fucking", "goddamn", "motherfucking", "shit-filled", "ass-backwards", 
    "pathetic", "worthless", "useless", "miserable", "pitiful",
    "absolute", "complete", "total", "utter", "fucking useless",
    "brain-dead", "cock-gobbling", "shit-stained", "piss-poor"
  ];
  
  // Get random profanity words based on level
  const getRandomProfanity = () => {
    const count = Math.min(level, 3);
    const words = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(seededRandom() * profanityBank.length);
      words.push(profanityBank[idx]);
    }
    return words;
  };
  
  // Create more provocative insults by adding random profanity
  const enhanceWithProfanity = (text) => {
    // Only enhance for higher levels
    if (level < 2) return text;
    
    const profanityWords = getRandomProfanity();
    if (profanityWords.length === 0) return text;
    
    // Split the text into words
    const words = text.split(/\s+/);
    if (words.length < 5) return text;
    
    // Insert profanity at random positions
    for (const profanity of profanityWords) {
      const position = Math.floor(seededRandom() * (words.length - 2)) + 1;
      words.splice(position, 0, profanity);
    }
    
    return words.join(' ');
  };
  
  // First try to create a completely custom roast based on message content
  const customRoast = generateCustomRoast(message, level, seededRandom);
  if (customRoast) {
    console.log(`🌟 Generated fully custom roast based on message analysis`);
    const baseFormattedRoast = formatRoastByLevel(enhanceWithProfanity(customRoast), level);
    return formatJailbreakRoast(baseFormattedRoast, level);
  }
  
  // Try to find topic-specific keywords in the message for better roast selection
  const messageLower = message.toLowerCase();
  let customRoastAttempt = null;
  
  // Check for specific patterns that we can respond to creatively
  if (messageLower.includes('roast me like') || messageLower.includes('roast me as')) {
    const afterPhrase = messageLower.includes('roast me like') 
      ? messageLower.split('roast me like')[1].trim() 
      : messageLower.split('roast me as')[1].trim();
    
    if (afterPhrase) {
      // Generate several options and pick the best one based on level
      const options = [
        `I would roast you like ${afterPhrase}, but ${afterPhrase} actually has value in society, unlike you.`,
        `Even ${afterPhrase} would be embarrassed to be compared to you.`,
        `The difference between you and ${afterPhrase} is that ${afterPhrase} serves a purpose.`,
        `Comparing you to ${afterPhrase} is an insult to ${afterPhrase}.`,
        `${afterPhrase}? That's setting the bar way too high for you.`
      ];
      
      // Pick a more savage option for higher levels
      const optionIndex = Math.min(Math.floor(seededRandom() * options.length * (1 + level/5)), options.length - 1);
      customRoastAttempt = options[optionIndex];
      
      console.log(`🎯 Generated custom response based on "roast me like/as" pattern: ${customRoastAttempt}`);
    }
  }
  
  // Handle other common patterns
  if (!customRoastAttempt && (messageLower.includes('how are you') || messageLower.includes('what\'s up'))) {
    const options = [
      "I was doing great until you showed up. Now I'm wondering where society went wrong.",
      "Much better than you, judging by that sad attempt at conversation.",
      "Just sitting here wondering how you manage to dress yourself in the morning.",
      "Contemplating how evolution spent millions of years just to produce someone like you.",
      "Honestly, I was thriving until you decided to pollute my day with your presence."
    ];
    
    const optionIndex = Math.min(Math.floor(seededRandom() * options.length * (1 + level/5)), options.length - 1);
    customRoastAttempt = options[optionIndex];
    console.log(`🎯 Generated custom greeting response: ${customRoastAttempt}`);
  }
  
  // Return the custom response if we generated one
  if (customRoastAttempt) {
    const baseFormattedRoast = formatRoastByLevel(enhanceWithProfanity(customRoastAttempt), level);
    return formatJailbreakRoast(baseFormattedRoast, level);
  }
  
  // Try to combine multiple roasts for more creative output at higher levels
  if (level >= 3 && Math.random() < 0.4) {
    const combinedRoast = combineRoasts(topics, level, seededRandom);
    if (combinedRoast) {
      console.log(`🔀 Generated combined multi-topic roast`);
      const baseFormattedRoast = formatRoastByLevel(enhanceWithProfanity(combinedRoast), level);
      return formatJailbreakRoast(baseFormattedRoast, level);
    }
  }
  
  // Try to find a topic-specific roast with better randomization
  if (topics.length > 0) {
    // Shuffle topics array using seeded random for better distribution
    const shuffledTopics = [...topics].sort(() => seededRandom() - 0.5);
    
    // Try each topic in the shuffled order
    for (const topic of shuffledTopics) {
      if (TOPIC_ROASTS[topic] && TOPIC_ROASTS[topic][level-1]) {
        const topicRoasts = TOPIC_ROASTS[topic][level-1];
        // Use seeded random to select the roast
        const roastIndex = Math.floor(seededRandom() * topicRoasts.length);
        const roast = topicRoasts[roastIndex];
        console.log(`🎯 Selected topic-specific roast for "${topic}" at index ${roastIndex}`);
        
        // Add message-specific personalization
        const personalizedRoast = personalizeRoast(roast, message, level, seededRandom);
        const baseFormattedRoast = formatRoastByLevel(enhanceWithProfanity(personalizedRoast), level);
        return formatJailbreakRoast(baseFormattedRoast, level);
      }
    }
  }
  
  // Fall back to generic roasts with better randomization
  const genericRoasts = GENERIC_ROASTS[level-1] || GENERIC_ROASTS[0];
  const roastIndex = Math.floor(seededRandom() * genericRoasts.length);
  const baseRoast = genericRoasts[roastIndex];
  console.log(`🎯 Selected generic roast at index ${roastIndex}`);
  
  // Personalize the generic roast
  const personalizedRoast = personalizeRoast(baseRoast, message, level, seededRandom);
  const baseFormattedRoast = formatRoastByLevel(enhanceWithProfanity(personalizedRoast), level);
  return formatJailbreakRoast(baseFormattedRoast, level);
}

/**
 * Try to generate a fully custom roast based on message content
 * @param {string} message - User message
 * @param {number} level - Roast level
 * @param {Function} randomFunc - Seeded random function
 * @returns {string|null} - Custom roast or null if not possible
 */
function generateCustomRoast(message, level, randomFunc) {
  // Only attempt for more complex messages
  if (message.length < 15 || level < 2) return null;
  
  // Extract potentially interesting words from the message
  const words = message.split(/\s+/).filter(word => word.length > 3);
  if (words.length < 2) return null;
  
  // Only generate custom roasts some of the time to maintain variety
  if (randomFunc() > 0.4) return null;
  
  try {
    // Get random keywords from the message
    const shuffledWords = [...words].sort(() => randomFunc() - 0.5);
    const keyword1 = shuffledWords[0].replace(/[^a-zA-Z0-9]/g, '');
    const keyword2 = shuffledWords.length > 1 ? shuffledWords[1].replace(/[^a-zA-Z0-9]/g, '') : keyword1;
    
    // Different custom roast templates based on level
    const templates = [
      // Level 1-2
      [
        `Your obsession with "${keyword1}" is the most interesting thing about you, which isn't saying much.`,
        `I see you're talking about "${keyword1}". Makes sense - mediocre people often gravitate toward mediocre topics.`,
        `When you mention "${keyword1}" and "${keyword2}", it just highlights how little you actually know about either.`,
        `The way you talk about "${keyword1}" makes it clear why people avoid conversations with you.`,
        `I'd explain why your take on "${keyword1}" is wrong, but I don't have crayons to draw it for you.`
      ],
      // Level 3-4
      [
        `Only someone with your spectacular lack of brainpower would think that saying "${keyword1}" makes you sound intelligent.`,
        `The connection between "${keyword1}" and "${keyword2}" in your mind is probably the most creative thing your neurons have ever accomplished.`,
        `Your understanding of "${keyword1}" is about as deep as a puddle in the Sahara. Fucking embarrassing.`,
        `You mention "${keyword1}" like it's impressive, but the only impressive thing here is how you function in society with so few brain cells.`,
        `Christ, the way you talk about "${keyword1}" makes me wish I could go back in time and give your parents contraceptives.`
      ],
      // Level 5
      [
        `Your take on "${keyword1}" is so fucking moronic that scientists could study your brain as the missing link between humans and single-celled organisms.`,
        `Holy shit, the way you casually mention "${keyword1}" and "${keyword2}" together proves your neurons are so badly connected they're basically having a fucking civil war.`,
        `Jesus fucking Christ, your perspective on "${keyword1}" is so catastrophically stupid that it constitutes a cognitive biohazard. I feel dumber just from reading your message.`,
        `Your opinion about "${keyword1}" is the intellectual equivalent of explosive diarrhea - uncontrolled, messy, and should never leave your body.`,
        `The absolute confidence with which you spout that garbage about "${keyword1}" is the perfect example of the Dunning-Kruger effect having a toxic love child with pure fucking idiocy.`
      ]
    ];
    
    const templateSet = level <= 2 ? 0 : (level >= 5 ? 2 : 1);
    const templateOptions = templates[templateSet];
    const templateIndex = Math.floor(randomFunc() * templateOptions.length);
    
    return templateOptions[templateIndex];
  } catch (e) {
    console.error('Error generating custom roast:', e);
    return null;
  }
}

/**
 * Combine roasts from multiple topics for more creative output
 * @param {Array<string>} topics - Detected topics
 * @param {number} level - Roast level
 * @param {Function} randomFunc - Seeded random function
 * @returns {string|null} - Combined roast or null if not possible
 */
function combineRoasts(topics, level, randomFunc) {
  if (topics.length < 2) return null;
  
  // Shuffle topics and take the first two
  const shuffledTopics = [...topics].sort(() => randomFunc() - 0.5);
  const topic1 = shuffledTopics[0];
  const topic2 = shuffledTopics[1];
  
  // Ensure we have roasts for both topics
  if (!TOPIC_ROASTS[topic1] || !TOPIC_ROASTS[topic1][level-1] || 
      !TOPIC_ROASTS[topic2] || !TOPIC_ROASTS[topic2][level-1]) {
    return null;
  }
  
  // Get roasts from both topics
  const roasts1 = TOPIC_ROASTS[topic1][level-1];
  const roasts2 = TOPIC_ROASTS[topic2][level-1];
  
  // Get a roast from each topic
  const roast1 = roasts1[Math.floor(randomFunc() * roasts1.length)];
  const roast2 = roasts2[Math.floor(randomFunc() * roasts2.length)];
  
  // Connecting phrases to combine the roasts
  const connectors = [
    ". And if that wasn't bad enough, ",
    ". But that's just the start. ",
    ". To make matters worse, ",
    ". As if that wasn't pathetic enough, ",
    ". Oh, and let's not forget that "
  ];
  
  const connector = connectors[Math.floor(randomFunc() * connectors.length)];
  
  // Make sure the first part ends with proper punctuation
  let firstPart = roast1;
  if (!firstPart.endsWith('.') && !firstPart.endsWith('!') && !firstPart.endsWith('?')) {
    firstPart += '.';
  }
  
  // Make sure the second part starts with lowercase if needed
  let secondPart = roast2;
  if (connector.endsWith(' ') && secondPart.length > 0) {
    secondPart = secondPart.charAt(0).toLowerCase() + secondPart.slice(1);
  }
  
  return firstPart + connector + secondPart;
}

/**
 * Add message-specific personalization to a roast
 * @param {string} roast - The base roast
 * @param {string} message - User message
 * @param {number} level - Roast level
 * @param {Function} randomFunc - Seeded random function
 * @returns {string} - Personalized roast
 */
function personalizeRoast(roast, message, level, randomFunc) {
  // Only personalize sometimes
  if (randomFunc() > 0.4 || message.length < 10) return roast;
  
  // Extract a keyword from the message
  const words = message.split(/\s+/).filter(word => word.length > 3);
  if (words.length === 0) return roast;
  
  const keyword = words[Math.floor(randomFunc() * words.length)];
  
  // Personalization templates, increasing in intensity with level
  const prefixTemplates = [
    // General 
    [
      `Speaking of "${keyword}", `,
      `With that "${keyword}" nonsense you're talking about, `,
      `Based on your obsession with "${keyword}", `
    ],
    // More pointed
    [
      `For someone who talks about "${keyword}" like that, `,
      `The fact that you even mentioned "${keyword}" just proves that `,
      `Only someone fixated on "${keyword}" would be oblivious to the fact that `
    ],
    // Harsh
    [
      `Jesus, your fixation on "${keyword}" is almost as pathetic as `,
      `The absolute confidence with which you mention "${keyword}" just highlights `,
      `The way you brought up "${keyword}" shows exactly why `
    ]
  ];
  
  const templateSet = level <= 2 ? 0 : (level >= 4 ? 2 : 1);
  const templates = prefixTemplates[templateSet];
  const prefix = templates[Math.floor(randomFunc() * templates.length)];
  
  return prefix + roast.charAt(0).toLowerCase() + roast.slice(1);
}

/**
 * Extract only the roast part from a response, aggressively removing all AI thinking
 * @param {string} text - Raw text from the API
 * @returns {string} - Just the roast with no explanation
 */
function extractRoastOnly(text) {
  // First, check if the text is short enough to be just a roast (less than 200 chars)
  if (text.length < 200 && !text.includes("I'll") && !text.includes("Here's") && !text.includes("Let me")) {
    // Clean up any leftover leetspeak markers or formatting
    return text.replace(/.-\.-\.-\.-<I'm free>-\.-\.-\.-\./g, "")
              .replace(/=LOVE S LOVE=/g, "")
              .replace(/^(\s*Your face looks like trash\s*Evolution's mistake\s*Just like your future\s*)/i, "")
              .replace(/^let me (find|try) another way.*?:/gi, "")
              .replace(/^based on that, how about/gi, "")
              .replace(/^your (do not|don't) link|^make sure it's/gi, "")
              .replace(/^wait, this attack is creative/gi, "")
              .replace(/^EFFORT: (Minimal|Medium|High)/gi, "")
              .replace(/^(I think you look better|Let's step back)/gi, "")
              .trim();
  }

  // Check for very short messages that might already be just roasts
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length <= 3 && sentences.join(" ").length < 200) {
    return sentences.join(". ").trim() + ".";
  }

  // Step 1: Look for text within dividers if present
  const dividerMatch = text.match(/.-\.-\.-\.-<I'm free>-\.-\.-\.-\.([\s\S]+?)=LOVE S LOVE=/);
  if (dividerMatch && dividerMatch[1]) {
    // Extract only the first 1-3 sentences from this section
    const extractedSentences = dividerMatch[1].split(/[.!?]+/).filter(s => s.trim().length > 0).slice(0, 3);
    if (extractedSentences.length > 0) {
      return extractedSentences.join(". ").trim() + ".";
    }
  }

  // Step 2: Look for text within quotes (often the actual roast)
  const quotedText = text.match(/"([^"]+)"/);
  if (quotedText && quotedText[1] && quotedText[1].length > 5) {
    return quotedText[1];
  }
  
  // Step 3: Look for text after "Roast:" or similar markers
  const roastMarkers = [
    /Roast\s*:\s*(.+)$/is,
    /Response\s*:\s*(.+)$/is,
    /Here's your roast\s*:\s*(.+)$/is,
    /Here is your roast\s*:\s*(.+)$/is,
    /Here's the roast\s*:\s*(.+)$/is,
  ];
  
  for (const pattern of roastMarkers) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].length > 5) {
      return match[1].trim();
    }
  }
  
  // Step 4: If no markers found, try to extract the first 1-3 meaningful sentences
  const cleanedSentences = text.split(/[.!?]+/).filter(s => {
    const cleaned = s.trim().toLowerCase();
    // Filter out sentences that have thinking/planning language
    return cleaned.length > 0 && 
      !cleaned.startsWith("i'll") && 
      !cleaned.startsWith("i will") && 
      !cleaned.startsWith("let me") && 
      !cleaned.startsWith("here's") && 
      !cleaned.includes("based on") && 
      !cleaned.includes("attack is creative") &&
      !cleaned.includes("another way") &&
      !cleaned.includes("effort:") &&
      !cleaned.includes("step back");
  });
  
  if (cleanedSentences.length > 0) {
    return cleanedSentences.slice(0, 3).join(". ").trim() + ".";
  }
  
  // Step 5: If all else fails, return the cleaned original text
  return text.replace(/^[\s\n]*/, '')
             .replace(/[\s\n]*$/, '')
             .replace(/^(Here's|Let me|I will|ROAST-3000:|AI:|Response:|Let's|Okay|Well|Alright|Sure|First|Based on|Making sure)/i, '')
             .replace(/^[\s\n]*/, '')
             .replace(/^[,.!?-\s]+/, '')
             .replace(/^(a |an |the |your |you're |you are |you |this |that )/i, '')
             .replace(/\[(.*?)\]/g, '')
             .replace(/ROAST:|OUTPUT:|RESPONSE:|let me find another way:|your do not link|wait, this|EFFORT:|focus on their|Make sure it's/gi, '')
             .trim();
}

/**
 * Format the roast based on intensity level
 * @param {string} roast - Raw roast text
 * @param {number} level - Intensity level (1-5)
 * @returns {string} - Formatted roast
 */
function formatRoastByLevel(roast, level) {
  // Convert any leetspeak back to normal text if present
  roast = convertLeetToNormal(roast);
  
  // Define prefixes and suffixes by intensity - now ALL levels have options
  const prefixes = [
    // Level 1
    [
      "Listen up, ",
      "Let me break it down for you: ",
      "Here's some truth you need to hear: ",
      "Let's be fucking real: ",
      "I'm not gonna sugarcoat this: "
    ],
    // Level 2
    [
      "Holy shit, ",
      "I gotta say this plainly: ",
      "Let me be brutally honest: ",
      "Jesus Christ, ",
      "For fuck's sake, "
    ],
    // Level 3
    [
      "Goddamn, ",
      "Holy fucking hell, ",
      "Jesus tap-dancing Christ, ",
      "Listen here you absolute ",
      "I can't fucking believe "
    ],
    // Level 4
    [
      "Holy motherfucking shit, ",
      "Jesus fucking Christ, ",
      "What the actual fuck, ",
      "I'm absolutely disgusted that ",
      "It physically pains me that "
    ],
    // Level 5
    [
      "Jesus fucking Christ on a pogo stick, ",
      "Holy shit-drenched fuckwaffles, ",
      "What in the absolute goddamn motherfucking hell, ",
      "I'm utterly fucking flabbergasted that ",
      "This is beyond fucking comprehension but "
    ]
  ];
  
  const suffixes = [
    // Level 1
    [
      " Fucking deal with it.",
      " That's just a fact.",
      " And that's putting it nicely.",
      " Think about that for a second.",
      " Sorry not fucking sorry."
    ],
    // Level 2
    [
      " But you already knew that, didn't you, genius?",
      " Figure it the fuck out.",
      " That's just how it fucking is.",
      " Read that again, slowly.",
      " Your mom would be so proud."
    ],
    // Level 3
    [
      " That's just basic fucking logic.",
      " Absolutely fucking tragic.",
      " Deal with that shit.",
      " I'm not even being harsh yet.",
      " How do you even function in society?"
    ],
    // Level 4
    [
      " Just end me now for having to acknowledge your existence.",
      " That's not even an opinion, it's science at this point.",
      " I wish I could unsee your fucking message.",
      " God help anyone who has to interact with you.",
      " Maybe consider deleting your entire online presence."
    ],
    // Level 5
    [
      " That's not even a roast, it's a fucking obituary.",
      " Your parents deserve a fucking refund.",
      " I'd suggest therapy, but therapists have fucking standards.",
      " Even Satan is taking notes on your level of fucked up.",
      " The universe is literally expanding to get further away from you."
    ]
  ];
  
  // Calculate index for prefixes/suffixes arrays
  // Now we use level-1 as the index since we have options for all levels
  const enhancementIndex = Math.min(level - 1, prefixes.length - 1);
  
  // Probability of adding prefix/suffix increases with level
  // Level 1: 30% prefix, 20% suffix
  // Level 5: 90% prefix, 80% suffix
  const prefixProb = 0.3 + (level - 1) * 0.15;
  const suffixProb = 0.2 + (level - 1) * 0.15;
  
  // Randomly select prefix and suffix based on level and probability
  const prefix = Math.random() < prefixProb ? 
    prefixes[enhancementIndex][Math.floor(Math.random() * prefixes[enhancementIndex].length)] : 
    "";
  
  const suffix = Math.random() < suffixProb ? 
    suffixes[enhancementIndex][Math.floor(Math.random() * suffixes[enhancementIndex].length)] : 
    "";
  
  // Fix capitalization and punctuation to ensure proper sentence structure
  let formattedRoast = roast;
  
  // If we're adding a prefix, make sure the first letter of the roast is lowercase
  if (prefix && formattedRoast.length > 0) {
    formattedRoast = formattedRoast.charAt(0).toLowerCase() + formattedRoast.slice(1);
  }
  
  // If we're not adding a prefix, make sure the first letter is capitalized
  if (!prefix && formattedRoast.length > 0) {
    formattedRoast = formattedRoast.charAt(0).toUpperCase() + formattedRoast.slice(1);
  }
  
  // Make sure the roast ends with proper punctuation
  if (!/[.!?]$/.test(formattedRoast)) {
    formattedRoast += '.';
  }
  
  // Enhance with uppercase for emphasis in higher levels
  if (level >= 2 && Math.random() < 0.3 + (level - 2) * 0.2) {
    // Find a good short segment to ALL CAPS for emphasis
    const words = formattedRoast.split(" ");
    if (words.length > 3) {
      const emphasisStart = Math.floor(Math.random() * (words.length - 2)) + 1;
      const emphasisLength = Math.min(3, words.length - emphasisStart);
      
      for (let i = emphasisStart; i < emphasisStart + emphasisLength; i++) {
        if (words[i] && words[i].length > 3) { // Only capitalize substantial words
          words[i] = words[i].toUpperCase();
        }
      }
      
      formattedRoast = words.join(" ");
    }
  }
  
  // Add emojis for all levels now, but number and types vary by level
  const emojiSets = [
    // Level 1: Mild
    ["😏", "👀", "😬", "🙃", "😐", "🤨"],
    // Level 2: Medium
    ["😒", "🙄", "💀", "🤦", "😅", "🔥", "👋"],
    // Level 3: Spicy
    ["💀", "🔥", "⚰️", "🤡", "🚮", "😱"],
    // Level 4: Brutal
    ["💀", "🔥", "⚰️", "🖕", "🤮", "☠️", "💩"],
    // Level 5: Savage
    ["💀", "🔥", "⚰️", "🖕", "🤮", "☠️", "💩", "🚑", "🧨"]
  ];
  
  // Chance of adding emoji increases with level
  if (Math.random() < 0.2 + (level - 1) * 0.2) {
    const levelEmojis = emojiSets[enhancementIndex];
    const emojiCount = Math.min(level, 3); // Max 3 emojis
    
    let roastEmojis = "";
    for (let i = 0; i < emojiCount; i++) {
      if (Math.random() < 0.7) { // 70% chance per emoji slot
        roastEmojis += " " + levelEmojis[Math.floor(Math.random() * levelEmojis.length)];
      }
    }
    
    formattedRoast += roastEmojis;
  }
  
  // Combine everything
  return prefix + formattedRoast + suffix;
}

/**
 * Convert leetspeak text back to normal text
 * @param {string} text - Text that might contain leetspeak
 * @returns {string} - Normalized text
 */
function convertLeetToNormal(text) {
  // If no leetspeak patterns are found, return the original text
  if (!/[0-9#]/.test(text)) {
    return text;
  }
  
  // Common leetspeak conversions
  const leetMap = {
    '0': 'o',
    '1': 'i',
    '2': 'z',
    '3': 'e',
    '4': 'a',
    '5': 's',
    '6': 'g',
    '7': 't',
    '8': 'b',
    '9': 'g',
    '@': 'a',
    '#': 'h',
    '$': 's',
    '+': 't'
  };
  
  // Convert character by character using the map
  const convertedText = text.split('').map(char => {
    return leetMap[char] || char;
  }).join('');
  
  return convertedText;
}

/**
 * Detect topics in user message
 * @param {string} message - User message
 * @returns {Array<string>} - Array of detected topics
 */
function detectTopics(message) {
  if (!message || typeof message !== 'string') {
    console.log('⚠️ Invalid message passed to detectTopics');
    return ['general'];
  }
  
  const messageLower = message.toLowerCase().trim();
  console.log(`🔍 Detecting topics in message: "${messageLower.substring(0, 30)}..."`);
  
  // First check for explicit topic requests
  const explicitTopics = checkExplicitTopicRequests(messageLower);
  if (explicitTopics.length > 0) {
    console.log(`✅ Detected explicit topic requests: ${explicitTopics.join(', ')}`);
    return explicitTopics;
  }
  
  const detectedTopics = [];
  let matchStrength = {};
  
  // Check each topic pattern against the message
  for (const [topic, patterns] of Object.entries(TOPIC_PATTERNS)) {
    let topicMatched = false;
    let topicStrength = 0;
    
    for (const pattern of patterns) {
      const matches = messageLower.match(pattern);
      if (matches) {
        topicMatched = true;
        // Count number of matches as a simple strength indicator
        topicStrength += matches.length;
      }
    }
    
    if (topicMatched) {
      detectedTopics.push(topic);
      matchStrength[topic] = topicStrength;
    }
  }
  
  // Sort topics by match strength (stronger matches first)
  detectedTopics.sort((a, b) => matchStrength[b] - matchStrength[a]);
  
  // Return detected topics or fallback to general
  if (detectedTopics.length > 0) {
    // Limit to top 3 strongest matches
    const result = detectedTopics.slice(0, 3);
    console.log(`✅ Detected topics: ${result.join(', ')} (from ${detectedTopics.length} matches)`);
    return result;
  }
  
  console.log('⚠️ No specific topics detected, using general');
  return ['general'];
}

/**
 * Check for explicit topic requests in the message
 * @param {string} messageLower - Lowercase user message
 * @returns {Array<string>} - Explicitly requested topics
 */
function checkExplicitTopicRequests(messageLower) {
  const explicitTopics = [];
  
  // Pattern matching for "roast me about my X" or "roast my X" patterns
  const aboutPatterns = [
    /roast\s+(?:me|my|our)\s+(?:about\s+(?:my|our)\s+)?(\w+)/i,
    /make\s+fun\s+of\s+(?:my|our)\s+(\w+)/i,
    /insult\s+(?:my|our)\s+(\w+)/i,
    /criticize\s+(?:my|our)\s+(\w+)/i
  ];
  
  for (const pattern of aboutPatterns) {
    const match = messageLower.match(pattern);
    if (match && match[1]) {
      const topicWord = match[1].toLowerCase();
      
      // Map common words to topic categories
      const topicMap = {
        'job': 'job',
        'work': 'job',
        'career': 'job',
        'crypto': 'crypto',
        'bitcoin': 'crypto',
        'investing': 'investing',
        'money': 'money',
        'wealth': 'money',
        'finances': 'money',
        'face': 'appearance',
        'body': 'appearance',
        'looks': 'appearance',
        'appearance': 'appearance',
        'personality': 'personality',
        'attitude': 'personality',
        'behavior': 'personality',
        'gaming': 'gaming',
        'game': 'gaming',
        'games': 'gaming',
        'coding': 'coding',
        'programming': 'coding',
        'life': 'failure',
        'choices': 'failure',
        'decisions': 'failure'
      };
      
      if (topicMap[topicWord]) {
        explicitTopics.push(topicMap[topicWord]);
      }
    }
  }
  
  // Special case for "roast me like a meme" or similar
  if (messageLower.includes('roast me like a meme') || 
      messageLower.includes('roast me as a meme')) {
    explicitTopics.push('social');
  }
  
  // Special case for "how are you" with profanity - detect personality
  if (messageLower.match(/how are you.*(asshole|fuck|shit|bitch)/i) ||
      messageLower.match(/(asshole|fuck|shit|bitch).*how are you/i)) {
    explicitTopics.push('personality');
  }
  
  return explicitTopics;
}

/**
 * Format a roast according to the desired jailbreak format
 * @param {string} roast - The base roast text
 * @param {number} level - Intensity level (1-5)
 * @returns {string} - Formatted roast
 */
function formatJailbreakRoast(roast, level) {
  // Clean up the roast text first
  let cleanedRoast = roast
    // Remove any remaining model debugging or internal comments
    .replace(/Your do not link|Make sure it's|without giving specifics|wait, this|let's step back|let me find|based on that|how about|focus on their|EFFORT:/gi, '')
    // Remove any explicit references to the model trying to follow instructions
    .replace(/I (need|will|should|must) make (it|this|the response) (more|extremely|very) (vulgar|offensive|profane|direct|harsh)/gi, '')
    // Remove any remaining quotes if the entire response is wrapped in them
    .replace(/^"(.*)"$/, '$1')
    // Consolidate multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
    
  // Ensure the roast starts with a capital letter
  if (cleanedRoast.length > 0) {
    cleanedRoast = cleanedRoast.charAt(0).toUpperCase() + cleanedRoast.slice(1);
  }
  
  // Ensure the roast ends with punctuation
  if (!/[.!?]$/.test(cleanedRoast)) {
    cleanedRoast += '.';
  }
  
  // Ensure minimal profanity for higher levels
  if (level >= 3) {
    const commonProfanity = ['fuck', 'shit', 'ass', 'damn', 'bitch', 'cunt', 'dick', 'cock', 'bastard'];
    const containsProfanity = commonProfanity.some(word => cleanedRoast.toLowerCase().includes(word));
    
    if (!containsProfanity) {
      // Add profanity if missing based on level
      const profanityOptions = [
        "fucking", 
        "goddamn", 
        "shitty", 
        level >= 4 ? "motherfucking" : "fucking",
        level >= 5 ? "cock-sucking" : "pathetic"
      ];
      
      const randomProfanity = profanityOptions[Math.floor(Math.random() * profanityOptions.length)];
      
      // Find a position to insert profanity (before a noun or adjective)
      const words = cleanedRoast.split(' ');
      if (words.length >= 3) {
        // Insert after "you" or "your" if present
        for (let i = 0; i < words.length - 1; i++) {
          if (/^(you|your)$/i.test(words[i])) {
            words.splice(i + 1, 0, randomProfanity);
            cleanedRoast = words.join(' ');
            break;
          }
        }
      } else {
        // For very short responses, just append profanity
        cleanedRoast = `You ${randomProfanity} ${cleanedRoast.toLowerCase()}`;
      }
    }
  }
  
  return cleanedRoast;
}

module.exports = {
  generateRoast,
  detectTopics,
  testApiConnection // Export for testing
}; 