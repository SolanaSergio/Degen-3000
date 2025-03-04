#!/bin/bash
# Test Environment Variables for Vercel Deployment
# This script tests if your environment variables are correctly set up
# for Hugging Face integration and Vercel deployment.

# Style helpers
BOLD='\033[1m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BOLD}DEGEN ROAST 3000 - Environment Variable Check${NC}"
echo -e "This script will check if your environment variables are set up correctly for deployment."
echo -e "------------------------------------------------------------"

# Check if .env file exists
if [ -f .env ]; then
  echo -e "${GREEN}✓${NC} .env file found"
else
  echo -e "${RED}✗${NC} .env file not found!"
  echo -e "   Create an .env file based on .env.example"
  exit 1
fi

# Check required variables
echo -e "\n${BOLD}Checking required variables:${NC}"

# Check HF_TOKEN (the only truly required variable)
if grep -q "HF_TOKEN=" .env; then
  HF_TOKEN_VALUE=$(grep "HF_TOKEN=" .env | cut -d '=' -f2)
  if [[ $HF_TOKEN_VALUE == *"your_"* ]] || [[ -z "$HF_TOKEN_VALUE" ]]; then
    echo -e "${RED}✗${NC} HF_TOKEN is set but appears to be a placeholder or empty"
  else
    TOKEN_START=$(echo $HF_TOKEN_VALUE | cut -c1-5)
    echo -e "${GREEN}✓${NC} HF_TOKEN is set (starts with: ${TOKEN_START}...)"
  fi
else
  echo -e "${RED}✗${NC} HF_TOKEN is not set in .env file"
fi

# Check for conflicting/legacy variables
echo -e "\n${BOLD}Checking for conflicting variables:${NC}"
if grep -q "HUGGINGFACE_API_TOKEN=" .env; then
  echo -e "${YELLOW}!${NC} HUGGINGFACE_API_TOKEN found in .env file"
  echo -e "   This variable is not used by the application. Use HF_TOKEN instead."
else
  echo -e "${GREEN}✓${NC} No conflicting Hugging Face token variables found"
fi

# Check Vercel-specific variables
echo -e "\n${BOLD}Checking optional variables for Vercel:${NC}"
OPTIONAL_VARS=("PORT" "NODE_ENV" "DEBUG_MODE" "LOG_LEVEL")

for VAR in "${OPTIONAL_VARS[@]}"; do
  if grep -q "$VAR=" .env; then
    echo -e "${GREEN}✓${NC} $VAR is set"
  else
    echo -e "${YELLOW}!${NC} $VAR is not set (optional)"
  fi
done

# Check SESSION_SECRET separately 
if grep -q "SESSION_SECRET=" .env; then
  echo -e "${GREEN}✓${NC} SESSION_SECRET is set (optional - has secure default value)"
else
  echo -e "${GREEN}✓${NC} SESSION_SECRET is not set - using secure default value"
fi

# Verify token with Hugging Face
echo -e "\n${BOLD}Testing Hugging Face connection:${NC}"
echo -e "${BLUE}>${NC} Running: node verify-token.js"
echo -e "${BLUE}>${NC} This might take a few seconds..."
echo -e "------------------------------------------------------------"
node verify-token.js
echo -e "------------------------------------------------------------"

# Final instructions
echo -e "\n${BOLD}Next steps for Vercel deployment:${NC}"
echo -e "1. Make sure to add the HF_TOKEN environment variable in your Vercel project settings"
echo -e "2. After deployment, visit your-app-url.com/api/check-deployment?test_key=degentest123 to verify"
echo -e "3. If you encounter issues, run 'node scripts/vercel-deployment-check.js' locally first"

exit 0 