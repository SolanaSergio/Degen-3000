# Vercel Deployment Guide for Degen Roast 3000

This document provides instructions for deploying the Degen Roast 3000 application to Vercel, with special attention to the Hugging Face API connection.

## Environment Variables Setup

Vercel requires environment variables to be explicitly set in the dashboard. Follow these steps to ensure your Hugging Face connection works properly:

### Required Environment Variables

1. **HF_TOKEN** - Your Hugging Face API token
   - This is the MOST IMPORTANT variable for AI functionality
   - Get your token from: https://huggingface.co/settings/tokens
   - Make sure your token has READ permissions

### Optional Environment Variables

These provide additional configuration but are not strictly required:

- **PORT** - Server port (Vercel may override this, but include it anyway)
  - Recommended value: `8000`

- **NODE_ENV** - Environment mode
  - Recommended value: `production`

- **DEBUG_MODE** - Set to `true` or `false`
  - Default: `false`

- **LOG_LEVEL** - Options: `error`, `warn`, `info`, `debug`
  - Default: `info`

- **SESSION_SECRET** - Secret for session encryption
  - ✅ **Completely Optional** - Has a secure default value
  - Only set this if you want to use a custom session secret

## Step-by-Step Deployment Process

1. **Prepare your repository**
   - Make sure your code is in a GitHub, GitLab, or Bitbucket repository
   - Ensure your repository includes the `vercel.json` configuration file

2. **Connect to Vercel**
   - Create an account on [Vercel](https://vercel.com) if you don't have one
   - Create a new project and import your repository

3. **Configure build settings**
   - Framework Preset: `Other`
   - Build Command: `npm install && npm run build`
   - Output Directory: `public`
   - Install Command: `npm install`

4. **Add environment variables**
   - In your project settings, go to "Environment Variables"
   - **Required**: Add `HF_TOKEN` with your actual Hugging Face token value
   - Optional: Add any of the optional variables if you want to customize behavior

5. **Deploy**
   - Click "Deploy" to start the deployment process
   - Vercel will build and deploy your application

## Troubleshooting Hugging Face Connection Issues

If your application is not connecting to Hugging Face after deployment:

1. **Check Environment Variables**
   - Verify `HF_TOKEN` is correctly set in Vercel dashboard
   - Make sure there are no typos in the variable name (it MUST be `HF_TOKEN`, not something like `HUGGINGFACE_TOKEN`)

2. **Verify Token Permissions**
   - Ensure your Hugging Face token has proper READ permissions
   - Tokens with restricted access might not work with the DeepSeek model

3. **Check Function Logs**
   - In Vercel dashboard, go to "Functions" and check the logs for any errors
   - Look for messages related to Hugging Face initialization

4. **Test with local deployment first**
   - Run `node verify-token.js` locally to verify your token works
   - Confirm local deployment connects to Hugging Face before deploying to Vercel

5. **Check for Rate Limiting**
   - Hugging Face has rate limits that might affect your application
   - Consider implementing local fallbacks for high-traffic scenarios

## Making Changes After Deployment

After deploying, if you need to update environment variables:

1. Go to your project settings in Vercel dashboard
2. Update the necessary environment variables
3. Redeploy your application for changes to take effect 