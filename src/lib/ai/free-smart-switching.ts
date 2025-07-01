import { generateText } from 'ai';

// Define provider types
type TextModelConfig = {
  [key: string]: string;
};

type ProviderConfig = {
  models: {
    text: TextModelConfig;
    image: {
      generation: string;
    } | null;
  };
  limits: {
    dailyRequests?: number;
    monthlyRequests?: number;
    dailyTokens?: number;
    requestsPerMinute?: number;
    unlimited?: boolean;
  };
  priority: number;
  apiKeyEnvVar?: string; // Environment variable name for the API key
};

type Providers = {
  [key: string]: ProviderConfig;
};

// Define available free providers
const FREE_PROVIDERS: Providers = {
  // Completely free, ultra-fast
  groq: {
    models: {
      text: {
        versatile: 'llama-3.1-70b-versatile',
        instant: 'llama-3.1-8b-instant',
        reasoning: 'mixtral-8x7b-32768',
        efficient: 'gemma2-9b-it'
      },
      // Check if Groq supports image generation (currently doesn't)
      image: null
    },
    limits: {
      dailyRequests: 30000
    },
    priority: 1, // Highest priority
    apiKeyEnvVar: 'GROQ_API_KEY'
  },
  
  // Free $25 credits (~500K tokens/month)
  together: {
    models: {
      text: {
        reasoning: 'meta-llama/Llama-3-70b-chat-hf',
        efficient: 'meta-llama/Llama-3-8b-chat-hf',
        quality: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        creative: 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO'
      },
      image: null
    },
    limits: {
      dailyTokens: 25000
    },
    priority: 2,
    apiKeyEnvVar: 'TOGETHER_API_KEY'
  },
  
  // Free with API key
  huggingface: {
    models: {
      text: {
        conversation: 'microsoft/DialoGPT-large',
        chat: 'facebook/blenderbot-400M-distill',
        code: 'microsoft/CodeBERT-base',
        embeddings: 'sentence-transformers/all-MiniLM-L6-v2'
      },
      image: {
        generation: 'stabilityai/stable-diffusion-xl-base-1.0'
      }
    },
    limits: {
      dailyRequests: 100000
    },
    priority: 3,
    apiKeyEnvVar: 'HUGGINGFACE_API_KEY'
  },
  
  // Free 15 RPM, 1.5K requests/day
  google: {
    models: {
      text: {
        flash: 'gemini-1.5-flash'
      },
      image: null
    },
    limits: {
      dailyRequests: 1500,
      requestsPerMinute: 15
    },
    priority: 4,
    apiKeyEnvVar: 'GOOGLE_AI_API_KEY'
  },
  
  // Free 1000 requests/month
  cohere: {
    models: {
      text: {
        light: 'command-light'
      },
      image: null
    },
    limits: {
      monthlyRequests: 1000
    },
    priority: 5,
    apiKeyEnvVar: 'COHERE_API_KEY'
  },
  
  // Local models (free but requires setup)
  ollama: {
    models: {
      text: {
        llama: 'llama3.1',
        code: 'codellama',
        efficient: 'phi3'
      },
      image: null
    },
    limits: {
      unlimited: true
    },
    priority: 6 // Last resort if others fail or are exhausted
  }
};

// Check if we should enable smart switching
const isSwitchingEnabled = process.env.ENABLE_SMART_SWITCHING === 'true';

// Helper function to log based on configured level
function logAI(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: any[]) {
  const configuredLevel = process.env.AI_SWITCHING_LOG_LEVEL || 'info';
  const levels = { debug: 0, info: 1, warn: 2, error: 3 };
  
  if (levels[level] >= levels[configuredLevel as keyof typeof levels]) {
    const prefix = `[AI-Switch:${level.toUpperCase()}]`;
    switch(level) {
      case 'debug': console.debug(prefix, message, ...args); break;
      case 'info': console.info(prefix, message, ...args); break;
      case 'warn': console.warn(prefix, message, ...args); break;
      case 'error': console.error(prefix, message, ...args); break;
    }
  }
}

// Usage tracking to respect limits
type UsageRecord = {
  provider: string;
  date: string;
  requests: number;
  tokens: number;
};

// In-memory storage (replace with DB in production)
let usageRecords: UsageRecord[] = [];

// Get today's usage for a provider
async function getTodayUsage(provider: string): Promise<UsageRecord> {
  const today = new Date().toISOString().split('T')[0];
  
  const record = usageRecords.find(r => 
    r.provider === provider && r.date === today
  );
  
  if (!record) {
    const newRecord = { provider, date: today, requests: 0, tokens: 0 };
    usageRecords.push(newRecord);
    return newRecord;
  }
  
  return record;
}

// Update provider usage
async function updateUsage(provider: string, tokens: number = 0): Promise<void> {
  const record = await getTodayUsage(provider);
  record.requests += 1;
  record.tokens += tokens;
  
  logAI('debug', `Updated usage for ${provider}:`, {
    requests: record.requests,
    tokens: record.tokens,
    date: record.date
  });
}

// Check if provider is available (not exceeding limits and has API key if required)
async function isProviderAvailable(provider: string): Promise<boolean> {
  if (!FREE_PROVIDERS[provider]) return false;
  
  const providerConfig = FREE_PROVIDERS[provider];
  
  // Check if API key is required and available
  if (providerConfig.apiKeyEnvVar) {
    const apiKey = process.env[providerConfig.apiKeyEnvVar];
    if (!apiKey) {
      logAI('debug', `Provider ${provider} requires API key but none is set in ${providerConfig.apiKeyEnvVar}`);
      return false;
    }
  }
  
  // Ollama is always available (local)
  if (provider === 'ollama' && providerConfig.limits.unlimited) return true;
  
  const usage = await getTodayUsage(provider);
  
  // Check daily request limits
  if (providerConfig.limits.dailyRequests && 
      usage.requests >= providerConfig.limits.dailyRequests) {
    logAI('info', `Provider ${provider} has reached daily request limit: ${usage.requests}/${providerConfig.limits.dailyRequests}`);
    return false;
  }
  
  // Check monthly request limits (cohere)
  if (providerConfig.limits.monthlyRequests) {
    // Simple implementation - would need proper month tracking in production
    if (usage.requests >= providerConfig.limits.monthlyRequests) {
      logAI('info', `Provider ${provider} has reached monthly request limit: ${usage.requests}/${providerConfig.limits.monthlyRequests}`);
      return false;
    }
  }
  
  // Check token limits (together)
  if (providerConfig.limits.dailyTokens && 
      usage.tokens >= providerConfig.limits.dailyTokens) {
    logAI('info', `Provider ${provider} has reached daily token limit: ${usage.tokens}/${providerConfig.limits.dailyTokens}`);
    return false;
  }
  
  return true;
}

// Get available providers sorted by priority
async function getAvailableProviders(): Promise<string[]> {
  const providers = Object.keys(FREE_PROVIDERS);
  const available = await Promise.all(
    providers.map(async provider => {
      const isAvailable = await isProviderAvailable(provider);
      return { provider, isAvailable, priority: FREE_PROVIDERS[provider].priority };
    })
  );
  
  return available
    .filter(p => p.isAvailable)
    .sort((a, b) => a.priority - b.priority)
    .map(p => p.provider);
}

// Smart text generation with free provider switching
export async function generateWithFreeSwitching(
  prompt: string,
  options: {
    type?: 'reasoning' | 'creative' | 'conversation' | 'code';
    maxTokens?: number;
    temperature?: number;
  } = {}
) {
  const { type = 'conversation', maxTokens = 500, temperature = 0.7 } = options;
  
  // Check if smart switching is disabled - use default provider
  if (!isSwitchingEnabled) {
    const defaultProvider = process.env.AI_PROVIDER || 'google';
    logAI('info', `Smart switching disabled, using default provider: ${defaultProvider}`);
    return generateWithProvider(defaultProvider, prompt, { type, maxTokens, temperature });
  }
  
  // Get available providers in priority order
  const availableProviders = await getAvailableProviders();
  
  if (availableProviders.length === 0) {
    throw new Error('No free providers available. Try again later.');
  }
  
  logAI('info', `Smart switching enabled, available providers:`, availableProviders);
  
  // Try providers in order until successful
  for (const provider of availableProviders) {
    try {
      logAI('info', `Attempting to use provider: ${provider}`);
      const result = await generateWithProvider(provider, prompt, { type, maxTokens, temperature });
      return result;
    } catch (error) {
      logAI('warn', `Provider ${provider} failed:`, error instanceof Error ? error.message : String(error));
      // Continue to next provider
    }
  }
  
  // If all providers failed, try Ollama as last resort
  if (FREE_PROVIDERS.ollama) {
    try {
      logAI('info', `All cloud providers failed, attempting to use local Ollama models`);
      const result = await generateWithProvider('ollama', prompt, { type, maxTokens, temperature });
      return result;
    } catch (error) {
      logAI('error', 'Even Ollama failed:', error instanceof Error ? error.message : String(error));
    }
  }
  
  throw new Error('All providers failed. Please try again later.');
}

// Helper function to generate text with a specific provider
async function generateWithProvider(
  provider: string,
  prompt: string,
  options: {
    type?: 'reasoning' | 'creative' | 'conversation' | 'code';
    maxTokens?: number;
    temperature?: number;
  }
) {
  const { type = 'conversation', maxTokens = 500, temperature = 0.7 } = options;
  
  if (!FREE_PROVIDERS[provider]) {
    throw new Error(`Provider ${provider} not found`);
  }
  
  const modelConfig = FREE_PROVIDERS[provider].models.text;
  
  // Select best model for the task type
  let modelName: string;
  switch (type) {
    case 'reasoning':
      modelName = modelConfig.reasoning || modelConfig.versatile || Object.values(modelConfig)[0];
      break;
    case 'creative':
      modelName = modelConfig.creative || modelConfig.versatile || Object.values(modelConfig)[0];
      break;
    case 'code':
      modelName = modelConfig.code || modelConfig.reasoning || Object.values(modelConfig)[0];
      break;
    case 'conversation':
    default:
      modelName = modelConfig.conversation || modelConfig.chat || Object.values(modelConfig)[0];
  }
  
  // Get API key from environment if available
  const apiKeyEnvVar = FREE_PROVIDERS[provider].apiKeyEnvVar;
  const apiKey = apiKeyEnvVar ? process.env[apiKeyEnvVar] : undefined;
  
  // Create the model with the selected provider
  // Note: In a real implementation, you would import the specific provider SDK
  // and use it to create the model. For this example, we'll use a placeholder.
  const model = { 
    provider, 
    modelName,
    apiKey
  } as unknown as any;
  
  logAI('debug', `Using model: ${modelName} from provider: ${provider}`);
  
  // Example call to generate text - in actual implementation you would
  // import the specific provider libraries
  const startTime = Date.now();
  const result = await generateText({
    model,
    prompt,
    maxTokens,
    temperature
  });
  
  const latency = Date.now() - startTime;
  
  // Update usage stats
  await updateUsage(provider, result.usage?.totalTokens || estimateTokens(prompt, result.text));
  
  return {
    text: result.text,
    provider,
    model: modelName,
    latency,
    estimatedTokens: result.usage?.totalTokens || estimateTokens(prompt, result.text)
  };
}

// Image generation using Hugging Face (and Groq if available)
export async function generateImageWithFreeSwitching(
  prompt: string
) {
  // Check if smart switching is disabled - use default provider
  if (!isSwitchingEnabled) {
    const defaultProvider = process.env.AI_PROVIDER || 'huggingface';
    logAI('info', `Smart switching disabled, using default provider for image: ${defaultProvider}`);
    // Only continue if the default provider supports images
    if (!FREE_PROVIDERS[defaultProvider]?.models.image) {
      throw new Error(`Default provider ${defaultProvider} does not support image generation`);
    }
    return generateImageWithProvider(defaultProvider, prompt);
  }
  
  // Find providers that support image generation
  const imageProviders = Object.keys(FREE_PROVIDERS).filter(
    provider => FREE_PROVIDERS[provider].models.image !== null
  );
  
  // Get available image providers
  const availableProviders = await Promise.all(
    imageProviders.map(async provider => {
      const isAvailable = await isProviderAvailable(provider);
      return { provider, isAvailable, priority: FREE_PROVIDERS[provider].priority };
    })
  );
  
  const sortedProviders = availableProviders
    .filter(p => p.isAvailable)
    .sort((a, b) => a.priority - b.priority)
    .map(p => p.provider);
  
  if (sortedProviders.length === 0) {
    throw new Error('No image generation providers available.');
  }
  
  logAI('info', `Available image providers:`, sortedProviders);
  
  // Try providers in order
  for (const provider of sortedProviders) {
    try {
      logAI('info', `Attempting to use image provider: ${provider}`);
      const result = await generateImageWithProvider(provider, prompt);
      return result;
    } catch (error) {
      logAI('warn', `Image provider ${provider} failed:`, error instanceof Error ? error.message : String(error));
      // Continue to next provider
    }
  }
  
  throw new Error('All image generation providers failed.');
}

// Helper function to generate image with a specific provider
async function generateImageWithProvider(provider: string, prompt: string) {
  if (!FREE_PROVIDERS[provider] || !FREE_PROVIDERS[provider].models.image) {
    throw new Error(`Provider ${provider} does not support image generation`);
  }
  
  // Get API key from environment if available
  const apiKeyEnvVar = FREE_PROVIDERS[provider].apiKeyEnvVar;
  const apiKey = apiKeyEnvVar ? process.env[apiKeyEnvVar] : undefined;
  
  if (!apiKey && provider !== 'ollama') {
    throw new Error(`Image provider ${provider} requires API key but none is set in ${apiKeyEnvVar}`);
  }
  
  const hfModel = FREE_PROVIDERS[provider].models.image!.generation;
  
  // In real implementation, use the actual image generation API
  // This is a placeholder for the response structure
  const startTime = Date.now();
  
  // Simulate API call - in reality, this would call the provider's API
  const result = {
    url: `https://${provider}-generated-image.com/${prompt.replace(/\s+/g, '-')}`
  };
  
  const latency = Date.now() - startTime;
  
  await updateUsage(provider);
  
  return {
    url: result.url,
    provider,
    model: hfModel,
    latency
  };
}

// Helper function to estimate tokens
function estimateTokens(prompt: string, response: string): number {
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil((prompt.length + response.length) / 4);
}
