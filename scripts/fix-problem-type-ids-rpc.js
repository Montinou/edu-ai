const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Manual mapping of specific cards to their correct problem types
const cardMappings = [
  // Fracciones (5)
  { name: 'El Grimorio de las Fracciones Fractales', problemTypeId: 5 },
  { name: 'El Grimorio de las Fracciones Perdidas', problemTypeId: 5 },
  
  // Multiplicación (3)
  { name: 'El Abanico de las Multiplicaciones Celestiales', problemTypeId: 3 },
  
  // División (4)
  { name: 'La División de Amaterasu', problemTypeId: 4 },
  { name: 'El Susurro de la División Infinita', problemTypeId: 4 },
  
  // Resta (2)
  { name: 'Susurro de la Resta Infinita', problemTypeId: 2 },
  { name: 'Sōshū de la Resta Infinita', problemTypeId: 2 },
  { name: 'Sombras de la Resta Infinita', problemTypeId: 2 },
  { name: 'La Sombra de la Resta Infinita', problemTypeId: 2 },
  { name: 'Súcubo de la Sustracción Silenciosa', problemTypeId: 2 },
  { name: 'La Sustracción de Amaterasu', problemTypeId: 2 },
  
  // Decimales (6)
  { name: 'El Susurro de los Decimales', problemTypeId: 6 },
  { name: 'El Silencio de los Decimales Susurrantes', problemTypeId: 6 },
  
  // Porcentajes (7)
  { name: 'El Grimorio de los Porcentajes Eternos', problemTypeId: 7 },
  { name: 'El Grimorio de los Porcentajes Perdidos', problemTypeId: 7 },
  { name: 'El Grimorio de los Porcentajes Cósmicos', problemTypeId: 7 },
  { name: 'El Grimorio de los Porcentajes Ascendentes', problemTypeId: 7 },
  
  // Ecuaciones (8)
  { name: 'El Grimorio de Al-Khwarizmi', problemTypeId: 8 },
  { name: 'El Grimorio de los Sistemas Ecuacionales', problemTypeId: 8 },
  { name: 'El Grimorio de Xylos el Inefable', problemTypeId: 8 },
  
  // Polinomios (10)
  { name: 'El Grimorio de los Polinomios Oni', problemTypeId: 10 },
  { name: 'El Susurro de los Polinomios de Xylos', problemTypeId: 10 },
  { name: 'El Grimorio de los Polinomios Celestiales', problemTypeId: 10 },
  { name: 'El Grimorio de los Polinomios de Amaterasu', problemTypeId: 10 },
  
  // Geometría - Área/Perímetro (12)
  { name: 'El Prisma de Apep', problemTypeId: 12 },
  { name: 'El Grimorio de los Perímetros Perdidos', problemTypeId: 12 },
  { name: 'El Prisma de Apep, Destructor de Perímetros', problemTypeId: 12 },
  { name: 'El Silencio de Shizuka: Secreto de las Geometrías Perdidas', problemTypeId: 12 },
  { name: 'El Sello de Arquimedes', problemTypeId: 12 },
  { name: 'El Grimorio Geométrico de Aethelred', problemTypeId: 12 },
  { name: 'El Sello de la Geometría Sagrada', problemTypeId: 12 },
  { name: 'El Sello de Amaterasu: Geometría Sagrada', problemTypeId: 12 },
  { name: 'El Prisma de Apep: Fractal del Desierto', problemTypeId: 12 },
  
  // Ángulos (13)
  { name: 'El Prisma Angular de Amaterasu', problemTypeId: 13 },
  { name: 'El Abanico de los Ángulos Celestiales', problemTypeId: 13 },
  { name: 'El Grial Angular de Amaterasu', problemTypeId: 13 },
  { name: 'El Prisma de los Ángulos Celestiales', problemTypeId: 13 },
  
  // Patrones (16)
  { name: 'El Grimorio de los Patrones Celestiales', problemTypeId: 16 },
  
  // Secuencias (17)
  { name: 'El Grimorio de las Secuencias Escondidas', problemTypeId: 17 },
  { name: 'El Grimorio de las Secuencias Estelar', problemTypeId: 17 },
  { name: 'El Grimorio de las Secuencias Eternas', problemTypeId: 17 },
  { name: 'El Grimorio de las Secuencias Estelares', problemTypeId: 17 },
  
  // Lógica (19)
  { name: 'El Acertijo de la Diosa Amaterasu', problemTypeId: 19 },
  { name: 'El Acertijo de Amaterasu', problemTypeId: 19 },
  
  // Estadísticas (20)
  { name: 'El Grimorio de Laplace', problemTypeId: 20 },
  { name: 'El Ojo de Amaterasu: Análisis de Regresión', problemTypeId: 20 },
  { name: 'El Grimorio de las Regresiones', problemTypeId: 20 },
];

async function updateSingleCard(cardName, problemTypeId) {
  try {
    // Get the card first
    const { data: cards, error: selectError } = await supabase
      .from('cards')
      .select('id')
      .eq('name', cardName)
      .eq('is_active', true);
      
    if (selectError || !cards || cards.length === 0) {
      console.log(`❌ Card not found: "${cardName}"`);
      return false;
    }
    
    const cardId = cards[0].id;
    
    // Use raw SQL to avoid triggers
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `UPDATE cards SET problem_type_id = ${problemTypeId} WHERE id = '${cardId}' AND is_active = true`
    });
    
    if (error) {
      console.log(`❌ Error updating "${cardName}":`, error);
      return false;
    }
    
    console.log(`✅ Updated "${cardName}" -> problem_type_id: ${problemTypeId}`);
    return true;
    
  } catch (error) {
    console.log(`❌ Exception updating "${cardName}":`, error.message);
    return false;
  }
}

async function fixProblemTypeIds() {
  console.log('🔧 Starting manual problem_type_id updates...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const mapping of cardMappings) {
    const success = await updateSingleCard(mapping.name, mapping.problemTypeId);
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log(`\n📊 Update Summary:`);
  console.log(`✅ Successfully updated: ${successCount} cards`);
  console.log(`❌ Errors: ${errorCount} cards`);
  
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
    Object.entries(grouped).sort((a, b) => a[0] - b[0]).forEach(([id, count]) => {
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