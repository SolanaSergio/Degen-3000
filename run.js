// Script to run the DEGEN ROAST 3000 server
const path = require('path');
require('dotenv').config();

console.log('\n---------------------------------------------');
console.log(`🔥 DEGEN ROAST 3000 - SAVAGE EDITION v2.1.0 🔥`);
console.log('---------------------------------------------');

// Check for HF_TOKEN
if (!process.env.HF_TOKEN) {
  console.warn('\n⚠️ WARNING: HF_TOKEN environment variable is not set.');
  console.warn('The server will run with local roasts only (no AI generation).');
  console.warn('\nTo enable Hugging Face API integration:');
  console.warn('1. Create a .env file in the project root');
  console.warn('2. Add your Hugging Face token:');
  console.warn('   HF_TOKEN=your_token_here');
  console.warn('\nGet your token from: https://huggingface.co/settings/tokens');
  console.warn('\nContinuing with local roast generation only...');
} else {
  console.log('✅ HF_TOKEN found - Hugging Face API integration enabled');
  console.log(`Token starts with: ${process.env.HF_TOKEN.substring(0, 5)}...`);
  console.log('Using DeepSeek-R1 model for enhanced roast generation');
  console.log('Run "node verify-token.js" to test your token with the API');
}

console.log('\nStarting server...');

// Start the server
require('./server/server.js'); 