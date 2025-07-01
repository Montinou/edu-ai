# AI Providers Setup Guide

This guide explains how to set up and configure the various AI providers in the IAEducation platform.

## Environment Variables

Copy the following variables to your `.env.local` file and fill in your API keys:

```env
# AI Provider Selection - choose one: google, vercel, huggingface, groq
AI_PROVIDER=google

# Google AI (Gemini)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
GOOGLE_AI_MODEL=gemini-1.5-flash

# OpenAI via Vercel AI SDK
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4-turbo

# Hugging Face
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
HUGGINGFACE_MODEL=mistralai/Mixtral-8x7B-Instruct-v0.1

# Groq
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-70b-versatile

# Free AI Smart Switching - Enable or disable
ENABLE_SMART_SWITCHING=true
# Logging level for AI switching (debug, info, warn, error)
AI_SWITCHING_LOG_LEVEL=info

# Database connection (for storing usage metrics)
DATABASE_URL=your_database_url_here
```

## Smart AI Switching

The platform includes a "Free AI Smart Switching" system that automatically selects the best available AI provider based on:

1. API key availability
2. Usage limits
3. Provider priority

To enable this feature, set `ENABLE_SMART_SWITCHING=true` in your environment variables.

## Provider Setup

### Google AI (Gemini)

1. Go to https://makersuite.google.com/
2. Create an API key
3. Add the key to your `.env.local` file as `GOOGLE_AI_API_KEY`

### OpenAI

1. Go to https://platform.openai.com/
2. Create an API key
3. Add the key to your `.env.local` file as `OPENAI_API_KEY`

### Hugging Face

1. Go to https://huggingface.co/settings/tokens
2. Create an API token
3. Add the token to your `.env.local` file as `HUGGINGFACE_API_KEY`

### Groq

1. Go to https://console.groq.com/
2. Create an API key
3. Add the key to your `.env.local` file as `GROQ_API_KEY`

## Testing AI Providers

You can test the AI providers using the included test script:

```bash
node scripts/test-ai-services.js
```

This script will cycle through all configured providers and test:
- Math problem generation
- Complete card generation

## Troubleshooting

If you encounter issues with the AI providers:

1. Check that your API keys are correct
2. Verify that the models specified are available with your current subscription
3. Check the console logs for detailed error messages
4. Try setting `AI_SWITCHING_LOG_LEVEL=debug` for more verbose logging 