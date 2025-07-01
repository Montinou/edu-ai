const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Direct updates using card IDs
async function updateCardProblemType(cardName, newProblemTypeId) {
  try {
    // First get the card ID
    const { data: cards, error: selectError } = await supabase
      .from('cards')
      .select('id')
      .eq('name', cardName)
      .eq('is_active', true)
      .single();
      
    if (selectError || !cards) {
      console.log(`❌ Card not found: "${cardName}"`);
      return false;
    }
    
    // Use direct SQL update via RPC (if available) or direct update
    const { error: updateError } = await supabase
      .from('cards')
      .update({ 
        problem_type_id: newProblemTypeId
      })
      .eq('id', cards.id)
      .eq('is_active', true);
      
    if (updateError) {
      // If update fails due to triggers, try with specific options
      console.log(`⚠️  Standard update failed for "${cardName}", trying alternative...`);
      
      // Try with option to skip triggers (if supported)
      const { error: altError } = await supabase
        .from('cards')
        .update({ 
          problem_type_id: newProblemTypeId
        }, { 
          count: 'exact',
          returning: 'minimal'
        })
        .eq('id', cards.id);
        
      if (altError) {
        console.log(`❌ Alternative update failed for "${cardName}":`, altError.message);
        return false;
      }
    }
    
    console.log(`✅ Updated "${cardName}" -> problem_type_id: ${newProblemTypeId}`);
    return true;
    
  } catch (error) {
    console.log(`❌ Exception updating "${cardName}":`, error.message);
    return false;
  }
}

async function fixProblemTypeIds() {
  console.log('🔧 Starting direct problem_type_id updates...');
  
  // Specific mappings based on card names
  const updates = [
    // Fracciones (5)
    { name: 'El Grimorio de las Fracciones Fractales', type: 5 },
    { name: 'El Grimorio de las Fracciones Perdidas', type: 5 },
    
    // Multiplicación (3)
    { name: 'El Abanico de las Multiplicaciones Celestiales', type: 3 },
    
    // División (4)
    { name: 'La División de Amaterasu', type: 4 },
    { name: 'El Susurro de la División Infinita', type: 4 },
    
    // Resta (2)
    { name: 'Susurro de la Resta Infinita', type: 2 },
    { name: 'Sōshū de la Resta Infinita', type: 2 },
    { name: 'Sombras de la Resta Infinita', type: 2 },
    { name: 'La Sombra de la Resta Infinita', type: 2 },
    { name: 'Súcubo de la Sustracción Silenciosa', type: 2 },
    { name: 'La Sustracción de Amaterasu', type: 2 },
    
    // Decimales (6)
    { name: 'El Susurro de los Decimales', type: 6 },
    { name: 'El Silencio de los Decimales Susurrantes', type: 6 },
    
    // Porcentajes (7)
    { name: 'El Grimorio de los Porcentajes Eternos', type: 7 },
    { name: 'El Grimorio de los Porcentajes Perdidos', type: 7 },
    { name: 'El Grimorio de los Porcentajes Cósmicos', type: 7 },
    { name: 'El Grimorio de los Porcentajes Ascendentes', type: 7 },
    
    // Ecuaciones (8)
    { name: 'El Grimorio de Al-Khwarizmi', type: 8 },
    { name: 'El Grimorio de los Sistemas Ecuacionales', type: 8 },
    { name: 'El Grimorio de Xylos el Inefable', type: 8 },
    
    // Polinomios (10)
    { name: 'El Grimorio de los Polinomios Oni', type: 10 },
    { name: 'El Susurro de los Polinomios de Xylos', type: 10 },
    { name: 'El Grimorio de los Polinomios Celestiales', type: 10 },
    { name: 'El Grimorio de los Polinomios de Amaterasu', type: 10 },
    
    // Geometría (12)
    { name: 'El Prisma de Apep', type: 12 },
    { name: 'El Grimorio de los Perímetros Perdidos', type: 12 },
    { name: 'El Prisma de Apep, Destructor de Perímetros', type: 12 },
    { name: 'El Silencio de Shizuka: Secreto de las Geometrías Perdidas', type: 12 },
    { name: 'El Sello de Arquimedes', type: 12 },
    { name: 'El Grimorio Geométrico de Aethelred', type: 12 },
    { name: 'El Sello de la Geometría Sagrada', type: 12 },
    { name: 'El Sello de Amaterasu: Geometría Sagrada', type: 12 },
    { name: 'El Prisma de Apep: Fractal del Desierto', type: 12 },
    
    // Ángulos (13)
    { name: 'El Prisma Angular de Amaterasu', type: 13 },
    { name: 'El Abanico de los Ángulos Celestiales', type: 13 },
    { name: 'El Grial Angular de Amaterasu', type: 13 },
    { name: 'El Prisma de los Ángulos Celestiales', type: 13 },
    
    // Patrones (16)
    { name: 'El Grimorio de los Patrones Celestiales', type: 16 },
    
    // Secuencias (17)
    { name: 'El Grimorio de las Secuencias Escondidas', type: 17 },
    { name: 'El Grimorio de las Secuencias Estelar', type: 17 },
    { name: 'El Grimorio de las Secuencias Eternas', type: 17 },
    { name: 'El Grimorio de las Secuencias Estelares', type: 17 },
    
    // Lógica (19)
    { name: 'El Acertijo de la Diosa Amaterasu', type: 19 },
    { name: 'El Acertijo de Amaterasu', type: 19 },
    
    // Estadísticas (20)
    { name: 'El Grimorio de Laplace', type: 20 },
    { name: 'El Ojo de Amaterasu: Análisis de Regresión', type: 20 },
    { name: 'El Grimorio de las Regresiones', type: 20 },
  ];
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const update of updates) {
    const success = await updateCardProblemType(update.name, update.type);
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
    
    // Small delay to avoid overwhelming
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`\n📊 Update Summary:`);
  console.log(`✅ Successfully updated: ${successCount} cards`);
  console.log(`❌ Errors: ${errorCount} cards`);
  
  // Verification
  console.log('\n🔍 Verification...');
  const { data: allCards } = await supabase
    .from('cards')
    .select('problem_type_id')
    .eq('is_active', true);
    
  const grouped = allCards.reduce((acc, card) => {
    acc[card.problem_type_id] = (acc[card.problem_type_id] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n📊 Distribution by problem_type_id:');
  Object.entries(grouped).sort((a, b) => a[0] - b[0]).forEach(([id, count]) => {
    console.log(`   ${id}: ${count} cards`);
  });
}

fixProblemTypeIds(); 