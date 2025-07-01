const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSingleCard() {
  try {
    console.log('🧪 Probando generación de una sola carta...\n');
    
    // Llamar a la API para generar una carta
    const response = await fetch('http://localhost:3000/api/ai/generate-dynamic-cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: 'aritmética',
        rarity: 'épico',
        count: 1,
        theme: 'anime-epic-español',
        educationalFocus: 'Dominando la multiplicación épica'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('📋 RESULTADO COMPLETO DE LA API:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success && result.cards && result.cards.length > 0) {
      const card = result.cards[0];
      console.log('\n✅ CARTA GENERADA EXITOSAMENTE:');
      console.log(`🎴 Nombre: ${card.name}`);
      console.log(`📖 Descripción: ${card.description}`);
      console.log(`⚡ Poder: ${card.base_power}`);
      console.log(`🏆 Rareza: ${card.rarity}`);
      console.log(`🎯 Categoría: ${card.category}`);
      
      if (card.special_ability) {
        console.log(`✨ Habilidad Especial: ${card.special_ability}`);
      }
      
      console.log(`📜 Lore: ${card.lore || 'No definido'}`);
    } else {
      console.log('❌ No se generaron cartas válidas');
      console.log('Respuesta:', result);
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

testSingleCard(); 