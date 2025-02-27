/**
 * utils.js
 * Utility functions for DEGEN ROAST 3000
 */

/**
 * Utility to truncate text to a certain length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} - Truncated text with ellipsis if needed
 */
function truncateText(text, length) {
  if (text.length <= length) return text;
  return text.substring(0, length - 3) + '...';
}

/**
 * Format a timestamp into a readable time
 * @param {number} timestamp - Timestamp in milliseconds
 * @returns {string} - Formatted time string
 */
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Generate a random ID
 * @param {number} length - Length of the ID
 * @returns {string} - Random ID
 */
function generateRandomId(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Debounce a function to limit how often it can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Escape HTML to prevent XSS
 * @param {string} html - HTML string to escape
 * @returns {string} - Escaped HTML
 */
function escapeHtml(html) {
  const el = document.createElement('div');
  el.innerText = html;
  return el.innerHTML;
}

/**
 * Get a random element from an array
 * @param {Array} array - Array to select from
 * @returns {*} - Random element
 */
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate a random number between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random number
 */
function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Format a number with commas
 * @param {number} number - Number to format
 * @returns {string} - Formatted number
 */
function formatNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format a price for display
 * @param {number} price - Price to format
 * @param {boolean} includeCurrency - Whether to include currency symbol
 * @returns {string} - Formatted price
 */
function formatPrice(price, includeCurrency = true) {
  const formattedPrice = parseFloat(price).toFixed(2);
  return includeCurrency ? `$${formattedPrice}` : formattedPrice;
}

/**
 * Calculate percentage change
 * @param {number} oldValue - Old value
 * @param {number} newValue - New value
 * @returns {string} - Percentage change with sign
 */
function calculatePercentageChange(oldValue, newValue) {
  const change = ((newValue - oldValue) / oldValue) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

/**
 * Wait for a specified time
 * @param {number} ms - Time to wait in milliseconds
 * @returns {Promise} - Promise that resolves after the time
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export utilities for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    truncateText,
    formatTime,
    generateRandomId,
    debounce,
    escapeHtml,
    getRandomElement,
    getRandomNumber,
    formatNumber,
    formatPrice,
    calculatePercentageChange,
    wait
  };
} 