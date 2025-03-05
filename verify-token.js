// Script to verify Hugging Face token
require('dotenv').config();
const { HfInference } = require('@huggingface/inference');

console.log('\n---------------------------------------------');
console.log('🔍 HUGGING FACE TOKEN VERIFICATION');
console.log('---------------------------------------------');

// Check if HF_TOKEN exists
if (!process.env.HF_TOKEN) {
  console.error('❌ ERROR: HF_TOKEN is not set in your .env file');
  console.log('\nPlease create a .env file with your Hugging Face token:');
  console.log('HF_TOKEN=your_token_here');
  console.log('\nGet your token from: https://huggingface.co/settings/tokens');
  process.exit(1);
}

// Log token info
console.log(`✓ HF_TOKEN found (starts with: ${process.env.HF_TOKEN.substring(0, 5)}...)`);
console.log('Verifying token with Hugging Face API...');

// Initialize the Hugging Face client
const client = new HfInference(process.env.HF_TOKEN);

// The model we want to use
const MODEL = "mistralai/Mistral-7B-Instruct-v0.2";
console.log(`Testing with model: ${MODEL}`);

// Simple test request
async function verifyToken() {
  try {
    // Use textGeneration instead of chatCompletion
    const response = await client.textGeneration({
      model: MODEL,
      inputs: "Generate a short test response.",
      parameters: {
        max_new_tokens: 20,
        temperature: 0.7
      }
    });

    if (response && response.generated_text) {
      console.log('✅ SUCCESS: Token verified! API connection is working correctly.');
      console.log('\nAPI Response:');
      console.log(response.generated_text);
      return true;
    } else {
      console.error('❌ ERROR: Invalid response format');
      console.error(response);
      return false;
    }
  } catch (error) {
    console.error('❌ ERROR: Failed to connect to Hugging Face API');
    console.error(error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', await error.response.text());
    }
    return false;
  }
}

// Run the verification
verifyToken().then(success => {
  console.log('\n---------------------------------------------');
  if (success) {
    console.log('✅ Token verification successful! Your Hugging Face integration is working.');
  } else {
    console.log('❌ Token verification failed. Please check your token and try again.');
  }
  console.log('---------------------------------------------\n');
}); 