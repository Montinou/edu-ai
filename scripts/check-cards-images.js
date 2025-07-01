const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCardsWithImages() {
  try {
    console.log('🔍 Verificando estado de las imágenes de las cartas...\n');
    
    const { data: cards, error } = await supabase
      .from('cards')
      .select('id, name, image_url, image_prompt, rarity, art_style')
      .eq('is_active', true);
      
    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }
    
    console.log('📊 ESTADO DE LAS IMÁGENES DE LAS CARTAS:');
    console.log(`📦 Total cartas en la base de datos: ${cards.length}`);
    
    const withImages = cards.filter(c => c.image_url && c.image_url.trim() !== '');
    const withoutImages = cards.filter(c => !c.image_url || c.image_url.trim() === '');
    const withPrompts = cards.filter(c => c.image_prompt && c.image_prompt.trim() !== '');
    
    console.log(`✅ Cartas CON imágenes: ${withImages.length}`);
    console.log(`❌ Cartas SIN imágenes: ${withoutImages.length}`);
    console.log(`📝 Cartas con prompts listos: ${withPrompts.length}\n`);
    
    if (withImages.length > 0) {
      console.log('🎨 EJEMPLO DE CARTAS CON IMÁGENES:');
      withImages.slice(0, 5).forEach((card, i) => {
        console.log(`   ${i + 1}. "${card.name}" (${card.rarity})`);
        console.log(`      URL: ${card.image_url}`);
      });
      console.log('');
    }
    
    if (withoutImages.length > 0) {
      console.log('⚠️  CARTAS SIN IMÁGENES (necesitan generación):');
      
      // Agrupar por rareza para mejor visualización
      const byRarity = withoutImages.reduce((acc, card) => {
        if (!acc[card.rarity]) acc[card.rarity] = [];
        acc[card.rarity].push(card);
        return acc;
      }, {});
      
      Object.entries(byRarity).forEach(([rarity, cards]) => {
        console.log(`   ${rarity.toUpperCase()}: ${cards.length} cartas`);
        cards.slice(0, 3).forEach(card => {
          console.log(`     - "${card.name}" | Prompt: ${card.image_prompt ? 'Sí' : 'No'}`);
        });
        if (cards.length > 3) {
          console.log(`     ... y ${cards.length - 3} más`);
        }
      });
      console.log('');
    }
    
    // Verificar el storage de imágenes
    console.log('🗄️  Verificando storage de imágenes...');
    const { data: storageFiles, error: storageError } = await supabase
      .storage
      .from('card-images')
      .list('', { limit: 100 });
      
    if (storageError) {
      console.log('❌ Error verificando storage:', storageError.message);
    } else {
      console.log(`📁 Archivos en storage: ${storageFiles ? storageFiles.length : 0}`);
    }
    
    console.log('\n📋 RESUMEN:');
    console.log(`🎌 Cartas épicas anime generadas: ${cards.length}`);
    console.log(`🖼️  Imágenes disponibles: ${withImages.length}/${cards.length} (${Math.round(withImages.length/cards.length*100)}%)`);
    
    if (withoutImages.length > 0) {
      console.log(`🚨 ACCIÓN REQUERIDA: Generar ${withoutImages.length} imágenes faltantes`);
      console.log('💡 Ejecutar: node scripts/generate-card-images.js');
    } else {
      console.log('🎉 ¡Todas las cartas tienen sus imágenes asociadas!');
    }
    
  } catch (error) {
    console.error('🚨 Error:', error.message);
  }
}

checkCardsWithImages(); 