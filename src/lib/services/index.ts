// Export all services for easy access
import { createAIService, aiService } from './aiService';
import { createVercelAIService } from './vercelAIService';
import { createHuggingFaceService } from './huggingfaceService';
import { createGroqService } from './groqService';

// Standard AI service (Google AI implementation)
export { createAIService, aiService };

// Vercel AI SDK implementation (OpenAI)
export { createVercelAIService };

// Hugging Face implementation
export { createHuggingFaceService };

// Groq implementation
export { createGroqService };

// Function to get the appropriate AI service based on configuration
export async function getAIService() {
  // Check which AI provider to use
  const aiProvider = process.env.AI_PROVIDER || 'google';
  
  console.log(`🤖 Using AI provider: ${aiProvider}`);
  
  switch (aiProvider.toLowerCase()) {
    case 'vercel':
    case 'openai':
      console.log('Using OpenAI via Vercel AI SDK');
      return await createVercelAIService();
    
    case 'huggingface':
    case 'hf':
      console.log('Using Hugging Face AI Service');
      return await createHuggingFaceService();
    
    case 'groq':
      console.log('Using Groq AI Service');
      return await createGroqService();
    
    case 'google':
    case 'googleai':
    default:
      console.log('Using Google AI Service');
      return await createAIService();
  }
}

// Create and configure the appropriate AI service based on environment variables
export const smartAIService = (process.env.ENABLE_SMART_SWITCHING === 'true')
  ? getAIService()
  : aiService;

export default getAIService; 