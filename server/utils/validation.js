/**
 * Input validation utilities for DEGEN ROAST 3000
 */

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - User input string
 * @returns {string} - Sanitized input
 */
function sanitizeUserInput(input) {
  if (!input) return '';
  
  // Basic XSS prevention - strip HTML tags
  const sanitized = input
    .toString()
    .replace(/<(script|iframe|object|embed|applet)/gi, '&lt;$1')
    .replace(/<\/?(script|iframe|object|embed|applet)>/gi, '&lt;$1&gt;')
    .replace(/javascript:/gi, 'disabled-javascript:')
    .replace(/onerror=/gi, 'disabled-onerror=')
    .replace(/onclick=/gi, 'disabled-onclick=');
    
  return sanitized;
}

/**
 * Validate a chat request
 * @param {Object} request - Chat request object
 * @returns {Object} - Validation result {valid: boolean, message: string}
 */
function validateChatRequest(request) {
  if (!request) {
    return {
      valid: false,
      message: "Missing request body"
    };
  }
  
  if (!request.message) {
    return {
      valid: false,
      message: "Missing 'message' field"
    };
  }
  
  if (typeof request.message !== 'string') {
    return {
      valid: false,
      message: "Message must be a string"
    };
  }
  
  if (request.message.length > 1000) {
    return {
      valid: false,
      message: "Message too long (max 1000 characters)"
    };
  }
  
  // Check for empty message after trimming whitespace
  if (request.message.trim().length === 0) {
    return {
      valid: false,
      message: "Message cannot be empty"
    };
  }
  
  return {
    valid: true,
    message: "Request is valid"
  };
}

module.exports = {
  sanitizeUserInput,
  validateChatRequest
}; 