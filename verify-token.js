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

// The new model we want to use
const MODEL = "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B";
console.log(`Testing with model: ${MODEL}`);

// Simple test request
async function verifyToken() {
  try {
    // Use the new chatCompletion method with the DeepSeek model
    const response = await client.chatCompletion({
      model: MODEL,
      messages: [
        { role: "user", content: "Generate a short test response." }
      ],
      max_tokens: 20,
      temperature: 0.7
    });

    if (response && response.choices && response.choices.length > 0) {
      console.log('✅ SUCCESS: Token verified! API connection is working correctly.');
      console.log('\nAPI Response:');
      console.log(response.choices[0].message);
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

// Run verification
verifyToken()
  .then(success => {
    console.log('\n---------------------------------------------');
    if (success) {
      console.log('✅ You can now run the application with AI-powered roasts!');
      console.log(`   The application will use the ${MODEL} model.`);
      console.log('   Start the server with: node run.js');
    } else {
      console.log('❌ Token verification failed. Please check your token and try again.');
    }
    console.log('---------------------------------------------\n');
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 