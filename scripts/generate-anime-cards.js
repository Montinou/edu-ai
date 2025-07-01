const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuración de distribución de cartas estilo anime - 100% ESPAÑOL
const cardDistribution = {
  común: 20,      // 31% - Cartas básicas pero épicas
  raro: 24,       // 37% - Mayoría de la colección
  épico: 16,      // 25% - Cartas poderosas
  legendario: 4   // 7% - Las más poderosas
};

// Tipos de problemas matemáticos
const problemTypes = [
  'suma', 'resta', 'multiplicación', 'división',
  'fracciones', 'decimales', 'porcentajes', 'ecuaciones',
  'polinomios', 'área y perímetro', 'ángulos', 'patrones',
  'secuencias', 'deducción', 'probabilidad'
];

// Categorías en español
const categories = ['aritmética', 'álgebra', 'geometría', 'lógica', 'estadística'];

// Función para importar fetch dinámicamente
async function importFetch() {
  const fetch = await import('node-fetch');
  return fetch.default;
}

// Función para generar carta usando la API HTTP (CORREGIDA)
async function generateEpicAnimeCard(problemType, category, rarity) {
  try {
    console.log(`🎌 Generando carta ${rarity}: ${problemType} (${category})`);
    
    // Importar fetch dinámicamente
    const fetch = await importFetch();
    
    const response = await fetch('http://localhost:3000/api/ai/generate-dynamic-cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category,
        rarity,
        count: 1,
        theme: 'anime-epic-español',
        educationalFocus: `Dominio de ${problemType} estilo anime épico`,
        ageGroup: '12-16 años'
      })
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.cards && result.cards.length > 0) {
      const card = result.cards[0];
      
      // Convertir a formato compatible con la base de datos
      const dbCard = {
        name: card.name,
        description: card.description || card.flavor_text,
        category: card.category,
        rarity: card.rarity,
        type: 'attack', // Tipo por defecto
        attack_power: card.base_power,
        defense_power: Math.floor(card.base_power * 0.8),
        cost: Math.max(1, Math.floor(card.base_power / 100)),
        difficulty_level: card.level_range ? card.level_range[0] : 3,
        base_power: card.base_power,
        level_range: card.level_range || [1, 5],
        lore: card.lore,
        art_style: 'anime-epic-español',
        image_prompt: card.art_prompt,
        is_active: true,
        created_at: new Date().toISOString()
      };
      
      console.log(`   ✨ "${card.name}" generada por API exitosamente`);
      return dbCard;
    } else {
      throw new Error(`API no retornó cartas válidas: ${JSON.stringify(result)}`);
    }
  } catch (error) {
    console.error(`❌ ERROR generando carta ${rarity}:`, error.message);
    return null;
  }
}

// Función principal para generar colección épica 100% en español
async function generateAnimeCardCollection() {
  try {
    console.log('🎌⚔️ INICIANDO GENERACIÓN DE COLECCIÓN ÉPICA ESTILO ANIME ⚔️🎌');
    console.log('🌍 MODO: 100% ESPAÑOL - USANDO API HTTP');
    console.log('🔗 CONECTANDO CON SERVIDOR LOCAL...\n');
    
    // Verificar que el servidor esté corriendo
    try {
      const fetch = await importFetch();
      const testResponse = await fetch('http://localhost:3000/api/ai/generate-dynamic-cards');
      if (!testResponse.ok) {
        throw new Error('Servidor no disponible');
      }
      console.log('✅ Servidor de desarrollo detectado y funcionando\n');
    } catch (error) {
      console.error('❌ Error: El servidor de desarrollo no está corriendo.');
      console.error('🔧 Por favor ejecuta "npm run dev" en otra terminal primero.');
      return;
    }
    
    const cards = [];
    let successCount = 0;
    let failedCount = 0;
    
    // Generar cartas por rareza
    for (const [rarity, count] of Object.entries(cardDistribution)) {
      console.log(`\n🎯 Generando ${count} cartas ${rarity.toUpperCase()}...`);
      
      for (let i = 0; i < count; i++) {
        const problemType = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        
        const card = await generateEpicAnimeCard(problemType, category, rarity);
        
        if (card) {
          // Mapear problem_type_id en español
          try {
            const problemTypeMapping = {
              'addition': 'Suma',
              'subtraction': 'Resta', 
              'multiplication': 'Multiplicación',
              'division': 'División',
              'fractions': 'Fracciones',
              'decimals': 'Decimales',
              'percentages': 'Porcentajes',
              'equations': 'Ecuaciones',
              'polynomials': 'Polinomios',
              'area_perimeter': 'Área y Perímetro',
              'angles': 'Ángulos',
              'patterns': 'Patrones',
              'sequences': 'Secuencias',
              'deduction': 'Deducción',
              'probability': 'Probabilidad'
            };
            
            const problemNameEs = problemTypeMapping[problemType] || 'Matemáticas';
            
            const { data: problemTypeData, error: problemError } = await supabase
              .from('cards_problem_types')
              .select('id')
              .eq('name_es', problemNameEs)
              .single();
              
            if (!problemError && problemTypeData) {
              card.problem_type_id = problemTypeData.id;
            }
          } catch (e) {
            console.warn(`⚠️ No se pudo asignar problem_type_id para ${problemType}`);
          }
          
          cards.push(card);
          successCount++;
          console.log(`   ✨ ${i + 1}/${count}: "${card.name}" - ¡ÉPICA CREADA!`);
        } else {
          failedCount++;
          console.log(`   ❌ ${i + 1}/${count}: FALLÓ`);
        }
        
        // Pausa para no sobrecargar la API
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    
    // Guardar cartas épicas en la base de datos
    console.log(`\n💾 Guardando ${cards.length} cartas épicas en la base de datos...`);
    
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      try {
        const { error } = await supabase
          .from('cards')
          .insert(card);
          
        if (error) {
          console.error(`❌ Error guardando carta ${i + 1}:`, error.message);
        } else {
          console.log(`   ✅ Carta ${i + 1}/${cards.length}: "${card.name}" guardada`);
        }
      } catch (saveError) {
        console.error(`❌ Error guardando carta ${i + 1}:`, saveError.message);
      }
      
      // Pausa para la base de datos
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n🎉 ¡GENERACIÓN DE COLECCIÓN ÉPICA COMPLETADA!');
    console.log('📊 Estadísticas finales:');
    console.log(`   ⚔️  Total de cartas épicas: ${cards.length}`);
    console.log(`   🎌 Cartas generadas exitosamente: ${successCount}`);
    console.log(`   ❌ Cartas fallidas: ${failedCount}`);
    console.log(`   👑 Legendarias: ${cardDistribution.legendario}`);
    console.log(`   ⚡ Épicas: ${cardDistribution.épico}`);
    console.log(`   💎 Raras: ${cardDistribution.raro}`);
    console.log(`   🔸 Comunes: ${cardDistribution.común}`);
    console.log('   🌍 Idioma: 100% ESPAÑOL');
    console.log('   🔗 Método: API HTTP');
    console.log('\n🎮 ¡Tu nueva colección épica estilo anime está lista!');
    
  } catch (error) {
    console.error('🚨 Error en la generación de cartas:', error);
  }
}

// Ejecutar la generación
if (require.main === module) {
  console.log('🎌 ¡Iniciando generación de cartas épicas 100% en español!');
  console.log('🔗 Usando API HTTP del servidor local\n');
  generateAnimeCardCollection().catch(console.error);
}

module.exports = { generateAnimeCardCollection }; 