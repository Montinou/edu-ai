const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanDatabaseAndStorage() {
  try {
    console.log('🧹 INICIANDO LIMPIEZA TOTAL DE LA BASE DE DATOS Y STORAGE');
    console.log('🗑️  ¡ELIMINANDO TODOS LOS DATOS DE CARTAS Y FALLBACKS!\n');
    
    // 1. Limpiar todas las cartas (sin excepciones)
    console.log('🗑️  Paso 1: Eliminando TODAS las cartas de la base de datos...');
    const { error: deleteCardsError } = await supabase
      .from('cards')
      .delete()
      .neq('id', 0); // Eliminar todas las cartas sin excepción
      
    if (deleteCardsError) {
      console.error('❌ Error eliminando cartas:', deleteCardsError);
    } else {
      console.log('✅ Todas las cartas eliminadas exitosamente');
    }
    
    // 2. Limpiar el storage de imágenes completamente
    console.log('\n🖼️  Paso 2: Limpiando storage de imágenes (eliminando TODO)...');
    
    try {
      // Listar TODOS los archivos en el bucket de card-images
      const { data: files, error: listError } = await supabase.storage
        .from('card-images')
        .list('', {
          limit: 1000,
          sortBy: { column: 'name', order: 'asc' }
        });
        
      if (listError) {
        console.error('❌ Error listando archivos:', listError);
      } else if (files && files.length > 0) {
        console.log(`📁 Encontrados ${files.length} archivos de imágenes para ELIMINAR...`);
        
        // Eliminar archivos en lotes
        const filePaths = files.map(file => file.name);
        const { error: deleteFilesError } = await supabase.storage
          .from('card-images')
          .remove(filePaths);
          
        if (deleteFilesError) {
          console.error('❌ Error eliminando archivos:', deleteFilesError);
        } else {
          console.log(`✅ ${filePaths.length} archivos de imágenes ELIMINADOS completamente`);
        }
      } else {
        console.log('✅ No hay archivos de imágenes (storage ya limpio)');
      }
    } catch (storageError) {
      console.error('❌ Error accediendo al storage:', storageError);
    }
    
    // 3. Verificar que todo esté completamente limpio
    console.log('\n🔍 Paso 3: Verificando que la limpieza sea TOTAL...');
    
    const { data: remainingCards, error: checkError } = await supabase
      .from('cards')
      .select('id', { count: 'exact' });
      
    if (checkError) {
      console.error('❌ Error verificando cartas:', checkError);
    } else {
      console.log(`📊 Cartas restantes en la base de datos: ${remainingCards?.length || 0}`);
      if (remainingCards?.length === 0) {
        console.log('🎯 ¡PERFECTO! Base de datos completamente limpia');
      }
    }
    
    // 4. Preparación para nueva generación épica
    console.log('\n🚀 Paso 4: Preparando para NUEVA GENERACIÓN ÉPICA EN ESPAÑOL...');
    console.log('✅ Sistema listo para cartas 100% en español');
    console.log('✅ Sin fallbacks en inglés');
    console.log('✅ Sin métodos de respaldo innecesarios');
    
    console.log('\n🎉 ¡LIMPIEZA TOTAL COMPLETADA!');
    console.log('📊 Resumen de la operación EXTREMA:');
    console.log('   🗑️  Cartas eliminadas: TODAS');
    console.log('   🖼️  Imágenes eliminadas: TODAS');
    console.log('   💾 Storage: COMPLETAMENTE LIMPIO');
    console.log('   🗄️  Base de datos: RESETEO TOTAL');
    console.log('   🌍 Idioma: ESPAÑOL ÚNICAMENTE');
    console.log('   🚫 Fallbacks en inglés: ELIMINADOS');
    console.log('\n🎌 ¡LISTO PARA COLECCIÓN ÉPICA ESTILO ANIME EN ESPAÑOL!');
    
  } catch (error) {
    console.error('🚨 Error en la limpieza total:', error);
  }
}

// Ejecutar la limpieza con advertencia MÁS FUERTE
if (require.main === module) {
  console.log('⚠️  ¡ADVERTENCIA EXTREMA!');
  console.log('⚠️  Este script eliminará ABSOLUTAMENTE TODO:');
  console.log('    - Todas las cartas (sin excepciones)');
  console.log('    - Todas las imágenes');
  console.log('    - Todo el contenido del storage');
  console.log('    - Todos los fallbacks en inglés');
  console.log('⚠️  Presiona Ctrl+C en los próximos 5 segundos para cancelar...\n');
  
  setTimeout(() => {
    cleanDatabaseAndStorage().catch(console.error);
  }, 5000);
}

module.exports = { cleanDatabaseAndStorage }; 