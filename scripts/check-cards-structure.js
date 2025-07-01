const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iyezdyycisbakuozpcym.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5ZXpkeXljaXNiYWt1b3pwY3ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODM5MjIyNSwiZXhwIjoyMDYzOTY4MjI1fQ.v3S_jJn-WqMj2SSGekR9QpMRgpYGANh7UDZbP2yQi8M';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCardsStructure() {
  console.log('🎯 Verificando estructura de la tabla cards...\n');
  
  try {
    // Intentar obtener todas las columnas haciendo un select *
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('🏗️  COLUMNAS DISPONIBLES EN CARDS:');
      console.log('==================================');
      
      const columns = Object.keys(data[0]);
      columns.forEach(col => {
        console.log(`  • ${col}`);
      });
      
      console.log('\n📋 MUESTRA DE DATOS:');
      console.log('====================');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log('⚠️  Tabla cards existe pero está vacía');
      
      // Intentar insertar un dato de prueba para ver la estructura
      console.log('\n🔍 Intentando detectar estructura...');
      
      const { data: insertData, error: insertError } = await supabase
        .from('cards')
        .insert([{ name: 'test' }])
        .select();
      
      if (insertError) {
        console.log('Error de inserción (esto nos ayuda a ver los campos requeridos):');
        console.log(insertError.message);
      }
    }
    
    // Verificar el total de registros
    const { count, error: countError } = await supabase
      .from('cards')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`\n📊 Total de registros: ${count}`);
    }
    
  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

checkCardsStructure(); 