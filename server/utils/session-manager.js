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
  const sessionId = generateSessionId();
  const now = Date.now();
  
  const session = {
    ...DEFAULT_SESSION,
    id: sessionId,
    created: now,
    lastInteraction: now,
    expiry: now + SESSION_EXPIRY
  };
  
  sessions.set(sessionId, session);
  
  console.log(`Created new session: ${sessionId}. Total active sessions: ${sessions.size}`);
  
  return session;
}

/**
 * Get a session by ID, or create a new one if not found
 * @param {string} sessionId - Session ID
 * @returns {object} Session object
 */
function getSession(sessionId) {
  // If no session ID, create a new session
  if (!sessionId) {
    return createSession();
  }
  
  // If session exists, return it with updated expiry
  if (sessions.has(sessionId)) {
    const session = sessions.get(sessionId);
    
    // Update last interaction and expiry
    session.lastInteraction = Date.now();
    session.expiry = Date.now() + SESSION_EXPIRY;
    
    return session;
  }
  
  // If session ID not found, create a new one
  return createSession();
}

/**
 * Update session data
 * @param {string} sessionId - Session ID
 * @param {object} updates - Data to update
 * @returns {object} Updated session
 */
function updateSession(sessionId, updates) {
  // Get or create session
  const session = getSession(sessionId);
  
  // Apply updates
  Object.assign(session, updates);
  
  // Update last interaction time
  session.lastInteraction = Date.now();
  
  // Update session in storage
  sessions.set(sessionId, session);
  
  return session;
}

/**
 * Add a message to session history
 * @param {string} sessionId - Session ID
 * @param {string} role - Message role ('user' or 'assistant')
 * @param {string} content - Message content
 * @returns {object} Updated session
 */
function addMessage(sessionId, role, content) {
  // Get session
  const session = getSession(sessionId);
  
  // Create message object
  const message = {
    role,
    content,
    timestamp: Date.now()
  };
  
  // Add to history
  session.history.push(message);
  
  // Cap history at 50 messages
  if (session.history.length > 50) {
    session.history.shift();
  }
  
  // Increment message count
  session.messageCount++;
  
  // Auto-increment roast level based on message count
  // Every 5 messages, increase roast level (up to 5)
  if (role === 'user' && session.messageCount % 5 === 0 && session.roastLevel < 5) {
    session.roastLevel++;
    console.log(`Auto-increasing roast level to ${session.roastLevel} for session ${sessionId}`);
  }
  
  // Update session in storage
  sessions.set(sessionId, session);
  
  return session;
}

/**
 * Update user preferences
 * @param {string} sessionId - Session ID
 * @param {object} preferences - Preference updates
 * @returns {object} Updated session
 */
function updatePreferences(sessionId, preferences) {
  // Get session
  const session = getSession(sessionId);
  
  // Apply preference updates
  session.preferences = {
    ...session.preferences,
    ...preferences
  };
  
  // Update session in storage
  sessions.set(sessionId, session);
  
  return session;
}

/**
 * Add topics to session
 * @param {string} sessionId - Session ID
 * @param {Array<string>} newTopics - Topics to add
 * @returns {object} Updated session
 */
function addTopics(sessionId, newTopics) {
  // Get session
  const session = getSession(sessionId);
  
  // Add topics to set
  newTopics.forEach(topic => session.topics.add(topic));
  
  // Update session in storage
  sessions.set(sessionId, session);
  
  return session;
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
  addTopics,
  cleanupSessions
}; 