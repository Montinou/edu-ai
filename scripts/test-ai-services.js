// Simple script to test AI services
require('dotenv').config(); // Load environment variables from .env file

// Set environment variables for testing
process.env.ENABLE_SMART_SWITCHING = 'true';

async function main() {
  try {
    console.log('🧪 Testing AI services...');
    
    // Test with different providers
    const providers = ['google', 'vercel', 'huggingface', 'groq'];
    
    for (const provider of providers) {
      console.log(`\n----------------------------------------`);
      console.log(`Testing AI provider: ${provider}`);
      console.log(`----------------------------------------`);
      
      // Set provider for this test
      process.env.AI_PROVIDER = provider;
      
      // Dynamic import to ensure env vars are set first
      const { getAIService } = require('../dist/lib/services');
      
      try {
        // Get service instance
        const aiService = await getAIService();
        
        // Test math problem generation
        console.log('\nGenerating math problem...');
        const mathProblem = await aiService.generateMathProblem({
          difficulty: 3,
          operation: 'addition',
          studentLevel: 4,
          context: 'space exploration',
        });
        
        console.log(`Question: ${mathProblem.question}`);
        console.log(`Answer: ${mathProblem.answer}`);
        console.log(`Options: ${mathProblem.options.join(', ')}`);
        
        // Test card generation
        console.log('\nGenerating complete card...');
        const card = await aiService.generateCompleteCard({
          difficulty: 3,
          cardType: 'math',
          operation: 'multiplication',
          studentLevel: 4,
          rarity: 'épico',
          theme: 'fantasy',
          context: 'dragons',
        });
        
        console.log(`Card: ${card.name}`);
        console.log(`Description: ${card.description}`);
        console.log(`Problem: ${card.problem.question}`);
        
        // Clear the module cache for next iteration
        delete require.cache[require.resolve('../dist/lib/services')];
      } catch (error) {
        console.error(`Error testing ${provider}:`, error);
      }
    }
    
    console.log('\n✅ AI service tests completed');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

main(); 