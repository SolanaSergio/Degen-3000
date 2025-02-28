# Vercel Deployment Guide

This document provides instructions for deploying the Degen Roast 3000 application to Vercel.

## Required Environment Variables

Set the following environment variables in your Vercel project settings:

```
# API Configuration
HF_TOKEN=your_huggingface_token_here
MODEL_NAME=deepseek-ai/DeepSeek-R1-Distill-Qwen-32B

# Server Configuration
PORT=8000
NODE_ENV=production

# Session
SESSION_SECRET=your_session_secret_here

# Debug mode (set to false in production)
DEBUG_MODE=false
```

## Deployment Steps

1. **Connect your repository to Vercel**
   - Create a new project in Vercel
   - Connect to your Git repository
   
2. **Configure build settings**
   - Build Command: `npm run build`
   - Output Directory: `public`
   - Install Command: `npm install`

3. **Add environment variables**
   - Add all the environment variables listed above
   
4. **Deploy**
   - Click "Deploy" and wait for the build to complete

## Troubleshooting

If you encounter any deployment issues:

1. Check the Vercel build logs for specific error messages
2. Ensure all required environment variables are set
3. Verify that your `vercel.json` file is properly configured
4. Confirm that your server.js is exporting the app for serverless deployment 