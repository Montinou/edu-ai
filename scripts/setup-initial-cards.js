// Setup Initial Cards - Uses service role to bypass RLS
// This script populates the database with initial cards from CARD_PROMT.md

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🎨 EduCard AI - Initial Card Setup (Admin Mode)\n');

// Use service role key to bypass RLS during setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
  console.log('📋 You need to add your Supabase service role key to .env.local:');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  console.log('\n🔍 Find it in: Supabase Dashboard → Settings → API → service_role key');
  console.log('\n🔄 Alternative: Run the RLS fix script in Supabase SQL Editor:');
  console.log('   Copy contents of "scripts/fix-rls-for-setup.sql" and run it');
  process.exit(1);
}

// Initialize with service role (bypasses RLS)
const supabase = createClient(supabaseUrl, serviceRoleKey);

// Card templates from CARD_PROMT.md (same as generate-cards.js)
const CARD_TEMPLATES = {
  suma: [
    {
      name: "Suma Elemental - Cristales de Luz",
      description: "Estudiante mágico conjurando hechizo de suma con orbes de cristal brillantes",
      type: "attack",
      rarity: "common",
      problem_type: "addition",
      difficulty_level: 1,
      attack_power: 30,
      defense_power: 10,
      cost: 2,
      prompt: "young magical student casting addition spell with glowing crystal orbs showing numbers, bright blue and gold magical effects, mathematical symbols floating around, academy classroom background"
    },
    {
      name: "Suma Elemental - Flores Mágicas",
      description: "Flores mágicas con números en pétalos combinándose por magia de hadas",
      type: "attack",
      rarity: "common",
      problem_type: "addition",
      difficulty_level: 1,
      attack_power: 25,
      defense_power: 15,
      cost: 2,
      prompt: "cute magical flowers with numbers on petals being combined by fairy magic, pastel colors, garden academy setting, mathematical sparkles in the air"
    }
  ],
  resta: [
    {
      name: "Resta Protectora - Escudo Lunar",
      description: "Escudo místico con fases lunares brillantes mostrando resta",
      type: "defense",
      rarity: "common",
      problem_type: "subtraction",
      difficulty_level: 2,
      attack_power: 15,
      defense_power: 40,
      cost: 3,
      prompt: "mystical shield with glowing moon phases showing subtraction, silver and blue magical aura, protective magical barriers, nighttime academy courtyard"
    },
    {
      name: "Resta Protectora - Espejo Temporal",
      description: "Espejo mágico reflejando operaciones matemáticas que se desvanecen",
      type: "defense",
      rarity: "rare",
      problem_type: "subtraction",
      difficulty_level: 2,
      attack_power: 20,
      defense_power: 35,
      cost: 3,
      prompt: "magical mirror reflecting mathematical operations, numbers fading away in golden light, time magic effects, mystical library setting"
    }
  ],
  multiplicacion: [
    {
      name: "Multiplicación Feroz - Dragón Escarlata",
      description: "Pequeño dragón amigable respirando fuego matemático con números multiplicándose",
      type: "attack",
      rarity: "rare",
      problem_type: "multiplication",
      difficulty_level: 3,
      attack_power: 50,
      defense_power: 20,
      cost: 4,
      prompt: "small friendly dragon breathing mathematical fire with multiplying numbers, red and orange flames, numbers duplicating in magical patterns, dragon academy training grounds"
    },
    {
      name: "Multiplicación Feroz - Cristales Espejo",
      description: "Cristales mágicos creando múltiples reflejos con números multiplicándose",
      type: "attack",
      rarity: "epic",
      problem_type: "multiplication",
      difficulty_level: 3,
      attack_power: 45,
      defense_power: 25,
      cost: 4,
      prompt: "magical crystals creating multiple reflections with numbers multiplying, rainbow refractions, geometric magical effects, crystal cave academy"
    }
  ],
  division: [
    {
      name: "División Sabia - Búho Arcano",
      description: "Búho sabio profesor con ecuaciones mágicas dividiéndose en porciones perfectas",
      type: "special",
      rarity: "epic",
      problem_type: "division",
      difficulty_level: 4,
      attack_power: 35,
      defense_power: 45,
      cost: 5,
      prompt: "wise owl professor with magical equations dividing into perfect portions, scholarly magical effects, ancient books floating, academy library tower"
    }
  ],
  legendarias: [
    {
      name: "Dragón del Cálculo Infinito",
      description: "Dragón majestuoso con patrones de constelación matemática en sus escamas",
      type: "special",
      rarity: "legendary",
      problem_type: "logic",
      difficulty_level: 5,
      attack_power: 80,
      defense_power: 70,
      cost: 8,
      prompt: "majestic dragon with mathematical constellation patterns on scales, cosmic calculation magic, infinite mathematical power, academy sky realm, overwhelming magical presence, cinematic lighting effects, complex magical phenomena, legendary aura, epic proportions"
    }
  ]
};

// Curated math problems
const MATH_PROBLEMS = {
  addition: [
    {
      problem: "Los cristales mágicos muestran 5 + 3. ¿Cuál es el poder total?",
      answer: 8,
      explanation: "Suma los cristales: 5 + 3 = 8",
      options: [6, 7, 8, 9]
    },
    {
      problem: "Las flores mágicas tienen 4 + 6 pétalos. ¿Cuántos pétalos en total?",
      answer: 10,
      explanation: "Cuenta todos los pétalos: 4 + 6 = 10",
      options: [9, 10, 11, 12]
    }
  ],
  subtraction: [
    {
      problem: "El escudo lunar tenía 12 rayos, 4 se desvanecieron. ¿Cuántos quedan?",
      answer: 8,
      explanation: "Resta los rayos perdidos: 12 - 4 = 8",
      options: [7, 8, 9, 10]
    },
    {
      problem: "En el espejo había 15 números, 7 se borraron. ¿Cuántos siguen?",
      answer: 8,
      explanation: "Números restantes: 15 - 7 = 8",
      options: [6, 7, 8, 9]
    }
  ],
  multiplication: [
    {
      problem: "El dragón respira 3 llamas, cada una con 4 números. ¿Cuántos números total?",
      answer: 12,
      explanation: "Multiplica las llamas: 3 × 4 = 12",
      options: [10, 11, 12, 13]
    },
    {
      problem: "Hay 5 cristales, cada uno se refleja 6 veces. ¿Cuántos reflejos?",
      answer: 30,
      explanation: "Reflejos totales: 5 × 6 = 30",
      options: [25, 28, 30, 32]
    }
  ],
  division: [
    {
      problem: "El búho tiene 20 libros para dividir en 4 grupos iguales. ¿Cuántos por grupo?",
      answer: 5,
      explanation: "Divide los libros: 20 ÷ 4 = 5",
      options: [4, 5, 6, 7]
    }
  ],
  logic: [
    {
      problem: "El dragón sigue el patrón: 2, 4, 8, ?. ¿Cuál es el siguiente número?",
      answer: 16,
      explanation: "Cada número se multiplica por 2: 8 × 2 = 16",
      options: [12, 14, 16, 18]
    }
  ]
};

async function setupInitialCards() {
  console.log('🚀 Setting up initial cards (using service role key)...\n');
  
  let totalCards = 0;
  let successfulCards = 0;

  // Check if cards already exist
  const { data: existingCards, error: checkError } = await supabase
    .from('cards')
    .select('name')
    .limit(1);

  if (checkError) {
    console.error('❌ Error checking existing cards:', checkError.message);
    return;
  }

  if (existingCards.length > 0) {
    console.log('⚠️  Cards already exist in database. Skipping setup.');
    console.log('💡 To regenerate, delete existing cards first or use a different script.');
    return;
  }

  for (const [category, cards] of Object.entries(CARD_TEMPLATES)) {
    console.log(`\n📂 Creating ${category} cards...`);
    
    for (const cardTemplate of cards) {
      try {
        console.log(`🃏 Creating: ${cardTemplate.name}`);
        
        // Get math problem for this card type
        const problems = MATH_PROBLEMS[cardTemplate.problem_type] || MATH_PROBLEMS.addition;
        const mathProblem = problems[Math.floor(Math.random() * problems.length)];
        
        // Insert card
        const { data: card, error: cardError } = await supabase
          .from('cards')
          .insert({
            name: cardTemplate.name,
            description: cardTemplate.description,
            type: cardTemplate.type,
            rarity: cardTemplate.rarity,
            attack_power: cardTemplate.attack_power,
            defense_power: cardTemplate.defense_power,
            cost: cardTemplate.cost,
            difficulty_level: cardTemplate.difficulty_level,
            problem_type: cardTemplate.problem_type,
            image_url: `/images/cards/${cardTemplate.name.toLowerCase().replace(/\s+/g, '-')}.png`,
            image_prompt: cardTemplate.prompt
          })
          .select()
          .single();

        if (cardError) {
          console.error(`❌ Error creating card: ${cardError.message}`);
          continue;
        }

        // Insert AI generated content (math problem)
        const { error: contentError } = await supabase
          .from('ai_generated_content')
          .insert({
            content_type: 'math_problem',
            title: `Problema de ${cardTemplate.name}`,
            content: mathProblem,
            prompt_used: `Math problem for ${cardTemplate.name}`,
            difficulty_level: cardTemplate.difficulty_level,
            target_age: cardTemplate.difficulty_level + 7,
            ai_model: 'curated',
            quality_score: 0.90,
            is_approved: true
          });

        if (contentError) {
          console.error(`❌ Error creating AI content: ${contentError.message}`);
        }

        console.log(`✅ Successfully created: ${card.name}`);
        successfulCards++;
        
      } catch (error) {
        console.error(`❌ Error processing ${cardTemplate.name}:`, error.message);
      }
      
      totalCards++;
    }
  }

  console.log(`\n🎉 Initial card setup complete!`);
  console.log(`📊 Successfully created: ${successfulCards}/${totalCards} cards`);
  
  if (successfulCards > 0) {
    console.log(`\n🎯 Next steps:`);
    console.log(`1. Run: node scripts/check-database-setup.js (to verify)`);
    console.log(`2. Start building your card display UI!`);
    console.log(`3. Your magical math academy is ready! 🏫✨`);
  }
}

// Run the setup
if (require.main === module) {
  setupInitialCards().catch(console.error);
}

module.exports = { setupInitialCards }; 