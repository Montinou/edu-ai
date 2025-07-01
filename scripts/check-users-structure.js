const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iyezdyycisbakuozpcym.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5ZXpkeXljaXNiYWt1b3pwY3ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODM5MjIyNSwiZXhwIjoyMDYzOTY4MjI1fQ.v3S_jJn-WqMj2SSGekR9QpMRgpYGANh7UDZbP2yQi8M';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsersStructure() {
  console.log('👥 Verificando estructura de la tabla users...\n');
  
  try {
    // Intentar insertar con el campo name que vimos en el error
    console.log('🔍 Intentando insertar con campo name...');
    
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert([{ 
        email: 'test@test.com',
        name: 'Test User'
      }])
      .select();
    
    if (insertError) {
      console.log('Error de inserción:');
      console.log('Message:', insertError.message);
      console.log('Details:', insertError.details);
      console.log('Hint:', insertError.hint);
      console.log('Code:', insertError.code);
    } else {
      console.log('✅ Inserción exitosa!');
      console.log('Estructura detectada:');
      
      if (insertData && insertData.length > 0) {
        const columns = Object.keys(insertData[0]);
        console.log('\n🏗️  COLUMNAS DISPONIBLES EN USERS:');
        console.log('==================================');
        columns.forEach(col => {
          console.log(`  • ${col}: ${typeof insertData[0][col]} = ${insertData[0][col]}`);
        });
        
        // Limpiar el registro de prueba
        await supabase
          .from('users')
          .delete()
          .eq('email', 'test@test.com');
        
        console.log('\n🧹 Registro de prueba eliminado');
      }
    }
    
    // Verificar el total de registros
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`\n📊 Total de registros: ${count}`);
    }
    
  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

checkUsersStructure(); 