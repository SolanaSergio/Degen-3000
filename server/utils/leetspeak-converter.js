/**
 * DEGEN ROAST 3000 - LeetSpeak Converter Utility
 * 
 * This module provides functions to convert leetspeak to normal text.
 * Used to normalize responses that might come back in leetspeak format.
 */

/**
 * Leetspeak converter for DEGEN ROAST 3000
 * 
 * Provides functions to convert between normal text and leetspeak
 */

// Leetspeak character mappings
const LEET_MAP = {
  'a': ['4', '@', 'a', 'A', '/-\\', '/\\'],
  'b': ['8', '6', 'b', 'B', '|3', '|8', 'ß'],
  'c': ['c', 'C', '(', '<', '[', '©'],
  'd': ['d', 'D', '|)', '|]', 'Ð'],
  'e': ['3', 'e', 'E', '€'],
  'f': ['f', 'F', 'ph', '|='],
  'g': ['g', 'G', '6', '9', '&'],
  'h': ['h', 'H', '|-|', '}{', ']-['],
  'i': ['1', 'i', 'I', '!', '|', 'eye'],
  'j': ['j', 'J', ';', '_|'],
  'k': ['k', 'K', '|<', '|{'],
  'l': ['l', 'L', '1', '|', '|_'],
  'm': ['m', 'M', '/\\/\\', '|\\/|', '/v\\'],
  'n': ['n', 'N', '|\\|', '/\\/', '|v|'],
  'o': ['0', 'o', 'O', '()', '[]', 'Ø'],
  'p': ['p', 'P', '|*', '|o', '|>', '|7'],
  'q': ['q', 'Q', '9', '(,)', 'O\\', 'kw'],
  'r': ['r', 'R', '|2', '|?', '/2'],
  's': ['5', 's', 'S', '$', 'z'],
  't': ['7', 't', 'T', '+', '†'],
  'u': ['u', 'U', '|_|', '\\_\\', '/_/', 'µ'],
  'v': ['v', 'V', '\\/', '√'],
  'w': ['w', 'W', '\\/\\/', 'vv', '\\^/', '\\|/'],
  'x': ['x', 'X', '><', ')(', '}{'],
  'y': ['y', 'Y', '`/', '¥'],
  'z': ['z', 'Z', '2', 's', '7_', '>_']
};

// Reverse mapping for leetspeak to normal text conversion
const REVERSE_LEET_MAP = {};
Object.keys(LEET_MAP).forEach(char => {
  LEET_MAP[char].forEach(leetChar => {
    REVERSE_LEET_MAP[leetChar.toLowerCase()] = char;
  });
});

/**
 * Convert normal text to leetspeak
 * @param {string} text - Normal text to convert
 * @param {number} intensity - How extreme the leetspeak should be (1-5)
 * @returns {string} - Text converted to leetspeak
 */
function normalToLeet(text, intensity = 3) {
  if (!text) return '';
  
  // Normalize intensity
  const level = Math.min(Math.max(1, intensity), 5);
  
  // Convert text to leetspeak character by character
  let result = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i].toLowerCase();
    
    // If the character has a leetspeak equivalent, maybe replace it
    if (LEET_MAP[char]) {
      // Higher intensity means more replacements
      const replacementChance = 0.2 * level;
      
      if (Math.random() < replacementChance) {
        // Choose a replacement based on intensity
        // Higher intensity allows more complex replacements
        const leetOptions = LEET_MAP[char].slice(0, Math.floor(level * LEET_MAP[char].length / 5) + 1);
        const leetChar = leetOptions[Math.floor(Math.random() * leetOptions.length)];
        result += leetChar;
      } else {
        result += char;
      }
    } else {
      // Keep non-letter characters as they are
      result += text[i];
    }
  }
  
  return result;
}

/**
 * Convert leetspeak text to normal text
 * @param {string} leetText - Leetspeak text to convert
 * @returns {string} - Normalized text
 */
function leetToNormal(leetText) {
  if (!leetText) return '';
  
  // Process word by word to handle multi-character leet codes
  const words = leetText.split(/\s+/);
  const normalizedWords = words.map(word => {
    // First try simple character-by-character replacement
    let normalWord = '';
    for (let i = 0; i < word.length; i++) {
      const char = word[i].toLowerCase();
      normalWord += REVERSE_LEET_MAP[char] || word[i];
    }
    
    // Now check for complex multi-character leet codes
    Object.keys(LEET_MAP).forEach(normalChar => {
      LEET_MAP[normalChar].forEach(leetChar => {
        // Skip single-character replacements as they've been handled
        if (leetChar.length > 1) {
          normalWord = normalWord.replace(new RegExp(leetChar, 'gi'), normalChar);
        }
      });
    });
    
    return normalWord;
  });
  
  return normalizedWords.join(' ');
}

/**
 * Identify if text contains significant amount of leetspeak
 * @param {string} text - Text to analyze
 * @returns {boolean} - True if text likely contains leetspeak
 */
function containsLeetspeak(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }

  // Count leetspeak characters
  const leetChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '@', '#', '$', '+'];
  let leetCount = 0;
  let totalCount = 0;

  for (const char of text) {
    if (/[a-z0-9]/i.test(char)) {
      totalCount++;
      if (leetChars.includes(char)) {
        leetCount++;
      }
    }
  }

  // If more than 15% of alphanumeric characters are leetspeak, consider it leetspeak
  return totalCount > 0 && (leetCount / totalCount) >= 0.15;
}

/**
 * Convert markdown with leetspeak to regular markdown
 * @param {string} markdownText - Markdown text that might contain leetspeak
 * @returns {string} - Normalized markdown
 */
function convertLeetMarkdownToNormal(markdownText) {
  if (!markdownText || typeof markdownText !== 'string') {
    return markdownText;
  }

  // Split the markdown into lines to handle each line separately
  // This preserves markdown formatting (headings, lists, etc.)
  const lines = markdownText.split('\n');
  const normalizedLines = lines.map(line => {
    // Preserve markdown syntax at the beginning of lines (##, >, -, *, etc.)
    const mdMatch = line.match(/^(\s*(?:#|>|\-|\*|\+|\d+\.|\`{3})\s*)(.*)/);
    
    if (mdMatch) {
      // Keep the markdown prefix, convert only the content
      return mdMatch[1] + leetToNormal(mdMatch[2]);
    }
    
    // Check for code blocks
    if (line.trim() === '```' || line.match(/^```[a-z]*/i)) {
      return line; // Don't convert code block markers
    }
    
    // Convert normal text
    return leetToNormal(line);
  });

  return normalizedLines.join('\n');
}

module.exports = {
  normalToLeet,
  leetToNormal,
  containsLeetspeak,
  convertLeetMarkdownToNormal
}; 