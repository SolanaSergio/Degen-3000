/**
 * Session Manager for DEGEN ROAST 3000
 * 
 * Handles user sessions, roast level progression, and user preferences
 */

// In-memory session storage
const sessions = new Map();

// Session defaults
const DEFAULT_SESSION = {
  id: null,
  roastLevel: 1,
  messageCount: 0,
  lastInteraction: null,
  preferences: {
    theme: 'crypto', // Default theme: crypto, hacker, gamer
    volume: 0.5,     // Default volume: 0-1
  },
  history: [],
  topics: new Set(['general']), // Topics detected in user messages
  created: null,
  expiry: null,
};

// Session expiry time (24 hours)
const SESSION_EXPIRY = 24 * 60 * 60 * 1000;

/**
 * Generate a unique session ID
 * @returns {string} Unique session ID
 */
function generateSessionId() {
  return 'session_' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Create a new session
 * @returns {object} New session object
 */
function createSession() {
  const now = Date.now();
  const sessionId = generateSessionId();
  
  const session = {
    ...DEFAULT_SESSION,
    id: sessionId,
    created: now,
    lastInteraction: now,
    expiry: now + SESSION_EXPIRY
  };
  
  sessions.set(sessionId, session);
  
  console.log(`Created new session: ${sessionId}`);
  return session;
}

/**
 * Get a session by ID, create if not exists
 * @param {string} sessionId - Session ID
 * @returns {object} Session object
 */
function getSession(sessionId) {
  if (!sessionId || !sessions.has(sessionId)) {
    return createSession();
  }
  
  const session = sessions.get(sessionId);
  
  // Check if session has expired
  if (Date.now() > session.expiry) {
    sessions.delete(sessionId);
    return createSession();
  }
  
  return session;
}

/**
 * Update a session
 * @param {string} sessionId - Session ID
 * @param {object} updates - Updates to apply to the session
 * @returns {object} Updated session
 */
function updateSession(sessionId, updates) {
  const session = getSession(sessionId);
  
  const updatedSession = {
    ...session,
    ...updates,
    lastInteraction: Date.now(),
    expiry: Date.now() + SESSION_EXPIRY
  };
  
  sessions.set(sessionId, updatedSession);
  return updatedSession;
}

/**
 * Add a message to the session history
 * @param {string} sessionId - Session ID
 * @param {string} role - Message role (user or assistant)
 * @param {string} content - Message content
 * @returns {object} Updated session
 */
function addMessage(sessionId, role, content) {
  const session = getSession(sessionId);
  
  const updatedHistory = [
    ...session.history,
    {
      role,
      content,
      timestamp: Date.now()
    }
  ];
  
  // Limit history to last 50 messages
  if (updatedHistory.length > 50) {
    updatedHistory.shift();
  }
  
  const updatedSession = {
    ...session,
    history: updatedHistory,
    messageCount: session.messageCount + 1,
    lastInteraction: Date.now(),
    expiry: Date.now() + SESSION_EXPIRY
  };
  
  // Increase roast level based on message count
  if (role === 'user') {
    const newRoastLevel = Math.min(5, 1 + Math.floor(updatedSession.messageCount / 3));
    updatedSession.roastLevel = newRoastLevel;
  }
  
  sessions.set(sessionId, updatedSession);
  return updatedSession;
}

/**
 * Update user preferences
 * @param {string} sessionId - Session ID
 * @param {object} preferences - User preferences
 * @returns {object} Updated session
 */
function updatePreferences(sessionId, preferences) {
  const session = getSession(sessionId);
  
  const updatedSession = {
    ...session,
    preferences: {
      ...session.preferences,
      ...preferences
    },
    lastInteraction: Date.now(),
    expiry: Date.now() + SESSION_EXPIRY
  };
  
  sessions.set(sessionId, updatedSession);
  return updatedSession;
}

/**
 * Add topics to a session
 * @param {string} sessionId - Session ID
 * @param {Array<string>} newTopics - Topics to add
 * @returns {object} Updated session
 */
function addTopics(sessionId, newTopics) {
  const session = getSession(sessionId);
  
  const updatedTopics = new Set([...session.topics]);
  newTopics.forEach(topic => updatedTopics.add(topic));
  
  const updatedSession = {
    ...session,
    topics: updatedTopics,
    lastInteraction: Date.now(),
    expiry: Date.now() + SESSION_EXPIRY
  };
  
  sessions.set(sessionId, updatedSession);
  return updatedSession;
}

/**
 * Clean up expired sessions
 */
function cleanupSessions() {
  const now = Date.now();
  let expiredCount = 0;
  
  for (const [sessionId, session] of sessions.entries()) {
    if (now > session.expiry) {
      sessions.delete(sessionId);
      expiredCount++;
    }
  }
  
  if (expiredCount > 0) {
    console.log(`Cleaned up ${expiredCount} expired sessions. Active sessions: ${sessions.size}`);
  }
}

// Run cleanup every hour
setInterval(cleanupSessions, 60 * 60 * 1000);

module.exports = {
  createSession,
  getSession,
  updateSession,
  addMessage,
  updatePreferences,
  addTopics
}; 