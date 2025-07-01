// EduCard AI - Dynamic Cards Generation System with AI
// Uses Gemini AI to generate creative and unique card metadata

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase with service role for full access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🚀 EduCard AI - Dynamic Cards Generation System (AI-Powered)\n');

// Generation configuration
const GENERATION_CONFIG = {
  categories: ['arithmetic', 'algebra', 'geometry', 'logic', 'statistics'],
  rarities: ['common', 'rare', 'epic', 'legendary'],
  themes: [
    'Academia Mágica de Matemáticas',
    'Reino de los Cristales Numéricos', 
    'Torre de los Sabios Algebraicos',
    'Bosque Geométrico Encantado',
    'Laboratorio de Lógica Ancestral',
    'Observatorio de Patrones Estelares'
  ],
  cardsPerCategory: 2,
  cardsPerRarity: 1
};

// Enhanced database insertion function
async function insertDynamicCardToDatabase(cardData, imageData) {
  try {
    console.log(`📦 Inserting: ${cardData.name} (${cardData.rarity})`);
    
    // Get the problem type ID for the foreign key
    const { data: problemType, error: ptError } = await supabase
      .from('cards_problem_types')
      .select('id')
      .eq('name_es', cardData.problem_type_code)
      .single();

    if (ptError) {
      console.error('❌ Error finding problem type:', ptError.message);
      const defaultProblemTypeId = 1;
      console.log(`🔄 Using default problem type ID: ${defaultProblemTypeId}`);
    }

    const problemTypeId = problemType?.id || 1;

    // Insert dynamic card with enhanced structure
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .insert({
        name: cardData.name,
        description: cardData.description,
        type: 'attack', // All dynamic cards are attack type for now
        rarity: cardData.rarity,
        attack_power: cardData.base_power,
        defense_power: Math.floor(cardData.base_power * 0.3), // 30% of attack
        cost: Math.ceil(cardData.base_power / 15), // Cost based on power
        difficulty_level: Math.max(...cardData.level_range),
        problem_type: cardData.problem_type_code, // Keep for backward compatibility
        problem_type_id: problemTypeId, // New foreign key
        image_url: imageData.image_url,
        image_prompt: imageData.image_prompt,
        // New dynamic fields
        category: cardData.category,
        base_power: cardData.base_power,
        level_range: cardData.level_range,
        lore: cardData.lore,
        art_style: cardData.art_style,
        // Enhanced AI-generated fields
        flavor_text: cardData.flavor_text,
        magical_element: cardData.magical_element,
        educational_theme: cardData.educational_theme,
        backstory: cardData.backstory
      })
      .select()
      .single();

    if (cardError) {
      console.error('❌ Error inserting card:', cardError.message);
      return null;
    }

    console.log(`   ✅ Inserted: ${card.name} | Power: ${card.base_power} | ID: ${card.id}`);
    return card;

  } catch (error) {
    console.error('❌ Database error:', error.message);
    return null;
  }
}

// Generate card image using the existing service
async function generateCardImage(cardData) {
  try {
    console.log(`🎨 Generating image for: ${cardData.name}`);
    
    // Determine image generation parameters based on category and problem type
    const imageParams = {
      cardType: mapCategoryToImageType(cardData.category),
      mathType: cardData.problem_type_code,
      rarity: cardData.rarity,
      customPrompt: cardData.art_prompt
    };
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/ai/generate-card-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(imageParams)
    });

    if (response.ok) {
      const result = await response.json();
      
      if (result.success) {
        console.log(`   🎨 Image generated: ${result.provider} ($${result.cost || 0})`);
        return {
          image_url: result.imageUrl,
          image_prompt: cardData.art_prompt,
          provider: result.provider,
          cost: result.cost || 0
        };
      }
    }
    
    // Fallback to placeholder if API fails
    console.log(`   ⚠️ Using placeholder for: ${cardData.name}`);
    return {
      image_url: `/images/cards/placeholder-${cardData.category}.png`,
      image_prompt: cardData.art_prompt,
      provider: 'placeholder',
      cost: 0
    };
    
  } catch (error) {
    console.error(`❌ Error generating image for ${cardData.name}:`, error.message);
    return {
      image_url: `/images/cards/placeholder-${cardData.category}.png`,
      image_prompt: cardData.art_prompt,
      provider: 'placeholder',
      cost: 0
    };
  }
}

// Map category to image type for existing image generation service
function mapCategoryToImageType(category) {
  const mapping = {
    arithmetic: 'math',
    algebra: 'math', 
    geometry: 'math',
    logic: 'logic',
    statistics: 'special'
  };
  return mapping[category] || 'math';
}

// Generate cards dynamically using AI
async function generateDynamicCardsWithAI() {
  console.log('🤖 Starting AI-powered dynamic card generation...\n');
  
  let totalCards = 0;
  let successfulCards = 0;
  let totalCost = 0;
  const generatedCards = [];

  for (const category of GENERATION_CONFIG.categories) {
    console.log(`\n📚 Generating ${category.toUpperCase()} category cards...`);
    
    for (const rarity of GENERATION_CONFIG.rarities) {
      try {
        console.log(`\n🎯 Generating ${rarity} ${category} cards...`);
        
        // Select random theme for variety
        const randomTheme = GENERATION_CONFIG.themes[Math.floor(Math.random() * GENERATION_CONFIG.themes.length)];
        
        // Call the dynamic card generation API
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/ai/generate-dynamic-cards`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category: category,
            rarity: rarity,
            theme: randomTheme,
            educationalFocus: `Aprendizaje interactivo de ${category}`,
            ageGroup: '10-16 años',
            count: GENERATION_CONFIG.cardsPerRarity
          })
        });

        if (!response.ok) {
          throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        if (!result.success || !result.cards) {
          throw new Error(result.error || 'No cards generated');
        }

        console.log(`   🤖 AI generated ${result.cards.length} card(s)`);
        
        // Process each generated card
        for (const cardData of result.cards) {
          console.log(`\n🃏 Processing: ${cardData.name}`);
          
          // Generate image
          const imageData = await generateCardImage(cardData);
          totalCost += imageData.cost;
          
          // Insert to database
          const insertedCard = await insertDynamicCardToDatabase(cardData, imageData);
          
          if (insertedCard) {
            generatedCards.push({
              ...insertedCard,
              ai_metadata: cardData
            });
            successfulCards++;
            console.log(`   ✅ Success: ${insertedCard.name}`);
          }
          
          totalCards++;
          
          // Delay between cards to respect API limits
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        console.error(`❌ Error generating ${rarity} ${category} cards:`, error.message);
        totalCards++;
      }
    }
  }

  // Final report
  console.log(`\n🎉 AI-Powered Dynamic Card Generation Complete!`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 Cards Generated: ${successfulCards}/${totalCards}`);
  console.log(`💰 Total Cost: $${totalCost.toFixed(4)}`);
  console.log(`🤖 AI Provider: Gemini 1.5 Flash`);
  console.log(`🎨 Image Providers: Multiple (HF, Replicate, Pollinations)`);
  
  if (successfulCards > 0) {
    console.log(`\n🚀 Your AI-Generated EduCard Collection:`);
    
    // Group cards by category for summary
    const cardsByCategory = generatedCards.reduce((acc, card) => {
      acc[card.category] = acc[card.category] || [];
      acc[card.category].push(card);
      return acc;
    }, {});
    
    Object.entries(cardsByCategory).forEach(([category, cards]) => {
      console.log(`\n🔹 ${category.toUpperCase()} (${cards.length} cards):`);
      cards.forEach(card => {
        console.log(`   • ${card.name} (${card.rarity}) - Power: ${card.base_power}`);
      });
    });
    
    console.log(`\n🎯 Next Steps:`);
    console.log(`1. 🎮 Test dynamic problem generation with new cards`);
    console.log(`2. 🎨 Review generated artwork quality`);
    console.log(`3. 📚 Validate educational content alignment`);
    console.log(`4. 🚀 Deploy to production for student testing`);
  }
}

// Run the AI generation process
if (require.main === module) {
  generateDynamicCardsWithAI().catch(console.error);
}

module.exports = { 
  generateDynamicCardsWithAI,
  generateCardImage,
  GENERATION_CONFIG
}; 