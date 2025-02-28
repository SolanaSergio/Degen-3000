// Environment variable checker for Vercel deployment
require('dotenv').config();

function checkEnvironment() {
  const requiredVars = ['HF_TOKEN'];
  const missingVars = [];

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missingVars.join(', ')}`);
    console.warn('⚠️ The application may fall back to local mode or have limited functionality');
    return false;
  }

  console.log('✅ All required environment variables are set');
  return true;
}

module.exports = { checkEnvironment }; 