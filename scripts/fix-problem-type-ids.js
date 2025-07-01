const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service role for updates

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapping logic based on the card names and categories
const CATEGORY_TO_PROBLEM_TYPE_MAPPING = {
  // Arithmetic/Math (Spanish and English)
  'arithmetic': {
    'addition': 1,
    'suma': 1,
    'subtraction': 2,
    'resta': 2,
    'multiplication': 3,
    'multiplicación': 3,
    'multiplicador': 3,
    'division': 4,
    'división': 4,
    'fractions': 5,
    'fracciones': 5,
    'decimals': 6,
    'decimales': 6,
    'percentages': 7,
    'porcentajes': 7,
    'default': 1 // addition by default
  },
  
  // Spanish categories
  'aritmética': {
    'suma': 1,
    'resta': 2,
    'multiplicación': 3,
    'multiplicaciones': 3,
    'división': 4,
    'fracciones': 5,
    'decimales': 6,
    'porcentajes': 7,
    'default': 1 // suma by default
  },
  
  // Algebra (Spanish and English)
  'algebra': {
    'equations': 8,
    'ecuaciones': 8,
    'inequalities': 9,
    'desigualdades': 9,
    'polynomials': 10,
    'polinomios': 10,
    'factoring': 11,
    'factorización': 11,
    'default': 8 // equations by default
  },
  
  'álgebra': {
    'ecuaciones': 8,
    'sistemas': 8,
    'desigualdades': 9,
    'polinomios': 10,
    'factorización': 11,
    'default': 8 // ecuaciones by default
  },
  
  // Geometry (Spanish and English)
  'geometry': {
    'area': 12,
    'perimeter': 12,
    'área': 12,
    'perímetro': 12,
    'perímetros': 12,
    'formas': 12,
    'dimensiones': 12,
    'angles': 13,
    'ángulos': 13,
    'triangles': 14,
    'triángulos': 14,
    'circles': 15,
    'círculos': 15,
    'default': 12 // area_perimeter by default
  },
  
  'geometría': {
    'área': 12,
    'perímetro': 12,
    'perímetros': 12,
    'ángulos': 13,
    'angular': 13,
    'triángulos': 14,
    'círculos': 15,
    'geometría': 12,
    'geométrico': 12,
    'formas': 12,
    'default': 12 // área by default
  },
  
  // Logic (Spanish and English)
  'logic': {
    'patterns': 16,
    'patrones': 16,
    'sequences': 17,
    'secuencias': 17,
    'deduction': 18,
    'deducción': 18,
    'logic': 19,
    'lógica': 19,
    'default': 19 // logic by default
  },
  
  'lógica': {
    'patrones': 16,
    'secuencias': 17,
    'deducción': 18,
    'lógica': 19,
    'acertijo': 19,
    'default': 19 // lógica by default
  },
  
  // Statistics (Spanish and English)
  'statistics': {
    'statistics': 20,
    'estadísticas': 20,
    'análisis': 20,
    'datos': 20,
    'probability': 21,
    'probabilidad': 21,
    'probabilidades': 21,
    'distributions': 21, // distributions is probability-related
    'default': 20 // statistics by default
  },
  
  'estadística': {
    'estadísticas': 20,
    'análisis': 20,
    'regresión': 20,
    'regresiones': 20,
    'datos': 20,
    'probabilidad': 21,
    'probabilidades': 21,
    'laplace': 20, // Laplace is statistics
    'default': 20 // estadísticas by default
  }
};

function determineProblemTypeId(card) {
  const category = card.category?.toLowerCase() || 'arithmetic';
  const name = card.name?.toLowerCase() || '';
  
  console.log(`🔍 Analyzing card: "${card.name}" | Category: ${category}`);
  
  // Analyze the card name for specific math concepts
  // More specific patterns first, then category defaults
  
  // Fractions - very specific
  if (name.includes('fracciones') || name.includes('fracción')) {
    console.log(`   🎯 Found FRACTIONS keyword -> problem_type_id: 5`);
    return 5;
  }
  
  // Multiplication
  if (name.includes('multiplicación') || name.includes('multiplicaciones') || name.includes('multiplicador')) {
    console.log(`   🎯 Found MULTIPLICATION keyword -> problem_type_id: 3`);
    return 3;
  }
  
  // Division
  if (name.includes('división') || name.includes('división')) {
    console.log(`   🎯 Found DIVISION keyword -> problem_type_id: 4`);
    return 4;
  }
  
  // Subtraction/Resta
  if (name.includes('resta') || name.includes('sustracción') || name.includes('sustra')) {
    console.log(`   🎯 Found SUBTRACTION keyword -> problem_type_id: 2`);
    return 2;
  }
  
  // Addition/Suma
  if (name.includes('suma') || name.includes('adición')) {
    console.log(`   🎯 Found ADDITION keyword -> problem_type_id: 1`);
    return 1;
  }
  
  // Decimals
  if (name.includes('decimales') || name.includes('decimal')) {
    console.log(`   🎯 Found DECIMALS keyword -> problem_type_id: 6`);
    return 6;
  }
  
  // Percentages
  if (name.includes('porcentajes') || name.includes('porcentaje')) {
    console.log(`   🎯 Found PERCENTAGES keyword -> problem_type_id: 7`);
    return 7;
  }
  
  // Algebra - Equations
  if (name.includes('ecuaciones') || name.includes('sistemas') || name.includes('ecuacional')) {
    console.log(`   🎯 Found EQUATIONS keyword -> problem_type_id: 8`);
    return 8;
  }
  
  // Algebra - Polynomials
  if (name.includes('polinomios') || name.includes('polinomio')) {
    console.log(`   🎯 Found POLYNOMIALS keyword -> problem_type_id: 10`);
    return 10;
  }
  
  // Geometry - Angles
  if (name.includes('ángulos') || name.includes('ángulo') || name.includes('angular')) {
    console.log(`   🎯 Found ANGLES keyword -> problem_type_id: 13`);
    return 13;
  }
  
  // Geometry - Area/Perimeter
  if (name.includes('perímetro') || name.includes('perímetros') || name.includes('área') || name.includes('geométrico') || name.includes('geometría')) {
    console.log(`   🎯 Found GEOMETRY keyword -> problem_type_id: 12`);
    return 12;
  }
  
  // Logic - Sequences
  if (name.includes('secuencias') || name.includes('secuencia') || name.includes('estelar') || name.includes('estelares')) {
    console.log(`   🎯 Found SEQUENCES keyword -> problem_type_id: 17`);
    return 17;
  }
  
  // Logic - Patterns
  if (name.includes('patrones') || name.includes('patrón') || name.includes('celestiales')) {
    console.log(`   🎯 Found PATTERNS keyword -> problem_type_id: 16`);
    return 16;
  }
  
  // Logic - General logic/puzzles
  if (name.includes('acertijo') || name.includes('lógica') || name.includes('silencio') || name.includes('susurro')) {
    console.log(`   🎯 Found LOGIC keyword -> problem_type_id: 19`);
    return 19;
  }
  
  // Statistics - Regression/Analysis
  if (name.includes('regresión') || name.includes('regresiones') || name.includes('análisis') || name.includes('laplace')) {
    console.log(`   🎯 Found STATISTICS keyword -> problem_type_id: 20`);
    return 20;
  }
  
  // Statistics - Probability
  if (name.includes('probabilidad') || name.includes('probabilidades')) {
    console.log(`   🎯 Found PROBABILITY keyword -> problem_type_id: 21`);
    return 21;
  }
  
  // Get the mapping for this category as fallback
  const categoryMapping = CATEGORY_TO_PROBLEM_TYPE_MAPPING[category];
  if (!categoryMapping) {
    console.log(`   ⚠️  Unknown category "${category}", using arithmetic default -> problem_type_id: 1`);
    return 1; // addition default
  }
  
  // Use category default
  const defaultId = categoryMapping.default;
  console.log(`   🔄 No specific keywords found, using category default -> problem_type_id: ${defaultId}`);
  return defaultId;
}

async function fixProblemTypeIds() {
  try {
    console.log('🔧 Starting to fix problem_type_id for all cards...');
    
    // Get all active cards to reassign problem_type_id correctly
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('id, name, category, problem_type_id')
      .eq('is_active', true);
      
    if (cardsError) {
      console.error('❌ Error fetching cards:', cardsError);
      return;
    }
    
    console.log(`✅ Found ${cards.length} cards to update`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const card of cards) {
      try {
        const problemTypeId = determineProblemTypeId(card);
        
        console.log(`🔄 Updating "${card.name}" | Category: ${card.category} | New problem_type_id: ${problemTypeId}`);
        
        const { error: updateError } = await supabase
          .from('cards')
          .update({ problem_type_id: problemTypeId })
          .eq('id', card.id);
          
        if (updateError) {
          console.error(`❌ Error updating card ${card.id}:`, updateError);
          errorCount++;
        } else {
          updatedCount++;
        }
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error processing card "${card.name}":`, error);
        errorCount++;
      }
    }
    
    console.log('\n📊 Update Summary:');
    console.log(`✅ Successfully updated: ${updatedCount} cards`);
    console.log(`❌ Errors: ${errorCount} cards`);
    
    if (updatedCount > 0) {
      console.log('\n🔍 Verifying updates...');
      
      // Verify the updates
      const { data: updatedCards, error: verifyError } = await supabase
        .from('cards')
        .select('id, name, category, problem_type_id')
        .eq('is_active', true)
        .not('problem_type_id', 'is', null);
        
      if (verifyError) {
        console.error('❌ Error verifying updates:', verifyError);
      } else {
        console.log(`✅ Verification: ${updatedCards.length} cards now have problem_type_id`);
        
        // Show sample of updated cards
        console.log('\n📋 Sample updated cards:');
        updatedCards.slice(0, 5).forEach((card, index) => {
          console.log(`${index + 1}. "${card.name}" | Category: ${card.category} | problem_type_id: ${card.problem_type_id}`);
        });
      }
    }
    
  } catch (error) {
    console.error('🚨 Fix failed:', error);
  }
}

fixProblemTypeIds(); 