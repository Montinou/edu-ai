const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateMissingImages() {
  try {
    console.log('🎨 INICIANDO GENERACIÓN DE IMÁGENES FALTANTES');
    console.log('🖼️  Generando imágenes épicas estilo anime para cartas sin imagen\n');
    
    // 1. Obtener cartas sin imagen
    console.log('🔍 Paso 1: Buscando cartas sin imagen...');
    const { data: cardsWithoutImages, error } = await supabase
      .from('cards')
      .select('id, name, description, rarity, art_style, lore, image_prompt')
      .is('image_url', null)
      .eq('is_active', true)
      .order('rarity', { ascending: false }); // Legendarias primero
      
    if (error) {
      console.error('❌ Error obteniendo cartas:', error);
      return;
    }
    
    console.log(`📦 Encontradas ${cardsWithoutImages.length} cartas sin imagen:`);
    
    // Contar por rareza
    const countByRarity = cardsWithoutImages.reduce((acc, card) => {
      acc[card.rarity] = (acc[card.rarity] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Distribución por rareza:');
    Object.entries(countByRarity).forEach(([rarity, count]) => {
      console.log(`   ${rarity}: ${count} cartas`);
    });
    
    if (cardsWithoutImages.length === 0) {
      console.log('✅ ¡Todas las cartas ya tienen imágenes!');
      return;
    }
    
    console.log(`\\n🎨 Iniciando generación de ${cardsWithoutImages.length} imágenes...`);
    
    let processed = 0;
    let successful = 0;
    let failed = 0;
    
    for (const card of cardsWithoutImages) {
      processed++;
      console.log(`\\n🎴 [${processed}/${cardsWithoutImages.length}] Generando imagen para: "${card.name}"`);
      console.log(`   🏆 Rareza: ${card.rarity}`);
      
      try {
        // Crear prompt épico para la imagen basado en la carta
        const imagePrompt = createEpicImagePrompt(card);
        console.log(`   🎯 Prompt: ${imagePrompt.substring(0, 100)}...`);
        
        // Llamar a la API de generación de imágenes
        const response = await fetch('http://localhost:3000/api/generate-card-images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: imagePrompt,
            style: 'anime-epic',
            width: 768,
            height: 1024,
            cardName: card.name,
            cardId: card.id
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.imageUrl) {
          console.log(`   ✅ Imagen generada exitosamente`);
          console.log(`   🔗 URL: ${result.imageUrl}`);
          
          // Actualizar la carta con la URL de la imagen
          const { error: updateError } = await supabase
            .from('cards')
            .update({
              image_url: result.imageUrl,
              image_prompt: imagePrompt
            })
            .eq('id', card.id);
            
          if (updateError) {
            console.log(`   ⚠️  Error actualizando carta: ${updateError.message}`);
          } else {
            successful++;
            console.log(`   💾 Carta actualizada en la base de datos`);
          }
        } else {
          throw new Error(result.error || 'No se generó imagen válida');
        }
        
        // Pausa entre generaciones para evitar rate limits
        if (processed < cardsWithoutImages.length) {
          console.log('   ⏳ Esperando 2 segundos...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        failed++;
        console.log(`   ❌ Error generando imagen: ${error.message}`);
      }
    }
    
    console.log(`\\n🎉 GENERACIÓN DE IMÁGENES COMPLETADA!`);
    console.log(`📊 ESTADÍSTICAS FINALES:`);
    console.log(`   📦 Total procesadas: ${processed}`);
    console.log(`   ✅ Exitosas: ${successful}`);
    console.log(`   ❌ Fallidas: ${failed}`);
    console.log(`   📈 Tasa de éxito: ${Math.round((successful / processed) * 100)}%`);
    
    if (successful > 0) {
      console.log(`\\n🎨 ¡${successful} cartas épicas ahora tienen sus imágenes anime!`);
    }
    
  } catch (error) {
    console.error('❌ Error en la generación de imágenes:', error);
  }
}

function createEpicImagePrompt(card) {
  // Crear prompt épico basado en los datos de la carta
  const rarityStyles = {
    común: 'detailed anime artwork, soft lighting, clean style',
    raro: 'epic anime artwork, dynamic lighting, magical aura, detailed',
    épico: 'magnificent anime artwork, dramatic lighting, powerful aura, highly detailed, masterpiece',
    legendario: 'legendary anime artwork, divine lighting, cosmic aura, ultra detailed, godlike, masterpiece quality'
  };
  
  const style = rarityStyles[card.rarity] || rarityStyles.común;
  
  // Base del prompt con estilo anime épico
  let prompt = `${style}, anime style character or artifact, `;
  
  // Agregar descripción de la carta si existe
  if (card.description) {
    prompt += `${card.description.toLowerCase()}, `;
  }
  
  // Agregar elementos del lore si existe
  if (card.lore && card.lore.length > 20) {
    const loreSnippet = card.lore.substring(0, 150).toLowerCase();
    prompt += `inspired by: ${loreSnippet}, `;
  }
  
  // Prompt específico para el prompt de imagen si existe
  if (card.image_prompt && card.image_prompt.length > 10) {
    prompt += `${card.image_prompt}, `;
  }
  
  // Agregar estilo final según rareza
  switch (card.rarity) {
    case 'legendario':
      prompt += 'golden divine glow, cosmic energy, transcendent power, studio ghibli quality';
      break;
    case 'épico':
      prompt += 'magical energy aura, epic proportions, dramatic pose, high fantasy';
      break;
    case 'raro':
      prompt += 'mystical energy, beautiful details, enchanted atmosphere';
      break;
    default:
      prompt += 'clean anime style, bright colors, friendly atmosphere';
  }
  
  // Límite de caracteres para la API
  return prompt.length > 1000 ? prompt.substring(0, 1000) + '...' : prompt;
}

generateMissingImages(); 