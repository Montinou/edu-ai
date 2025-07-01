const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iyezdyycisbakuozpcym.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5ZXpkeXljaXNiYWt1b3pwY3ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODM5MjIyNSwiZXhwIjoyMDYzOTY4MjI1fQ.v3S_jJn-WqMj2SSGekR9QpMRgpYGANh7UDZbP2yQi8M';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTable(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      return { exists: false, error: error.message };
    }
    
    return { exists: true, sampleData: data };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

async function checkDatabaseStructure() {
  console.log('🔍 Verificando estructura de la base de datos...\n');
  
  const tablesToCheck = [
    'cards',
    'users', 
    'user_sessions',
    'user_profiles',
    'user_stats',
    'user_achievements',
    'game_sessions'
  ];

  console.log('📋 VERIFICACIÓN DE TABLAS:');
  console.log('==========================');
  
  for (const tableName of tablesToCheck) {
    const result = await checkTable(tableName);
    
    if (result.exists) {
      console.log(`  ✅ ${tableName} - Existe`);
    } else {
      console.log(`  ❌ ${tableName} - No existe (${result.error})`);
    }
  }

  // Verificar datos específicos de cards
  console.log('\n🎯 DATOS DE CARDS:');
  console.log('==================');
  
  try {
    const { data: cardsCount, error: countError } = await supabase
      .from('cards')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      console.log('  ⚠️  Error contando cards:', countError.message);
    } else {
      console.log(`  📊 Total de cards: ${cardsCount?.length || 0}`);
    }

    // Obtener muestra de cards
    const { data: sampleCards, error: cardsError } = await supabase
      .from('cards')
      .select('id, name_es, name_en, type, rarity, difficulty_level')
      .limit(5);

    if (cardsError) {
      console.log('  ⚠️  Error obteniendo muestra:', cardsError.message);
    } else if (sampleCards && sampleCards.length > 0) {
      console.log('\n  📋 Muestra de cards:');
      sampleCards.forEach(card => {
        console.log(`    • ID: ${card.id}`);
        console.log(`      Nombre ES: ${card.name_es}`);
        console.log(`      Nombre EN: ${card.name_en}`);
        console.log(`      Tipo: ${card.type}`);
        console.log(`      Rareza: ${card.rarity}`);
        console.log(`      Dificultad: ${card.difficulty_level}`);
        console.log('      ---');
      });
    }
  } catch (error) {
    console.log('  ❌ Error verificando cards:', error.message);
  }

  // Verificar auth de Supabase
  console.log('\n🔐 VERIFICACIÓN DE AUTH:');
  console.log('========================');
  
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.log('  ⚠️  Error accediendo a auth:', error.message);
    } else {
      console.log(`  👥 Usuarios registrados: ${users?.length || 0}`);
      if (users && users.length > 0) {
        console.log('  📋 Usuarios existentes:');
        users.slice(0, 3).forEach(user => {
          console.log(`    • Email: ${user.email}`);
          console.log(`      ID: ${user.id}`);
          console.log(`      Creado: ${user.created_at}`);
          console.log('      ---');
        });
      }
    }
  } catch (error) {
    console.log('  ❌ Error verificando auth:', error.message);
  }

  console.log('\n✅ Verificación completada!');
}

checkDatabaseStructure(); 