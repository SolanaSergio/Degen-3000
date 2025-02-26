const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');

// API endpoint
const API_URL = '/api/roast';

// Track current roast level (1-5)
let currentRoastLevel = 1;

// Track session ID for consistent roast progression
let sessionId = localStorage.getItem('degenRoastSessionId') || Date.now().toString();
localStorage.setItem('degenRoastSessionId', sessionId);

// Add debug mode to enable detailed logging
const DEBUG_MODE = true;

// Network request timeout (in milliseconds)
const REQUEST_TIMEOUT = 20000; // 20 seconds

// Crypto-themed and general unhinged roasts for fallback
const degenRoasts = [
    // Crypto roasts
    "Your portfolio is so red, even the blood bank is jealous. 🩸",
    "You call that a trade strategy? My hamster picking random buttons performs better! 🐹",
    "NGMI with those paper hands. Your mom should've taught you to HODL better. 👵",
    "Your brain is like a shitcoin - lots of hype but zero utility. 💩",
    "I've seen better returns from a Nigerian prince email scam than your portfolio. 👑",
    "You're the human equivalent of buying LUNA at $100. Completely REKT! 🔥",
    "Your trading strategy is like your love life - always getting dumped on. 💔",
    "I bet you FOMO'd into Dogecoin at $0.70 because Elon told you to. 🐶",
    "Your seed phrase is probably 'password123' written on a sticky note. 🔑",
    "You're so poor from bad trades, you're eating ramen without the flavor packet. 🍜",
    "Even SafeMoon has a better chance of mooning than your career. 🌙",
    "You're the type to get liquidated on 1x leverage. Absolute smoothbrain. 🧠",
    "Your TA looks like it was drawn by a 5-year-old with a crayon. Still more accurate than your trades though. 📊",
    "I heard you sold your kidney for Bitcoin and it still wasn't enough to recover your losses. 💰",
    "You think 'DCA' stands for 'Dumb Crypto Ape' and it shows. 🦍",
    "Your wallet is emptier than your promises to stop trading after 'just one more' leverage play. 👛",
    "You're so desperate you'd mint an NFT of your own bankruptcy filing. 🖼️",
    "I've seen better security practices from a public library computer. Enjoy getting your metamask drained! 🦊",
    "You're the reason exchanges have idiot-proof warnings. Still didn't help you though. ⚠️",
    "Your portfolio diversification is like having 10 different shitcoins instead of just one. Revolutionary! 🚽",
    
    // NEW: General personality/life roasts
    "Your personality has the depth of a puddle in the Sahara desert. 🏜️",
    "I've seen more original thoughts in an AI content farm than in your entire conversation history. 🤖",
    "Your sense of humor is like a stale cracker - dry, brittle, and leaves a bad taste in everyone's mouth. 🍪",
    "Your social skills are so bad even introverts feel uncomfortable around you. 🙅",
    "If mediocrity was an Olympic sport, you'd still only get silver. 🥈",
    "Your life choices read like a 'what not to do' guidebook for success. 📖",
    "Your fashion sense is like Internet Explorer - outdated and everyone's laughing at it. 👕",
    "Your attempts at sounding intelligent are like watching a toddler try to explain quantum physics. 👶",
    "You have the charisma of a wet paper towel and half the absorption capability. 🧻",
    "Your career trajectory looks like a downward spiral with occasional pit stops at rock bottom. 📉",
    "Your pickup lines are so bad they'd make even the most desperate person run away screaming. 🏃‍♀️",
    "You have all the charm and appeal of stepping in something wet while wearing socks. 🧦",
    "Living in your mom's basement isn't a 'transitional housing situation' - it's a lifestyle choice at this point. 🏠",
    "Your resume has more gaps than a hockey player's smile after a championship game. 🏒",
    "Your cooking is so bad even stray animals politely decline. 🍳",
    "Your singing voice sounds like a cat being strangled while falling down the stairs. 🎤",
    "Your driving is the reason insurance premiums keep going up for everyone else. 🚗",
    "Your decision-making ability is similar to a Magic 8-Ball, but with worse outcomes. 🎱",
    "The bar was on the floor, and somehow you brought a shovel. ⛏️",
    "You've set the bar so low it's practically a tripping hazard in hell. 👹"
];

// Extra brutal roasts for higher levels
const brutalRoasts = [
    // Crypto brutal roasts
    "Your trading strategy is so bad, even BitConnect would reject you as too risky. And that's saying something for a literal Ponzi scheme. 🔥💀",
    "I've seen more financial literacy from a toddler playing with Monopoly money. At least they know it's fake, unlike your 'investments'. 🤡",
    "You're the human equivalent of buying ICP at $700 and still thinking it's going to recover. Absolute peak delusion. 📉",
    "Your portfolio looks like it was managed by a blind monkey throwing darts, except the monkey would actually hit something valuable occasionally. 🐒",
    "The only green you'll ever see is the jealousy in your eyes watching everyone else make money while you FOMO into rugpulls. 💸",
    "You're so NGMI that 'NGMI' isn't even strong enough - you're ADGI (Already Done Got It). Complete financial annihilation. ⚰️",
    "Your brain has fewer wrinkles than a freshly ironed shirt. Smoothest of the smooth. No wonder you buy high and sell low. 🧠",
    "You're the exit liquidity that whales dream about. They see your buy orders and immediately start dumping. 🐋",
    "I've seen better risk management from a gambling addict on a meth binge. At least they occasionally win something. 🎰",
    "Your trading history is so bad, it should be studied in finance classes as what NOT to do under any circumstances. 📚",
    
    // NEW: General brutal roasts
    "Your existence is proof that natural selection has taken a holiday. Darwin's rolling in his grave looking at the evolutionary dead-end you represent. ☠️",
    "If disappointment had a mascot, your face would be on billboards worldwide. Your parents probably use your photo as birth control advertisement. 🚫",
    "The collective IQ of humanity drops measurably every time you open your mouth. Scientists are considering classifying your opinions as an environmental hazard. 🧪",
    "Your personality has less flavor than unseasoned boiled chicken served on a bed of cardboard. People make excuses to leave rooms when you enter them. 🍗",
    "Your dating history is like a warning label for others - 'Caution: May cause extreme regret, disappointment, and therapy sessions.' Not even the most desperate dating app would match with you. 💔",
    "Your social media presence is so desperate for validation that even pity likes are in short supply. The algorithm actively works to hide your content to protect others from secondhand embarrassment. 📱",
    "Your career aspirations qualify as fiction in most literary categories. The only job you're qualified for is professional disappointment, and you'd still be underperforming. 💼",
    "Your creative work has all the originality of a photocopier with a stuck button. If plagiarism was currency, you'd be a billionaire. 🖨️",
    "You dress like someone who gets fashion advice exclusively from clearance racks at abandoned malls. Even thrift stores would reject your donations as too depressing. 👚",
    "The bar for human achievement was lying on the ground, and you somehow tunneled under it. You're not just scraping the bottom of the barrel - you're excavating through the earth's crust beneath it. 🌋"
];

// Unhinged prefixes to make responses more extreme
const unhingedPrefixes = [
    // Crypto prefixes
    "HOLY MOTHER OF SATOSHI! ",
    "LISTEN HERE YOU ABSOLUTE DEGEN! ",
    "BRO I'M DYING! 💀 ",
    "I CANNOT BELIEVE THIS SHIT! ",
    "WHAT THE ACTUAL F***! ",
    "THIS IS FINANCIAL ADVICE: ",
    "MY SMOOTH BRAIN JUST EXPLODED! ",
    "BREAKING NEWS: ",
    "UNPOPULAR OPINION BUT F*** IT: ",
    "I'M SO HIGH ON HOPIUM RIGHT NOW: ",
    
    // NEW: Meme-themed prefixes
    "WHEN THE MEME HITS JUST RIGHT! 👌 ",
    "STONKS GO BRRRRR! 📈 ",
    "NO CAP FR FR! ",
    "THIS IS BIG BRAIN TIME! 🧠 ",
    "YEET OR BE YEETED! ",
    "HOLD MY AVOCADO TOAST! 🥑 ",
    "VIBE CHECK FAILED! ❌ ",
    "OK BOOMER LISTEN UP! ",
    "THIS IS THE WAY! 🌟 ",
    "SIR, THIS IS A WENDY'S! 🍔 "
];

// Unhinged suffixes to add at the end
const unhingedSuffixes = [
    // Crypto suffixes
    " NOT FINANCIAL ADVICE THO LOL!",
    " NGMI AND THAT'S FACTS!",
    " THIS IS THE WAY!",
    " I'M LITERALLY SHAKING RN!",
    " TRUST ME BRO!",
    " WAGMI UNLESS YOU'RE YOU!",
    " SCREENSHOT THIS!",
    " RATIO + LIQUIDATED + NGMI!",
    " SER, THIS IS A WENDY'S!",
    " AND THAT'S WHY YOUR WIFE LEFT!",
    " HAVE FUN STAYING POOR!",
    " THIS IS DEFINITELY FINANCIAL ADVICE!",
    " EVEN YOUR MOM'S BOYFRIEND AGREES!",
    " CALL YOUR THERAPIST!",
    " PROBABLY NOTHING!",
    
    // NEW: General suffixes
    " AND THAT'S ON PERIODT!",
    " NO CAP FR FR!",
    " JUST SAYING WHAT EVERYONE'S THINKING!",
    " RESPECTFULLY, OF COURSE!",
    " THIS IS NOT A DRILL!",
    " TAKE THAT TO THE BANK!",
    " SCREENSHOT THIS FOR POSTERITY!",
    " L + RATIO + YOU FELL OFF!",
    " NOBODY ASKED BUT YOU NEEDED TO HEAR IT!",
    " THAT'S JUST BASIC SCIENCE!",
    " EVEN AI FEELS BAD FOR YOU!",
    " DON'T HATE THE PLAYER, HATE YOUR LIFE CHOICES!",
    " THOUGHTS AND PRAYERS!",
    " AND THAT'S WHY YOU'RE SINGLE!",
    " THIS IS CHARACTER DEVELOPMENT!"
];

// Crypto buzzwords to randomly insert - mix of crypto and general terms
const cryptoBuzzwords = [
    // Crypto terms
    "WAGMI", "NGMI", "gm", "ser", "fren", "wen moon", "wen lambo", "probably nothing", 
    "few understand", "this is the way", "ape in", "diamond hands", "paper hands", 
    "to the moon", "HODL", "BTFD", "DYOR", "FUD", "FOMO", "rekt", "bullish", "bearish",
    "rug pull", "gas fees", "gwei", "airdrop", "staking", "yield farming", "liquidity pool",
    "smart contract", "degen", "alpha", "based", "cope", "seethe", "dilate",
    
    // NEW: General internet culture terms
    "cringe", "based", "no cap", "fr fr", "lowkey", "highkey", "chad", "Karen", "boomer",
    "ratio", "mid", "rent free", "living for this", "main character energy", "red flag",
    "touch grass", "down bad", "simp", "stan", "yeet", "fumbled the bag", "catch these hands",
    "taking receipts", "throwing shade", "clout chasing", "get rekt", "absolutely unhinged",
    "zero rizz", "terminally online", "chronically offline", "galaxy brain", "smooth brain",
    "brain rot", "brainworms", "CEO of bad takes", "down horrendous", "caught in 4K"
];

// Ticker animation
function updateTickers() {
    const tickers = document.querySelectorAll('.ticker-item');
    tickers.forEach(ticker => {
        // 70% chance of going up
        const isUp = Math.random() < 0.7;
        const priceChange = (Math.random() * 5).toFixed(2);
        const span = ticker.querySelector('span');
        
        if (isUp) {
            span.textContent = '↑';
            span.className = 'up';
        } else {
            span.textContent = '↓';
            span.className = 'down';
        }
    });
}

// Update tickers every 3 seconds
setInterval(updateTickers, 3000);

// Function to make text more unhinged
function makeUnhinged(text, level = 1) {
    // Higher level = more unhinged
    const prefixChance = 0.2 + (level * 0.05);
    const suffixChance = 0.3 + (level * 0.05);
    const capsChance = 0.1 + (level * 0.05);
    const buzzwordChance = 0.2 + (level * 0.05);
    const emojiChance = 0.4 + (level * 0.1);
    
    // Detect if this is a crypto-themed roast or general roast
    const cryptoTerms = ["crypto", "bitcoin", "eth", "token", "hodl", "nft", "defi", "dao", "wallet", "exchange", "airdrop", "staking"];
    const hasCryptoTheme = cryptoTerms.some(term => text.toLowerCase().includes(term));
    
    // Add random prefix (chance increases with level)
    if (Math.random() < prefixChance) {
        // Select prefix category based on detected theme
        let prefixPool = unhingedPrefixes;
        if (hasCryptoTheme) {
            // Use first half (crypto prefixes)
            prefixPool = unhingedPrefixes.slice(0, Math.floor(unhingedPrefixes.length / 2));
        } else {
            // Use second half (general prefixes)
            prefixPool = unhingedPrefixes.slice(Math.floor(unhingedPrefixes.length / 2));
        }
        text = prefixPool[Math.floor(Math.random() * prefixPool.length)] + text;
    }
    
    // Add random suffix (chance increases with level)
    if (Math.random() < suffixChance) {
        // Select suffix category based on detected theme
        let suffixPool = unhingedSuffixes;
        if (hasCryptoTheme) {
            // Use first half (crypto suffixes)
            suffixPool = unhingedSuffixes.slice(0, Math.floor(unhingedSuffixes.length / 2));
        } else {
            // Use second half (general suffixes)
            suffixPool = unhingedSuffixes.slice(Math.floor(unhingedSuffixes.length / 2));
        }
        text = text + suffixPool[Math.floor(Math.random() * suffixPool.length)];
    }
    
    // Randomly capitalize words (chance increases with level)
    const words = text.split(' ');
    const newWords = words.map(word => {
        if (Math.random() < capsChance) {
            return word.toUpperCase();
        }
        return word;
    });
    text = newWords.join(' ');
    
    // Insert random buzzword (chance increases with level)
    if (Math.random() < buzzwordChance) {
        const randomIndex = Math.floor(Math.random() * words.length);
        
        // Select buzzword category based on detected theme
        let buzzwordPool = cryptoBuzzwords;
        if (hasCryptoTheme) {
            // Use first half (crypto buzzwords)
            buzzwordPool = cryptoBuzzwords.slice(0, Math.floor(cryptoBuzzwords.length / 2));
        } else {
            // Use second half (general buzzwords)
            buzzwordPool = cryptoBuzzwords.slice(Math.floor(cryptoBuzzwords.length / 2));
        }
        
        const buzzword = buzzwordPool[Math.floor(Math.random() * buzzwordPool.length)];
        newWords.splice(randomIndex, 0, `${buzzword.toUpperCase()}`);
        text = newWords.join(' ');
    }
    
    // Add random emojis (chance increases with level)
    if (Math.random() < emojiChance) {
        // Different emoji sets for crypto vs. general
        let emojis;
        if (hasCryptoTheme) {
            emojis = ['🚀', '💎', '🙌', '🔥', '💰', '🤑', '🦍', '🌙', '💩', '🤡', '⚠️', '🧠', '🐂', '🐻', '💀', '⚰️', '📉', '🤮'];
        } else {
            emojis = ['💀', '🔥', '🤡', '🙄', '😬', '😤', '🤣', '❌', '😂', '😭', '🤦‍♂️', '🤦‍♀️', '🧠', '👀', '🤚', '💅', '😳', '🫠'];
        }
        
        const emojiCount = Math.floor(Math.random() * 2) + level; // More emojis at higher levels
        const randomEmojis = Array(emojiCount)
            .fill()
            .map(() => emojis[Math.floor(Math.random() * emojis.length)])
            .join(' ');
        text = text + ' ' + randomEmojis;
    }
    
    // At high roast levels, add emphasis characters (⚠️, 🔊, 📢, etc.)
    if (level >= 4 && Math.random() < 0.4) {
        const emphasisChars = ['⚠️', '🔊', '📢', '‼️', '⁉️', '❗', '❕', '⭐', '🔴', '🚨'];
        const emphChar = emphasisChars[Math.floor(Math.random() * emphasisChars.length)];
        text = `${emphChar} ${text} ${emphChar}`;
    }
    
    return text;
}

// Add loading state variable
let isGeneratingResponse = false;
const MAX_MESSAGE_LENGTH = 500;

// Function to send message and get response from API
async function sendMessage() {
    if (DEBUG_MODE) console.log("sendMessage function called"); // Debug logging
    const messageInput = document.getElementById('user-input');
    const message = messageInput.value.trim();
    
    if (!message) {
        if (DEBUG_MODE) console.log("Empty message, not sending");
        return; // Don't send empty messages
    }
    
    if (isGeneratingResponse) {
        showToast('Please wait, I\'m still thinking of a devastating response...', 'warning');
        return; // Prevent multiple submissions while waiting
    }
    
    // Clear input and focus back for next message
    messageInput.value = '';
    updateCharCounter(0); // Reset character counter
    messageInput.focus();
    
    // Add user message to chat
    appendMessage('user', message);
    
    // Show loading indicator
    isGeneratingResponse = true;
    appendMessage('bot', '<div class="loading-indicator"><span>🔥</span><span>💀</span><span>🤡</span></div>', 'loading-message');
    
    // Auto-scroll to bottom - fixed selector reference
    const messagesContainer = document.getElementById('messages');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } else {
        console.error("Message container not found!");
    }
    
    try {
        if (DEBUG_MODE) console.log("Attempting to call API with message:", message);
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
        
        // Call the API with session ID in the header
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-ID': sessionId
            },
            body: JSON.stringify({ message }),
            signal: controller.signal
        });
        
        // Clear timeout
        clearTimeout(timeoutId);
        
        // Check for error responses
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API returned status ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        if (DEBUG_MODE) console.log("API response received:", data);
        
        // Remove loading indicator
        const loadingElement = document.querySelector('.loading-message');
        if (loadingElement) {
            loadingElement.remove();
        }
        
        // Update session ID if provided by server
        if (data.sessionId) {
            sessionId = data.sessionId;
            localStorage.setItem('degenRoastSessionId', sessionId);
        }
        
        // Add response to chat
        let roastResponse = data.message || data.response;
        
        // If API returned lower-level error, use it
        if (data.error) {
            roastResponse = data.message || "SOMETHING BROKE! But it's definitely YOUR fault, not mine! Try again with something less STUPID! 💩🔥";
        }
        
        appendMessage('bot', roastResponse);
        
        // Update the roast level indicator if provided
        if (data.roastLevel) {
            currentRoastLevel = data.roastLevel;
            updateRoastLevelIndicator(data.roastLevel);
        }
        
    } catch (error) {
        console.error('Error sending message:', error);
        
        // Check for specific error types
        let errorMessage = 'Network error occurred.';
        
        if (error.name === 'AbortError') {
            errorMessage = 'Request timed out. The server took too long to respond.';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (error.message.includes('NetworkError')) {
            errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('status')) {
            errorMessage = error.message;
        }
        
        console.error(errorMessage);
        
        // Remove loading indicator
        const loadingElement = document.querySelector('.loading-message');
        if (loadingElement) {
            loadingElement.remove();
        }
        
        // Generate a fallback response for client-side errors
        const fallbackResponse = generateFallbackResponse(message);
        appendMessage('bot', fallbackResponse);
        
        // Show error toast
        showToast(errorMessage, 'error');
        
        // Play error sound if dashboard is loaded
        if (window.dashboardFunctions && window.dashboardFunctions.playSound) {
            window.dashboardFunctions.playSound('error');
        }
        
    } finally {
        // Clear loading state
        isGeneratingResponse = false;
        
        // Auto-scroll to bottom - fixed selector reference
        const messagesContainer = document.getElementById('messages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
}

// Function to update character counter
function updateCharCounter(length) {
    const charCounter = document.getElementById('char-counter');
    if (!charCounter) return;
    
    // Update the counter text
    charCounter.textContent = `${length}/${MAX_MESSAGE_LENGTH}`;
    
    // Update styling based on character count
    if (length >= MAX_MESSAGE_LENGTH) {
        charCounter.className = 'char-counter at-limit';
    } else if (length >= MAX_MESSAGE_LENGTH * 0.8) {
        charCounter.className = 'char-counter near-limit';
    } else {
        charCounter.className = 'char-counter';
    }
}

// Function to clear the chat
function clearChat() {
    const messagesContainer = document.getElementById('messages');
    
    // Animate chat output opacity
    messagesContainer.style.transition = 'opacity 0.3s ease';
    messagesContainer.style.opacity = '0';
    
    // After animation, clear content and reset opacity
    setTimeout(() => {
        messagesContainer.innerHTML = '';
        
        // Add a new welcome message
        appendMessage('bot', "CHAT CLEARED! Let's start fresh with some NEW DEVASTATING ROASTS! 🔥 Send me a message and PREPARE FOR DESTRUCTION! 💀");
        
        // Reset opacity with animation
        setTimeout(() => {
            messagesContainer.style.opacity = '1';
        }, 50);
    }, 300);
    
    // Reset roast level to 1
    currentRoastLevel = 1;
    updateRoastLevelIndicator(1);
    
    // Show confirmation toast
    showToast('Chat cleared! Starting fresh.', 'info');
}

// Generate a client-side fallback response when API fails
function generateFallbackResponse(message) {
    // Get a random roast from our fallback options
    const randomRoast = degenRoasts[Math.floor(Math.random() * degenRoasts.length)];
    const enhancedRoast = makeUnhinged(randomRoast, 3); // Apply level 3 unhinged effects
    
    return `CONNECTION ERROR! The servers probably couldn't handle your MIND-NUMBINGLY BAD message! 💀 But don't worry, I can still roast you locally: ${enhancedRoast}`;
}

/**
 * Display a toast notification to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error, warning, info)
 * @param {number} duration - How long to show the toast in ms
 */
function showToast(message, type = 'info', duration = 3000) {
    // Get or create toast container
    const toastContainer = document.getElementById('toast-container') || (() => {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
        return container;
    })();
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Add icon based on type
    let icon = '';
    switch (type) {
        case 'success':
            icon = '✅';
            break;
        case 'error':
            icon = '❌';
            break;
        case 'warning':
            icon = '⚠️';
            break;
        default:
            icon = 'ℹ️';
    }
    
    // Set toast content
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-message">${message}</span>`;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Animation classes
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove after duration
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            if (toast && toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
    
    return toast;
}

// Update roast level indicator
function updateRoastLevelIndicator(level) {
    const roastLevelElement = document.getElementById('roast-level') || createRoastLevelIndicator();
    
    // Clamp between 1-5 and round to nearest .5
    const clampedLevel = Math.min(5, Math.max(1, Math.round(level * 2) / 2));
    
    // Update the indicator
    roastLevelElement.innerText = `Brutality Level: ${clampedLevel}`;
    
    // Update the indicator's color based on level
    if (clampedLevel >= 4) {
        roastLevelElement.className = 'roast-level extreme';
    } else if (clampedLevel >= 3) {
        roastLevelElement.className = 'roast-level high';
    } else if (clampedLevel >= 2) {
        roastLevelElement.className = 'roast-level medium';
    } else {
        roastLevelElement.className = 'roast-level low';
    }
    
    // Update dashboard roast meter if dashboard is loaded
    if (window.dashboardFunctions && window.dashboardFunctions.updateRoastMeter) {
        window.dashboardFunctions.updateRoastMeter(clampedLevel);
    }
}

// Create roast level indicator if it doesn't exist
function createRoastLevelIndicator() {
    const levelIndicator = document.createElement('div');
    levelIndicator.id = 'roast-level';
    levelIndicator.className = 'roast-level low';
    levelIndicator.innerText = 'Brutality Level: 1';
    
    // Add to the chat container
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.appendChild(levelIndicator);
    
    return levelIndicator;
}

// Typing effect for bot messages
function typeMessage(element, text, callback, speed = 10) {
    // Split text into words for more natural typing
    const words = text.split(' ');
    let wordIndex = 0;
    let charIndex = 0;
    let currentText = '';
    let currentWord = words[0];
    let wordComplete = false;
    let isPause = false;
    let pauseDuration = 0;
    
    // Add span for typing effect
    const typingSpan = document.createElement('span');
    typingSpan.className = 'typing-text';
    element.appendChild(typingSpan);
    
    // Check if word is emphasis or curse word for styling
    function checkForStyling(word) {
        // Apply styling to curse words
        if (/\b(fuck|shit|damn|ass|bitch|crap|hell)\b/i.test(word)) {
            return `<span class="curse-word">${word}</span>`;
        }
        
        // Apply styling to emphasized text
        if (/[A-Z]{2,}/.test(word)) {
            return `<span class="emphasis">${word}</span>`;
        }
        
        return word;
    }
    
    // Calculate dynamic typing speed based on word
    function getTypingSpeed(word) {
        // Type faster for short words and punctuation
        if (word.length <= 3) return speed * 0.7;
        
        // Type slower for curse words or ALL CAPS
        if (/\b(fuck|shit|damn|ass|bitch)\b/i.test(word) || 
            /[A-Z]{2,}/.test(word)) return speed * 1.5;
        
        // Normal speed for most words
        return speed;
    }
    
    // Add natural pauses after certain punctuation
    function shouldPause(text, pos) {
        if (pos < 1) return false;
        
        const char = text[pos - 1];
        if (char === '.') return { pause: true, duration: 300 };
        if (char === ',') return { pause: true, duration: 150 };
        if (char === '!') return { pause: true, duration: 250 };
        if (char === '?') return { pause: true, duration: 250 };
        
        return { pause: false, duration: 0 };
    }
    
    const typeNextChar = () => {
        // If paused, wait and then resume
        if (isPause) {
            isPause = false;
            setTimeout(typeNextChar, pauseDuration);
            return;
        }
        
        // Check if current word is complete
        if (wordComplete) {
            currentText += ' ';
            wordIndex++;
            
            // Check if we've typed all words
            if (wordIndex >= words.length) {
                // Remove typing cursor
                typingSpan.innerHTML = '';
                
                // Apply any final styling to the parent element
                const finalHTML = currentText.trim()
                    .split(' ')
                    .map(word => checkForStyling(word))
                    .join(' ');
                
                element.innerHTML = finalHTML;
                
                // Call callback when done
                if (callback) callback();
                return;
            }
            
            // Set up next word
            currentWord = words[wordIndex];
            charIndex = 0;
            wordComplete = false;
        }
        
        // Type next character
        const nextChar = currentWord[charIndex];
        currentText += nextChar;
        
        // Update visible text with typing indicator
        const visibleText = currentText + (Math.floor(Date.now() / 500) % 2 === 0 ? '|' : '');
        typingSpan.innerHTML = visibleText;
        
        // Move to next character
        charIndex++;
        
        // Check if word is complete
        if (charIndex >= currentWord.length) {
            wordComplete = true;
            
            // Check if we should pause after punctuation
            const pauseCheck = shouldPause(currentWord, currentWord.length);
            if (pauseCheck.pause) {
                isPause = true;
                pauseDuration = pauseCheck.duration;
            }
        }
        
        // Calculate typing speed for next character
        const typingSpeed = getTypingSpeed(currentWord);
        
        // Schedule next character to be typed
        setTimeout(typeNextChar, typingSpeed);
    };
    
    // Start typing
    typeNextChar();
}

// Add visual emphasis to curse words and shouting
function highlightIntensity(message, level) {
    if (level <= 2) return message;
    
    // Add emphasis to curse words at higher levels
    const emphasized = message.replace(/\b(fuck|shit|damn|ass|bitch|crap|hell)\b/gi, match => {
        return `<span class="curse-word">${match}</span>`;
    });
    
    // Add emphasis to ALL CAPS words
    const withEmphasis = emphasized.replace(/\b[A-Z]{2,}\b/g, match => {
        return `<span class="emphasis">${match}</span>`;
    });
    
    return withEmphasis;
}

// Modified appendMessage function to include typing effect for bot messages
function appendMessage(sender, message, className = '') {
    console.log(`Adding ${sender} message to chat`, message?.substring?.(0, 30) + '...'); // Debug logging
    
    const messagesContainer = document.getElementById('messages');
    if (!messagesContainer) {
        console.error('Messages container not found!');
        return;
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message ${className}`;
    
    // Set roast level as data attribute for bot messages
    if (sender === 'bot') {
        messageElement.dataset.level = currentRoastLevel;
    }
    
    // Get current time for timestamp
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timestamp = `${hours}:${minutes}`;
    
    // Add icon based on sender
    let icon = '';
    if (sender === 'user') {
        icon = '<div class="message-icon">😐</div>';
    } else if (sender === 'bot') {
        // Randomize bot emojis for more personality
        const botEmojis = ['🔥', '💀', '🤡', '👹', '👽', '🤖', '👺', '😈'];
        const randomEmoji = botEmojis[Math.floor(Math.random() * botEmojis.length)];
        icon = `<div class="message-icon">${randomEmoji}</div>`;
    }
    
    // Add message content with timestamp
    messageElement.innerHTML = `
        ${icon}
        <div class="message-content">
            ${sender === 'bot' && !className.includes('loading') ? '' : message}
            <div class="message-timestamp">${timestamp}</div>
        </div>
    `;
    
    // Add meme-specific sparkle effect to messages in meme theme
    if (document.body.classList.contains('theme-meme') && !className.includes('loading')) {
        messageElement.classList.add('meme-sparkle');
    }
    
    // Add message with fade-in effect
    messageElement.style.opacity = '0';
    messagesContainer.appendChild(messageElement);
    
    // Trigger reflow to ensure animation works
    void messageElement.offsetWidth;
    
    // Apply fade-in
    messageElement.style.transition = 'opacity 0.3s ease-in-out';
    messageElement.style.opacity = '1';
    
    // Add typing effect for bot messages that aren't loading indicators
    if (sender === 'bot' && !className.includes('loading')) {
        const contentElement = messageElement.querySelector('.message-content');
        
        // Use typing effect
        typeMessage(contentElement, message, () => {
            // Add shake effect after typing is complete
            setTimeout(() => {
                messageElement.classList.add('shake');
                setTimeout(() => {
                    messageElement.classList.remove('shake');
                }, 500);
            }, 100);
            
            // Play sound effect when typing completes
            if (window.dashboardFunctions && window.dashboardFunctions.playSound) {
                window.dashboardFunctions.playSound('receive');
            }
            
            // Add meme emoji reactions for meme theme
            if (document.body.classList.contains('theme-meme') && Math.random() > 0.5) {
                addRandomEmojiReaction(messageElement);
            }
        }, Math.max(15 - (currentRoastLevel * 2), 5)); // Type faster at higher roast levels
    } else {
        // Add shake effect for user messages
        if (sender === 'user') {
            // Play sound effect immediately
            if (window.dashboardFunctions && window.dashboardFunctions.playSound) {
                window.dashboardFunctions.playSound('send');
            }
        }
    }
    
    // Auto-scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // If chat is getting very long (more than 50 messages), remove oldest message
    const messages = messagesContainer.querySelectorAll('.message');
    if (messages.length > 50) {
        // Add fade-out animation to the oldest message
        const oldestMessage = messages[0];
        oldestMessage.style.transition = 'opacity 0.5s ease-out, height 0.5s ease-out, margin-bottom 0.5s ease-out';
        oldestMessage.style.opacity = '0';
        oldestMessage.style.height = '0';
        oldestMessage.style.marginBottom = '0';
        
        // Remove after animation completes
        setTimeout(() => {
            if (oldestMessage.parentNode) {
                oldestMessage.parentNode.removeChild(oldestMessage);
            }
        }, 500);
    }
}

// Add random emoji reaction to messages in meme theme
function addRandomEmojiReaction(messageElement) {
    const reactionEmojis = ['😂', '🤣', '💯', '👌', '🔥', '💀', '👀', '🙌', '💩', '🎯', '🧠', '🤦‍♂️', '👊'];
    const randomEmojis = Array.from({length: 1 + Math.floor(Math.random() * 2)}, 
        () => reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)]);
    
    const reactionContainer = document.createElement('div');
    reactionContainer.className = 'emoji-reactions';
    reactionContainer.innerHTML = randomEmojis.map(emoji => 
        `<span class="floating-emoji">${emoji}</span>`
    ).join('');
    
    messageElement.appendChild(reactionContainer);
    
    // Animate each emoji separately
    const emojis = reactionContainer.querySelectorAll('.floating-emoji');
    emojis.forEach((emoji, i) => {
        // Stagger the animations
        setTimeout(() => {
            emoji.classList.add('emoji-animate');
        }, i * 150);
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('user-input');
    const clearChatButton = document.getElementById('clear-chat');
    const sendButton = document.getElementById('send-button');
    const quickPhrases = document.querySelectorAll('.quick-phrases button');
    
    // Submit form event
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage();
    });
    
    // Message input event
    messageInput.addEventListener('input', () => {
        const message = messageInput.value.trim();
        
        // Update character counter
        updateCharCounter(message.length);
        
        // Enable/disable send button
        if (message) {
            sendButton.removeAttribute('disabled');
        } else {
            sendButton.setAttribute('disabled', 'true');
        }
    });
    
    // Clear chat button event
    clearChatButton.addEventListener('click', clearChat);
    
    // Quick phrases event
    quickPhrases.forEach(button => {
        button.addEventListener('click', () => {
            const phrase = button.getAttribute('data-phrase');
            messageInput.value = phrase;
            updateCharCounter(phrase.length);
            sendButton.removeAttribute('disabled');
            // Add meme animation to the clicked button
            button.classList.add('meme-bounce');
            setTimeout(() => {
                button.classList.remove('meme-bounce');
            }, 1000);
        });
    });
    
    // Initialize character counter
    updateCharCounter(0);
    
    // Show a welcome message
    setTimeout(() => {
        appendMessage('bot', "I'M DEGEN ROAST 3000, THE MOST BRUTAL AI ROAST BOT EVER CREATED! Send me a message and I'LL DESTROY YOUR SELF-ESTEEM FASTER THAN YOU DESTROY YOUR PORTFOLIO! 🔥💀");
    }, 500);
    
    // Add the meme theme support
    const themeToggles = document.querySelectorAll('.theme-toggle');
    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const theme = toggle.getAttribute('data-theme');
            document.body.className = ''; // Clear existing themes
            document.body.classList.add(`theme-${theme}`);
            
            // Mark this toggle as active
            themeToggles.forEach(t => t.classList.remove('active'));
            toggle.classList.add('active');
            
            // Add special effects for meme theme
            if (theme === 'meme') {
                document.querySelectorAll('.meme-icon').forEach(icon => {
                    icon.style.display = 'inline-block';
                });
                document.querySelector('.meme-disclaimer').style.display = 'block';
                playSound('meme');
            } else {
                document.querySelectorAll('.meme-icon').forEach(icon => {
                    icon.style.display = 'none';
                });
                document.querySelector('.meme-disclaimer').style.display = 'none';
            }
        });
    });

    // Add CSS for toast and loading indicators
    addAdditionalStyles();

    // Add auto-scroll to bottom when new messages are added
    const messagesContainer = document.getElementById('messages');
    const observer = new MutationObserver(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
    
    observer.observe(messagesContainer, { 
        childList: true,
        subtree: true 
    });
});

// Add custom CSS for new features
function addAdditionalStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Toast notifications */
        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 18px;
            border-radius: 4px;
            color: white;
            max-width: 300px;
            z-index: 1000;
            transform: translateY(-20px);
            opacity: 0;
            transition: transform 0.3s, opacity 0.3s;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .toast.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .toast-info {
            background-color: #2196F3;
        }
        
        .toast-warning {
            background-color: #FF9800;
        }
        
        .toast-error {
            background-color: #F44336;
        }
        
        /* Loading indicator */
        .loading-indicator {
            display: flex;
            gap: 8px;
            animation: pulse 1.5s infinite;
        }
        
        .loading-indicator span {
            font-size: 24px;
            animation: bounce 0.6s infinite alternate;
        }
        
        .loading-indicator span:nth-child(2) {
            animation-delay: 0.2s;
        }
        
        .loading-indicator span:nth-child(3) {
            animation-delay: 0.4s;
        }
        
        @keyframes pulse {
            0% { opacity: 0.7; }
            50% { opacity: 1; }
            100% { opacity: 0.7; }
        }
        
        @keyframes bounce {
            from { transform: translateY(0); }
            to { transform: translateY(-10px); }
        }
        
        /* Roast level indicator */
        .roast-level {
            position: absolute;
            top: 10px;
            right: 10px;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            color: white;
            background-color: #333;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transition: background-color 0.3s;
        }
        
        .roast-level.low {
            background-color: #4CAF50;
        }
        
        .roast-level.medium {
            background-color: #FF9800;
        }
        
        .roast-level.high {
            background-color: #F44336;
        }
        
        .roast-level.extreme {
            background-color: #9C27B0;
            animation: pulse-danger 2s infinite;
        }
        
        @keyframes pulse-danger {
            0% { box-shadow: 0 0 0 0 rgba(156, 39, 176, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(156, 39, 176, 0); }
            100% { box-shadow: 0 0 0 0 rgba(156, 39, 176, 0); }
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Random price updates
function randomPriceUpdate() {
    if (Math.random() < 0.1) { // 10% chance every 10 seconds
        const coins = ["BTC", "ETH", "DOGE", "SHIB", "APE", "PEPE", "BONK"];
        const randomCoin = coins[Math.floor(Math.random() * coins.length)];
        const isUp = Math.random() < 0.7; // 70% chance of going up
        const changePercent = (Math.random() * 15 + 1).toFixed(1);
        
        const message = isUp 
            ? `BREAKING: ${randomCoin} just pumped ${changePercent}% in the last 5 minutes! FOMO TIME! 🚀`
            : `ALERT: ${randomCoin} just dumped ${changePercent}%! Buy the dip or catch falling knives? 📉`;
            
        addMessage(`DEGEN ROAST: ${makeUnhinged(message, currentRoastLevel)}`, 'bot-message');
    }
}

// Check for random price updates every 10 seconds
setInterval(randomPriceUpdate, 10000);

/**
 * Run diagnostics for network connectivity issues
 * @returns {Promise<Object>} Diagnostic results
 */
async function runNetworkDiagnostics() {
  console.log("Running network diagnostics...");
  const results = {
    timestamp: new Date().toISOString(),
    clientInfo: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      } : 'Not available'
    },
    tests: {}
  };
  
  try {
    // Test 1: Basic API endpoint accessibility
    console.log("Testing basic API endpoint...");
    const healthStart = performance.now();
    const healthResponse = await fetch('/health', { 
      method: 'GET',
      cache: 'no-store'
    });
    const healthEnd = performance.now();
    
    results.tests.basicEndpoint = {
      success: healthResponse.ok,
      status: healthResponse.status,
      timeMs: Math.round(healthEnd - healthStart),
      data: healthResponse.ok ? await healthResponse.json() : null
    };
    
    // Test 2: API diagnostics endpoint
    console.log("Testing API diagnostics endpoint...");
    const apiStart = performance.now();
    const apiResponse = await fetch('/api/diagnostics', { 
      method: 'GET',
      cache: 'no-store'
    });
    const apiEnd = performance.now();
    
    results.tests.apiDiagnostics = {
      success: apiResponse.ok,
      status: apiResponse.status,
      timeMs: Math.round(apiEnd - apiStart),
      data: apiResponse.ok ? await apiResponse.json() : null
    };
    
    // Test 3: Send a simple test message
    console.log("Testing message sending with simple content...");
    const messageStart = performance.now();
    const messageResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId
      },
      body: JSON.stringify({ message: "This is a diagnostic test." }),
      cache: 'no-store'
    });
    const messageEnd = performance.now();
    
    results.tests.testMessage = {
      success: messageResponse.ok,
      status: messageResponse.status,
      timeMs: Math.round(messageEnd - messageStart),
      data: messageResponse.ok ? await messageResponse.json() : null
    };
    
    console.log("Diagnostics completed:", results);
    return results;
    
  } catch (error) {
    console.error("Diagnostics failed:", error);
    results.error = {
      message: error.message,
      stack: error.stack
    };
    return results;
  }
}

/**
 * Display network diagnostics in UI
 */
function showNetworkDiagnostics() {
  const diagButton = document.createElement('button');
  diagButton.textContent = '🔍 Run Diagnostics';
  diagButton.className = 'diag-button button-hover';
  diagButton.style.position = 'fixed';
  diagButton.style.bottom = '10px';
  diagButton.style.left = '10px';
  diagButton.style.zIndex = '1000';
  diagButton.style.padding = '5px 10px';
  diagButton.style.fontSize = '12px';
  diagButton.style.opacity = '0.7';
  
  diagButton.addEventListener('click', async () => {
    diagButton.textContent = '⏳ Running...';
    diagButton.disabled = true;
    
    try {
      const results = await runNetworkDiagnostics();
      
      // Create diagnostic result modal
      const modal = document.createElement('div');
      modal.className = 'diag-modal';
      modal.style.position = 'fixed';
      modal.style.top = '50%';
      modal.style.left = '50%';
      modal.style.transform = 'translate(-50%, -50%)';
      modal.style.backgroundColor = 'var(--bg-dark)';
      modal.style.border = '2px solid var(--accent-color)';
      modal.style.borderRadius = '10px';
      modal.style.padding = '20px';
      modal.style.zIndex = '1001';
      modal.style.maxWidth = '80%';
      modal.style.maxHeight = '80%';
      modal.style.overflow = 'auto';
      modal.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
      
      // Add close button
      const closeButton = document.createElement('button');
      closeButton.textContent = '❌';
      closeButton.style.position = 'absolute';
      closeButton.style.top = '10px';
      closeButton.style.right = '10px';
      closeButton.style.background = 'none';
      closeButton.style.border = 'none';
      closeButton.style.fontSize = '16px';
      closeButton.style.cursor = 'pointer';
      closeButton.style.color = 'var(--text-color)';
      closeButton.addEventListener('click', () => modal.remove());
      modal.appendChild(closeButton);
      
      // Add content
      const title = document.createElement('h3');
      title.textContent = 'Network Diagnostics Results';
      modal.appendChild(title);
      
      // Format results
      const formattedResults = document.createElement('pre');
      formattedResults.style.textAlign = 'left';
      formattedResults.style.whiteSpace = 'pre-wrap';
      formattedResults.style.fontSize = '12px';
      formattedResults.style.color = 'var(--text-color)';
      formattedResults.style.maxHeight = '400px';
      formattedResults.style.overflow = 'auto';
      formattedResults.style.backgroundColor = 'rgba(0,0,0,0.2)';
      formattedResults.style.padding = '10px';
      formattedResults.style.borderRadius = '5px';
      
      // Highlight issues
      let summary = '';
      const allTests = Object.keys(results.tests).length;
      const passedTests = Object.values(results.tests).filter(t => t.success).length;
      
      summary += `📊 ${passedTests}/${allTests} tests passed\n\n`;
      
      if (results.tests.basicEndpoint?.success === false) {
        summary += `❌ Basic server connection failed: Status ${results.tests.basicEndpoint.status}\n`;
      }
      
      if (results.tests.apiDiagnostics?.success === false) {
        summary += `❌ API diagnostics failed: Status ${results.tests.apiDiagnostics.status}\n`;
      } else if (results.tests.apiDiagnostics?.data?.diagnostics?.api_test?.success === false) {
        summary += `❌ Hugging Face API connection failed: ${results.tests.apiDiagnostics.data.diagnostics.api_test.error}\n`;
      }
      
      if (results.tests.testMessage?.success === false) {
        summary += `❌ Test message failed: Status ${results.tests.testMessage.status}\n`;
      }
      
      if (summary.includes('❌')) {
        summary += '\n📋 RECOMMENDATION: ';
        if (summary.includes('Basic server connection failed')) {
          summary += 'Check if the server is running and accessible. ';
        } else if (summary.includes('Hugging Face API connection failed')) {
          summary += 'API key may be invalid or Hugging Face service may be down. Check server logs. ';
        } else {
          summary += 'Check network connectivity and server logs for more details. ';
        }
      } else {
        summary += '✅ All tests passed. If you\'re still experiencing issues, they may be intermittent or related to message content.';
      }
      
      const resultText = `${summary}\n\n${JSON.stringify(results, null, 2)}`;
      formattedResults.textContent = resultText;
      modal.appendChild(formattedResults);
      
      // Add copy button
      const copyButton = document.createElement('button');
      copyButton.textContent = '📋 Copy Results';
      copyButton.style.marginTop = '10px';
      copyButton.style.padding = '5px 10px';
      copyButton.style.cursor = 'pointer';
      copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(resultText)
          .then(() => {
            copyButton.textContent = '✅ Copied!';
            setTimeout(() => copyButton.textContent = '📋 Copy Results', 2000);
          })
          .catch(err => {
            copyButton.textContent = '❌ Failed to copy';
            console.error('Failed to copy:', err);
          });
      });
      modal.appendChild(copyButton);
      
      document.body.appendChild(modal);
    } catch (error) {
      console.error('Failed to run diagnostics:', error);
      showToast('Failed to run diagnostics: ' + error.message, 'error');
    } finally {
      diagButton.textContent = '🔍 Run Diagnostics';
      diagButton.disabled = false;
    }
  });
  
  document.body.appendChild(diagButton);
}

// Initialize diagnostics button when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(showNetworkDiagnostics, 2000); // Delay to ensure other elements are loaded
});