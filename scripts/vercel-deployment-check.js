/**
 * Vercel Deployment Check
 * 
 * This script helps verify that your Vercel deployment is correctly set up
 * with the necessary environment variables, especially for Hugging Face integration.
 * 
 * Usage:
 * 1. Deploy your app to Vercel
 * 2. Add this script to your Vercel deployment
 * 3. Visit your-vercel-url.com/api/check-deployment to see the status
 */

// Import required packages
require('dotenv').config();
const HfInference = process.env.HF_TOKEN ? require('@huggingface/inference').HfInference : null;

// Function to evaluate environment status
async function checkEnvironment() {
  // Results object
  const results = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unspecified',
    isVercel: !!process.env.VERCEL,
    checks: {
      requiredVariables: {},
      optionalVariables: {},
      huggingFace: {
        status: 'unchecked',
        details: null
      }
    }
  };
  
  // Check required environment variables
  const requiredVars = ['HF_TOKEN'];
  for (const varName of requiredVars) {
    results.checks.requiredVariables[varName] = {
      exists: !!process.env[varName],
      value: process.env[varName] ? 
        (varName === 'HF_TOKEN' ? 
          `${process.env[varName].substring(0, 5)}...` : 
          process.env[varName]) 
        : null
    };
  }
  
  // Check optional environment variables
  const optionalVars = ['PORT', 'NODE_ENV', 'DEBUG_MODE', 'LOG_LEVEL', 'SESSION_SECRET'];
  for (const varName of optionalVars) {
    const hasDefaultValue = varName === 'SESSION_SECRET' || varName === 'PORT';
    
    results.checks.optionalVariables[varName] = {
      exists: !!process.env[varName],
      value: process.env[varName] || null,
      hasDefaultValue: hasDefaultValue,
      isRequired: false
    };
  }
  
  // Check for problematic legacy variables
  if (process.env.HUGGINGFACE_API_TOKEN) {
    results.checks.legacyVariables = {
      HUGGINGFACE_API_TOKEN: {
        exists: true,
        warning: "This variable is not used by the application. Use HF_TOKEN instead."
      }
    };
  }
  
  // Check Hugging Face connection
  if (process.env.HF_TOKEN && HfInference) {
    try {
      results.checks.huggingFace.status = 'checking';
      
      // Initialize the Hugging Face client
      const hfClient = new HfInference(process.env.HF_TOKEN);
      
      // Basic test to check if token is valid (simple text generation)
      const testPrompt = "Write a very short greeting";
      const response = await hfClient.textGeneration({
        model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
        inputs: testPrompt,
        parameters: {
          max_new_tokens: 20,
          temperature: 0.7
        }
      });
      
      // If we got here, the token is working
      results.checks.huggingFace = {
        status: 'success',
        details: {
          tokenValid: true,
          modelAccess: true,
          response: response.generated_text
        }
      };
    } catch (error) {
      // Capture error details
      results.checks.huggingFace = {
        status: 'error',
        details: {
          message: error.message,
          tokenValid: false,
          errorType: error.name,
          stack: process.env.NODE_ENV === 'development' ? error.stack : null
        }
      };
    }
  } else {
    results.checks.huggingFace = {
      status: 'unavailable',
      details: {
        reason: !process.env.HF_TOKEN ? 'Missing HF_TOKEN' : 'HfInference not loaded'
      }
    };
  }
  
  return results;
}

// Export for API route usage
module.exports = checkEnvironment;

// Run directly if executed as a script
if (require.main === module) {
  checkEnvironment().then(results => {
    console.log('DEPLOYMENT CHECK RESULTS:');
    console.log(JSON.stringify(results, null, 2));
    
    // Provide recommendations
    console.log('\nRECOMMENDATIONS:');
    
    // Check HF_TOKEN
    const hfToken = results.checks.requiredVariables.HF_TOKEN;
    if (!hfToken.exists) {
      console.log('❌ HF_TOKEN is missing. Set it in your Vercel environment variables.');
    } else if (results.checks.huggingFace.status === 'error') {
      console.log('❌ HF_TOKEN exists but is not working correctly:');
      console.log(`   Error: ${results.checks.huggingFace.details.message}`);
      console.log('   Please check that your token has the correct permissions.');
    } else if (results.checks.huggingFace.status === 'success') {
      console.log('✅ HF_TOKEN is valid and working properly.');
    }
    
    // Check for session secret
    const sessionSecret = results.checks.optionalVariables.SESSION_SECRET;
    if (!sessionSecret.exists) {
      console.log('ℹ️ SESSION_SECRET is not set. This is completely fine - a default secure value will be used.');
    }
    
    // Check for legacy variables
    if (results.checks.legacyVariables) {
      console.log('⚠️ Legacy variable(s) detected. Consider removing them:');
      Object.keys(results.checks.legacyVariables).forEach(varName => {
        console.log(`   ${varName}: ${results.checks.legacyVariables[varName].warning}`);
      });
    }
    
    // General advice
    if (results.isVercel) {
      console.log('ℹ️ Detected Vercel environment. Make sure HF_TOKEN is set in the Vercel dashboard.');
    } else {
      console.log('ℹ️ Not running on Vercel. If testing locally, ensure your .env file has HF_TOKEN set correctly.');
    }
  });
} 