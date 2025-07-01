const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mapping from our types to database values
const PROBLEM_TYPE_MAPPING = {
  "addition": { id: 1, category: "aritmética" },
  "subtraction": { id: 2, category: "aritmética" },
  "multiplication": { id: 3, category: "aritmética" },
  "division": { id: 4, category: "aritmética" },
  "fractions": { id: 5, category: "aritmética" },
  "pattern": { id: 15, category: "lógica" },
  "deduction": { id: 16, category: "lógica" },
  "classification": { id: 17, category: "lógica" },
  "spatial": { id: 18, category: "lógica" },
  "strategy": { id: 19, category: "lógica" },
  "sequence": { id: 20, category: "lógica" },
  "algebra": { id: 10, category: "álgebra" }
};

const CARD_TYPE_MAPPING = {
  "matemáticas": "ataque",
  "lógica": "apoyo", 
  "especial": "especial"
};

// Themed card sets with consistent aesthetics
const THEMED_SETS = {
  "academia_magica_fundamentos": {
    theme: "Academia Mágica - Fundamentos",
    description: "Cartas básicas con temática de escuela de magia para principiantes",
    basePrompt: "magical academy student learning basic spells, Studio Ghibli style, clean anime art, bright educational atmosphere, fantasy classroom setting",
    cards: [
      {
        cardType: "matemáticas",
        mathType: "suma ",
        rarity: "común",
        customPrompt: "estudiante mágico aprendiendo hechizos básicos con esferas de cristal que muestran números, efectos mágicos brillantes azules y dorados, símbolos matemáticos flotando alrededor, fondo de aula de academia"
      },
      {
        cardType: "matemáticas", 
        mathType: "resta",
        rarity: "común",
        customPrompt: "escudo mágico con fases de luna iluminadas que muestran restas, aura mágica plateada y azul, barreras mágicas protectivas, patio de academia nocturno"
      },
      {
        cardType: "matemáticas",
        mathType: "multiplicación", 
        rarity: "raro",
        customPrompt: "dragón pequeño amigable que respira fuego matemático con números multiplicando, llamas rojas y naranja, números duplicando en patrones mágicos, terreno de entrenamiento de academia de dragones"
      },
      {
        cardType: "lógica",
        mathType: "patrón",
        rarity: "raro", 
        customPrompt: "mandala mágico intrincado con patrones geométricos evolucionando, secuencias matemáticas místicas, energía mágica púrpura y dorada, magia de reconocimiento de patrones"
      }
    ]
  },

  "matematicas_elementales": {
    theme: "Matemáticas Elementales",
    description: "Cartas con poderes elementales para conceptos matemáticos intermedios",
    basePrompt: "elemental magic creatures teaching mathematics, Studio Ghibli inspired, vibrant elemental effects, magical academy environment",
    cards: [
      {
        cardType: "matemáticas",
        mathType: "fracciones",
        rarity: "raro",
        customPrompt: "elemento agua dividiendo corrientes de agua cristalinas en fracciones perfectas, efectos mágicos azules y plateados, precisión matemática fluida, jardín de academia de agua"
      },
      {
        cardType: "matemáticas",
        mathType: "división",
        rarity: "raro", 
        customPrompt: "golem de tierra sabio con escalas mágicas perfectamente dividiendo gemas, efectos mágicos terrestres, justicia matemática equilibrada, laboratorio mineral de academia"
      },
      {
        cardType: "lógica",
        mathType: "deducción",
        rarity: "epico",
        customPrompt: "espíritu de viento detective con lupa mágica descubriendo pistas lógicas ocultas, magia de aire revolviendo, aura de búsqueda de la verdad, torre de investigación de academia"
      },
      {
        cardType: "especial",
        mathType: "álgebra",
        rarity: "epico",
        customPrompt: "fénix de fuego con ecuaciones algebraicas ardiendo en llamas místicas, magia de renacimiento representando el aprendizaje de los errores, transformación matemática de fuego, espada de academia"
      }
    ]
  },

  "legendary_guardians": {
    theme: "Guardianes Legendarios",
    description: "Cartas legendarias con guardianes ancestrales de la sabiduría matemática",
    basePrompt: "ancient magical guardians of mathematical wisdom, legendary aura, epic magical effects, Studio Ghibli grandeur",
    cards: [
      {
        cardType: "especial",
        mathType: "estrategia",
        rarity: "legendario",
        customPrompt: "maestro mágico majestuoso rodeado de elementos matemáticos flotantes, aura mágica de nivel maestro, presencia divina de enseñanza, gran salón de academia con efectos celestiales"
      },
      {
        cardType: "lógica",
        mathType: "espacial",
        rarity: "legendario",
        customPrompt: "sarcófago geométrico antiguo con enigmas matemáticos cristalinos, geometría mágica cósmica, efectos de doblez del espacio, observatorio de academia con matemáticas estelares"
      },
      {
        cardType: "matemáticas",
        mathType: "álgebra",
        rarity: "legendario", 
        customPrompt: "princesa matemática elegante con corona hecha de símbolos algebraicos, ecuaciones mágicas reales, palacio de academia con fórmulas matemáticas doradas"
      },
      {
        cardType: "especial",
        mathType: "secuencia",
        rarity: "legendario",
        customPrompt: "dragón que viaja en el tiempo con secuencias matemáticas cronológicas, efectos mágicos temporales, patrones de espiral temporal, torre de academia de tiempo con matemáticas de reloj"
      }
    ]
  },

  "academia_natural": {
    theme: "Academia Natural",
    description: "Cartas con temática de naturaleza mágica para aprendizaje orgánico",
    basePrompt: "espíritus mágicos de naturaleza enseñando a través de fenómenos naturales, efectos mágicos orgánicos, ambiente de academia de bosque, magia natural de Studio Ghibli",
    cards: [
      {
        cardType: "matemáticas",
        mathType: "suma",
        rarity: "común",
        customPrompt: "flores mágicas cariñosas con números en pétalos siendo combinados por magia de hada, colores pastel, ambiente de jardín de academia, brillos matemáticos en el aire"
      },
      {
        cardType: "matemáticas",
        mathType: "multiplicación",
        rarity: "raro",
        customPrompt: "semillas mágicas creciendo rápidamente en plantas numeradas, magia natural con progresión matemática, energía de crecimiento verde, invernadero de academia botánica"
      },
      {
        cardType: "lógica",
        mathType: "clasificación", 
        rarity: "raro",
        customPrompt: "jardín mágico con plantas organizándose por categorías, magia natural de clasificación, taxonomía botánica, terreno de academia con matemáticas vivientes"
      },
      {
        cardType: "especial",
        mathType: "patrón",
        rarity: "epico",
        customPrompt: "árbol espíritu con patrones de ramas fractales, magia natural recursiva, espirales doradas de proporción áurea, huerto sagrado de academia con matemáticas armónicas"
      }
    ]
  }
};

async function generateThemedSet(setName, options = {}) {
  console.log(`🎨 Generando set temático: ${setName}`);
  
  const themedSet = THEMED_SETS[setName];
  if (!themedSet) {
    console.error(`❌ Set temático '${setName}' no encontrado`);
    console.log('Sets disponibles:', Object.keys(THEMED_SETS).join(', '));
    return;
  }

  console.log(`📖 Tema: ${themedSet.theme}`);
  console.log(`📝 Descripción: ${themedSet.description}`);
  console.log(`🎴 Cartas a generar: ${themedSet.cards.length}`);

  try {
    // Step 1: Generate images using batch API
    const batchRequest = {
      cards: themedSet.cards,
      maxConcurrent: options.maxConcurrent || 2
    };

    console.log('📤 Paso 1: Generando imágenes en batch...');

    const baseUrl = options.baseUrl || 'http://localhost:3001'; // Updated port
    const response = await fetch(`${baseUrl}/api/ai/generate-card-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batchRequest)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const imageResults = await response.json();
    
    console.log('🎉 Generación de imágenes completada!');
    console.log(`✅ Exitosas: ${imageResults.successful}`);
    console.log(`❌ Fallidas: ${imageResults.failed}`);
    console.log(`💰 Costo total: $${imageResults.totalCost.toFixed(4)}`);

    if (imageResults.failed > 0) {
      console.log('⚠️  Algunas imágenes fallaron, continuando con las exitosas...');
    }

    // Step 2: Create cards in database for successful images
    console.log('\n📝 Paso 2: Creando cartas en la base de datos...');
    
    const createdCards = [];
    const cardCreationErrors = [];

    for (let i = 0; i < imageResults.results.length; i++) {
      const imageResult = imageResults.results[i];
      const cardConfig = themedSet.cards[i]; // Assuming same order
      
      try {
        if (imageResult.success && imageResult.imageUrl) {
          console.log(`📝 Creando carta ${i + 1}/${imageResults.results.length}: ${generateCardName(cardConfig, setName)}`);
          
          const createdCard = await createCardInDatabase(cardConfig, imageResult.imageUrl, setName);
          createdCards.push({
            ...createdCard,
            imageProvider: imageResult.provider,
            imageCost: imageResult.cost
          });
        } else {
          console.log(`⏭️  Saltando carta ${i + 1} (no hay imagen disponible)`);
        }
      } catch (error) {
        console.error(`❌ Error creando carta ${i + 1}:`, error);
        cardCreationErrors.push({
          index: i,
          cardConfig,
          error: error.message
        });
      }
    }

    // Step 3: Summary and results
    console.log('\n📊 Resumen final:');
    console.log(`🖼️  Imágenes generadas: ${imageResults.successful}`);
    console.log(`🎴 Cartas creadas en BD: ${createdCards.length}`);
    console.log(`❌ Errores de creación: ${cardCreationErrors.length}`);
    console.log(`💰 Costo total de imágenes: $${imageResults.totalCost.toFixed(4)}`);

    if (createdCards.length > 0) {
      console.log('\n✅ Cartas creadas exitosamente:');
      createdCards.forEach((card, index) => {
        console.log(`  ${index + 1}. ${card.name} (ID: ${card.id}) - ${card.imageProvider}`);
      });
    }

    if (cardCreationErrors.length > 0) {
      console.log('\n❌ Errores de creación de cartas:');
      cardCreationErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.error}`);
      });
    }

    return {
      setName,
      theme: themedSet.theme,
      imageResults,
      createdCards,
      cardCreationErrors,
      summary: {
        imagesGenerated: imageResults.successful,
        cardsCreated: createdCards.length,
        totalCost: imageResults.totalCost,
        success: createdCards.length > 0
      }
    };

  } catch (error) {
    console.error('🚨 Error generando set temático:', error);
    throw error;
  }
}

async function generateAllSets(options = {}) {
  console.log('🎨 Generando todos los sets temáticos...\n');
  
  const results = {};
  const setNames = Object.keys(THEMED_SETS);
  
  for (let i = 0; i < setNames.length; i++) {
    const setName = setNames[i];
    console.log(`📦 Procesando set ${i + 1}/${setNames.length}: ${setName}`);
    
    try {
      results[setName] = await generateThemedSet(setName, options);
      
      // Small delay between sets
      if (i < setNames.length - 1) {
        console.log('⏸️  Pausa entre sets...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ Error en set ${setName}:`, error);
      results[setName] = { error: error.message };
    }
  }

  // Summary
  console.log('\n📊 Resumen final:');
  let totalSuccessful = 0;
  let totalFailed = 0;
  let totalCost = 0;

  Object.entries(results).forEach(([setName, result]) => {
    if (result.error) {
      console.log(`❌ ${setName}: Error - ${result.error}`);
    } else {
      console.log(`✅ ${setName}: ${result.successful} exitosas, ${result.failed} fallidas, $${result.totalCost.toFixed(4)}`);
      totalSuccessful += result.successful;
      totalFailed += result.failed;
      totalCost += result.totalCost;
    }
  });

  console.log(`\n🎯 Total general: ${totalSuccessful} exitosas, ${totalFailed} fallidas, $${totalCost.toFixed(4)}`);
  
  return results;
}

async function createCardInDatabase(cardConfig, imageUrl, setTheme) {
  const problemType = PROBLEM_TYPE_MAPPING[cardConfig.mathType];
  if (!problemType) {
    throw new Error(`No se encontró mapping para problema tipo: ${cardConfig.mathType}`);
  }

  const cardData = {
    name: generateCardName(cardConfig, setTheme),
    description: cardConfig.customPrompt.substring(0, 200) + '...',
    type: CARD_TYPE_MAPPING[cardConfig.cardType],
    rarity: cardConfig.rarity,
    attack_power: getBasePowerByRarity(cardConfig.rarity),
    defense_power: Math.floor(getBasePowerByRarity(cardConfig.rarity) * 0.8),
    cost: getCostByRarity(cardConfig.rarity),
    category: problemType.category,
    problem_type_id: problemType.id,
    difficulty_level: getDifficultyByRarity(cardConfig.rarity),
    image_url: imageUrl,
    image_prompt: cardConfig.customPrompt,
    is_active: true,
    created_at: new Date().toISOString()
  };

  console.log(`📝 Creando carta en BD: ${cardData.name}`);
  
  const { data, error } = await supabase
    .from('cards')
    .insert(cardData)
    .select()
    .single();

  if (error) {
    throw new Error(`Error creando carta en BD: ${error.message}`);
  }

  console.log(`✅ Carta creada con ID: ${data.id}`);
  return data;
}

function generateCardName(cardConfig, setTheme) {
  const names = {
    magical_academy_basics: {
      addition: "Estudiante de Suma Mágica",
      subtraction: "Escudo Lunar Protector", 
      multiplication: "Dragoncito Multiplicador",
      pattern: "Mandala de Patrones"
    },
    elemental_mathematics: {
      fractions: "Elemental de Agua Fraccionaria",
      division: "Golem de División Equilibrada",
      deduction: "Espíritu Detective del Viento", 
      algebra: "Fénix Algebraico"
    },
    legendary_guardians: {
      strategy: "Maestro Matemático Celestial",
      spatial: "Esfinge Geométrica Ancestral",
      algebra: "Princesa de Ecuaciones Doradas",
      sequence: "Dragón Temporal de Secuencias"
    },
    nature_academy: {
      addition: "Flores Mágicas Sumadoras",
      multiplication: "Semillas de Crecimiento Multiplicativo",
      classification: "Jardín de Clasificación Viviente",
      pattern: "Árbol Espíritu Fractal"
    }
  };
  
  return names[setTheme]?.[cardConfig.mathType] || `Carta ${cardConfig.cardType} de ${cardConfig.mathType}`;
}

function getBasePowerByRarity(rarity) {
  const powerMapping = {
    common: 25,
    rare: 35,
    epic: 50,
    legendary: 70
  };
  return powerMapping[rarity] || 25;
}

function getCostByRarity(rarity) {
  const costMapping = {
    common: 2,
    rare: 4,
    epic: 6,
    legendary: 8
  };
  return costMapping[rarity] || 2;
}

function getDifficultyByRarity(rarity) {
  const difficultyMapping = {
    common: 1,
    rare: 3,
    epic: 5,
    legendary: 7
  };
  return difficultyMapping[rarity] || 1;
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const options = {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    maxConcurrent: 2
  };

  try {
    switch (command) {
      case 'set':
        const setName = args[1];
        if (!setName) {
          console.log('Uso: node generate-themed-cards.js set <nombre_del_set>');
          console.log('Sets disponibles:', Object.keys(THEMED_SETS).join(', '));
          return;
        }
        await generateThemedSet(setName, options);
        break;

      case 'all':
        await generateAllSets(options);
        break;

      case 'list':
        console.log('🎨 Sets temáticos disponibles:\n');
        Object.entries(THEMED_SETS).forEach(([name, set]) => {
          console.log(`📦 ${name}`);
          console.log(`   Tema: ${set.theme}`);
          console.log(`   Descripción: ${set.description}`);
          console.log(`   Cartas: ${set.cards.length}\n`);
        });
        break;

      default:
        console.log('🎨 Generador de Cartas Temáticas');
        console.log('');
        console.log('Comandos disponibles:');
        console.log('  list               - Listar todos los sets disponibles');
        console.log('  set <nombre>       - Generar un set específico');
        console.log('  all               - Generar todos los sets');
        console.log('');
        console.log('Ejemplos:');
        console.log('  node generate-themed-cards.js list');
        console.log('  node generate-themed-cards.js set magical_academy_basics');
        console.log('  node generate-themed-cards.js all');
        break;
    }
  } catch (error) {
    console.error('🚨 Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generateThemedSet,
  generateAllSets,
  THEMED_SETS
}; 