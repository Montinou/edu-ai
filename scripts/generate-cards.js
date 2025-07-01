// EduCard AI - Dynamic Cards Generation System
// Generates category-based cards for real-time AI problem generation

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase with service role for full access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for inserts
);

console.log('🚀 EduCard AI - Dynamic Cards Generation System\n');

// Dynamic card templates based on mathematical categories
const DYNAMIC_CARD_TEMPLATES = {
  // MATH Category Cards - Basic Arithmetic
  math: [
    {
      name: "Cristales Matemáticos",
      description: "Cristales místicos que brillan con operaciones básicas",
      category: "aritmética",
      base_power: 35,
      rarity: "común",
      level_range: [1, 3],
      art_style: "cristales-matematicos",
      lore: "Antiguos cristales que ponen a prueba el dominio aritmético",
      art_prompt: "Glowing mathematical crystals with floating numbers, blue and gold magical effects",
      problem_type_code: "Suma"
    },
    {
      name: "Tomo Aritmético",
      description: "Libro mágico lleno de fórmulas numéricas ancestrales",
      category: "aritmética", 
      base_power: 42,
      rarity: "raro",
      level_range: [2, 5],
      art_style: "libro-mistico",
      lore: "Un grimorio que desafía con cálculos de precisión",
      art_prompt: "Magical book with floating mathematical equations, golden pages with numbers",
      problem_type_code: "Resta"
    },
    {
      name: "Orbe del Cálculo",
      description: "Esfera de energía pura con patrones numéricos sagrados",
      category: "aritmética",
      base_power: 58,
      rarity: "épico", 
      level_range: [4, 8],
      art_style: "esfera-energia",
      lore: "Concentra el poder de los números en una forma perfecta",
      art_prompt: "Glowing energy orb with mathematical patterns, swirling numbers and formulas",
      problem_type_code: "Multiplicación"
    },
    {
      name: "Maestro de Números",
      description: "Sabio ancestral que domina todos los cálculos matemáticos",
      category: "aritmética",
      base_power: 75,
      rarity: "legendario",
      level_range: [6, 12],
      art_style: "maestro-sabio",
      lore: "El último maestro de las artes numéricas perdidas",
      art_prompt: "Ancient wise master surrounded by floating mathematical symbols, epic magical aura",
      problem_type_code: "División"
    }
  ],

  // ALGEBRA Category Cards - Equations and Variables
  algebra: [
    {
      name: "Ecuación Encantada",
      description: "Hechizo que equilibra variables mágicas con precisión",
      category: "algebra",
      base_power: 45,
      rarity: "común",
      level_range: [3, 6],
      art_style: "ecuacion-magica",
      lore: "Las variables danzan en perfecta armonía",
      art_prompt: "Magical equation floating in air with glowing variables, balanced scales",
      problem_type_code: "Ecuaciones"
    },
    {
      name: "Báculo Algebraico", 
      description: "Bastón de poder que resuelve incógnitas misteriosas",
      category: "algebra",
      base_power: 52,
      rarity: "rare",
      level_range: [4, 8],
      art_style: "baculo-mistico",
      lore: "Revela los secretos ocultos en las ecuaciones",
      art_prompt: "Magical staff with algebraic symbols, glowing variables floating around",
      problem_type_code: "Desigualdades"
    },
    {
      name: "Portal Polinomial",
      description: "Puerta dimensional alimentada por polinomios sagrados",
      category: "algebra",
      base_power: 68,
      rarity: "é  pico",
      level_range: [6, 10],
      art_style: "portal-dimensional",
      lore: "Atraviesa dimensiones usando el poder de los polinomios",
      art_prompt: "Dimensional portal with polynomial equations forming the gateway, cosmic energy",
      problem_type_code: "Polinomios"
    }
  ],

  // GEOMETRY Category Cards - Shapes and Spatial Reasoning  
  geometry: [
    {
      name: "Compás Cósmico",
      description: "Instrumento que traza círculos perfectos en el espacio",
      category: "geometría", 
      base_power: 40,
      rarity: "común",
      level_range: [2, 5],
      art_style: "compas-cosmico",
      lore: "Mide las distancias entre mundos",
      art_prompt: "Cosmic compass drawing perfect circles, starfield background, geometric precision",
      problem_type_code: "Círculos"
    },
    {
      name: "Prisma de Luz",
      description: "Cristal que refracta formas geométricas celestiales",
      category: "geometría",
      base_power: 55,
      rarity: "raro", 
      level_range: [4, 7],
      art_style: "prisma-luz",
      lore: "Revela las formas ocultas en la luz",
      art_prompt: "Light prism refracting geometric shapes, rainbow colors, crystal clarity",
      problem_type_code: "Área y Perímetro"
    },
    {
      name: "Arquitecto Celestial",
      description: "Constructor de dimensiones geométricas sagradas",
      category: "geometría",
      base_power: 72,
      rarity: "épico",
      level_range: [6, 10],
      art_style: "arquitecto-celestial", 
      lore: "Diseña las estructuras del universo",
      art_prompt: "Celestial architect building geometric structures, divine geometry, cosmic blueprints",
      problem_type_code: "Triángulos"
    }
  ],

  // LOGIC Category Cards - Patterns and Deduction
  logic: [
    {
      name: "Detector de Patrones",
      description: "Dispositivo que revela secuencias ocultas en el cosmos",
      category: "logic",
      base_power: 38,
      rarity: "common", 
      level_range: [2, 4],
      art_style: "detector-patrones",
      lore: "Descifra los códigos del universo",
      art_prompt: "Mystical device detecting hidden patterns, glowing sequences, analytical magic",
      problem_type_code: "Patrones"
    },
    {
      name: "Espejo Deductivo",
      description: "Refleja la verdad lógica absoluta sin distorsión",
      category: "logic",
      base_power: 48,
      rarity: "rare",
      level_range: [3, 7],
      art_style: "espejo-deductivo",
      lore: "Solo muestra lo que puede ser demostrado",
      art_prompt: "Deductive mirror reflecting logical truths, crystal clear reasoning, proof emanations",
      problem_type_code: "Deducción"
    },
    {
      name: "Oráculo Lógico",
      description: "Entidad que conoce todas las conclusiones posibles",
      category: "logic",
      base_power: 65,
      rarity: "epic",
      level_range: [5, 9],
      art_style: "oraculo-logico", 
      lore: "Ve todas las posibilidades lógicas simultáneamente",
      art_prompt: "Logical oracle surrounded by flowing logical sequences, omniscient presence",
      problem_type_code: "Secuencias"
    }
  ]
};

// Rarity multipliers for damage calculation
const RARITY_MULTIPLIERS = {
  common: 1.0,
  rare: 1.2,
  epic: 1.5,
  legendary: 2.0
};

// Category icons and colors for UI
const CATEGORY_METADATA = {
  math: { icon: '🔢', color: '#4F46E5', description: 'Aritmética básica y operaciones' },
  algebra: { icon: '📐', color: '#059669', description: 'Ecuaciones y variables algebraicas' },
  geometry: { icon: '📏', color: '#DC2626', description: 'Formas, espacios y medidas' },
  logic: { icon: '🧩', color: '#7C3AED', description: 'Patrones y razonamiento lógico' }
};

// Generate card image using the real image generation service
async function generateCardImage(cardTemplate) {
  try {
    console.log(`🎨 Generating image for: ${cardTemplate.name}`);
    
    // Call the actual image generation API
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/ai/generate-card-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cardType: cardTemplate.category === 'math' ? 'math' : cardTemplate.category === 'logic' ? 'logic' : 'special',
        mathType: cardTemplate.problem_type_code,
        rarity: cardTemplate.rarity,
        customPrompt: cardTemplate.art_prompt
      })
    });

    if (response.ok) {
      const result = await response.json();
      
      if (result.success) {
        return {
          image_url: result.imageUrl,
          image_prompt: cardTemplate.art_prompt,
          provider: result.provider,
          cost: result.cost || 0
        };
      }
    }
    
    // Fallback to placeholder if API fails
    console.log(`⚠️  Using placeholder for: ${cardTemplate.name}`);
    return {
      image_url: `/images/cards/placeholder-${cardTemplate.category}.png`,
      image_prompt: cardTemplate.art_prompt,
      provider: 'placeholder',
      cost: 0
    };
    
  } catch (error) {
    console.error(`❌ Error generating image for ${cardTemplate.name}:`, error.message);
    return {
      image_url: `/images/cards/placeholder-${cardTemplate.category}.png`,
      image_prompt: cardTemplate.art_prompt,
      provider: 'placeholder',
      cost: 0
    };
  }
}

async function insertDynamicCardToDatabase(cardData, imageData) {
  try {
    // Get the problem type ID for the foreign key
    const { data: problemType, error: ptError } = await supabase
      .from('cards_problem_types')
      .select('id')
      .eq('name_es', cardData.problem_type_code)
      .single();

    if (ptError) {
      console.error('❌ Error finding problem type:', ptError.message);
      // Use a default problem type or create one
      const defaultProblemTypeId = 1; // Assuming 'addition' has ID 1
      console.log(`🔄 Using default problem type ID: ${defaultProblemTypeId}`);
    }

    const problemTypeId = problemType?.id || 1;

    // Insert dynamic card with new structure
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
        art_style: cardData.art_style
      })
      .select()
      .single();

    if (cardError) {
      console.error('❌ Error inserting card:', cardError.message);
      return null;
    }

    console.log(`✅ Successfully created dynamic card: ${card.name} (Category: ${cardData.category})`);
    return card;

  } catch (error) {
    console.error('❌ Database error:', error.message);
    return null;
  }
}

async function generateAllDynamicCards() {
  console.log('🚀 Starting DYNAMIC card generation process...\n');
  console.log('💡 Creating category-based cards for real-time AI problem generation\n');
  
  let totalCards = 0;
  let successfulCards = 0;
  let totalCost = 0;

  for (const [category, cards] of Object.entries(DYNAMIC_CARD_TEMPLATES)) {
    console.log(`\n📂 Generating ${category.toUpperCase()} category cards...`);
    console.log(`   ${CATEGORY_METADATA[category].icon} ${CATEGORY_METADATA[category].description}`);
    
    for (const cardTemplate of cards) {
      try {
        console.log(`\n🃏 Processing: ${cardTemplate.name} (${cardTemplate.rarity})`);
        
        // Generate image
        const imageData = await generateCardImage(cardTemplate);
        totalCost += imageData.cost;
        
        // Insert to database
        const insertedCard = await insertDynamicCardToDatabase(cardTemplate, imageData);
        
        if (insertedCard) {
          console.log(`   ✅ Created | Power: ${insertedCard.base_power} | Range: ${cardTemplate.level_range.join('-')}`);
          successfulCards++;
        }
        
        totalCards++;
        
        // Small delay between cards to respect API limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error processing ${cardTemplate.name}:`, error.message);
        totalCards++;
      }
    }
  }

  console.log(`\n🎉 Dynamic Card generation complete!`);
  console.log(`📊 Successfully created: ${successfulCards}/${totalCards} cards`);
  console.log(`💰 Total image generation cost: $${totalCost.toFixed(4)}`);
  console.log(`🚀 Your Dynamic EduCard AI system is ready!`);
  
  if (successfulCards > 0) {
    console.log(`\n🎯 Next steps:`);
    console.log(`1. Test the dynamic problem generation API`);
    console.log(`2. Update the frontend components for dynamic cards`);
    console.log(`3. Implement the battle system with real-time AI problems`);
    console.log(`4. Add learning analytics and adaptive difficulty`);
  }
}

// Run the generation process
if (require.main === module) {
  generateAllDynamicCards().catch(console.error);
}

module.exports = { 
  generateAllDynamicCards, 
  generateCardImage, 
  DYNAMIC_CARD_TEMPLATES,
  RARITY_MULTIPLIERS,
  CATEGORY_METADATA
}; 