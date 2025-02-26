# Hugging Face API Integration Guide

## Overview

DEGEN ROAST 3000 uses the Hugging Face Inference API to generate high-quality, AI-powered roasts. This integration enhances the application with more creative, contextual, and personalized roasts, especially at higher intensity levels.

## Configuration

### Requirements

1. **Hugging Face Account**: You need to create an account at [huggingface.co](https://huggingface.co)
2. **API Token**: Generate a token at [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
3. **Environment Variable**: Set the token in a `.env` file:
   ```
   HF_TOKEN=your_token_here
   ```

### Verification

The application includes a verification script to test API connectivity:

```
node verify-token.js
```

This script:
- Checks if the HF_TOKEN environment variable is set
- Tests the token with a simple API request
- Provides feedback on the connection status

## Implementation Details

### Model Selection

The integration now uses the `deepseek-ai/DeepSeek-R1-Distill-Qwen-32B` model, which offers:
- High-quality text generation
- Improved creative responses
- Enhanced context understanding
- Better handling of humor and roasting
- Excellent multilingual capabilities

### API Call Structure

We use the Hugging Face Inference JavaScript SDK:

```javascript
// Install with: npm install --save @huggingface/inference
const { HfInference } = require("@huggingface/inference");

// Initialize the client
const hfClient = new HfInference(process.env.HF_TOKEN);

// Make a chat completion request
const response = await hfClient.chatCompletion({
  model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
  messages: [
    { role: "user", content: prompt }
  ],
  temperature: 0.8,
  max_tokens: 150,
  top_p: 0.9
});
```

### Prompt Construction

The application constructs prompts that include:
1. The user's message
2. Detected topics
3. Desired roast level (1-5)
4. Instructions for style and tone

Example prompt:
```
Generate a savage, funny roast of someone. The roast should be about this topic: "crypto, investing". 
The roast level should be 4/5 in intensity (5 being most brutal).
Their message was: "I just bought the dip but it keeps dipping"
Make it very creative, funny, and devastating. Maximum 2 sentences.
```

### Fallback System

The integration includes a robust fallback system:
- Uses local roasts if the API is unavailable
- Falls back if the token is missing
- Uses local roasts for lower levels (1-2) most of the time
- Mixes local and API roasts at higher levels for variety

## Usage Logic

The application decides whether to use the API based on:

```javascript
if (hfClient && normalizedLevel >= 3 && Math.random() > (0.6 - normalizedLevel * 0.1)) {
  // Use Hugging Face API with DeepSeek model
} else {
  // Use local roast database
}
```

This means:
- API is used primarily for levels 3-5
- Level 3: ~70% local, ~30% API
- Level 4: ~50% local, ~50% API
- Level 5: ~10% local, ~90% API

## Response Processing

After receiving the API response:
1. Extract the generated text from `response.choices[0].message.content`
2. Clean up by removing any prompts/artifacts
3. Apply additional processing:
   - Add emphases (uppercase words)
   - Add prefixes/suffixes
   - Add emojis
   - Format based on roast level

## Streaming Capability (Future Enhancement)

The SDK also supports streaming completions for more responsive UI:

```javascript
const stream = hfClient.chatCompletionStream({
  model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
  messages: [
    { role: "user", content: prompt }
  ],
  temperature: 0.5,
  max_tokens: 150,
  top_p: 0.7
});

let out = "";
for await (const chunk of stream) {
  if (chunk.choices && chunk.choices.length > 0) {
    const newContent = chunk.choices[0].delta.content;
    out += newContent;
    // Update UI with new content
  }  
}
```

## Troubleshooting

Common issues:
- **Missing Token**: Ensure HF_TOKEN is set in .env file
- **Rate Limits**: Hugging Face has usage limits on free accounts
- **Network Issues**: Check your internet connection
- **Model Availability**: The model may occasionally be under maintenance

For any issues, the application will:
1. Log detailed error information to the console
2. Fall back to local roast generation
3. Continue functioning without interruption

## Extending the Integration

To modify or extend this integration:
1. Edit `server/utils/api-integration.js` for API call logic
2. Modify `verify-token.js` to test additional functionality
3. Consider trying different Hugging Face models by changing the `model` parameter
4. Adjust prompt engineering for different response styles 