// Test Hugging Face API connection
require('dotenv').config();
const { HfInference } = require('@huggingface/inference');

async function testHuggingFaceConnection() {
  console.log('Testing Hugging Face API connection...');
  console.log(`HF_TOKEN (first 5 chars): ${process.env.HF_TOKEN.substring(0, 5)}...`);
  console.log(`Model: ${process.env.MODEL_NAME}`);
  
  try {
    const hf = new HfInference(process.env.HF_TOKEN);
    console.log('Created HfInference client successfully');
    
    // Test with a roast prompt
    console.log('Generating a test response...');
    const response = await hf.textGeneration({
      model: process.env.MODEL_NAME || "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
      inputs: "Generate a creative insult about someone who can't code: ",
      parameters: {
        max_new_tokens: 100,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true,
        return_full_text: false
      }
    });
    
    console.log('API Response:', response);
    
    if (!response.generated_text) {
      throw new Error('No generated text in response');
    }
    
    console.log('Test completed successfully!');
    return true;
  } catch (error) {
    console.error('Error connecting to Hugging Face API:', error.message);
    console.error('Full error:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      try {
        const errorText = await error.response.text();
        console.error('Response text:', errorText);
      } catch (e) {
        console.error('Could not parse error response');
      }
    }
    return false;
  }
}

// Run the test
testHuggingFaceConnection()
  .then(success => {
    console.log(`Test ${success ? 'passed' : 'failed'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 