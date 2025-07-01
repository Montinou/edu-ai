const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Simple direct updates
const updates = [
  // Fracciones
  { keyword: 'fracciones', problemTypeId: 5 },
  { keyword: 'fracción', problemTypeId: 5 },
  
  // Multiplicación
  { keyword: 'multiplicación', problemTypeId: 3 },
  { keyword: 'multiplicaciones', problemTypeId: 3 },
  { keyword: 'multiplicador', problemTypeId: 3 },
  
  // División
  { keyword: 'división', problemTypeId: 4 },
  
  // Resta/Sustracción
  { keyword: 'resta', problemTypeId: 2 },
  { keyword: 'sustracción', problemTypeId: 2 },
  { keyword: 'sustra', problemTypeId: 2 },
  
  // Suma
  { keyword: 'suma', problemTypeId: 1 },
  { keyword: 'adición', problemTypeId: 1 },
  
  // Decimales
  { keyword: 'decimales', problemTypeId: 6 },
  { keyword: 'decimal', problemTypeId: 6 },
  
  // Porcentajes
  { keyword: 'porcentajes', problemTypeId: 7 },
  { keyword: 'porcentaje', problemTypeId: 7 },
  
  // Ecuaciones
  { keyword: 'ecuaciones', problemTypeId: 8 },
  { keyword: 'sistemas', problemTypeId: 8 },
  { keyword: 'ecuacional', problemTypeId: 8 },
  
  // Polinomios
  { keyword: 'polinomios', problemTypeId: 10 },
  { keyword: 'polinomio', problemTypeId: 10 },
  
  // Ángulos
  { keyword: 'ángulos', problemTypeId: 13 },
  { keyword: 'ángulo', problemTypeId: 13 },
  { keyword: 'angular', problemTypeId: 13 },
  
  // Geometría
  { keyword: 'perímetro', problemTypeId: 12 },
  { keyword: 'perímetros', problemTypeId: 12 },
  { keyword: 'área', problemTypeId: 12 },
  { keyword: 'geométrico', problemTypeId: 12 },
  { keyword: 'geometría', problemTypeId: 12 },
  
  // Secuencias
  { keyword: 'secuencias', problemTypeId: 17 },
  { keyword: 'secuencia', problemTypeId: 17 },
  { keyword: 'estelar', problemTypeId: 17 },
  { keyword: 'estelares', problemTypeId: 17 },
  
  // Patrones
  { keyword: 'patrones', problemTypeId: 16 },
  { keyword: 'patrón', problemTypeId: 16 },
  { keyword: 'celestiales', problemTypeId: 16 },
  
  // Lógica
  { keyword: 'acertijo', problemTypeId: 19 },
  { keyword: 'lógica', problemTypeId: 19 },
  { keyword: 'silencio', problemTypeId: 19 },
  { keyword: 'susurro', problemTypeId: 19 },
  
  // Estadísticas
  { keyword: 'regresión', problemTypeId: 20 },
  { keyword: 'regresiones', problemTypeId: 20 },
  { keyword: 'análisis', problemTypeId: 20 },
  { keyword: 'laplace', problemTypeId: 20 },
  
  // Probabilidad
  { keyword: 'probabilidad', problemTypeId: 21 },
  { keyword: 'probabilidades', problemTypeId: 21 }
];

async function fixProblemTypeIds() {
  console.log('🔧 Starting simple problem_type_id fix...');
  
  let totalUpdated = 0;
  
  for (const update of updates) {
    try {
      console.log(`🔄 Updating cards with "${update.keyword}" -> problem_type_id: ${update.problemTypeId}`);
      
      const { data, error } = await supabase
        .from('cards')
        .update({ problem_type_id: update.problemTypeId })
        .ilike('name', `%${update.keyword}%`)
        .eq('is_active', true)
        .select('id, name');
        
      if (error) {
        console.error(`❌ Error updating "${update.keyword}":`, error);
      } else {
        const count = data.length;
        if (count > 0) {
          console.log(`   ✅ Updated ${count} cards`);
          data.forEach(card => console.log(`      • "${card.name}"`));
          totalUpdated += count;
        }
      }
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`❌ Error processing "${update.keyword}":`, error);
    }
  }
  
  console.log(`\n📊 Total updated: ${totalUpdated} cards`);
  
  // Final verification
  console.log('\n🔍 Final verification...');
  const { data: allCards, error } = await supabase
    .from('cards')
    .select('id, name, category, problem_type_id')
    .eq('is_active', true)
    .order('problem_type_id');
    
  if (error) {
    console.error('❌ Error in verification:', error);
  } else {
    console.log(`✅ Total cards: ${allCards.length}`);
    
    // Group by problem_type_id
    const grouped = allCards.reduce((acc, card) => {
      acc[card.problem_type_id] = (acc[card.problem_type_id] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📊 Distribution by problem_type_id:');
    Object.entries(grouped).forEach(([id, count]) => {
      console.log(`   ${id}: ${count} cards`);
    });
    
    console.log('\n📋 Sample cards by type:');
    [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 13, 16, 17, 19, 20, 21].forEach(typeId => {
      const cards = allCards.filter(c => c.problem_type_id == typeId);
      if (cards.length > 0) {
        console.log(`   Type ${typeId}: "${cards[0].name}"`);
      }
    });
  }
}

fixProblemTypeIds(); 